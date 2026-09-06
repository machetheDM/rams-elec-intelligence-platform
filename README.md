# Rams @Elec Intelligence Platform Showcase

### Built a full AI operations platform for a real South African electrical and refrigeration company — automated inquiry triage, XGBoost cost estimation with SHAP explainability, a 3-agent CrewAI crew, RAG chatbot, and AWS-native ML infrastructure. External client engagement.

**Client:** [ramsatelec.com](https://ramsatelec.com) — Electrical & Refrigeration Engineering, Gauteng + Limpopo, South Africa

> This showcase carries the architecture, patterns and engineering decisions from the production system. The production repository is **private** — it contains infrastructure configuration, deployment specifics, and will handle customer data. This mirror exists for portfolio purposes only.

---

## Screenshots

> Screenshots coming soon — the landing page hero with live load-shedding widget, gallery with project photography, services catalog, admin analytics dashboards, and the inquiry-triage flow returning a cost estimate with SHAP explanations.

---

## Why this repository is a mirror

The production platform is **private**, deliberately. It holds Terraform infrastructure configuration, SSM parameter paths, API key validation patterns, and will eventually process customer data — publishing it would expose the business's attack surface and is incompatible with South Africa's **POPIA**.

This showcase carries the architecture, code patterns and engineering decisions with none of the operational configuration. Its companion projects [EduPortal Showcase](https://github.com/machetheDM/edu-portal-showcase) and [EduAnalytics Showcase](https://github.com/machetheDM/edu-analytics-showcase) are mirrored for the same reason.

---

## Author

**Dingaan Mahlatse Machethe**
MSc Data Science (University of East London, UK) | MSc Cybersecurity — Cloud Security Architect (EC-Council University, USA) | PGDip Data Science (Regenesys Business School)

---

## Problem, Technique, Result

### The Problem
Small South African electrical and refrigeration companies run on phone calls, WhatsApp messages, and paper job cards. Inquiries sit in a WhatsApp inbox with no triage. Cost estimates are guesswork. Technician assignment is whoever answers the phone. Load-shedding — a daily reality — damages equipment and costs customers money, but nobody tracks the pattern or warns them. The company's website is a static brochure that generates no leads.

### Techniques Used
- **Microservices Architecture:** 6 FastAPI services (triage, load-shedding, chatbot, dispatch, CrewAI crew, sentiment), each with API key auth, rate limiting, security headers, input sanitisation, and audit logging via a shared `security/` middleware stack
- **NLP Classification:** Groq LLM (llama-3.3-70b-versatile) for inquiry classification with keyword-based fallback when the LLM is unavailable
- **ML Cost Estimation:** XGBoost regressor trained on completed job history, SHAP TreeExplainer for per-feature cost impact explanations, MLflow experiment tracking
- **Multi-Agent Triage:** CrewAI 3-agent sequential crew (classifier, cost estimator, technician matcher) with inter-agent sanitisation, cost-determinism guard, and delegation disabled to keep deterministic work deterministic
- **RAG Chatbot:** FAISS vector store over SANS 10142 electrical regulations + company FAQ, Groq LLM for generation, LangChain orchestration
- **ETL Pipeline:** Bronze-Silver-Gold medallion architecture — Excel/CSV/PDF extraction, validation, feature engineering. Parallel S3 Parquet write for the AWS data lake
- **AWS ML Infrastructure:** SageMaker Training Jobs + Model Registry + gated Serverless Inference, Glue Crawler/Catalog over S3 Gold Parquet, Textract OCR fallback for scanned job cards, Bedrock as a second LLM backend alongside Groq
- **Security Hardening:** Fail-closed API key gate (unknown environment refuses to start), CORS locked to specific origins, Pydantic `extra="forbid"` + `sanitize_prompt_input` on all LLM-facing fields, CSP/X-Frame-Options headers, per-IP rate limiting

### The Result
- **38-route Next.js frontend** that replaces the original static brochure — 11-section landing page, gallery with project portfolio, services catalog with process section, customer portal, admin analytics (7 dashboard pages), AI-powered inquiry form, and RAG chatbot
- **XGBoost quote estimator:** MAE R11,280.65, R^2 0.5121, CV MAE R10,393.38 (108/27 split, synthetic data — disclosed honestly in the UI and metrics.json)
- **6 microservices** with a shared security middleware stack, consistent health checks, API key auth, and audit logging
- **CrewAI crew** that is measurably slower but architecturally extensible — a fourth specialist is a configuration change, not a rewrite. Benchmark: [crew-vs-sequential.md](docs/crew-vs-sequential.md)
- **AWS infrastructure** (Terraform, never applied): $8/month budget ceiling, every billable resource gated behind the budget, SageMaker endpoint default-off, Glue Crawler on-demand only
- **SecureDevOps pipeline:** 6-job CI (Bandit SAST, Safety/npm SCA, detect-secrets, Trivy container scan, Terraform validate), built for ECCU510/ECCU524 coursework
- **Inter-agent sanitisation** — a security control most CrewAI implementations miss. Task output is re-sanitised before chaining to the next agent, because Task 1's output becomes Task 2's prompt

---

## What This Is

An AI-powered operations platform for **Rams @Elec**, replacing a static brochure site with automated inquiry triage, cost estimation, technician dispatch, load-shedding intelligence, a RAG chatbot, and analytics. Built as a paid client engagement and simultaneously as portfolio evidence for Data Science / AI Engineering / Cloud Security roles.

Two layers in one repo:
1. **The product** — Next.js frontend, 6 FastAPI microservices, Prisma/Postgres, Airflow ETL, Streamlit dashboard, n8n automations
2. **A DevSecOps overlay** — ECCU510 (Secure Programming) and ECCU524 (Cloud Security): security audit, hardening middleware, CI security pipeline, Azure/AWS Terraform, runbooks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, NextAuth v5, Recharts |
| ML Microservices | FastAPI, XGBoost, SHAP, scikit-learn |
| LLM / RAG | Groq llama-3.3-70b, FAISS, LangChain, sentence-transformers |
| Multi-Agent | CrewAI (3-agent sequential crew, tools over internal HTTP) |
| ETL | Pandas, Airflow, SQLAlchemy, Bronze-Silver-Gold medallion |
| Database | PostgreSQL (Supabase), Prisma ORM |
| AWS ML | SageMaker (Training + Registry + Serverless Inference), Glue/Athena, Textract, Bedrock |
| Automation | n8n (WhatsApp/SMS via Twilio), Apache Airflow |
| Analytics | Recharts (Next.js), Streamlit, Plotly, Prophet |
| Experiment Tracking | MLflow |
| IaC | Terraform (AWS: Lambda, S3, SageMaker, Glue, Budgets; Azure: designed, not provisioned) |
| Security | Bandit, Safety, detect-secrets, truffleHog, Trivy, ESLint Security |
| CI/CD | GitHub Actions (6-job security pipeline + Terraform validate) |

---

## Architecture Overview

```
                          Browser / Mobile
                               |
                          ┌────┴────┐
                          │ Next.js │ Port 3000
                          │ 15 App  │ NextAuth v5
                          │ Router  │
                          └────┬────┘
                               │ Same-origin proxy routes
           ┌───────────┬───────┼───────┬───────────┐
           │           │       │       │           │
     ┌─────┴─────┐ ┌───┴───┐ ┌┴────┐ ┌┴─────┐ ┌───┴────┐
     │  Triage   │ │ Load- │ │ RAG │ │ Dis- │ │ CrewAI │
     │  :8001    │ │ Shed  │ │Chat │ │patch │ │ Crew   │
     │ Groq+XGB  │ │ :8002 │ │:8003│ │:8004 │ │ :8005  │
     │ +SHAP     │ │ ESP   │ │FAISS│ │ SQL  │ │3 agents│
     └─────┬─────┘ └───┬───┘ └─┬──┘ └──┬───┘ └───┬────┘
           │           │       │       │         │
     ┌─────┴───────────┴───────┴───────┴─────────┘
     │          security/ middleware stack
     │   API key auth · rate limit · CSP · sanitisation
     └─────────────────────┬───────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────┴──┐  ┌──────┴─────┐  ┌──┴──────┐
     │ PostgreSQL│  │ FAISS      │  │ MLflow  │
     │ (Supabase)│  │ Vector DB  │  │Tracking │
     └───────────┘  └────────────┘  └─────────┘

     ┌────────────────────────────────────────────┐
     │              AWS (Terraform)               │
     │  Lambda (sentiment) · S3 (artifacts+Gold)  │
     │  SageMaker (train+registry+inference)      │
     │  Glue (catalog+crawler) · Budgets ($8/mo)  │
     └────────────────────────────────────────────┘

     ┌──────────────┐    ┌────────────────────┐
     │ Airflow DAGs │    │ Streamlit Dashboard │
     │ ETL + alerts │    │ 6 pages + Prophet   │
     └──────┬───────┘    └────────┬───────────┘
            │                     │
     ┌──────┴──────┐              │
     │ n8n         │              │
     │ WhatsApp/SMS│──── Twilio   │
     └─────────────┘              │
                                  └──── PostgreSQL
```

---

## Key Modules Showcase

### 1. AI Inquiry Triage Engine
`services/triage/main.py` — FastAPI service providing NLP classification, XGBoost cost estimation with SHAP explanations, and technician assignment:
- **Groq LLM classification** with structured JSON extraction and keyword-based fallback
- **XGBoost cost estimation** trained on Gold-layer completed jobs, with `MODEL_BACKEND=local|sagemaker` switch for AWS-native serving
- **SHAP TreeExplainer** produces per-feature cost impact explanations ("urgency level increases cost by R2,400")
- **SageMaker integration** — `_predict_sagemaker()` invokes Serverless Inference, degrades gracefully on failure
- Pydantic inputs: `extra="forbid"`, `sanitize_prompt_input` on LLM-facing fields, SA phone validation (E.164)

**Skills demonstrated:** XGBoost regression, SHAP explainability, Groq LLM integration, Pydantic input hardening, graceful degradation, multi-backend ML serving.

---

### 2. CrewAI Multi-Agent Triage
`services/crew/` — Three autonomous agents performing the same triage pipeline as the sequential endpoint, but as collaborating specialists:
- **Provider-generic LLM backend** — `CREW_MODEL` accepts `groq/<model>` or `bedrock/<model-id>`, routed by litellm. `build_llm()` never raises, matching triage's degradation contract
- **Inter-agent sanitisation** — `task_callback` re-runs `sanitize_prompt_input()` on every task output before it chains forward, because Task 1's output becomes Task 2's prompt. Most CrewAI implementations miss this
- **Cost-determinism guard** — after `kickoff()`, the service compares what the crew reported against the XGBoost tool's ground truth. On disagreement the tool's value wins, the response carries `cost_estimate_overridden: true`, and a SecurityLogger event fires
- **Delegation disabled** — `allow_delegation=False` on all three agents, so the classifier cannot end up writing cost estimates without calling the XGBoost tool

**Skills demonstrated:** CrewAI agent design, prompt injection mitigation in multi-agent chains, LLM output verification against deterministic models, multi-provider LLM backends.

---

### 3. Security Middleware Stack
`security/` — Shared across all 6 services via `apply_security_middleware()`:
- **Fail-closed API key gate** — unknown `APP_ENV` refuses to start rather than serving an open endpoint. The committed development keys' hashes are rejected in non-development environments, even if supplied via `API_KEY_HASHES`
- **Never raise inside middleware** — `BaseHTTPMiddleware.dispatch()` returns `JSONResponse` directly, not `HTTPException`, because Starlette's `ExceptionMiddleware` sits inside user middleware and would surface 401 as 500
- **Input sanitisation** — `sanitize_prompt_input()` strips control characters, code fences, and injection markers from any string reaching an LLM
- **SecurityLogger** emits structured JSON audit events (auth failures, rate-limit hits, validation failures)

**Skills demonstrated:** FastAPI/Starlette middleware architecture, zero-trust API key design, defence-in-depth input validation, audit logging.

---

### 4. ETL Pipeline + AWS Data Lake
`etl/` — Bronze-Silver-Gold medallion architecture with parallel S3 output:
- **PDF extraction** — `pdfplumber` for text-layer PDFs, `TextractExtractor` as opt-in fallback for scanned job cards (single-page AnalyzeDocument with FORMS feature)
- **S3GoldLoader** — writes Gold DataFrame to Parquet partitioned by ingestion date (`dt=YYYY-MM-DD`), alongside the existing Postgres load. Degrades to "skipped" when no AWS credentials are present
- **Glue Crawler** catalogs the S3 Gold prefix so Athena can query it as a partitioned table without a warehouse
- **Airflow DAGs** — `PythonOperator` (no TaskFlow), `schedule_interval` (not `schedule`), SQLAlchemy `create_engine + text()`

**Skills demonstrated:** Medallion ETL architecture, AWS Glue/Athena data lake, Textract OCR, Airflow DAG design, graceful degradation for optional cloud dependencies.

---

### 5. SageMaker ML Pipeline
`services/triage/sagemaker/` + `terraform/aws/sagemaker.tf` — AWS-native training and serving path alongside the local XGBoost model:
- **`launch_training_job.py`** reads Gold Parquet from S3, falls back to Postgres, uploads train/test CSVs, submits a SageMaker Training Job (XGBoost 1.7-1 built-in container), and registers the result as a Model Package with `PendingManualApproval`
- **`train.py`** runs inside the SageMaker container — deliberately dumb, no encoding or DB access, just numeric CSVs. Feature encoding happens in `launch_training_job.py` using the same `feature_encoding.py` both training paths share
- **Serverless Inference** endpoint is count-gated (`enable_sagemaker_endpoint`, default `false`) — cannot be deployed until a model artifact exists
- **CI regression gate** — `.github/workflows/sagemaker-train.yml` (`workflow_dispatch` only) compares SageMaker metrics against the committed local baseline

**Skills demonstrated:** SageMaker Training Jobs, Model Registry, Serverless Inference, CI regression gating, infrastructure-as-code with Terraform, cost-gated resource deployment.

---

### 6. AWS Infrastructure (Terraform)
`terraform/aws/` — Serverless-only, budget-capped, never applied:
- **Budget guardrails** — $8/month ceiling + $1/day tripwire. Every billable resource carries `depends_on = [aws_budgets_budget.monthly_cost]`. Budget must exist before the things it guards
- **Lambda** — sentiment service via Mangum over the existing FastAPI app (preserves the full security middleware stack), Function URL with `authorization_type = "NONE"` defended by the fail-closed API key gate
- **IAM** — least-privilege roles per service (Lambda, SageMaker, Glue Crawler). No managed `*FullAccess` policies anywhere
- **SSM** — secrets created out of band with `aws ssm put-parameter --type SecureString`. A value passed through Terraform lands in state in plaintext, which defeats encrypting it

**Skills demonstrated:** Terraform IaC, AWS Lambda/S3/SageMaker/Glue/Budgets, least-privilege IAM, cost engineering for portfolio-scale projects, secure secrets management.

---

### 7. Frontend Architecture (38 Routes)
`frontend/` — Next.js 15 App Router with strict separation of concerns:

**Public pages (no auth):**
- `/` — 11-section landing page: Hero with live load-shedding widget, AI inquiry form, services bento grid, process workflow ("Blueprint to Mastery"), ML quote estimator stats, risk intelligence, about section with image + stat overlay, security/trust panel, testimonials, load-shedding alerts signup, contact information (phone/email/location/hours), closing CTA
- `/services` — Full-bleed image header, 3 featured capability cards, service catalog with indicative pricing, process section, emergency CTA
- `/gallery` — 9 projects across 4 filterable categories (cold rooms, electrical, HVAC, emergency) with representative imagery and transparency disclosure
- `/inquire` — AI-powered inquiry form
- `/login` — NextAuth v5 credentials provider

**Customer portal (auth-gated):**
- `/dashboard`, `/equipment`, `/service-history`, `/compliance`, `/chatbot`

**Admin analytics (7 Recharts dashboard pages):**
- Overview, inquiries, revenue, equipment, technicians, load-shedding impact, follow-up sentiment/satisfaction

**Architecture patterns:**
- `src/lib/api/*.ts` = data fetching (no React), `src/hooks/*.ts` = headless state (zero markup), `src/components/**` = presentation only
- All browser-to-service calls go through same-origin `src/app/api/*/route.ts` proxy routes that inject `INTERNAL_API_KEY` server-side — no API key ever reaches the browser
- Prisma singleton with explicit `datasourceUrl` override to prevent `.env` auto-loading bugs
- Tailwind design system: `brand-*` (amber) + `industrial-*` (slate), blueprint grid textures, instrument-panel aesthetics
- CSP, X-Frame-Options, COOP, CORP, Permissions-Policy security headers on every response

**Skills demonstrated:** Next.js App Router architecture, NextAuth v5, server-side API proxying, Recharts data visualisation, responsive design systems, Content Security Policy engineering.

---

## What This Project Demonstrates

### AI / ML Engineering
- XGBoost regression with SHAP explainability
- CrewAI multi-agent orchestration with security hardening
- RAG chatbot (FAISS + LLM) with domain-specific knowledge base
- SageMaker Training Jobs, Model Registry, Serverless Inference
- Multi-provider LLM backends (Groq, Bedrock) with graceful degradation
- MLflow experiment tracking

### Data Engineering
- Bronze-Silver-Gold medallion ETL pipeline
- S3 data lake with Glue Crawler/Catalog and Athena
- PDF/Excel extraction with Textract OCR fallback
- Airflow DAG orchestration

### Full-Stack Development
- Next.js 15 App Router with NextAuth v5 (38 routes — 18 pages, 17 API proxies, icon route)
- 11-section landing page, gallery with filtering, services catalog, customer portal, 7 admin analytics dashboards
- 6 FastAPI microservices with shared security middleware
- Prisma ORM with PostgreSQL, comprehensive seed data (22 customers, 60 jobs, 25 follow-ups)
- Recharts analytics dashboards replacing legacy Streamlit

### Cloud & DevOps
- AWS Terraform (Lambda, S3, SageMaker, Glue, Budgets)
- Azure Terraform (designed, not provisioned)
- Docker Compose local development
- GitHub Actions CI (6-job security pipeline + Terraform validate)
- Cost engineering: $8/month ceiling, structural controls not just alerts

### Cybersecurity
- Fail-closed API key authentication
- Inter-agent prompt injection mitigation
- LLM output verification against deterministic models
- OWASP Top 10 + STRIDE threat model (ECCU510/ECCU524 coursework)
- SecureDevOps pipeline: Bandit, Safety, detect-secrets, truffleHog, Trivy

---

## Honesty Policy

This project's differentiator is that **every claim is verifiable**:
- **No fabricated statistics.** Four unsourced marketing figures were removed from the risk section rather than kept for impressiveness
- **No invented testimonials.** The `REAL_TESTIMONIALS` array is empty; samples are hard-gated behind `NODE_ENV === "development"` so the bundler strips them from production
- **No untrained models presented as trained.** `metrics.json` carries `data_source: "synthetic_etl_pipeline"` and the UI renders that disclosure
- **Designed != deployed.** Azure Terraform and the AWS stack are labelled accurately. Nothing has been applied to any cloud account
- The XGBoost R^2 of 0.51 is reported honestly — the synthetic data has irreducible variance by design. This will read differently with real job history

---

## Related Projects

- **[EduPortal Showcase](https://github.com/machetheDM/edu-portal-showcase)** — Next.js 16 school management portal with AI chatbot (production at mahlontebe.org.za)
- **[EduAnalytics Showcase](https://github.com/machetheDM/edu-analytics-showcase)** — PySide6 desktop app with ML clustering, predictive modelling, FastAPI, Docker
- **[SA STEM Insights](https://github.com/machetheDM/za-stem-insights)** — Streamlit analytics on 10 years of SA matric data (XGBoost, SHAP, K-Means, Holt ETS)
- **[ML IDS Zero Trust](https://github.com/machetheDM/ml-ids-zero-trust-cloud)** — MSc research: LSTM intrusion detection in Zero Trust Architecture (98.1% accuracy, published ECCU Cyber Journal 2026)

---

## License

This showcase is provided for portfolio and educational purposes. The production system and its data remain private.

---

*Built by Dingaan Mahlatse Machethe — Data Science | AI Engineering | Cloud Security*
