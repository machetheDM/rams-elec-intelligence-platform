# Rams @Elec — System Architecture

## Architecture Diagram

```mermaid
graph TB
    subgraph "Public Layer"
        FE[Next.js 16 Frontend<br/>Vercel Deployed]
        IW[Inquiry Widget]
        LW[Load-Shedding Widget]
    end

    subgraph "AI Microservices — Railway/Render"
        TR[Triage Engine<br/>FastAPI :8001<br/>Groq + XGBoost + SHAP]
        LS[Load-Shedding<br/>FastAPI :8002<br/>EskomSePush API]
        CB[RAG Chatbot<br/>FastAPI :8003<br/>FAISS + Groq]
        DP[Dispatch Service<br/>FastAPI :8004<br/>Skillset Scoring]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Supabase)]
        FAISS[(FAISS Vector Store<br/>SANS 10142 + FAQ)]
        RD[(Redis<br/>Cache + Celery)]
    end

    subgraph "Automation"
        N8N[n8n Workflows<br/>WhatsApp/SMS Alerts]
        AF[Airflow DAGs<br/>ETL + Load-Shedding Polling]
    end

    subgraph "Analytics"
        ST[Streamlit Dashboard<br/>:8501<br/>6 Pages + Prophet]
        ML[MLflow<br/>Experiment Tracking]
    end

    subgraph "External APIs"
        GROQ[Groq LLM<br/>llama-3.3-70b]
        ESP[EskomSePush<br/>Load-Shedding Data]
        TW[Twilio<br/>WhatsApp + SMS]
    end

    FE --> TR
    FE --> LS
    FE --> CB
    FE --> DP
    TR --> PG
    TR --> GROQ
    LS --> PG
    LS --> ESP
    CB --> PG
    CB --> FAISS
    CB --> GROQ
    DP --> PG
    N8N --> TR
    N8N --> LS
    N8N --> DP
    N8N --> TW
    AF --> PG
    AF --> LS
    AF --> RD
    ST --> PG
```

## Data Flow: Key Journey

```
Web Form → n8n Webhook → Triage FastAPI → PostgreSQL → n8n → Twilio → Customer WhatsApp
```

## Service Descriptions

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| **Web Frontend** | 3000 | Next.js 16, TypeScript, Tailwind | Public site + customer portal + admin dashboard |
| **Triage Engine** | 8001 | FastAPI, Groq, XGBoost, SHAP | NLP inquiry classification, cost estimation, technician matching |
| **Load-Shedding** | 8002 | FastAPI, EskomSePush | Real-time load-shedding status, schedules, alerts |
| **RAG Chatbot** | 8003 | FastAPI, FAISS, Groq, LangChain | Knowledge-base chatbot with SANS 10142 citations |
| **Dispatch** | 8004 | FastAPI | Skillset + area + workload scoring for technician assignment |
| **Dashboard** | 8501 | Streamlit, Plotly, Prophet | 6-page analytics dashboard |
| **Airflow** | 8080 | Apache Airflow | ETL orchestration + load-shedding polling DAGs |
| **n8n** | 5678 | n8n | Automation workflows (WhatsApp/SMS notifications) |
| **PostgreSQL** | 5432 | PostgreSQL 15 | Primary database (via Supabase) |
| **Redis** | 6379 | Redis 7 | Cache + Celery broker for Airflow |

## Deployment

| Component | Platform |
|-----------|----------|
| Next.js Frontend | Vercel |
| FastAPI Services | Railway / Render |
| PostgreSQL | Supabase |
| Streamlit | Railway |
| Airflow + n8n | Self-hosted (Docker) |
