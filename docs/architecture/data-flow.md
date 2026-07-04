# Data Flow — Key Journeys

## Journey 1: Customer Submits Inquiry

```
1. Customer fills multi-step form on Next.js frontend (/inquire)
2. Form data sent to n8n webhook endpoint
3. n8n forwards to Triage FastAPI POST /triage/classify
4. Triage calls Groq LLM for NLP classification (service_category, urgency, area_zone)
5. Triage calls POST /triage/estimate-cost (XGBoost model + SHAP explanation)
6. Triage calls POST /triage/assign-technician (skillset + area + workload scoring)
7. Results written to PostgreSQL (inquiries, jobs, cost_estimates tables)
8. n8n polls for completion, then triggers Twilio workflow
9. Customer receives WhatsApp: "Your quote is ready — estimated R X,XXX. Technician assigned: [Name]. View: [link]"
10. Admin dashboard shows new inquiry in real-time

Services involved: Next.js → n8n → Triage FastAPI → Groq → PostgreSQL → n8n → Twilio → WhatsApp
```

## Journey 2: Load-Shedding Alert

```
1. Airflow DAG polls EskomSePush API every 30 minutes
2. New stage/event detected → written to PostgreSQL (loadshedding_events table)
3. Airflow triggers n8n webhook on new event
4. n8n queries PostgreSQL for customers in affected area_zone
5. n8n filters: cold room customers get priority (equipment.type = 'cold_room')
6. n8n sends personalised WhatsApp via Twilio to each affected customer
7. Notification logged to notification_log table
8. Next.js widget on homepage shows live area status via GET /loadshedding/status/{area_zone}
9. Widget includes "Get Protection" CTA → drives inquiries into triage engine

Services involved: Airflow → EskomSePush → PostgreSQL → n8n → Twilio → WhatsApp
```

## Journey 3: Admin Assigns a Job

```
1. Admin views kanban board on /admin/jobs
2. Admin clicks "Get Recommendation" on an unassigned job
3. Frontend calls POST /dispatch/recommend with job_id
4. Dispatch service queries PostgreSQL for:
   - Job requirements (skillset, area, urgency)
   - Available technicians (skills, area_familiarity, current_workload)
5. Weighted scoring algorithm ranks top 3 technicians
6. Admin selects technician and clicks "Assign"
7. Frontend calls POST /dispatch/assign with job_id + technician_id
8. Job status updated to 'assigned' in PostgreSQL
9. n8n workflow triggered: sends WhatsApp to technician (job details) + customer (confirmation)
10. Technician mobile view updates with new job

Services involved: Next.js → Dispatch FastAPI → PostgreSQL → n8n → Twilio → WhatsApp
```

## Journey 4: Customer Uses RAG Chatbot

```
1. Customer types question in portal chatbot (/chatbot)
2. Frontend sends POST /chatbot/query with message + conversation_history
3. Chatbot service embeds query using sentence-transformers
4. FAISS similarity search on knowledge base (SANS 10142 summaries + service catalog + FAQ)
5. Top 3 relevant chunks retrieved with relevance scores
6. Chatbot injects customer equipment context from PostgreSQL (equipment table)
7. Augmented prompt sent to Groq LLM with system prompt + context + conversation
8. Groq returns cited answer
9. If Groq detects out-of-scope question → returns escalate_to_human: true
10. Frontend shows booking button instead of hallucinated answer
11. Response with sources returned to frontend

Services involved: Next.js → Chatbot FastAPI → FAISS → PostgreSQL → Groq → Response
```
