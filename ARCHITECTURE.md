# Rams @Elec Intelligence Platform Architecture

## System Context

The platform replaces a static brochure website for a real South African electrical and refrigeration services company. It serves three user classes — public visitors (inquiry submission, service catalogue), authenticated customers (job history, equipment registry, chatbot), and administrators (triage dashboard, dispatch, analytics) — through a Next.js frontend backed by 6 FastAPI microservices, a PostgreSQL database, and an optional AWS data lake.

```
                            Internet
                               │
           ┌───────────────────┤
           │                   │
    ┌──────┴──────┐     ┌──────┴──────┐
    │   Vercel    │     │ AWS Lambda  │
    │  Next.js 15 │     │  Sentiment  │
    │  Port 3000  │     │  Function   │
    │  NextAuth   │     │  URL        │
    └──────┬──────┘     └──────┬──────┘
           │                   │
           │      ┌────────────┤
           │      │   security/ middleware (shared)
           │      │   API key · rate limit · CSP · sanitisation
           │      │
    ┌──────┴──────┴────────────────────────────────────┐
    │                FastAPI Microservices               │
    │                                                    │
    │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐  │
    │  │Triage  │ │LoadShed│ │Chatbot │ │ Dispatch   │  │
    │  │:8001   │ │:8002   │ │:8003   │ │ :8004      │  │
    │  │Groq+XGB│ │ESP API │ │FAISS+  │ │ Skillset   │  │
    │  │+SHAP   │ │        │ │Groq    │ │ Scoring    │  │
    │  └────┬───┘ └───┬────┘ └───┬────┘ └─────┬──────┘  │
    │       │         │          │             │          │
    │  ┌────┴─────────┴──────────┴─────────────┘          │
    │  │                                                   │
    │  │  ┌────────┐ ┌───────────┐                         │
    │  │  │CrewAI  │ │ Sentiment │                         │
    │  │  │:8005   │ │ :8006     │                         │
    │  │  │3 agents│ │ Groq NLP  │                         │
    │  │  └────┬───┘ └─────┬─────┘                         │
    │  │       │           │                               │
    └──┴───────┴───────────┴───────────────────────────────┘
               │
    ┌──────────┼──────────────────────────┐
    │          │                          │
    │   ┌──────┴──────┐  ┌────────────┐  │
    │   │ PostgreSQL  │  │ FAISS      │  │
    │   │ (Supabase)  │  │ Vector DB  │  │
    │   │ Prisma ORM  │  │ SANS 10142 │  │
    │   └──────┬──────┘  └────────────┘  │
    │          │                          │
    └──────────┼──────────────────────────┘
               │
    ┌──────────┼──────────────────────────┐
    │   AWS (Terraform, never applied)    │
    │                                     │
    │   S3 ── Gold Parquet ── Glue ── Athena
    │   │                                 │
    │   SageMaker (train+registry+serve)  │
    │   Budgets ($8/mo + $1/day)          │
    │   Lambda (sentiment Function URL)   │
    └─────────────────────────────────────┘

    ┌──────────────┐    ┌────────────────────────┐
    │ Airflow DAGs │    │ Recharts Analytics     │
    │ ETL + alerts │    │ 7 admin dashboard pages│
    └──────┬───────┘    │ (replaced Streamlit)   │
           │            └────────┬───────────────┘
    ┌──────┴──────┐              └──── PostgreSQL
    │ n8n         │
    │ WhatsApp/SMS│──── Twilio
    └─────────────┘
```

---

## Data Flow

### 1. Inquiry Triage Flow

```
Customer ──POST /triage/classify──→ API key validation
                                        │
                                        ▼
                                  sanitize_prompt_input(description)
                                        │
                                        ▼
                                  Groq LLM: classify + urgency
                                  (keyword fallback on LLM failure)
                                        │
                                        ▼
                                  XGBoost: estimate cost
                                  SHAP: per-feature explanations
                                        │
                                  ┌─────┴──────┐
                                  │ local  │ sagemaker │
                                  │ .pkl   │ endpoint  │
                                  └────┬───┘ (fallback)
                                       │
                                       ▼
                                  Dispatch: match technician
                                  (skillset + availability + area)
                                       │
                                       ▼
                                  JSON response with:
                                  - category, urgency
                                  - cost_estimate, cost_range
                                  - shap_explanations[]
                                  - recommended_technician
```

### 2. CrewAI Multi-Agent Flow

```
Customer ──POST /crew/process──→ API key validation
                                      │
                                      ▼
                                sanitize_prompt_input(description)
                                      │
                                      ▼
                                build_triage_crew(model=CREW_MODEL)
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────┴────┐    ┌──────┴─────┐    ┌──────┴──────┐
              │Classifier│    │Cost Agent  │    │Tech Matcher │
              │Agent     │    │            │    │             │
              │          │    │XGBoost tool│    │Dispatch tool│
              └────┬─────┘    └──────┬─────┘    └──────┬──────┘
                   │                 │                 │
                   │   task_callback: sanitise output
                   │   before chaining to next agent
                   │                 │                 │
                   └────────┬────────┘                 │
                            │                          │
                            ▼                          │
                   cost-determinism guard:             │
                   crew estimate != XGBoost?           │
                   XGBoost wins, flag override         │
                            │                          │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                                  JSON response
```

### 3. ETL Pipeline Flow

```
Source Files ──→ PDFExtractor / ExcelExtractor
(Excel, CSV,     │
 PDF job cards)  ├─ pdfplumber (default)
                 └─ TextractExtractor (opt-in fallback)
                        │
                        ▼
                  ┌─────────────┐
                  │   Bronze    │ Raw extracted records
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Silver    │ Validated, deduped, typed
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │    Gold     │ Feature-engineered, analysis-ready
                  └──────┬──────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
       ┌──────┴──┐ ┌─────┴────┐ ┌──┴─────────┐
       │Postgres │ │ S3       │ │ MLflow     │
       │(upsert) │ │ Parquet  │ │ (metrics)  │
       └─────────┘ │ dt=date  │ └────────────┘
                   └──────────┘
                        │
                   Glue Crawler
                        │
                   Athena (SQL queries over S3)
```

### 4. SageMaker Training Flow

```
workflow_dispatch ──→ GitHub Actions
                          │
                          ▼
                    launch_training_job.py
                          │
                    ┌─────┴──────┐
                    │ S3 Gold    │ (preferred)
                    │ Parquet    │
                    │            │
                    │ Postgres   │ (fallback)
                    └─────┬──────┘
                          │
                          ▼
                    encode features + split
                          │
                          ▼
                    upload train/test CSVs to S3
                          │
                          ▼
                    sagemaker.create_training_job()
                    XGBoost 1.7-1 built-in container
                          │
                          ▼
                    create_model_package()
                    status: PendingManualApproval
                          │
                          ▼
                    regression gate:
                    SageMaker MAE < local baseline?
```

---

## Internal Architecture

### Directory Structure

```
ramsatelec-intelligence/
├── packages/db/              # Prisma schema, migrations, seed
│   └── prisma/
│       ├── schema.prisma     # 16 tables, star schema
│       └── migrations/       # Version-controlled schema changes
├── etl/                      # ETL pipeline (Bronze→Silver→Gold)
│   ├── extractors/           # pdf.py, excel.py, textract.py
│   ├── transformers/         # bronze.py, silver.py, gold.py
│   ├── loaders/              # postgres_loader.py, s3_loader.py
│   ├── dags/                 # Airflow DAGs (rams_elec_etl_dag.py)
│   └── scripts/              # generate_seed_data.py
├── services/
│   ├── triage/               # AI classification + XGBoost + SHAP
│   │   ├── main.py           # FastAPI app, MODEL_BACKEND switch
│   │   ├── train_model.py    # Local XGBoost training
│   │   ├── model/            # .pkl artifacts + metrics.json
│   │   └── sagemaker/        # train.py, launch_training_job.py
│   ├── crew/                 # CrewAI 3-agent triage crew
│   │   ├── agents.py         # Provider-generic LLM backend
│   │   ├── crew.py           # Agent + task definitions
│   │   ├── main.py           # FastAPI app
│   │   └── benchmark_bedrock.py
│   ├── loadshedding/         # EskomSePush integration
│   ├── chatbot/              # RAG (FAISS + Groq + LangChain)
│   ├── dispatch/             # Skillset-based technician matching
│   └── sentiment/            # NLP sentiment + Lambda handler
│       ├── main.py           # FastAPI app
│       └── lambda_handler.py # SSM config → Mangum adapter
├── security/                 # Shared middleware stack
│   ├── middleware.py         # apply_security_middleware()
│   ├── api_key_auth.py       # Fail-closed API key gate
│   ├── rate_limiter.py       # Per-IP rate limiting
│   ├── input_sanitiser.py    # sanitize_prompt_input()
│   └── security_logger.py    # Structured JSON audit events
├── frontend/                 # Next.js 15 site (38 routes)
│   └── src/
│       ├── app/(public)/     # Home (11 sections), Services,
│       │                     #   Gallery, Inquiry, Login
│       ├── app/(portal)/     # Dashboard, Equipment, History,
│       │                     #   Compliance, Chatbot
│       ├── app/admin/        # Jobs Kanban + 7 analytics pages
│       │   └── analytics/    #   (Recharts: overview, inquiries,
│       │                     #    revenue, equipment, technicians,
│       │                     #    load-shedding, follow-ups)
│       ├── app/api/*/route.ts # 17 same-origin proxy routes
│       ├── lib/api/          # Data fetching (no React)
│       ├── hooks/            # Headless state (zero markup)
│       └── components/       # Presentation only
│           ├── home/         #   HeroSection, AboutSection,
│           │                 #   ProcessSection, ContactSection,
│           │                 #   CtaSection, SecurityTrustSection
│           └── layout/       #   Navbar, Footer
├── terraform/
│   ├── aws/                  # Module 11: Lambda, S3, SageMaker,
│   │   │                     #   Glue, Budgets (never applied)
│   │   ├── main.tf
│   │   ├── lambda.tf
│   │   ├── sagemaker.tf
│   │   ├── glue.tf
│   │   └── budgets.tf
│   └── *.tf                  # Azure (ECCU524, never provisioned)
├── dashboard/                # Streamlit analytics (legacy, 6 pages)
├── n8n/workflows/            # WhatsApp/SMS automation
├── docker-compose.yml        # Local dev environment
└── .github/workflows/
    ├── ci.yml                # Lint, test, build
    ├── security.yml          # 6-job SecureDevOps pipeline
    ├── terraform-aws.yml     # fmt, init, validate
    └── sagemaker-train.yml   # Manual dispatch training
```

---

## Security Architecture

| Layer | Mechanism | File |
|-------|-----------|------|
| Authentication | Fail-closed API key gate. Unknown `APP_ENV` refuses to start. Committed dev key hashes rejected in non-dev environments | `security/api_key_auth.py` |
| Input Validation | `extra="forbid"` on all Pydantic models. `sanitize_prompt_input()` strips control chars, code fences, injection markers from LLM-facing fields | `security/input_sanitiser.py` |
| Inter-Agent | Task output re-sanitised before chaining to next CrewAI agent | `services/crew/crew.py` |
| Rate Limiting | Per-IP sliding window | `security/rate_limiter.py` |
| Headers | CSP, X-Frame-Options, X-Content-Type-Options on every response. CSP branches on `NODE_ENV` (strict in production, allows `eval` for React Fast Refresh in dev) | `security/middleware.py` |
| Secrets | AWS SSM `SecureString`, created out of band. Never in Terraform state, never committed | `lambda_handler.py` |
| CORS | Locked to specific origins per service | `security/middleware.py` |
| Proxy | Browser never sees API keys. `src/app/api/*/route.ts` holds `INTERNAL_API_KEY` server-side | Next.js route handlers |
| CI | Bandit SAST, Safety SCA, npm audit, detect-secrets, truffleHog, Trivy container scan | `.github/workflows/security.yml` |

---

## AWS Cost Engineering

The AWS infrastructure is designed for a portfolio project's budget, not an enterprise one. Every cost decision is explicit:

| Control | Where | What it prevents |
|---------|-------|-----------------|
| $8/month + $1/day budgets | `budgets.tf` | Unnoticed spend (alert only, cannot cap) |
| `depends_on = [aws_budgets_budget.monthly_cost]` | Every billable resource | Deploying resources before the budget exists |
| `reserved_concurrent_executions = 5` | `lambda.tf` | A retry loop scaling to the account limit |
| `timeout = 30s` | `lambda.tf` | A hung upstream call billing for minutes |
| Explicit log group, 14-day retention | `lambda.tf` | Logs that never expire (the usual free-tier leak) |
| `noncurrent_version_expiration` | `s3.tf` | Versioning turning a few MB into unbounded growth |
| SSE-S3 not KMS CMK | `s3.tf` | $1/month for a key (20% of the budget) for no gain |
| SageMaker endpoint `count = 0` | `sagemaker.tf` | Accidental inference endpoint provisioning |
| Glue Crawler: no `schedule` | `glue.tf` | Silent recurring crawl charges |
| `workflow_dispatch` only | `sagemaker-train.yml` | Accidental training job trigger |

---

## External Integrations

| System | Integration | Purpose |
|--------|------------|---------|
| Groq Cloud | `services/*/main.py` | LLM inference (llama-3.3-70b) |
| AWS Bedrock | `services/crew/agents.py` | Alternative LLM backend |
| EskomSePush | `services/loadshedding/main.py` | Real-time SA load-shedding data |
| Twilio | `n8n/workflows/` | WhatsApp + SMS notifications |
| AWS SageMaker | `services/triage/sagemaker/` | Model training + serving |
| AWS Textract | `etl/extractors/textract.py` | OCR for scanned PDFs |
| AWS S3 + Glue | `etl/loaders/s3_loader.py` | Data lake + catalog |
| Supabase | `packages/db/` | Managed PostgreSQL |
| MLflow | `services/triage/train_model.py` | Experiment tracking |

---

*Last updated: September 2026 — 38-route frontend, 7 Recharts analytics dashboards, gallery page*
