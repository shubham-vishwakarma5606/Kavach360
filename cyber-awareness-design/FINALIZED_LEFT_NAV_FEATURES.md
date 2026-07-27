# Kavach360 Finalized Left Navigation & Feature Structure

## Final Decision

Yes — this is the finalized portal structure.

The product will have two separate experiences:

1. **Public Website**
   - Premium animated marketing website
   - Product overview
   - Book demo
   - Feature showcase
   - Support/contact

2. **Logged-in Portal**
   - Clean professional SaaS UI
   - GoldPhish-style flow
   - All main navigation on the left side
   - Minimal top actions only where required

---

# Final Left Sidebar Navigation

## 1. Dashboard

Purpose: Management and user overview.

Features:

- Overall training status
- Training completion percentage
- Assigned modules
- Phishing click rate
- Phishing report rate
- Priority actions
- Latest activity
- Risk summary
- Compliance snapshot

---

## 2. Training

Purpose: Awareness learning area.

Features:

- My Training
- Assigned modules
- Interactive modules
- Videos
- Quizzes
- Fill-in-the-blanks
- Puzzle modules
- Scenario-based questions
- DPDPA training
- RBI / SEBI / NIST / compliance modules
- IoT, mobile, Play Store, email and AI fraud modules
- Protected view-only content
- Certificate-linked completion

---

## 3. Phishing

Purpose: Safe phishing simulation management.

Features:

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
- Campaign draft/save

---

## 4. Users

Purpose: User and role management.

Features:

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

---

## 5. Company

Purpose: Customer organisation setup.

Features:

- Company profile
- Company branding
- Customer academy name
- Approved domains
- Training domain
- SMTP domain
- Company logo
- Company colours
- Portal identity

---

## 6. Licences

Purpose: Licence and trial management.

Features:

- Licence plan
- 30-day free trial
- Trial extension
- Active user count
- User limit
- Licence expiry
- Feature entitlements
- Basic / Professional / Enterprise plan status
- Licence renewal status

---

## 7. Reports

Purpose: Dashboards, compliance and user-level reporting.

Features:

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

---

## 8. Policies

Purpose: Policy acknowledgement and internal compliance.

Features:

- Acceptable Use Policy
- Data Retention Policy
- Incident Reporting Policy
- DPDPA policy
- Cybersecurity policy
- User acknowledgement tracking
- Policy version tracking
- Policy completion report

---

## 9. Settings

Purpose: Portal configuration.

Settings must also use left-side sub-navigation, not top tabs.

Settings sections:

### Theme
- Select primary colour
- Select primary text colour
- Select secondary colour
- Select secondary text colour
- Select light theme
- Select dark theme
- Reset theme
- Save theme

### Company Logo
- Upload logo
- Preview logo
- Replace logo

### System Emails
- Email sender name
- Email templates
- Training reminder email
- Certificate email
- Campaign report email

### User Sync
- CSV upload
- Azure AD sync, future
- Google Workspace sync, future

### SSO
- SAML, future
- OIDC, future

### Logs
- Admin activity logs
- Campaign logs
- User activity logs
- Content access logs

### Reminders
- Training reminders
- Overdue reminders
- Licence expiry reminders
- Campaign reminders

### SMTP
- SMTP host
- Port
- Encryption
- Sender email
- Test email

### Security
- MFA for admins
- Content download disabled
- Audit logs enabled
- Session timeout

---

## 10. Support Centre

Purpose: Help and customer support.

Features:

- Book a demo
- Raise support ticket
- FAQ
- Contact support
- Contact security team

Placement: Left sidebar utility area.

---

## 11. Theme Toggle

Purpose: Quick theme switching.

Features:

- Dark theme
- Light theme
- Premium colour theme

Placement: Left sidebar utility area.

---

## 12. Profile / Logout

Purpose: User account access.

Features:

- Logged-in user initials
- User name
- Account options
- Logout

Placement: Left sidebar bottom area.

---

# Final UI Rule

All navigation and utility actions must be on the **left side**.

The top area should not contain navigation tabs.

The page header may only contain page-specific actions, such as:

- Save
- Reset
- Schedule
- Export CSV
- Export PDF

---

# Final Files

## Public Website

`cyber-awareness-design/index.html`

Use for:

- Marketing
- Product introduction
- Feature showcase
- Demo request

## Final Logged-in Portal

`cyber-awareness-design/portal-clean/single-portal.html`

Use for:

- Dashboard
- Training
- Phishing
- Users
- Company
- Licences
- Reports
- Policies
- Settings
- Support Centre
- Theme
- Profile

---

# Final Status

This is the finalized project prototype structure.

No more top navigation is required for the portal. The portal should remain clean, left-navigation based, and GoldPhish-style.
