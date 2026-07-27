import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEV_PASSWORD = process.env.DEV_PASSWORD || 'Admin@123';

type AuthedRequest = any;

function signToken(user: any) {
  return jwt.sign(
    { sub: user.id, tenantId: user.tenant_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

async function requireAuth(req: AuthedRequest, reply: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return reply.code(401).send({ error: 'Missing bearer token' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

function tenantId(req: AuthedRequest) {
  return req.user?.tenantId || req.query?.tenantId || req.body?.tenantId;
}

app.get('/health', async () => ({ status: 'ok', service: 'kavach360-api' }));

// ---------------- Auth ----------------
app.post('/api/auth/login', async (req: any, reply) => {
  const { email, password } = req.body;
  const rows = await query('select * from users where email=$1 and status=$2 limit 1', [email, 'active']);
  const user = rows[0];
  if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

  let valid = false;
  if (user.password_hash) valid = await bcrypt.compare(password, user.password_hash);
  // Dev fallback for seeded users. Replace with hashed passwords in production.
  if (!user.password_hash && password === DEV_PASSWORD) valid = true;

  if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });
  await query('update users set last_login_at=now() where id=$1', [user.id]);
  const token = signToken(user);
  return { token, user: { id: user.id, tenantId: user.tenant_id, name: user.name, email: user.email, role: user.role } };
});

app.get('/api/auth/me', { preHandler: requireAuth }, async (req: AuthedRequest) => {
  const rows = await query('select id, tenant_id, name, email, role, risk, score from users where id=$1', [req.user.sub]);
  return rows[0];
});

// ---------------- Dashboard ----------------
app.get('/api/dashboard', { preHandler: requireAuth }, async (req: AuthedRequest) => {
  const tid = tenantId(req);
  const [users, modules, campaigns, completions] = await Promise.all([
    query<{ count: string }>('select count(*) from users where tenant_id=$1', [tid]),
    query<{ count: string }>('select count(*) from modules where tenant_id=$1', [tid]),
    query<{ count: string }>('select count(*) from phishing_campaigns where tenant_id=$1', [tid]),
    query<{ count: string }>("select count(*) from user_module_progress where tenant_id=$1 and status='completed'", [tid]),
  ]);
  return {
    users: Number(users[0]?.count ?? 0),
    modules: Number(modules[0]?.count ?? 0),
    campaigns: Number(campaigns[0]?.count ?? 0),
    completions: Number(completions[0]?.count ?? 0),
    trainingCompletion: 84,
    phishClickRate: 6.8,
    reportRate: 47,
    averageReportTimeMinutes: 18,
    departmentRisk: [
      { department: 'Finance', risk: 'High', score: 62 },
      { department: 'HR', risk: 'Medium', score: 78 },
      { department: 'IT', risk: 'Low', score: 94 },
    ],
  };
});

// ---------------- Tenants & Licences ----------------
app.get('/api/tenants', { preHandler: requireAuth }, async () => query('select * from tenants order by created_at desc'));

app.post('/api/tenants', { preHandler: requireAuth }, async (req: any) => {
  const { name, slug, industry, primaryContactEmail } = req.body;
  const rows = await query(
    `insert into tenants (name, slug, industry, primary_contact_email) values ($1,$2,$3,$4) returning *`,
    [name, slug, industry, primaryContactEmail]
  );
  return rows[0];
});

app.get('/api/licence', { preHandler: requireAuth }, async (req: AuthedRequest) => {
  const rows = await query('select * from licences where tenant_id=$1 order by created_at desc limit 1', [tenantId(req)]);
  return rows[0];
});

app.post('/api/licence/extend-trial', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { days = 15 } = req.body;
  const rows = await query(
    `update licences set trial_extended_until = coalesce(trial_extended_until, end_date, current_date) + ($2 || ' days')::interval, updated_at=now()
     where tenant_id=$1 returning *`,
    [tid, String(days)]
  );
  return rows[0];
});

// ---------------- Users ----------------
app.get('/api/users', { preHandler: requireAuth }, async (req: AuthedRequest) =>
  query('select id, name, email, role, risk, score, status from users where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/users', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { name, email, role = 'Learner', risk = 'Low' } = req.body;
  const rows = await query(
    `insert into users (tenant_id, name, email, role, risk) values ($1,$2,$3,$4,$5) returning id, name, email, role, risk, score, status`,
    [tid, name, email, role, risk]
  );
  return rows[0];
});

app.delete('/api/users/:id', { preHandler: requireAuth }, async (req: any) => {
  await query('delete from users where id=$1 and tenant_id=$2', [req.params.id, tenantId(req)]);
  return { ok: true };
});

// ---------------- Modules & Assignments ----------------
app.get('/api/modules', { preHandler: requireAuth }, async (req: AuthedRequest) =>
  query('select id, title, type, category, difficulty, status, protected, content_json from modules where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/modules', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { title, type, category, difficulty, estimatedMinutes = 5, contentJson = {} } = req.body;
  const rows = await query(
    `insert into modules (tenant_id, title, type, category, difficulty, estimated_minutes, content_json, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [tid, title, type, category, difficulty, estimatedMinutes, contentJson, req.user.sub]
  );
  return rows[0];
});

app.post('/api/training/assign', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { moduleId, assignedToType, assignedToId = null, dueDate } = req.body;
  const rows = await query(
    `insert into training_assignments (tenant_id, module_id, assigned_to_type, assigned_to_id, due_date, created_by)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [tid, moduleId, assignedToType, assignedToId, dueDate, req.user.sub]
  );
  return rows[0];
});

app.get('/api/training/progress', { preHandler: requireAuth }, async (req: AuthedRequest) =>
  query(
    `select p.*, u.name as user_name, m.title as module_title
     from user_module_progress p
     join users u on u.id=p.user_id
     join modules m on m.id=p.module_id
     where p.tenant_id=$1 order by p.updated_at desc`,
    [tenantId(req)]
  )
);

// ---------------- Phishing ----------------
app.get('/api/phishing/templates', { preHandler: requireAuth }, async (req: AuthedRequest) =>
  query('select * from phishing_templates where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/phishing/templates', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { name, subject, bodyHtml, bodyText, difficulty = 'Beginner', redFlags = [] } = req.body;
  const rows = await query(
    `insert into phishing_templates (tenant_id, name, subject, body_html, body_text, difficulty, red_flags_json, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [tid, name, subject, bodyHtml, bodyText, difficulty, JSON.stringify(redFlags), req.user.sub]
  );
  return rows[0];
});

app.get('/api/phishing/campaigns', { preHandler: requireAuth }, async (req: AuthedRequest) =>
  query('select * from phishing_campaigns where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/phishing/campaigns', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { templateId, name, scheduledAt, audienceType, consentJson, redirectRuleJson } = req.body;
  const rows = await query(
    `insert into phishing_campaigns (tenant_id, template_id, name, scheduled_at, status, audience_type, consent_json, redirect_rule_json, created_by)
     values ($1,$2,$3,$4,'scheduled',$5,$6,$7,$8) returning *`,
    [tid, templateId, name, scheduledAt, audienceType, consentJson, redirectRuleJson, req.user.sub]
  );
  return rows[0];
});

app.post('/api/phishing/events', async (req: any) => {
  const { tenantId, campaignId, targetId, eventType, metadata = {} } = req.body;
  const rows = await query(
    `insert into phishing_events (tenant_id, campaign_id, target_id, event_type, metadata_json)
     values ($1,$2,$3,$4,$5) returning *`,
    [tenantId, campaignId, targetId, eventType, metadata]
  );
  return rows[0];
});

// ---------------- Reports ----------------
app.get('/api/reports/user/:id', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const userRows = await query('select id, name, email, role, risk, score from users where id=$1 and tenant_id=$2', [req.params.id, tid]);
  const progress = await query(
    `select m.title, p.status, p.score, p.progress_percent
     from user_module_progress p join modules m on m.id=p.module_id
     where p.user_id=$1 and p.tenant_id=$2`,
    [req.params.id, tid]
  );
  return { user: userRows[0], progress, phishing: { clicked: 1, reported: 3, total: 5 } };
});

app.get('/api/reports/compliance', { preHandler: requireAuth }, async () => ({
  DPDPA: 92,
  RBI_BFSI: 76,
  NIST_CSF: 68,
  ISO27001: 81,
}));

// ---------------- Settings ----------------
app.get('/api/settings/smtp', { preHandler: requireAuth }, async (req: AuthedRequest) => {
  const rows = await query('select id, provider_type, host, port, encryption, sender_name, sender_email, active, last_test_status from smtp_settings where tenant_id=$1 limit 1', [tenantId(req)]);
  return rows[0];
});

app.patch('/api/settings/smtp', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { host, port, encryption, senderName, senderEmail } = req.body;
  const rows = await query(
    `update smtp_settings set host=$2, port=$3, encryption=$4, sender_name=$5, sender_email=$6 where tenant_id=$1 returning id, host, port, encryption, sender_name, sender_email`,
    [tid, host, port, encryption, senderName, senderEmail]
  );
  return rows[0];
});

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: '0.0.0.0' });
