-- =============================================================================
-- Rams @Elec Intelligence Platform — Initial Migration
-- =============================================================================
-- Run: npx prisma migrate deploy
-- Or:  npx prisma migrate dev --name init (for development)
-- =============================================================================

-- DIMENSION TABLES

CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "address" TEXT,
    "area_zone" TEXT NOT NULL,
    "alert_subscribed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "skills" TEXT[],
    "area_zones" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "max_daily_jobs" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "technicians_phone_key" ON "technicians"("phone");
CREATE UNIQUE INDEX "technicians_email_key" ON "technicians"("email");

CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "install_date" TIMESTAMP(3),
    "last_service_date" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "base_cost_min" DOUBLE PRECISION NOT NULL,
    "base_cost_max" DOUBLE PRECISION NOT NULL,
    "typical_duration_hours" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "service_types_name_key" ON "service_types"("name");

-- FACT TABLES

CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "service_type_id" TEXT NOT NULL,
    "equipment_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "area_zone" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "quoted_cost" DOUBLE PRECISION,
    "actual_cost" DOUBLE PRECISION,
    "job_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "jobs_status_idx" ON "jobs"("status");
CREATE INDEX "jobs_area_zone_idx" ON "jobs"("area_zone");
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");
CREATE INDEX "jobs_customer_id_idx" ON "jobs"("customer_id");
CREATE INDEX "jobs_technician_id_idx" ON "jobs"("technician_id");

CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web_form',
    "raw_message" TEXT NOT NULL,
    "classified_type" TEXT,
    "urgency_score" DOUBLE PRECISION,
    "estimated_cost_min" DOUBLE PRECISION,
    "estimated_cost_max" DOUBLE PRECISION,
    "assigned_job_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "inquiries_assigned_job_id_key" ON "inquiries"("assigned_job_id");
CREATE INDEX "inquiries_status_idx" ON "inquiries"("status");
CREATE INDEX "inquiries_created_at_idx" ON "inquiries"("created_at");

CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "inquiry_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "total_min" DOUBLE PRECISION NOT NULL,
    "total_max" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sent_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

CREATE TABLE "maintenance_schedules" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "interval_months" INTEGER NOT NULL DEFAULT 6,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_schedules_status_idx" ON "maintenance_schedules"("status");
CREATE INDEX "maintenance_schedules_scheduled_date_idx" ON "maintenance_schedules"("scheduled_date");

-- EVENT / LOG TABLES

CREATE TABLE "loadshedding_events" (
    "id" TEXT NOT NULL,
    "area_zone" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'eskomsepush',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loadshedding_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "loadshedding_events_area_zone_idx" ON "loadshedding_events"("area_zone");
CREATE INDEX "loadshedding_events_start_time_idx" ON "loadshedding_events"("start_time");
CREATE INDEX "loadshedding_events_end_time_idx" ON "loadshedding_events"("end_time");

CREATE TABLE "notification_log" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "channel" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notification_log_customer_id_idx" ON "notification_log"("customer_id");
CREATE INDEX "notification_log_sent_at_idx" ON "notification_log"("sent_at");

CREATE TABLE "job_status_history" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "job_status_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_status_history_job_id_idx" ON "job_status_history"("job_id");

CREATE TABLE "etl_error_log" (
    "id" TEXT NOT NULL,
    "source_file" TEXT NOT NULL,
    "row_index" INTEGER,
    "field_name" TEXT,
    "raw_value" TEXT,
    "error_type" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etl_error_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "etl_error_log_source_file_idx" ON "etl_error_log"("source_file");
CREATE INDEX "etl_error_log_error_type_idx" ON "etl_error_log"("error_type");

CREATE TABLE "chatbot_conversations" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sources" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "chatbot_conversations_customer_id_idx" ON "chatbot_conversations"("customer_id");
CREATE INDEX "chatbot_conversations_created_at_idx" ON "chatbot_conversations"("created_at");

-- AUTH TABLES (NextAuth.js v5)

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "password_hash" TEXT,
    "customer_id" TEXT,
    "technician_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_customer_id_key" ON "users"("customer_id");
CREATE UNIQUE INDEX "users_technician_id_key" ON "users"("technician_id");

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE "equipment" ADD CONSTRAINT "equipment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_job_id_fkey" FOREIGN KEY ("assigned_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "quotes" ADD CONSTRAINT "quotes_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "job_status_history" ADD CONSTRAINT "job_status_history_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
