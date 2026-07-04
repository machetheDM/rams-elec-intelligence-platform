# Rams @Elec — ETL Data Ingestion Pipeline

## Architecture: Medallion (Bronze → Silver → Gold)

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                           │
│  Excel/CSV spreadsheets  │  PDF job cards  │  Text notes    │
└──────────┬────────────────────┬──────────────┬──────────────┘
           │                    │              │
     ┌─────▼─────┐        ┌─────▼─────┐   ┌────▼──────┐
     │ Excel     │        │ PDF       │   │ (future)  │
     │ Extractor │        │ Extractor │   │           │
     └─────┬─────┘        └─────┬─────┘   └────┬──────┘
           │                    │              │
           └────────────────────┼──────────────┘
                                │
                        ┌───────▼───────┐
                        │   Validator   │  ← Flags failures, never drops
                        └───────┬───────┘
                                │
                    ┌───────────▼───────────┐
                    │   BRONZE (raw + meta) │  ← Source provenance preserved
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   SILVER (cleaned)    │  ← Standardised, deduplicated
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   GOLD (ML features)  │  ← Feature-engineered
                    └───────────┬───────────┘
                                │
                        ┌───────▼───────┐
                        │  PostgreSQL   │  ← Upsert (idempotent)
                        └───────────────┘
```

## Directory Structure

```
etl/
├── extractors/
│   ├── excel.py        # Excel/CSV extraction with SA data cleaning
│   ├── pdf.py          # PDF job card text extraction (pdfplumber)
│   └── validator.py    # Data validation — flags errors, never drops
├── transformers/
│   ├── bronze.py       # Raw storage with source metadata
│   ├── silver.py       # Cleaning, standardisation, deduplication
│   └── gold.py         # Feature engineering for ML
├── loaders/
│   └── postgres_loader.py  # SQLAlchemy upserts (idempotent)
├── dags/
│   └── rams_elec_etl_dag.py  # Airflow DAG
├── scripts/
│   └── generate_seed_data.py # 200 synthetic records for pipeline testing
└── README.md
```

## Quick Start

### 1. Install dependencies
```bash
pip install -r etl/requirements.txt
```

### 2. Set environment
```bash
cp packages/db/.env.example .env
# Edit .env with your DATABASE_URL
```

### 3. Generate and test with synthetic data
```bash
python etl/scripts/generate_seed_data.py
```
This creates `synthetic_jobs.xlsx` and runs the full Bronze → Silver → Gold pipeline.

### 4. Run with Airflow
```bash
# Set Airflow home
export AIRFLOW_HOME=$(pwd)/airflow

# Initialise Airflow DB
airflow db init

# Create admin user
airflow users create --username admin --password admin --firstname Admin --lastname User --role Admin --email admin@ramsatelec.co.za

# Start Airflow
airflow webserver -p 8080 &
airflow scheduler &

# Trigger the DAG
airflow dags trigger rams_elec_etl
```

## Data Handling Rules

| Scenario | Behaviour |
|---|---|
| Duplicate rows | Deduplicated in Silver layer by (customer, date, service_type) |
| Missing required fields | Flagged as validation error, row excluded from pipeline |
| Invalid phone format | Flagged, not loaded to customers table |
| Unknown area zone | Flagged as validation error |
| Negative cost | Flagged as validation error |
| Future completion date | Flagged as validation error |
| PDF with no extractable text | Logged as extraction failure |

## Gold Layer Features (for ML)

| Feature | Description |
|---|---|
| `service_category_encoded` | Integer encoding of service category |
| `urgency_flag` | Binary: 1 for emergency/high, 0 otherwise |
| `area_zone_encoded` | Integer encoding of area zone |
| `area_zone_group` | Gauteng / Limpopo grouping |
| `equipment_age_years` | Years since equipment installation |
| `job_duration_days` | Days between scheduled and completion |
| `cost_per_hour` | actual_cost / typical_duration_hours |
| `month` | Month of job (1–12) |
| `day_of_week` | Day of week (0=Mon, 6=Sun) |
| `is_weekend` | Binary: 1 if weekend job |
| `quarter` | Quarter (1–4) |
