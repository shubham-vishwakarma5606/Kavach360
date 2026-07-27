# Kavach360 Final Project Documentation

## 1. Project Status

**Status: Finalized Prototype**

The Kavach360 project has been finalized as a cybersecurity awareness, phishing simulation, compliance training and reporting SaaS prototype.

The project includes two separate experiences:

1. **Public Marketing Website**
2. **Logged-in Customer/Admin Portal**

---

## 2. Final File Structure

### Public Website

**File:** `cyber-awareness-design/index.html`

Purpose:

- Product marketing
- Animated landing page
- Feature showcase
- Book demo
- Support/FAQ
- Public-facing product explanation

### Final Portal

**File:** `cyber-awareness-design/portal-clean/single-portal.html`

Purpose:

- Clean professional GoldPhish-style portal
- Left navigation based
- Dashboard, Training, Phishing, Users, Company, Licences, Reports, Policies, Settings
- Support Centre, Theme and Profile on left side

### Optimized Flow Reference

**File:** `cyber-awareness-design/portal-clean/optimized-flow.html`

Purpose:

- Simplified portal flow reference
- Earlier optimized UI version

### Additional Prototype Screens

**Folder:** `cyber-awareness-design/screens/`

Includes:

- Login
- Central Control
- Customer Admin
- Learner Dashboard
- Content Editor
- SMTP Settings
- Phishing Builder
- Reports
- Certificate
- Scam Radar
- Branding
- Moderation
- Licence Management
- User Management

---

## 3. Final Product Positioning

Kavach360 is a **multi-tenant cybersecurity awareness, phishing simulation and compliance training SaaS** for businesses.

It helps organisations:

- Train employees on cybersecurity awareness
- Run safe phishing simulations
- Manage DPDPA, RBI, SEBI and other compliance awareness
- Upload customer-specific training content
- Assign modules to users
- Track training completion
- Generate user-level and department-level reports
- Issue certificates
- Manage licences and trials
- Collect user-contributed scam examples

---

## 4. Final Portal Navigation

All portal navigation is on the **left side**.

Final left sidebar:

1. Dashboard
2. Training
3. Phishing
4. Users
5. Company
6. Licences
7. Reports
8. Policies
9. Settings
10. Support Centre
11. Theme
12. Profile / Logout

### UI Rule

The top area should not contain navigation tabs.

The page header may only contain page-specific actions such as:

- Save
- Reset
- Schedule
- Export CSV
- Export PDF

---

## 5. Final Feature List

## Dashboard

- Training status
- Assigned modules
- Completion percentage
- Phishing click rate
- Phishing report rate
- Priority actions
- Latest activity
- Risk summary
- Compliance snapshot

## Training

- My Training
- Assigned modules
- Interactive modules
- Videos
- Quizzes
- Fill-in-the-blanks
- Puzzle modules
- Scenario-based questions
- DPDPA modules
- RBI / SEBI / NIST / ISO / MITRE modules
- IoT, mobile, Play Store, email and AI fraud modules
- Protected view-only content
- Certificate-linked completion

## Phishing

- Campaign creation
- Campaign scheduling
- Scenario selection
- Difficulty selection
- Approved domain selection
- Landing page selection
- Campaign consent note
- Management approval checklist
- HR/legal approval checklist
- No real credential collection confirmation
- Assign users by department
- Assign selected users
- Assign all users
- Assign by CSV upload
- Safe campaign launch
- Save draft

## Users

- User directory
- Add users
- Bulk upload users
- Department mapping
- Role assignment
- Admin / learner roles
- Manager role
- Content creator role
- High-risk user tracking
- Retraining assignment
- User status tracking

## Company

- Company profile
- Company branding
- Customer academy name
- Approved domains
- Training domain
- SMTP domain
- Company logo
- Company colours
- Portal identity

## Licences

- Licence plan
- 30-day free trial
- Trial extension
- Active user count
- User limit
- Licence expiry
- Feature entitlements
- Basic / Professional / Enterprise plan status
- Licence renewal status

## Reports

- Training completion dashboard
- Phishing click rate
- Phishing report rate
- Average report time
- Department risk report
- Compliance coverage report
- DPDPA completion report
- RBI / SEBI / NIST mapping report
- Individual user report
- User cyber score
- User quiz score
- User phishing history
- User certificate status
- Activity timeline
- Export CSV
- Export PDF

## Policies

- Acceptable Use Policy
- Data Retention Policy
- Incident Reporting Policy
- DPDPA policy
- Cybersecurity policy
- User acknowledgement tracking
- Policy version tracking
- Policy completion report

## Settings

Settings uses left-side sub-navigation.

Sections:

- Theme
- Company Logo
- System Emails
- User Sync
- SSO
- Logs
- Reminders
- SMTP
- Security

---

## 6. Content Protection Requirement

The portal includes UI-level no-download messaging. Production must enforce content protection server-side.

Required production controls:

- Private storage
- Signed streaming URLs
- Backend authorization
- Watermarking
- Audit logs
- No public file URLs
- Short-lived access tokens
- Licence-based access checks
- Tenant-based access checks

Important:

No web application can fully prevent screen recording or screenshots. The goal is to prevent casual downloading, control access, watermark content and maintain audit logs.

---

## 7. Recommended Technology Stack

Frontend:

- Next.js
- React
- Tailwind CSS
- Shadcn UI
- Framer Motion
- GSAP
- Three.js / React Three Fiber for public website animations

Backend:

- NestJS or Laravel
- PostgreSQL
- Redis queues
- S3-compatible private file storage
- SMTP/email provider
- JWT + refresh token auth
- RBAC
- Multi-tenant architecture

Integrations:

- SMTP
- Microsoft 365, future
- Google Workspace, future
- SSO/SAML/OIDC, future
- Webhooks, future

---

## 8. Recommended Development Phases

### Phase 1: Core Platform

- Auth
- Tenant management
- User management
- Licence management
- Dashboard
- Training module viewer
- Content protection architecture

### Phase 2: Content and Learning

- Module CMS
- Video modules
- Quiz modules
- Fill-in-the-blanks
- Puzzles
- Certificates
- User progress tracking

### Phase 3: Phishing Simulation

- Template editor
- Campaign builder
- Schedule and consent workflow
- User assignment
- Safe tracking
- Reports

### Phase 4: Compliance and Reporting

- DPDPA reports
- RBI/SEBI/NIST/ISO mapping
- Department risk reports
- Individual user reports
- CSV/PDF export

### Phase 5: Advanced Features

- Scam Radar
- Contribution moderation
- AI scam explainer
- SSO
- Azure AD / Google sync
- APIs/webhooks

---

## 9. Final Recommendation

Use:

- `index.html` for the public website
- `portal-clean/single-portal.html` for the final logged-in portal

This combination gives the product:

- A premium animated public website
- A clean professional customer portal
- GoldPhish-style flow
- Left-side navigation
- Minimal confusion
- Complete awareness, phishing, compliance and reporting structure
