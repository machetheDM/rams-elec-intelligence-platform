"""
Airflow DAG: EskomSePush Load-Shedding Ingestion

Schedule: every 30 minutes
Tasks: fetch status → fetch schedules → detect changes → trigger alerts → store events
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.models import Variable
import sys
import os
import json

import httpx
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ramsatelec")
ESP_API_KEY = os.getenv("ESKOM_SE_PUSH_API_KEY", "")
ESP_BASE_URL = "https://developer.sepush.co.za/business/2.0"

AREA_IDS = [
    "sandton", "midrand", "centurion", "pretoria-east",
    "soweto", "polokwane", "mokopane", "bela-bela",
]

default_args = {
    "owner": "ramsatelec",
    "depends_on_past": False,
    "email_on_failure": True,
    "email": ["ops@ramsatelec.co.za"],
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="loadshedding_ingestion",
    default_args=default_args,
    description="Fetch load-shedding data from EskomSePush every 30 minutes",
    schedule_interval="*/30 * * * *",
    start_date=datetime(2026, 7, 1),
    catchup=False,
    tags=["ramsatelec", "loadshedding"],
) as dag:

    def fetch_national_status(**context):
        """Fetch current national load-shedding stage."""
        if not ESP_API_KEY:
            print("WARNING: ESKOM_SE_PUSH_API_KEY not set — skipping")
            context["task_instance"].xcom_push(key="national_status", value={})
            return

        try:
            client = httpx.Client(
                base_url=ESP_BASE_URL,
                headers={"Token": ESP_API_KEY},
                timeout=15.0,
            )
            resp = client.get("/status")
            resp.raise_for_status()
            data = resp.json()
            client.close()

            stage = None
            try:
                stage = int(data.get("status", {}).get("eskom", {}).get("stage", 0))
            except (ValueError, TypeError):
                pass

            print(f"Current national stage: {stage}")
            context["task_instance"].xcom_push(key="national_status", value={"stage": stage, "raw": data})
        except Exception as e:
            print(f"ERROR fetching national status: {e}")
            context["task_instance"].xcom_push(key="national_status", value={})

    def fetch_area_schedules(**context):
        """Fetch schedule for each area zone."""
        if not ESP_API_KEY:
            context["task_instance"].xcom_push(key="area_schedules", value={})
            return

        schedules = {}
        client = httpx.Client(
            base_url=ESP_BASE_URL,
            headers={"Token": ESP_API_KEY},
            timeout=15.0,
        )

        for area_id in AREA_IDS:
            try:
                resp = client.get(f"/area?id={area_id}")
                resp.raise_for_status()
                schedules[area_id] = resp.json()
                print(f"Fetched schedule for {area_id}: {len(schedules[area_id].get('events', []))} events")
            except Exception as e:
                print(f"ERROR fetching {area_id}: {e}")

        client.close()
        context["task_instance"].xcom_push(key="area_schedules", value=schedules)

    def detect_and_store_events(**context):
        """Compare fetched events against database, store new ones."""
        ti = context["task_instance"]
        area_schedules = ti.xcom_pull(key="area_schedules", task_ids="fetch_area_schedules")

        if not area_schedules:
            print("No area schedules to process")
            return

        engine = create_engine(DATABASE_URL)
        new_events_count = 0

        with engine.begin() as conn:
            for area_id, data in area_schedules.items():
                events = data.get("events", [])
                for event in events:
                    start_time = event.get("start")
                    end_time = event.get("end")
                    stage = event.get("stage", 0) or 0

                    if not start_time or not end_time:
                        continue

                    # Check if event already exists
                    existing = conn.execute(
                        text("""
                            SELECT id FROM loadshedding_events
                            WHERE area_zone = :zone
                              AND start_time = :start
                              AND end_time = :end
                            LIMIT 1
                        """),
                        {"zone": area_id, "start": start_time, "end": end_time},
                    ).fetchone()

                    if not existing:
                        conn.execute(
                            text("""
                                INSERT INTO loadshedding_events (area_zone, stage, start_time, end_time, source)
                                VALUES (:zone, :stage, :start, :end, 'eskomsepush')
                            """),
                            {
                                "zone": area_id,
                                "stage": stage,
                                "start": start_time,
                                "end": end_time,
                            },
                        )
                        new_events_count += 1

        engine.dispose()
        print(f"Stored {new_events_count} new load-shedding events")
        context["task_instance"].xcom_push(key="new_events_count", value=new_events_count)

    def trigger_alerts(**context):
        """If new events detected, trigger n8n alert workflow."""
        ti = context["task_instance"]
        new_count = ti.xcom_pull(key="new_events_count", task_ids="detect_and_store_events")

        if new_count and new_count > 0:
            print(f"TRIGGER: {new_count} new events — n8n alert workflow should fire")
            # In production, call n8n webhook:
            # httpx.post("http://localhost:5678/webhook/loadshedding-alert", json={"new_events": new_count})
        else:
            print("No new events — skipping alerts")

    # Define tasks
    fetch_status = PythonOperator(task_id="fetch_national_status", python_callable=fetch_national_status)
    fetch_schedules = PythonOperator(task_id="fetch_area_schedules", python_callable=fetch_area_schedules)
    detect_store = PythonOperator(task_id="detect_and_store_events", python_callable=detect_and_store_events)
    trigger = PythonOperator(task_id="trigger_alerts", python_callable=trigger_alerts)

    fetch_status >> fetch_schedules >> detect_store >> trigger
