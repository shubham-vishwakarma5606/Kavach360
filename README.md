# Kavach360 Production Starter

This is the production-development starter package for Kavach360.

It converts the finalized prototype into a build-ready structure with:

- Backend API scaffold
- Database migration
- Docker infrastructure
- Frontend static prototype handoff
- Implementation plan
- Security and content-protection notes

## Final Prototype Files Included

- `frontend/public/public-website.html`
- `frontend/public/final-portal.html`
- `frontend/public/phishing-redirect-page.html`

## Recommended Stack

- Frontend: Next.js / React
- Backend: NestJS / Node.js
- Database: PostgreSQL
- Queue/cache: Redis
- Storage: S3-compatible private object storage
- Email: SMTP provider / SES / SendGrid / Mailgun

## Development Phases

1. Backend + database foundation
2. Auth + tenant + licence management
3. User management
4. Training CMS and assignments
5. Phishing campaign engine
6. Reports and certificates
7. Content protection and storage
8. Production deployment

## Quick Start for Infrastructure

```bash
cd kavach360-production-starter
cd infra
docker compose up -d
```

This starts:

- PostgreSQL
- Redis
- MinIO object storage
- Mailhog for email testing

## Important

This is a starter scaffold. It is not yet a complete production SaaS. The next step is implementing APIs and connecting the frontend to real backend services.
