# Kavach360 Step-by-Step API, Database and Frontend Integration

## 1. Start the Database and Services

```bash
cd kavach360-production-starter/infra
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- MinIO on `localhost:9000`
- Mailhog on `localhost:8025`

The SQL migrations in `database/migrations` run automatically when PostgreSQL is first created.

## 2. Start the Backend API

```bash
cd kavach360-production-starter/backend
cp .env.example .env
npm install
npm run dev
```

API runs on:

```text
http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/health
```

## 3. Demo Login

Seeded demo login:

```text
Email: admin@kavach360.local
Password: Admin@123
```

Login request:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kavach360.local","password":"Admin@123"}'
```

Copy the returned token.

## 4. Authenticated API Pattern

All protected APIs use:

```http
Authorization: Bearer <token>
```

Example:

```bash
curl http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

## 5. Link Frontend to API

Create a frontend API helper:

```js
const API_BASE = 'http://localhost:4000';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

## 6. Login Integration

```js
async function login(email, password) {
  const result = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('token', result.token);
  localStorage.setItem('user', JSON.stringify(result.user));
}
```

## 7. Dashboard Integration

Replace static dashboard data with:

```js
const dashboard = await api('/api/dashboard');
```

Bind values:

- `dashboard.trainingCompletion`
- `dashboard.users`
- `dashboard.modules`
- `dashboard.phishClickRate`
- `dashboard.reportRate`
- `dashboard.departmentRisk`

## 8. Users Integration

List users:

```js
const users = await api('/api/users');
```

Add user:

```js
await api('/api/users', {
  method: 'POST',
  body: JSON.stringify({
    name: 'New User',
    email: 'new.user@company.com',
    role: 'Learner',
    risk: 'Low'
  })
});
```

Delete user:

```js
await api(`/api/users/${userId}`, { method: 'DELETE' });
```

## 9. Module Integration

List modules:

```js
const modules = await api('/api/modules');
```

Create module:

```js
await api('/api/modules', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Mobile Scam Awareness',
    type: 'Interactive Module',
    category: 'Mobile Security',
    difficulty: 'Beginner',
    estimatedMinutes: 7,
    contentJson: {
      video: 'mobile-scams.mp4',
      quiz: [{ q: 'Should OTP be shared?', a: 'No' }]
    }
  })
});
```

Assign module:

```js
await api('/api/training/assign', {
  method: 'POST',
  body: JSON.stringify({
    moduleId: '<module-id>',
    assignedToType: 'all',
    dueDate: '2026-08-15'
  })
});
```

Assignment types:

- `all`
- `department`
- `users`
- `me`

## 10. Phishing Template Integration

List templates:

```js
const templates = await api('/api/phishing/templates');
```

Create template:

```js
await api('/api/phishing/templates', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Password Expiry',
    subject: 'Urgent: Your mailbox password expires today',
    bodyHtml: '<p>Verify using {{training_link}}</p>',
    bodyText: 'Verify using {{training_link}}',
    difficulty: 'Intermediate',
    redFlags: ['Urgency', 'Unexpected login link']
  })
});
```

## 11. Phishing Campaign Integration

Schedule campaign:

```js
await api('/api/phishing/campaigns', {
  method: 'POST',
  body: JSON.stringify({
    templateId: '<template-id>',
    name: 'August Password Expiry Drill',
    scheduledAt: '2026-08-01T10:30:00+05:30',
    audienceType: 'department',
    consentJson: {
      management_approval: true,
      hr_legal_review: true,
      no_credential_collection: true,
      approved_domain: true
    },
    redirectRuleJson: {
      on_click: 'interactive_module',
      module: 'Phishing Basics',
      auto_assign_remedial: true,
      micro_quiz: true
    }
  })
});
```

## 12. Phishing Event Tracking

When user opens/clicks/reports, send safe event:

```js
await fetch('http://localhost:4000/api/phishing/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenantId: '<tenant-id>',
    campaignId: '<campaign-id>',
    targetId: '<target-id>',
    eventType: 'clicked',
    metadata: { source: 'training-link' }
  })
});
```

Event types:

- `sent`
- `opened`
- `clicked`
- `reported`
- `training_completed`
- `bounced`

## 13. Auto Redirect After Click

After click event is recorded:

1. Save `clicked` event.
2. Read campaign `redirect_rule_json`.
3. Redirect user to:
   - Training landing page
   - Video training
   - Interactive module
   - Micro quiz
4. Auto assign remedial module if enabled.
5. Update user report.

## 14. Reports Integration

User report:

```js
const report = await api(`/api/reports/user/${userId}`);
```

Compliance report:

```js
const compliance = await api('/api/reports/compliance');
```

## 15. SMTP Settings Integration

Get SMTP:

```js
const smtp = await api('/api/settings/smtp');
```

Update SMTP:

```js
await api('/api/settings/smtp', {
  method: 'PATCH',
  body: JSON.stringify({
    host: 'smtp.company.com',
    port: 587,
    encryption: 'starttls',
    senderName: 'Kavach360 Training',
    senderEmail: 'training@company.com'
  })
});
```

## 16. Content Protection Integration

Do not expose raw file URLs.

Production flow:

1. User opens protected module.
2. Frontend requests signed URL from backend.
3. Backend checks:
   - user
   - tenant
   - licence
   - assignment
4. Backend returns short-lived signed URL.
5. Frontend streams video/PDF.
6. Access is logged.

## 17. Recommended Frontend Page Mapping

| Portal Area | API |
|---|---|
| Dashboard | `/api/dashboard` |
| Users | `/api/users` |
| Training Modules | `/api/modules` |
| Assign Module | `/api/training/assign` |
| Phishing Templates | `/api/phishing/templates` |
| Phishing Campaigns | `/api/phishing/campaigns` |
| User Report | `/api/reports/user/:id` |
| Compliance Report | `/api/reports/compliance` |
| SMTP Settings | `/api/settings/smtp` |

## 18. Production Checklist

Before production:

- Replace dev login fallback with hashed passwords only.
- Add refresh tokens.
- Add RBAC middleware.
- Add tenant isolation checks to every query.
- Encrypt SMTP secrets.
- Add rate limiting.
- Add file scanning for uploads.
- Add audit logs for all admin actions.
- Add signed URLs for content.
- Add email queue with Redis.
- Add proper PDF certificate generation.
