# Frontend Route Map (38 routes)

All routes served by Next.js 15 App Router. Browser-to-service calls go through same-origin proxy routes that inject `INTERNAL_API_KEY` server-side — no API key ever reaches the browser.

---

## Public Pages (no authentication)

| Route | Description |
|---|---|
| `/` | 11-section landing page: Hero, Inquiry form, Services bento, Process workflow, ML stats, Risk intelligence, About, Security trust, Testimonials, Alert signup, Contact, CTA |
| `/services` | Full-bleed image header, 3 featured capability cards, 12 service types with indicative pricing, process section, emergency CTA |
| `/gallery` | 9 projects across 4 filterable categories (cold rooms, electrical, HVAC, emergency) with representative imagery and transparency disclosure |
| `/inquire` | AI-powered inquiry form — submitted to triage service for NLP classification + XGBoost cost estimation |
| `/login` | NextAuth v5 credentials provider |

---

## Customer Portal (auth-gated)

| Route | Description |
|---|---|
| `/dashboard` | Customer overview — active jobs, equipment summary, recent activity |
| `/equipment` | Equipment registry with maintenance history and next-service dates |
| `/service-history` | Chronological job history with status, cost, technician, and compliance |
| `/compliance` | SANS 10142 compliance records and certificate tracking |
| `/chatbot` | RAG chatbot — FAISS over SANS 10142 + company FAQ, Groq LLM generation |

---

## Admin Pages (auth-gated, role = admin)

| Route | Description |
|---|---|
| `/admin/jobs` | Kanban board — drag-and-drop job assignment across status columns |
| `/admin/analytics` | Business overview — KPI cards, jobs-by-status donut, technician utilisation bar |
| `/admin/analytics/inquiries` | Inquiry volume trends, source breakdown, conversion funnel |
| `/admin/analytics/revenue` | Revenue trends, average job value, top service types by revenue |
| `/admin/analytics/equipment` | Equipment health distribution, maintenance compliance, age analysis |
| `/admin/analytics/technicians` | Per-technician workload, completion rates, area coverage |
| `/admin/analytics/loadshedding` | Load-shedding impact on job scheduling, equipment failures correlated with outage events |
| `/admin/analytics/followups` | Follow-up satisfaction scores, sentiment distribution, response rates |

---

## API Proxy Routes (17 routes)

All under `src/app/api/*/route.ts`. Each injects `INTERNAL_API_KEY` server-side and returns 503 (not 500) on `ECONNREFUSED`.

| Route | Upstream Service |
|---|---|
| `/api/triage/classify` | Triage :8001 |
| `/api/triage/estimate-cost` | Triage :8001 |
| `/api/triage/model-metrics` | Triage :8001 |
| `/api/loadshedding/status` | LoadShed :8002 |
| `/api/loadshedding/schedule` | LoadShed :8002 |
| `/api/loadshedding/subscribe` | LoadShed :8002 |
| `/api/chatbot/chat` | Chatbot :8003 |
| `/api/dispatch/recommend` | Dispatch :8004 |
| `/api/admin/jobs` | Dispatch :8004 |
| `/api/crew/process` | CrewAI :8005 |
| `/api/alerts/subscribe` | LoadShed :8002 |
| `/api/metrics/*` | Various |
| `/api/analytics/*` | PostgreSQL via Prisma (direct) |
| `/api/auth/[...nextauth]` | NextAuth v5 (internal) |

---

## Design System

- **Palette:** `brand-*` (amber) + `industrial-*` (slate)
- **Textures:** Blueprint grid backgrounds (`bg-grid-fine`, `bg-grid-sparse`)
- **Typography:** Monospace labels (`mono-label`), gradient headings (`gradient-text`)
- **Components:** `card-glow`, `tile-interactive`, `btn-primary`, `btn-outline`
- **Security headers:** CSP, X-Frame-Options, COOP, CORP, Permissions-Policy on every response
