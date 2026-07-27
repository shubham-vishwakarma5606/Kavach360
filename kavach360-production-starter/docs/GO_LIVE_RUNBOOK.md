# Kavach360 Go-Live Runbook

This is the final step-by-step guide to take Kavach360 from finalized prototype/starter to production.

---

## 1. Final Deliverables

### Final UI

- Public website: `cyber-awareness-design/final-release/public-website.html`
- Final portal: `cyber-awareness-design/final-release/final-portal.html`
- Phishing redirect page: `cyber-awareness-design/final-release/phishing-redirect-page.html`

### Production starter

- Backend scaffold: `kavach360-production-starter/backend`
- Database migrations: `kavach360-production-starter/database/migrations`
- Docker infrastructure: `kavach360-production-starter/infra`
- Production deployment compose: `kavach360-production-starter/deploy/docker-compose.prod.yml`

---

## 2. Pre-Go-Live Checklist

Before production launch, confirm:

- Domain purchased and DNS accessible
- Cloud server provisioned
- SSL certificate plan ready
- PostgreSQL production password created
- JWT secret generated
- SMTP provider ready
- Object storage ready
- Backup policy approved
- Privacy/security policy approved
- Phishing simulation approval workflow approved
- DPDPA/compliance content approved

---

## 3. Recommended Cloud Server

Minimum for pilot:

- 4 vCPU
- 8 GB RAM
- 100 GB SSD
- Ubuntu 24.04 LTS

Recommended for production:

- 8 vCPU
- 16 GB RAM
- Managed PostgreSQL
- Managed Redis
- S3-compatible object storage
- CDN/WAF

---

## 4. Install Server Dependencies

On Ubuntu:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw ca-certificates
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose-plugin
```

Log out and back in after adding user to docker group.

---

## 5. Upload Project

```bash
git clone <your-repo-url> kavach360
cd kavach360/kavach360-production-starter
```

If not using git, upload the folder by SFTP/SCP.

---

## 6. Configure Production Environment

```bash
cd backend
cp .env.production.example .env.production
nano .env.production
```

Set:

```text
DATABASE_URL=postgres://kavach360:<strong-password>@postgres:5432/kavach360
JWT_SECRET=<64+ character random secret>
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
S3_ENDPOINT=<storage-endpoint>
S3_BUCKET=kavach360-private-content
S3_ACCESS_KEY=<key>
S3_SECRET_KEY=<secret>
```

Important:

- Do not use the demo `DEV_PASSWORD` in production.
- Use hashed passwords only.
- Rotate secrets before launch.

---

## 7. Configure Domain in Nginx

Edit:

```bash
nano deploy/nginx/kavach360.conf
```

Replace:

```text
yourdomain.com
```

with your real domain.

---

## 8. Start Production Services

```bash
cd deploy
POSTGRES_PASSWORD='<strong-db-password>' \
MINIO_ROOT_USER='<minio-user>' \
MINIO_ROOT_PASSWORD='<minio-password>' \
docker compose -f docker-compose.prod.yml up -d --build
```

Check containers:

```bash
docker ps
```

Check API:

```bash
curl http://localhost:4000/health
```

---

## 9. SSL Certificate

Recommended: use Certbot or a managed load balancer.

For Certbot with the provided Nginx structure:

1. Start Nginx on port 80.
2. Run Certbot using webroot.
3. Restart Nginx.

Example:

```bash
sudo apt install -y certbot
sudo certbot certonly --webroot \
  -w deploy/certbot/www \
  -d yourdomain.com \
  -d www.yourdomain.com

docker restart kavach360-nginx
```

---

## 10. Database Verification

Connect to DB:

```bash
docker exec -it kavach360-postgres-prod psql -U kavach360 -d kavach360
```

Check tables:

```sql
\dt
select count(*) from tenants;
select count(*) from users;
select count(*) from modules;
```

---

## 11. Login Test

Use the production login API:

```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kavach360.local","password":"Admin@123"}'
```

For real production, replace demo users with real admin users and hashed passwords.

---

## 12. API Smoke Tests

After login, test:

```bash
curl https://yourdomain.com/api/dashboard \
  -H "Authorization: Bearer <token>"

curl https://yourdomain.com/api/users \
  -H "Authorization: Bearer <token>"

curl https://yourdomain.com/api/modules \
  -H "Authorization: Bearer <token>"

curl https://yourdomain.com/api/phishing/templates \
  -H "Authorization: Bearer <token>"
```

---

## 13. Frontend Deployment

Recommended production frontend:

- Convert final HTML into Next.js pages/components.
- Use `frontend/src/api-client.ts` for API calls.
- Deploy Next.js behind Nginx or on Vercel/Netlify.

Minimum temporary option:

- Serve static `final-portal.html`, `public-website.html`, and `phishing-redirect-page.html` through Nginx.

Recommended route mapping:

```text
/                  -> public website
/app               -> logged-in portal
/r/phish/:token    -> phishing redirect page
/api/*             -> backend API
```

---

## 14. Connect Frontend to API

Use:

`frontend/src/api-client.ts`

Frontend pages should call:

- Dashboard: `GET /api/dashboard`
- Users: `GET /api/users`
- Modules: `GET /api/modules`
- Assign modules: `POST /api/training/assign`
- Phishing templates: `GET /api/phishing/templates`
- Campaigns: `POST /api/phishing/campaigns`
- Reports: `GET /api/reports/user/:id`
- SMTP: `GET/PATCH /api/settings/smtp`

Full details:

`docs/STEP_BY_STEP_API_DATABASE_INTEGRATION.md`

---

## 15. Email / SMTP Test

Before sending campaigns:

- Configure SMTP.
- Send test email.
- Verify SPF/DKIM/DMARC alignment.
- Confirm bounce handling.
- Confirm allowlisting if required.

Do not launch phishing simulations until email deliverability and approval are confirmed.

---

## 16. Content Protection Setup

Production requirement:

- Store videos/PDFs in private bucket.
- Generate short-lived signed URLs.
- Do not expose raw file URLs.
- Add watermarking.
- Log access events.

Flow:

```text
User opens module
  -> Backend checks tenant/user/licence/assignment
  -> Backend returns signed URL
  -> Frontend streams protected content
  -> Access logged
```

---

## 17. Phishing Simulation Go-Live Checklist

Before running a campaign:

- Customer approval obtained
- HR/legal approval completed
- Approved domain verified
- No real credential capture
- Training redirect page configured
- Remedial module selected
- Test campaign sent to “Only Me”
- Reports verified

---

## 18. Backup and Monitoring

Minimum:

- Daily PostgreSQL backup
- Weekly restore test
- Object storage backup
- API health monitoring
- Disk monitoring
- Error logging

Backup command example:

```bash
docker exec kavach360-postgres-prod pg_dump -U kavach360 kavach360 > backup_$(date +%F).sql
```

---

## 19. Security Hardening Before Public Launch

Required:

- Remove dev login fallback
- Store only hashed passwords
- Add refresh token/session rotation
- Add RBAC middleware
- Add rate limiting
- Encrypt SMTP secrets
- Add audit logs for every admin action
- Enable HTTPS only
- Configure firewall
- Restrict database access
- Restrict MinIO console access
- Enable file upload scanning

---

## 20. Final Go-Live Steps

1. Complete environment configuration.
2. Start production containers.
3. Configure SSL.
4. Run DB verification.
5. Run API smoke tests.
6. Deploy frontend.
7. Create real admin user.
8. Disable demo/dev password fallback.
9. Upload approved training content.
10. Configure SMTP.
11. Test protected content.
12. Test “Only Me” phishing simulation.
13. Test reports and exports.
14. Switch DNS to production.
15. Monitor logs for 24–48 hours.

---

## 21. Go-Live Sign-Off

Sign-off checklist:

| Area | Status |
|---|---|
| UI approved | Pending sign-off |
| Backend deployed | Pending |
| DB migrated | Pending |
| SSL active | Pending |
| SMTP tested | Pending |
| Content protected | Pending |
| Phishing test campaign passed | Pending |
| Reports verified | Pending |
| Backup tested | Pending |
| Security review completed | Pending |

