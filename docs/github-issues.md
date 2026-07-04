# GitHub Issues — Rams @Elec Intelligence Platform

Copy each issue into GitHub Issues on `github.com/machetheDM/rams-elec-intelligence-platform`.

Labels to create first:
- `module` (blue) — for the 9 main build modules
- `enhancement` (green)
- `documentation` (yellow)
- `infrastructure` (purple)
- `blocked` (red)

Project board: "Rams @Elec Build" with columns: Backlog → Ready → In Progress → In Review → Done

---

## ISSUE 1: Module 1 — Database Schema & Data Models

**Labels:** `module`

**Description:**

### What Needs to Be Built
Star-schema PostgreSQL database with Prisma ORM. Foundation for all other modules.

### Acceptance Criteria
- [ ] Prisma schema with all 9 tables defined (customers, equipment, technicians, jobs, inquiries, cost_estimates, loadshedding_events, areas, notification_log)
- [ ] Foreign keys and cascading rules in place
- [ ] Indexes on frequently queried columns (customer_id, technician_id, area_id, status, created_at)
- [ ] Seed file with 50+ realistic SA job records, 22 customers, 5 technicians
- [ ] Migration script runs without errors
- [ ] Star schema documented in docs/architecture/database-schema.md

### Tech Stack
Prisma, PostgreSQL, TypeScript

### Dependencies
None — start here

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 2: Module 2 — ETL Pipeline

**Labels:** `module`

**Description:**

### What Needs to Be Built
Bronze → Silver → Gold medallion architecture ETL pipeline with Airflow orchestration.

### Acceptance Criteria
- [ ] Excel/CSV extractor handles messy real-world data (missing columns, inconsistent formats)
- [ ] PDF extractor pulls job card fields correctly
- [ ] Bronze → Silver → Gold transformation pipeline (validation, deduplication, feature engineering)
- [ ] Airflow DAG with 6 tasks orchestrates full pipeline
- [ ] Idempotent loads — no duplicates on re-run
- [ ] Error log table captures failed records with row-level error details
- [ ] Synthetic data generator produces 200 test records for development

### Tech Stack
Pandas, SQLAlchemy, Apache Airflow, Python

### Dependencies
- [ ] Issue 1 (Database Schema)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 3: Module 3 — AI Inquiry & Triage Engine

**Labels:** `module`

**Description:**

### What Needs to Be Built
FastAPI microservice that classifies customer inquiries, estimates costs, and matches technicians using AI/ML.

### Acceptance Criteria
- [ ] POST /triage/classify returns structured JSON from unstructured text using Groq LLM
- [ ] XGBoost quote estimator trained on Gold layer data with < 15% MAPE
- [ ] SHAP explainability on cost estimates (which factors drove the price)
- [ ] POST /triage/assign-technician returns ranked technician list with weighted scores
- [ ] MLflow experiment tracking set up and logging all training runs
- [ ] n8n workflow: form → classify → estimate → notify customer + technician via Twilio
- [ ] Next.js multi-step inquiry form connected to API

### Tech Stack
FastAPI, Groq (llama-3.3-70b), XGBoost, SHAP, MLflow, Twilio, n8n

### Dependencies
- [ ] Issue 1 (Database Schema)
- [ ] Issue 2 (ETL Pipeline — for Gold layer training data)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 4: Module 4 — Load-Shedding Intelligence

**Labels:** `module`

**Description:**

### What Needs to Be Built
Real-time load-shedding monitoring and personalised customer alerting system.

### Acceptance Criteria
- [ ] EskomSePush API integration working (NOT Eskom API — EskomSePush only)
- [ ] Airflow DAG polls every 30 minutes
- [ ] New events detected and stored correctly (no duplicates)
- [ ] n8n alert workflow sends personalised WhatsApp to affected customers
- [ ] Cold room customers get priority alerts (equipment.type = 'cold_room')
- [ ] All notifications logged to notification_log table
- [ ] Public homepage widget shows live area status
- [ ] Widget drives inquiries into triage engine ("Get Protection" CTA)

### Tech Stack
FastAPI, EskomSePush API, Airflow, n8n, Twilio

### Dependencies
- [ ] Issue 1 (customers + equipment + areas tables)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 5: Module 5 — Customer Portal + RAG Chatbot

**Labels:** `module`

**Description:**

### What Needs to Be Built
Authenticated customer portal with equipment management, service history, compliance docs, and AI chatbot.

### Acceptance Criteria
- [ ] NextAuth.js v5 authentication working (3 roles: customer, technician, admin)
- [ ] Equipment registry with status indicators (last serviced, next due, health)
- [ ] Service history timeline with PDF download capability
- [ ] Maintenance schedule calendar view
- [ ] Compliance document preparation tool (DRAFT watermark — NOT legal certificate generation)
- [ ] FAISS knowledge base embedded (SANS 10142 summaries + service catalog + FAQ)
- [ ] RAG chatbot answers service questions with source citations
- [ ] Chatbot injects customer equipment context into prompts
- [ ] Chatbot escalates correctly (shows booking button, not hallucinated answer)

### Tech Stack
NextAuth.js v5, FAISS, LangChain, Groq, sentence-transformers, FastAPI

### Dependencies
- [ ] Issue 1 (Database Schema)
- [ ] Issue 2 (ETL Pipeline)
- [ ] Issue 3 (Triage Engine — for inquiry integration)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 6: Module 6 — Analytics Dashboard

**Labels:** `module`

**Description:**

### What Needs to Be Built
6-page Streamlit analytics dashboard for business intelligence and operational monitoring.

### Acceptance Criteria
- [ ] Streamlit dashboard loads from PostgreSQL Gold layer
- [ ] 6 dashboard sections all working with real data:
  - Business Overview (KPIs, revenue, job volume)
  - Inquiry Analytics (conversion rates, source breakdown)
  - Revenue Forecasting (Prophet with confidence intervals)
  - Equipment Health (service due, age distribution)
  - Technician Performance (utilisation, completion rate, customer rating)
  - Load-Shedding Impact (correlation with job volume)
- [ ] Prophet revenue forecast renders with confidence intervals
- [ ] Load-shedding impact correlation chart
- [ ] Date range filters work on all time-series charts
- [ ] CSV export on all tabular views
- [ ] Admin-only access enforced (token-based)

### Tech Stack
Streamlit, Plotly, Prophet, Pandas, PostgreSQL

### Dependencies
- [ ] Issue 1 (Database Schema)
- [ ] Issue 2 (ETL Pipeline — Gold layer)
- [ ] Issue 3 (Triage Engine — inquiry data)
- [ ] Issue 4 (Load-Shedding — impact data)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 7: Module 7 — Dispatch & Job Assignment

**Labels:** `module`

**Description:**

### What Needs to Be Built
Intelligent technician-job matching and dispatch management system.

### Acceptance Criteria
- [ ] POST /dispatch/recommend returns top 3 technicians with weighted scores (skillset + area + workload — NO GPS routing)
- [ ] POST /dispatch/assign updates job status and triggers notifications
- [ ] n8n workflow notifies technician + customer via WhatsApp on assignment
- [ ] Admin kanban board shows all job statuses (unassigned → assigned → in_progress → complete)
- [ ] "Get Recommendation" button works on unassigned jobs
- [ ] Technician mobile view shows today's jobs
- [ ] Status update buttons trigger customer notification automatically

### Tech Stack
FastAPI, Next.js, n8n, Twilio

### Dependencies
- [ ] Issue 1 (Database Schema)
- [ ] Issue 3 (Triage Engine — technician scoring)
- [ ] Issue 5 (Customer Portal — auth + views)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 8: Module 8 — Public Frontend Upgrade

**Labels:** `module`

**Description:**

### What Needs to Be Built
Complete Next.js 16 frontend upgrade with AI-powered features and professional dark-mode design.

### Acceptance Criteria
- [ ] All 5 pages rebuilt or upgraded in Next.js 16 (Home, Services, Inquire, Gallery, Contact)
- [ ] AI inquiry form connected to triage API with multi-step UX
- [ ] Load-shedding widget shows live data from loadshedding API
- [ ] Service cards show real cost ranges from database
- [ ] Gallery page fixed (no placeholder images — real project photos)
- [ ] All dead social links fixed or flagged
- [ ] WhatsApp floating button added
- [ ] Newsletter connected to real email service
- [ ] Lighthouse mobile score > 85
- [ ] All pages SSR or SSG where possible

### Tech Stack
Next.js 16, TypeScript, Tailwind CSS

### Dependencies
- [ ] Issue 3 (Triage Engine — inquiry form API)
- [ ] Issue 4 (Load-Shedding — widget data)
- [ ] Issue 5 (Customer Portal — auth)
- [ ] Issue 7 (Dispatch — admin views)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 9: Module 9 — Integration Testing & Deployment

**Labels:** `module`, `infrastructure`

**Description:**

### What Needs to Be Built
End-to-end testing, CI/CD pipeline verification, and production deployment configuration.

### Acceptance Criteria
- [ ] End-to-end integration test passes full customer journey (inquiry → classify → estimate → assign → notify)
- [ ] All .env.example files complete and accurate across all services
- [ ] Docker Compose runs all services cleanly (docker compose up — no errors)
- [ ] GitHub Actions CI passes on all jobs (lint-python, lint-typescript, test-python, test-nextjs, docker-build)
- [ ] Vercel deployment configured for Next.js frontend
- [ ] Railway/Render Dockerfiles for FastAPI services
- [ ] README.md complete with Mermaid architecture diagram
- [ ] Phase 2 roadmap documented (IoT, CV, GPS dispatch, SANS automation)

### Tech Stack
Docker, GitHub Actions, Vercel, Railway/Render

### Dependencies
- [ ] All previous issues (1-8)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code reviewed
- [ ] README module progress updated

---

## ISSUE 10: Ongoing — Commit Discipline & Documentation

**Labels:** `documentation`

**Description:**

### Ongoing Requirements
- Commit after every feature, not in bulk
- Write meaningful commit messages (feat/fix/docs/refactor prefix)
- Update module progress table in README as each issue closes
- Keep build journal updated after each module (docs/build-journal.md)

### Build Journal Template (per module)
```
## Module X — [Name] — Completed [Date]

### What Was Built
- 

### Key Decisions
- 

### Challenges Encountered
- 

### Lessons Learned
- 
```

---

## ISSUE 11: External API Keys & Credentials Tracker

**Labels:** `infrastructure`

**Description:**

### Tracking Checklist
- [ ] EskomSePush API key registered (https://eskomsepush.gumroad.com/l/api)
- [ ] Groq API key obtained (https://console.groq.com)
- [ ] Twilio account created + WhatsApp sandbox enabled
- [ ] Supabase project created (PostgreSQL)
- [ ] Resend or Mailchimp API key for newsletter
- [ ] All keys added to .env (never committed)
- [ ] .env.example updated with all required variables
