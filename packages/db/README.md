# Rams @Elec — Database Schema & Data Models

## Architecture: Star Schema

```
                    ┌──────────────┐
                    │  customers   │  DIMENSION
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼──────┐  ┌──────▼──────┐  ┌─────▼──────────┐
    │   jobs     │  │  inquiries  │  │  quotes         │  FACT
    └─────┬──────┘  └──────┬──────┘  └────────────────┘
          │                │
    ┌─────▼──────┐  ┌──────▼──────┐
    │technicians │  │service_types│  DIMENSION
    └────────────┘  └─────────────┘
```

## Tables

### Dimension Tables (describe entities)

| Table | Role | Key Fields |
|---|---|---|
| `customers` | Client registry | name, phone, area_zone, alert_subscribed |
| `technicians` | Field staff | name, skills[], area_zones[], active, max_daily_jobs |
| `equipment` | Installed assets per customer | type (cold_room/hvac/electrical_panel/generator), brand, install_date, warranty_expiry |
| `service_types` | Service catalog with pricing | category, base_cost_min, base_cost_max, typical_duration_hours |

### Fact Tables (capture business events)

| Table | Role | Feeds |
|---|---|---|
| `jobs` | Work orders — the core operational record | Quote estimator training, dispatch scoring, revenue analytics |
| `inquiries` | Raw customer inquiries before triage | AI triage engine input, conversion funnel analytics |
| `quotes` | Formal price quotes sent to customers | Quote acceptance rate, revenue forecasting |
| `maintenance_schedules` | Preventative maintenance calendar | Equipment health tracking, overdue alerts |

### Event/Log Tables (track state changes)

| Table | Role |
|---|---|
| `loadshedding_events` | EskomSePush data — stage + time per area zone |
| `notification_log` | All outbound WhatsApp/SMS/email messages |
| `job_status_history` | Full audit trail of job status transitions |
| `etl_error_log` | Pipeline validation failures (Module 2) |
| `chatbot_conversations` | RAG chatbot interaction log (Module 5) |

### Auth Tables (NextAuth.js v5)

| Table | Role |
|---|---|
| `users` | User accounts with role (customer/technician/admin) |
| `accounts` | OAuth provider links |
| `sessions` | Active session tokens |
| `verification_tokens` | Magic link / email verification tokens |

## Area Zones

Gauteng: Sandton, Midrand, Centurion, Pretoria East, Soweto
Limpopo: Polokwane, Mokopane, Bela-Bela

## Seed Data

The seed file generates:
- 12 service types covering electrical, refrigeration, HVAC, and emergency
- 22 customers across all 8 area zones
- 5 technicians with realistic skill sets and area coverage
- ~60 equipment records (1-3 per customer)
- 60 jobs (45 completed for ML training, 15 in various states)
- 30 inquiries (20 converted to jobs)
- 15 quotes
- 30 maintenance schedules
- 112 load-shedding events (14 days × 8 zones)
- 40 notification logs

## Commands

```bash
# From packages/db/
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database (no migrations)
npm run db:migrate       # Create and apply migration
npm run db:migrate:deploy # Apply migrations in production
npm run db:seed          # Seed the database
npm run db:studio        # Open Prisma Studio GUI
npm run db:reset         # Reset database and re-run seed
```

## Environment

Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL instance.
