# Kavach360 Next Development Steps

## Step 1: Start Infrastructure

```bash
cd infra
docker compose up -d
```

## Step 2: Start Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Step 3: Seed Demo Data

Create demo tenant, users, modules and templates using the API or SQL seed script.

## Step 4: Convert Frontend Prototype

Move `frontend/public/final-portal.html` into a real Next.js component structure:

- Layout
- Navigation
- Dashboard
- Training
- Phishing
- Users
- Reports
- Settings

## Step 5: Connect APIs

Replace static data with API calls.

## Step 6: Implement Auth and RBAC

- Super Admin
- Customer Admin
- Learner
- Campaign Manager
- Content Creator
- Auditor

## Step 7: Content Protection

- Private S3/MinIO bucket
- Signed URLs
- Watermarking
- Audit logs

## Step 8: Phishing Engine

- Campaign scheduler
- Email queue
- Tracking tokens
- Safe redirect page
- Auto remedial module assignment

## Step 9: Reports

- User report
- Department risk
- Campaign report
- Compliance mapping
- CSV/PDF export
