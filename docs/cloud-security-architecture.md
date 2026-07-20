# Cloud Security Architecture — Rams @Elec on Azure

**Module 4 of SecureDevOps Pipeline**
**Applies**: ECCU524 Designing and Implementing Cloud Security (CCSE certification)
**Date**: July 2026
**Status**: Architecture design and IaC documentation (not provisioned — academic project)

---

## Architecture Overview

The Rams @Elec Intelligence Platform is designed for deployment on **Microsoft Azure**, leveraging native security services to implement defence-in-depth across network, identity, data, and application layers.

```mermaid
graph TB
    subgraph "Internet"
        USER[Users / Customers]
    end

    subgraph "Azure Front Door"
        AFD[Azure Front Door<br/>CDN + WAF + DDoS]
    end

    subgraph "Public Subnet 10.0.1.0/24"
        AGW[Application Gateway<br/>WAF v2<br/>OWASP Ruleset 3.2]
    end

    subgraph "Private Subnet 10.0.2.0/24"
        WEB[App Service<br/>Next.js Frontend<br/>:3000]
        API1[Triage Service<br/>:8001]
        API2[Loadshedding<br/>:8002]
        API3[Chatbot<br/>:8003]
        API4[Dispatch<br/>:8004]
    end

    subgraph "Data Subnet 10.0.3.0/24"
        PG[(PostgreSQL<br/>Flexible Server<br/>TDE Enabled)]
        REDIS[(Redis Cache<br/>Premium Tier)]
    end

    subgraph "Management Subnet 10.0.4.0/24"
        AIRFLOW[Airflow<br/>Container Instances]
        N8N[n8n<br/>Container Instances]
        STREAMLIT[Streamlit<br/>Dashboard]
    end

    subgraph "Security Services"
        KV[Key Vault<br/>Secrets + Keys]
        LAW[Log Analytics<br/>Workspace]
        SENTINEL[Microsoft Sentinel<br/>SIEM + SOAR]
        DEFENDER[Defender for Cloud]
    end

    subgraph "Identity"
        ENTRA[Entra ID<br/>Azure AD]
        MI[Managed Identities]
    end

    USER --> AFD
    AFD --> AGW
    AGW --> WEB
    AGW --> API1 & API2 & API3 & API4
    WEB --> API1
    WEB --> API2
    WEB --> API3
    WEB --> API4
    API1 & API2 & API3 & API4 --> PG
    API1 & API2 & API3 & API4 --> REDIS
    API1 & API2 & API3 & API4 --> KV
    AIRFLOW --> PG
    N8N --> PG
    STREAMLIT --> PG

    WEB -.-> ENTRA
    ENTRA -.-> MI
    MI -.-> PG & KV & REDIS

    AGW -.-> LAW
    WEB -.-> LAW
    API1 -.-> LAW
    PG -.-> LAW
    LAW -.-> SENTINEL
    SENTINEL -.-> DEFENDER

    style KV fill:#ff6b35,color:#fff
    style SENTINEL fill:#0078d4,color:#fff
    style DEFENDER fill:#0078d4,color:#fff
    style ENTRA fill:#0078d4,color:#fff
```

---

## Part A: Network Security

### Virtual Network Design

| Component | CIDR | Purpose |
|-----------|------|---------|
| VNet | `10.0.0.0/16` | Isolated network for all Rams @Elec resources |
| Public Subnet | `10.0.1.0/24` | Application Gateway / WAF only |
| Private Subnet | `10.0.2.0/24` | App Services (Next.js + 4 FastAPI services) |
| Data Subnet | `10.0.3.0/24` | PostgreSQL Flexible Server, Redis Cache |
| Management Subnet | `10.0.4.0/24` | Airflow, n8n, Streamlit |

### Network Security Groups (NSGs)

| Subnet | Inbound Rules | Outbound Rules |
|--------|--------------|----------------|
| Public | Allow HTTPS (443) from Azure Front Door only | Deny all (except to Private subnet) |
| Private | Allow from Public subnet on app ports | Allow to Data subnet, Key Vault, Entra ID |
| Data | Allow from Private + Management subnets on DB ports | Deny all internet |
| Management | Allow from VPN/Bastion only | Allow to Data subnet |

### DDoS Protection

- **Azure DDoS Protection Standard** enabled on the VNet
- Provides always-on traffic monitoring and automatic attack mitigation
- Covers volumetric, protocol, and resource-layer attacks

### Private Endpoints

All PaaS services use **Private Endpoints** — traffic never leaves the Microsoft backbone:

- PostgreSQL Flexible Server → Private Endpoint in Data subnet
- Redis Cache → Private Endpoint in Data subnet
- Key Vault → Private Endpoint in Data subnet

---

## Part B: Identity & Access Management

### Entra ID (Azure AD) Integration

| Component | Authentication Method |
|-----------|----------------------|
| Next.js Frontend | Entra ID App Registration + NextAuth |
| FastAPI Services | Managed Identity + JWT validation |
| PostgreSQL | Managed Identity (passwordless) |
| Key Vault | Managed Identity + RBAC |
| Airflow / n8n | Service Principal |

### Managed Identities

**No hardcoded credentials anywhere.** Every service uses system-assigned Managed Identity:

```python
# Instead of:
DATABASE_URL = "postgresql://user:password@host:5432/db"

# Use:
from azure.identity import DefaultAzureCredential
credential = DefaultAzureCredential()
token = credential.get_token("https://ossrdbms-aad.database.windows.net/.default")
```

### Role-Based Access Control (RBAC)

| Role | Permissions | Assigned To |
|------|-------------|-------------|
| **Admin** | Full resource management, Key Vault admin, security config | Dingaan Machethe |
| **Application** | Read/write to PostgreSQL, read Key Vault secrets | App Service Managed Identities |
| **Monitoring** | Read Log Analytics, view Sentinel alerts | DevOps / Security team |
| **Technician** | Read jobs, update status via API | Technician Entra ID accounts |
| **Customer** | Read own data, submit inquiries | Customer Entra ID accounts |

### Conditional Access Policies

| Policy | Condition | Action |
|--------|-----------|--------|
| MFA for admins | Admin role + any location | Require MFA |
| Block legacy auth | Legacy protocols (POP, IMAP, SMTP) | Block |
| Geo-fencing | Outside South Africa | Block (except admin VPN) |
| Device compliance | Non-compliant device | Block access |

---

## Part C: Data Protection

### Encryption at Rest

| Service | Encryption Method |
|---------|-------------------|
| PostgreSQL | TDE (Transparent Data Encryption) — AES-256 |
| Redis Cache | Azure Redis encryption at rest |
| App Service | Azure Disk Encryption |
| Key Vault | Automatic encryption at rest |

### Encryption in Transit

| Path | Protocol |
|------|----------|
| User → Front Door | TLS 1.3 |
| Front Door → App Gateway | TLS 1.3 |
| App Gateway → App Service | TLS 1.2+ (internal) |
| App Service → PostgreSQL | TLS 1.2+ (private endpoint) |
| App Service → Key Vault | TLS 1.2+ (private endpoint) |

### Key Management

All secrets, API keys, and certificates stored in **Azure Key Vault**:

| Secret Type | Rotation | Access |
|-------------|----------|--------|
| Database credentials | 90 days (auto-rotate) | Managed Identity only |
| API keys (Groq, EskomSePush) | 180 days | Managed Identity only |
| JWT signing key | 30 days | App Service only |
| TLS certificates | Auto-renew via Azure | Front Door / App Gateway |

### Data Classification

| Classification | Examples | Controls |
|---------------|----------|----------|
| **Public** | Service catalog, FAQ | No restrictions |
| **Internal** | Job counts, technician names | Auth required |
| **Confidential** | Customer names, emails, phone numbers | Auth + RBAC + audit log |
| **Restricted** | Password hashes, API keys | Key Vault only, never in logs |

---

## Part D: Application Security

### Azure Application Gateway + WAF

- **WAF v2** with OWASP 3.2 ruleset
- Prevention mode (not just detection)
- Custom rules for Rams @Elec-specific patterns:
  - Rate limiting on `/triage/classify` (100 req/min)
  - Geo-filtering (ZA only)
  - SQL injection detection
  - XSS detection

### Azure API Management (Future)

For production scaling, wrap FastAPI services with Azure API Management:
- Rate limiting per subscription key
- Request/response transformation
- API versioning
- Developer portal for API documentation

### Azure Front Door

- Global CDN for static assets
- SSL/TLS termination
- DDoS protection at the edge
- URL-based routing to App Gateway

---

## Part E: Monitoring & SIEM

### Log Analytics Workspace

All services send diagnostic logs to a central Log Analytics workspace:

| Service | Logs Collected |
|---------|---------------|
| App Service | App logs, HTTP logs, security audit logs |
| PostgreSQL | Query logs, connection logs, audit logs |
| Key Vault | Access logs, secret rotation events |
| Application Gateway | WAF logs, access logs |
| Front Door | Access logs, WAF logs |

### Microsoft Sentinel (SIEM + SOAR)

**Alert Rules**:

| Alert | Threshold | Severity |
|-------|-----------|----------|
| Failed authentication spike | >10 failures in 5 min from same IP | High |
| Unusual API call pattern | >3x baseline hourly rate | Medium |
| WAF rule trigger | Any SQL injection or XSS rule | High |
| Database connection anomaly | >50% increase in connections | Medium |
| Key Vault access outside business hours | Any access 22:00–06:00 SAST | High |
| New location login | Login from previously unseen geo | Medium |

**Automated Playbooks (SOAR)**:

| Trigger | Automated Response |
|---------|-------------------|
| WAF SQL injection alert | Block source IP for 24h via NSG rule |
| Auth failure spike | Enable account lockout, notify admin |
| Key Vault anomaly | Revoke affected Managed Identity, notify admin |

---

## Part F: Compliance Mapping

### NIST SP 800-53 Controls

| NIST Control | Azure Implementation |
|-------------|---------------------|
| AC-2 (Account Management) | Entra ID + RBAC |
| AC-3 (Access Enforcement) | Conditional Access + Managed Identity |
| AC-6 (Least Privilege) | RBAC with minimum required permissions |
| AU-2 (Audit Events) | Log Analytics + Sentinel |
| AU-6 (Audit Review) | Sentinel alert rules + weekly review |
| IA-2 (Identification & Authentication) | Entra ID + MFA |
| IA-5 (Authenticator Management) | Key Vault + auto-rotation |
| SC-7 (Boundary Protection) | NSGs + Private Endpoints + WAF |
| SC-8 (Transmission Confidentiality) | TLS 1.3 everywhere |
| SC-12 (Cryptographic Key Management) | Key Vault + Managed HSM |
| SC-28 (Protection of Information at Rest) | TDE + Disk Encryption |
| SI-4 (Information System Monitoring) | Sentinel + Defender for Cloud |

### POPIA (SA Data Protection Law)

| POPIA Requirement | Implementation |
|-------------------|---------------|
| Section 19 — Security measures | All controls in this document |
| Section 20 — Notification of breach | Sentinel alert → incident response (72-hour rule) |
| Section 21 — Operator agreements | Azure DPA (Data Processing Addendum) |
| Section 22 — Security safeguards | Encryption at rest + in transit |
| Section 83 — Direct marketing consent | Opt-in consent tracking in customer DB |

### CIS Azure Foundations Benchmark

| CIS Control | Status |
|-------------|--------|
| 1.1 — MFA for all users | ✅ Conditional Access policy |
| 1.2 — No legacy authentication | ✅ Blocked via Conditional Access |
| 2.1 — Azure Defender enabled | ✅ Defender for Cloud |
| 3.1 — Key Vault firewall | ✅ Private Endpoint only |
| 4.1 — PostgreSQL audit logging | ✅ Log Analytics |
| 5.1 — NSG on all subnets | ✅ All 4 subnets |
| 6.1 — WAF enabled | ✅ Application Gateway WAF v2 |
| 7.1 — Disk encryption | ✅ Azure Disk Encryption |
| 8.1 — Sentinel enabled | ✅ Microsoft Sentinel |

---

## References

- NIST SP 800-53 Rev 5: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
- NIST SP 800-207 (Zero Trust Architecture): https://csrc.nist.gov/publications/detail/sp/800-207/final
- CIS Azure Foundations Benchmark v2.0: https://www.cisecurity.org/benchmark/azure
- POPIA Act 4 of 2013: https://popia.co.za/
- Azure Architecture Center: https://learn.microsoft.com/en-us/azure/architecture/
