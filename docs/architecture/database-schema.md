# Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    customers ||--o{ equipment : owns
    customers ||--o{ jobs : requests
    customers ||--o{ inquiries : submits
    customers ||--o{ notification_log : receives
    equipment ||--o{ jobs : involves
    technicians ||--o{ jobs : assigned_to
    jobs ||--o{ cost_estimates : has
    inquiries ||--o{ cost_estimates : generates
    areas ||--o{ customers : located_in
    areas ||--o{ loadshedding_events : affected_by

    customers {
        uuid id PK
        string name
        string phone
        string email
        string address
        uuid area_id FK
        timestamp created_at
    }

    equipment {
        uuid id PK
        uuid customer_id FK
        string type
        string brand_model
        string location
        timestamp installed_date
        timestamp last_serviced
    }

    technicians {
        uuid id PK
        string name
        string phone
        string email
        jsonb skills
        jsonb area_familiarity
        int current_workload
        boolean available
    }

    jobs {
        uuid id PK
        uuid customer_id FK
        uuid equipment_id FK
        uuid technician_id FK
        string service_category
        string urgency
        string status
        text description
        decimal estimated_cost
        decimal actual_cost
        timestamp created_at
        timestamp completed_at
    }

    inquiries {
        uuid id PK
        uuid customer_id FK
        text raw_message
        string source
        string service_category
        string urgency
        string area_zone
        timestamp created_at
    }

    cost_estimates {
        uuid id PK
        uuid inquiry_id FK
        uuid job_id FK
        decimal estimated_cost
        decimal confidence_lower
        decimal confidence_upper
        jsonb shap_explanation
        timestamp created_at
    }

    loadshedding_events {
        uuid id PK
        uuid area_id FK
        int stage
        timestamp start_time
        timestamp end_time
        string status
        timestamp fetched_at
    }

    areas {
        uuid id PK
        string name
        string eskomsepush_id
        string province
    }

    notification_log {
        uuid id PK
        uuid customer_id FK
        string channel
        string template
        string status
        text content
        timestamp sent_at
    }
```

## Table Purposes

| Table | Purpose |
|-------|---------|
| **customers** | Core customer records — name, contact, location |
| **equipment** | Customer-owned equipment registry — type, model, service dates |
| **technicians** | Internal technician directory — skills, areas, availability |
| **jobs** | Work orders — links customer, equipment, and technician |
| **inquiries** | Raw inbound inquiries — pre-classification |
| **cost_estimates** | AI-generated cost predictions with SHAP explanations |
| **loadshedding_events** | Cached EskomSePush data — stage, area, timing |
| **areas** | Geographic zones mapped to EskomSePush area IDs |
| **notification_log** | Audit trail of all customer communications |

## Bronze → Silver → Gold Data Layers

### Bronze Layer (Raw Ingestion)
- Raw CSV/Excel/PDF extracts from client's existing records
- Unvalidated, messy real-world data
- Stored in `bronze_*` staging tables
- Purpose: preserve original data, never modified

### Silver Layer (Cleaned & Validated)
- Deduplicated, type-cast, validated records
- Missing values handled (imputed or flagged)
- Foreign key relationships resolved
- Stored in normalized schema tables
- Purpose: reliable, queryable operational data

### Gold Layer (Analytics-Ready)
- Aggregated, feature-engineered views
- Denormalized for dashboard performance
- Includes derived metrics (customer lifetime value, technician utilisation rate)
- Stored as materialized views / feature tables
- Purpose: feeds Streamlit dashboard and ML training
