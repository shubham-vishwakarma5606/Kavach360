# Kavach360 Cyber Awareness SaaS
# Technical Architecture, Database Design & API Blueprint

## 1. Product Architecture Overview

Kavach360 should be built as a **multi-tenant SaaS platform**.

The system has three main experiences:

1. **Public Website**
   - Marketing website
   - Book demo
   - Trial request
   - Product pages

2. **Central Control Portal**
   - Used by platform owner/super admin
   - Customer management
   - Licence management
   - Trial extension
   - Master content management
   - Global reports
   - Contribution review

3. **Customer Portal**
   - Customer admin dashboard
   - Learner dashboard
   - Content upload
   - SMTP settings
   - Phishing campaign builder
   - Reports
   - Certificates
   - Scam Radar contribution

---

## 2. Recommended Technology Stack

### Frontend

Recommended:

- Next.js / React
- Tailwind CSS
- Shadcn UI
- Framer Motion
- GSAP
- Three.js / React Three Fiber
- Zustand or Redux Toolkit for state

### Backend

Recommended options:

#### Option A: Node.js Enterprise Stack

- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ for queues
- S3-compatible storage
- JWT + refresh tokens
- SAML/OIDC later

#### Option B: Laravel Stack

- Laravel
- PostgreSQL / MySQL
- Redis queues
- Laravel Sanctum / Passport
- S3-compatible storage

### My Recommendation

Use **Next.js + NestJS + PostgreSQL + Redis + S3-compatible storage**.

Reason:

- Strong SaaS architecture
- Good API structure
- Scalable background jobs
- Easy integration with SMTP, Microsoft 365, Google Workspace, SSO and reporting

---

## 3. High-Level System Diagram

```text
Public Website
   |
   |-- Demo Request API
   |-- Trial Signup API
   |
Frontend App / Portals
   |
   |-- Auth Service
   |-- Tenant Service
   |-- Licence Service
   |-- Content Service
   |-- Learning Service
   |-- Campaign Service
   |-- Email Service
   |-- Reporting Service
   |-- Certificate Service
   |-- Contribution Service
   |
PostgreSQL Database
Redis Queue / Cache
Object Storage for files
SMTP / Email Providers
Analytics / Audit Logs
```

---

## 4. Multi-Tenant Model

### Recommended Tenancy Model

Use **shared database, tenant_id separation** for MVP and early scale.

Every customer-owned table should include:

- `tenant_id`
- `created_at`
- `updated_at`
- `created_by`

### Why shared database?

Pros:

- Easier development
- Easier reporting
- Lower infrastructure cost
- Easier trial provisioning
- Easier licence control

### Enterprise Future Option

For large customers, add:

- Dedicated database
- Dedicated storage bucket
- Dedicated encryption key
- Dedicated subdomain

---

## 5. User Roles

### Platform Roles

| Role | Purpose |
|---|---|
| Super Admin | Full access across all tenants |
| Platform Admin | Manage tenants/licences/support |
| Content Admin | Manage master modules/templates |
| Reviewer | Approve contributions/content |
| Support Agent | View customer status and assist |

### Customer Roles

| Role | Purpose |
|---|---|
| Customer Admin | Full control within tenant |
| Content Creator | Create/upload customer content |
| Campaign Manager | Create phishing campaigns |
| Department Manager | View department reports |
| Auditor | Read-only reports/certificates |
| Learner | Complete assigned training |

---

## 6. Core Database Tables

## 6.1 Tenants / Customers

### `tenants`

Stores customer organisation.

Fields:

- `id` UUID PK
- `name`
- `slug`
- `industry`
- `country`
- `primary_contact_name`
- `primary_contact_email`
- `status` active/trial/suspended/cancelled
- `branding_enabled` boolean
- `custom_domain_enabled` boolean
- `created_at`
- `updated_at`

### `tenant_domains`

Stores approved customer domains and simulation domains.

Fields:

- `id` UUID PK
- `tenant_id` FK
- `domain`
- `domain_type` portal/email/simulation/training
- `verification_status` pending/verified/rejected
- `dns_notes`
- `approved_by`
- `approved_at`

---

## 6.2 Licence Management

### `licences`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `plan` trial/basic/professional/enterprise/custom
- `status` active/expired/suspended/cancelled
- `start_date`
- `end_date`
- `trial_extended_until`
- `max_users`
- `features_json`
- `notes`
- `created_at`
- `updated_at`

### `licence_events`

Tracks extensions, upgrades, renewals.

Fields:

- `id` UUID PK
- `tenant_id` FK
- `licence_id` FK
- `event_type` created/extended/upgraded/downgraded/expired/suspended
- `old_value_json`
- `new_value_json`
- `performed_by`
- `notes`
- `created_at`

---

## 6.3 Users and Roles

### `users`

Fields:

- `id` UUID PK
- `tenant_id` nullable FK for platform admins
- `email`
- `name`
- `employee_id`
- `department_id`
- `job_title`
- `status` active/inactive/invited/suspended
- `password_hash`
- `last_login_at`
- `mfa_enabled`
- `created_at`
- `updated_at`

### `roles`

Fields:

- `id` UUID PK
- `name`
- `scope` platform/tenant
- `description`

### `user_roles`

Fields:

- `user_id` FK
- `role_id` FK
- `tenant_id` FK nullable

### `departments`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `name`
- `manager_user_id`

---

## 6.4 Content Management

### `modules`

Stores awareness modules.

Fields:

- `id` UUID PK
- `tenant_id` nullable FK
- `source_type` master/customer
- `title`
- `description`
- `category`
- `difficulty` beginner/intermediate/expert
- `estimated_minutes`
- `status` draft/review/published/archived
- `version`
- `language`
- `industry_pack`
- `framework_mapping_json`
- `created_by`
- `reviewed_by`
- `published_at`
- `created_at`
- `updated_at`

### `module_lessons`

Fields:

- `id` UUID PK
- `module_id` FK
- `lesson_type` text/video/scenario/puzzle/fill_blank/quiz
- `title`
- `content_json`
- `order_index`
- `duration_seconds`

### `module_assets`

Fields:

- `id` UUID PK
- `module_id` FK
- `asset_type` video/pdf/image/audio/file
- `file_url`
- `file_name`
- `file_size`
- `mime_type`
- `uploaded_by`

### `module_versions`

Fields:

- `id` UUID PK
- `module_id` FK
- `version`
- `change_notes`
- `snapshot_json`
- `created_by`
- `created_at`

---

## 6.5 Assignments and Learning Progress

### `training_assignments`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `module_id` FK
- `assignment_name`
- `assigned_to_type` user/department/role/all
- `assigned_to_id` nullable
- `due_date`
- `status` active/closed
- `created_by`
- `created_at`

### `user_module_progress`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `user_id` FK
- `module_id` FK
- `assignment_id` FK nullable
- `status` not_started/in_progress/completed/failed
- `progress_percent`
- `score`
- `started_at`
- `completed_at`
- `last_accessed_at`

### `quiz_attempts`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `user_id` FK
- `module_id` FK
- `score`
- `total_questions`
- `correct_answers`
- `passed` boolean
- `answers_json`
- `attempted_at`

---

## 6.6 Phishing Simulation

### `phishing_templates`

Fields:

- `id` UUID PK
- `tenant_id` nullable FK
- `source_type` master/customer
- `name`
- `category`
- `difficulty`
- `sender_name`
- `sender_email`
- `subject`
- `body_html`
- `body_text`
- `landing_page_html`
- `red_flags_json`
- `status` draft/published/archived
- `created_by`
- `created_at`

### `phishing_campaigns`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `name`
- `template_id` FK
- `target_type` all/department/users/csv
- `scheduled_at`
- `status` draft/scheduled/running/completed/cancelled
- `sender_domain_id` FK
- `landing_page_type` training/custom
- `approval_status` pending/approved/rejected
- `approved_by`
- `created_by`
- `created_at`

### `phishing_targets`

Fields:

- `id` UUID PK
- `campaign_id` FK
- `tenant_id` FK
- `user_id` FK nullable
- `email`
- `name`
- `department`
- `tracking_token_hash`
- `delivery_status` pending/sent/bounced/failed

### `phishing_events`

Tracks safe simulation events.

Fields:

- `id` UUID PK
- `tenant_id` FK
- `campaign_id` FK
- `target_id` FK
- `event_type` sent/opened/clicked/reported/training_completed/bounced
- `event_time`
- `ip_hash`
- `user_agent_hash`
- `metadata_json`

Important:

- Do not store real credentials.
- Do not store raw unnecessary personal data.
- Hash tokens and sensitive metadata.

---

## 6.7 SMTP and Email Notifications

### `smtp_settings`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `provider_type` smtp/sendgrid/ses/mailgun/m365/google
- `host`
- `port`
- `username`
- `encrypted_secret`
- `encryption` none/ssl/tls/starttls
- `sender_name`
- `sender_email`
- `reply_to_email`
- `is_active`
- `last_test_status`
- `last_test_at`

### `email_templates`

Fields:

- `id` UUID PK
- `tenant_id` nullable FK
- `template_type` training_assigned/reminder/overdue/certificate/campaign_report/trial_expiry
- `subject`
- `body_html`
- `body_text`
- `status`

### `email_queue`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `recipient_email`
- `subject`
- `body_html`
- `status` queued/sent/failed
- `provider_message_id`
- `attempts`
- `last_error`
- `scheduled_at`
- `sent_at`

---

## 6.8 Certificates

### `certificates`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `user_id` FK
- `module_id` nullable FK
- `certificate_level` bronze/silver/gold/platinum
- `certificate_id`
- `score`
- `issued_at`
- `expires_at`
- `verification_token_hash`
- `pdf_url`

---

## 6.9 Contribution / Scam Radar

### `contributions`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `submitted_by` FK
- `type` phishing_email/sms/whatsapp/qr/fake_app/deepfake/other
- `title`
- `description`
- `file_url`
- `status` submitted/under_review/redaction_needed/approved/rejected/published
- `redaction_notes`
- `reviewed_by`
- `published_at`
- `created_at`

### `contributor_badges`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `user_id` FK
- `badge_name`
- `points`
- `awarded_at`

---

## 6.10 Branding

### `tenant_branding`

Fields:

- `id` UUID PK
- `tenant_id` FK
- `academy_name`
- `logo_url`
- `primary_color`
- `secondary_color`
- `theme_mode` cyber/premium/light/custom
- `welcome_message`
- `certificate_signature_url`
- `email_footer_html`

---

## 6.11 Audit Logs

### `audit_logs`

Fields:

- `id` UUID PK
- `tenant_id` nullable FK
- `actor_user_id` FK
- `action`
- `resource_type`
- `resource_id`
- `old_value_json`
- `new_value_json`
- `ip_hash`
- `user_agent_hash`
- `created_at`

Audit logs are critical for compliance and support.

---

## 7. API Endpoint Blueprint

## 7.1 Auth

```text
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

## 7.2 Tenants

```text
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/:id
PATCH  /api/tenants/:id
POST   /api/tenants/:id/suspend
POST   /api/tenants/:id/activate
```

## 7.3 Licences

```text
GET   /api/tenants/:tenantId/licence
PATCH /api/tenants/:tenantId/licence
POST  /api/tenants/:tenantId/licence/extend-trial
POST  /api/tenants/:tenantId/licence/upgrade
GET   /api/tenants/:tenantId/licence/events
```

## 7.4 Users

```text
GET    /api/users
POST   /api/users
POST   /api/users/bulk-upload
PATCH  /api/users/:id
DELETE /api/users/:id
POST   /api/users/:id/assign-role
POST   /api/users/:id/suspend
```

## 7.5 Modules / Content

```text
GET    /api/modules
POST   /api/modules
GET    /api/modules/:id
PATCH  /api/modules/:id
POST   /api/modules/:id/publish
POST   /api/modules/:id/archive
POST   /api/modules/:id/assets
GET    /api/modules/:id/versions
POST   /api/modules/:id/duplicate
```

## 7.6 Learning

```text
GET   /api/learner/dashboard
GET   /api/learner/modules
POST  /api/learner/modules/:id/start
POST  /api/learner/modules/:id/progress
POST  /api/learner/modules/:id/complete
POST  /api/learner/modules/:id/quiz-attempt
GET   /api/learner/certificates
```

## 7.7 Phishing Templates

```text
GET    /api/phishing/templates
POST   /api/phishing/templates
GET    /api/phishing/templates/:id
PATCH  /api/phishing/templates/:id
POST   /api/phishing/templates/:id/publish
```

## 7.8 Phishing Campaigns

```text
GET    /api/phishing/campaigns
POST   /api/phishing/campaigns
GET    /api/phishing/campaigns/:id
PATCH  /api/phishing/campaigns/:id
POST   /api/phishing/campaigns/:id/approve
POST   /api/phishing/campaigns/:id/schedule
POST   /api/phishing/campaigns/:id/cancel
GET    /api/phishing/campaigns/:id/report
```

## 7.9 Simulation Tracking

```text
GET  /t/:trackingToken/open
GET  /t/:trackingToken/click
POST /t/:trackingToken/report
POST /t/:trackingToken/training-complete
```

Safety:

- Tracking tokens should be random and hashed in DB.
- Do not collect real credentials.
- Landing pages should be training pages.

## 7.10 SMTP

```text
GET   /api/settings/smtp
PATCH /api/settings/smtp
POST  /api/settings/smtp/test
GET   /api/settings/email-templates
PATCH /api/settings/email-templates/:id
```

## 7.11 Reports

```text
GET /api/reports/dashboard
GET /api/reports/training-completion
GET /api/reports/phishing-performance
GET /api/reports/department-heatmap
GET /api/reports/compliance-mapping
GET /api/reports/export/pdf
GET /api/reports/export/csv
```

## 7.12 Certificates

```text
GET  /api/certificates
POST /api/certificates/generate
GET  /api/certificates/:certificateId/verify
GET  /api/certificates/:id/download
```

## 7.13 Contributions

```text
GET   /api/contributions
POST  /api/contributions
PATCH /api/contributions/:id/review
POST  /api/contributions/:id/approve
POST  /api/contributions/:id/reject
POST  /api/contributions/:id/publish
GET   /api/contributors/wall
```

## 7.14 Branding

```text
GET   /api/settings/branding
PATCH /api/settings/branding
POST  /api/settings/branding/logo
```

---

## 8. Background Jobs / Queues

Use Redis/BullMQ for:

- Sending training assignment emails
- Sending reminders
- Sending certificate emails
- Phishing campaign delivery
- Report generation
- PDF certificate generation
- Trial expiry notifications
- Licence expiry notifications
- Contribution moderation notifications

Queue examples:

```text
email_queue
campaign_delivery_queue
certificate_generation_queue
report_export_queue
trial_expiry_queue
```

---

## 9. Safe Phishing Simulation Design

### Rules

- Customer approval required
- Use approved domains only
- Never collect real passwords
- No malware or harmful payloads
- No emotional trauma scenarios
- No public shaming
- Use training landing pages
- Store minimal event data
- Hash IP and user agent if stored
- Provide audit logs

### Campaign Lifecycle

```text
Draft
  ↓
Review
  ↓
Approved
  ↓
Scheduled
  ↓
Running
  ↓
Completed
  ↓
Report Generated
  ↓
Microtraining Assigned
```

---

## 10. Reporting Metrics

### Training Metrics

- Users enrolled
- Started
- Completed
- Overdue
- Average score
- Certificate issued
- Department completion

### Phishing Metrics

- Delivered
- Opened
- Clicked
- Reported
- Bounced
- Training completed after click
- Repeat clickers
- Department risk
- Average report time

### Compliance Metrics

- DPDPA module completion
- RBI pack completion
- SEBI pack completion
- NIST mapping coverage
- ISO 27001 awareness mapping
- CERT-In incident reporting readiness

### MTTD / MTTR Awareness Metrics

- Time from email sent to first report
- Time from click to user report
- Time from campaign end to report generation
- Time from contribution submission to approval

---

## 11. Security Requirements

- HTTPS only
- Secure cookies
- JWT refresh rotation
- Password hashing with Argon2 or bcrypt
- MFA support
- RBAC enforcement
- Tenant isolation checks on every query
- Rate limiting
- CSRF protection where applicable
- File upload scanning
- Signed URLs for file access
- Encrypted SMTP secrets
- Audit logs
- Data retention settings
- Backups
- Admin activity monitoring

---

## 12. File Storage

Use S3-compatible object storage.

Buckets/folders:

```text
/tenant-assets/{tenant_id}/logos
/tenant-assets/{tenant_id}/content
/tenant-assets/{tenant_id}/certificates
/tenant-assets/{tenant_id}/contributions
/master-content/videos
/master-content/images
```

All uploaded files should pass:

- File type validation
- Size validation
- Virus/malware scanning
- Personal data redaction process for contributions

---

## 13. Notification System

Notification types:

- Training assigned
- Training reminder
- Training overdue
- Certificate issued
- Trial expiring
- Licence expired
- Campaign scheduled
- Campaign completed
- High-risk user detected
- Contribution submitted
- Contribution approved

Channels:

- Email initially
- In-app notifications later
- Webhook later
- Microsoft Teams/Slack later

---

## 14. MVP Backend Scope

### Phase 1 Backend

- Auth
- Tenants
- Licences
- Users
- Roles
- Modules
- Assignments
- Progress
- Certificates

### Phase 2 Backend

- SMTP
- Email templates
- Phishing templates
- Phishing campaigns
- Tracking events
- Reports

### Phase 3 Backend

- Contributions
- Moderation
- Branding
- Advanced reports
- Framework mapping

### Phase 4 Backend

- SSO
- Azure AD/Google sync
- APIs/webhooks
- SCORM/LMS export
- AI scam explainer

---

## 15. Recommended Development Order

1. Database schema
2. Auth and RBAC
3. Tenant and licence management
4. User management
5. Module CMS
6. Learning progress
7. Certificate generation
8. SMTP and notifications
9. Phishing template editor
10. Phishing campaign builder
11. Tracking events
12. Reports
13. Contribution/moderation
14. Branding
15. Integrations

---

## 16. Final Recommendation

Build the platform as a modular multi-tenant SaaS with strict tenant isolation and RBAC from day one.

The strongest MVP should include:

- Central control portal
- Customer portal
- Licence management
- Content CMS
- User management
- Learner dashboard
- Certificates
- SMTP
- Basic phishing campaign builder
- Basic reports

Then add advanced modules:

- Scam Radar
- Compliance mapping
- Red Flag Lens
- AI scam explainer
- MITRE/NIST/ITIL packs
- Advanced integrations
