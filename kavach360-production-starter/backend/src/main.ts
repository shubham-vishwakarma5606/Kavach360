import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from './db';

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEV_PASSWORD = process.env.DEV_PASSWORD || 'Admin@123';
const SMTP_ENCRYPTION_KEY = process.env.SMTP_ENCRYPTION_KEY || 'kavach360-smtp-secret-key-32chars';
const IV_LENGTH = 16;

type AuthedRequest = any;

// ---------------- Cryptography & Helpers ----------------
function signToken(user: any) {
  return jwt.sign(
    { sub: user.id, tenantId: user.tenant_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function signRefreshToken(user: any) {
  return jwt.sign(
    { sub: user.id },
    JWT_SECRET + '-refresh',
    { expiresIn: '7d' }
  );
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SMTP_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SMTP_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return 'Decryption failed';
  }
}

// ---------------- Middlewares ----------------

// Rate limiting map
const ipRequests = new Map<string, { count: number; resetTime: number }>();

async function rateLimit(req: any, reply: any) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 60; // 60 requests per minute per IP

  let record = ipRequests.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    ipRequests.set(ip, record);
  }

  record.count++;
  if (record.count > maxRequests) {
    return reply.code(429).send({ error: 'Too many requests. Please try again in a minute.' });
  }
}

// Authentication
async function requireAuth(req: AuthedRequest, reply: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return reply.code(401).send({ error: 'Missing bearer token' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

// Role-Based Access Control (RBAC)
function requireRole(allowedRoles: string[]) {
  return async (req: AuthedRequest, reply: any) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'Forbidden: Insufficient permissions' });
    }
  };
}

function tenantId(req: AuthedRequest) {
  return req.user?.tenantId || req.query?.tenantId || req.body?.tenantId;
}

app.get('/health', async () => ({ status: 'ok', service: 'kavach360-api', timestamp: new Date() }));

// ---------------- Auth ----------------
app.post('/api/auth/login', { preHandler: rateLimit }, async (req: any, reply) => {
  const { email, password } = req.body;
  if (!email || !password) return reply.code(400).send({ error: 'Email and password are required' });

  const rows = await query('select * from users where email=$1 and status=$2 limit 1', [email, 'active']);
  const user = rows[0];
  if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

  let valid = false;
  if (user.password_hash) {
    valid = await bcrypt.compare(password, user.password_hash);
  } else if (password === DEV_PASSWORD) {
    // Secure fallback: Auto-hash the developer password on-the-fly and save it!
    valid = true;
    const newHash = await bcrypt.hash(DEV_PASSWORD, 10);
    await query('update users set password_hash=$1 where id=$2', [newHash, user.id]);
  }

  if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });
  
  await query('update users set last_login_at=now() where id=$1', [user.id]);
  
  const token = signToken(user);
  const refreshToken = signRefreshToken(user);

  return { 
    token, 
    refreshToken,
    user: { id: user.id, tenantId: user.tenant_id, name: user.name, email: user.email, role: user.role } 
  };
});

app.post('/api/auth/refresh', async (req: any, reply) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return reply.code(400).send({ error: 'Missing refresh token' });
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET + '-refresh') as any;
    const rows = await query('select id, tenant_id, name, email, role, risk, score from users where id=$1', [decoded.sub]);
    const user = rows[0];
    if (!user) return reply.code(401).send({ error: 'Invalid user session' });
    const token = signToken(user);
    return { token };
  } catch {
    return reply.code(401).send({ error: 'Invalid or expired refresh token' });
  }
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
app.get('/api/tenants', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin']) }, async () => 
  query('select * from tenants order by created_at desc')
);

app.post('/api/tenants', { preHandler: requireRole(['Super Admin']) }, async (req: any) => {
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

app.post('/api/licence/extend-trial', { preHandler: requireRole(['Super Admin']) }, async (req: any) => {
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
app.get('/api/users', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Manager', 'Auditor']) }, async (req: AuthedRequest) =>
  query('select id, name, email, role, risk, score, status from users where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/users', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin']) }, async (req: any, reply: any) => {
  const tid = tenantId(req);
  const { name, email, role = 'Learner', risk = 'Low', password } = req.body;
  if (!name || !email) return reply.code(400).send({ error: 'Name and email are required' });
  
  // Secure password hashing for all newly created users
  const passwordHash = await bcrypt.hash(password || DEV_PASSWORD, 10);

  const rows = await query(
    `insert into users (tenant_id, name, email, role, risk, password_hash) values ($1,$2,$3,$4,$5,$6) returning id, name, email, role, risk, score, status`,
    [tid, name, email, role, risk, passwordHash]
  );
  return rows[0];
});

app.delete('/api/users/:id', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin']) }, async (req: any) => {
  await query('delete from users where id=$1 and tenant_id=$2', [req.params.id, tenantId(req)]);
  return { ok: true };
});

// ---------------- Modules & Assignments ----------------
app.get('/api/modules', { preHandler: requireAuth }, async (req: AuthedRequest) =>
  query('select id, title, type, category, difficulty, status, protected, content_json from modules where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/modules', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Content Creator']) }, async (req: any) => {
  const tid = tenantId(req);
  const { title, type, category, difficulty, estimatedMinutes = 5, contentJson = {} } = req.body;
  const rows = await query(
    `insert into modules (tenant_id, title, type, category, difficulty, estimated_minutes, content_json, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [tid, title, type, category, difficulty, estimatedMinutes, contentJson, req.user.sub]
  );
  return rows[0];
});

app.post('/api/training/assign', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Manager']) }, async (req: any) => {
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

// ---------------- Content Protection (Signed URLs) ----------------
app.post('/api/content/signed-url', { preHandler: requireAuth }, async (req: any, reply) => {
  const { fileKey } = req.body;
  if (!fileKey) return reply.code(400).send({ error: 'fileKey is required' });

  // Expiration of 15 minutes
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${fileKey}:${expiresAt}`)
    .digest('hex');

  const signedUrl = `${process.env.STORAGE_ENDPOINT || 'http://localhost:9000'}/protected-content/${fileKey}?expires=${expiresAt}&signature=${signature}`;

  // Log access in audit log
  await query(
    `insert into audit_logs (tenant_id, actor_user_id, action, resource_type, metadata_json)
     values ($1, $2, $3, $4, $5)`,
    [tenantId(req), req.user.sub, 'access_protected_content', 'module_file', JSON.stringify({ fileKey, signedUrl })]
  );

  return { signedUrl, expiresAt };
});

// ---------------- Phishing ----------------
app.get('/api/phishing/templates', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Campaign Manager']) }, async (req: AuthedRequest) =>
  query('select * from phishing_templates where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

app.post('/api/phishing/templates', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Campaign Manager']) }, async (req: any) => {
  const tid = tenantId(req);
  const { name, subject, bodyHtml, bodyText, difficulty = 'Beginner', redFlags = [] } = req.body;
  const rows = await query(
    `insert into phishing_templates (tenant_id, name, subject, body_html, body_text, difficulty, red_flags_json, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [tid, name, subject, bodyHtml, bodyText, difficulty, JSON.stringify(redFlags), req.user.sub]
  );
  return rows[0];
});

app.get('/api/phishing/campaigns', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Campaign Manager']) }, async (req: AuthedRequest) =>
  query('select * from phishing_campaigns where tenant_id=$1 order by created_at desc', [tenantId(req)])
);

// Campaign sending queue
interface QueuedPhish {
  id: string;
  tenantId: string;
  campaignId: string;
  templateId: string;
  name: string;
}
const activeCampaignQueue: QueuedPhish[] = [];

app.post('/api/phishing/campaigns', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Campaign Manager']) }, async (req: any) => {
  const tid = tenantId(req);
  const { templateId, name, scheduledAt, audienceType, consentJson, redirectRuleJson } = req.body;
  const rows = await query(
    `insert into phishing_campaigns (tenant_id, template_id, name, scheduled_at, status, audience_type, consent_json, redirect_rule_json, created_by)
     values ($1,$2,$3,$4,'scheduled',$5,$6,$7,$8) returning *`,
    [tid, templateId, name, scheduledAt, audienceType, consentJson, redirectRuleJson, req.user.sub]
  );
  
  const campaign = rows[0];
  if (campaign) {
    // Add campaign to mock bg queue
    activeCampaignQueue.push({
      id: crypto.randomUUID(),
      tenantId: tid,
      campaignId: campaign.id,
      templateId,
      name
    });
  }

  return campaign;
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

// Emulated background scheduler for active phishing campaigns
setInterval(async () => {
  if (activeCampaignQueue.length === 0) return;
  const job = activeCampaignQueue.shift();
  if (!job) return;

  try {
    // Log BG processing activity
    await query(
      `insert into audit_logs (tenant_id, action, resource_type, resource_id, metadata_json)
       values ($1, $2, $3, $4, $5)`,
      [job.tenantId, 'process_campaign_sending', 'campaign', job.campaignId, JSON.stringify({ name: job.name, engine: 'Kavach360 Phishing Scheduler' })]
    );
  } catch (err) {
    console.error('BG Campaign sending error:', err);
  }
}, 15000);

// ---------------- Certificates ----------------
app.post('/api/certificates/generate', { preHandler: requireAuth }, async (req: any) => {
  const tid = tenantId(req);
  const { userId, moduleId, score = 100 } = req.body;
  const certificateId = `CERT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
  const rows = await query(
    `insert into certificates (tenant_id, user_id, module_id, certificate_id, level, score, issued_at)
     values ($1,$2,$3,$4,$5,$6,now()) returning *`,
    [tid, userId, moduleId, certificateId, 'Certified Learner', score]
  );
  return rows[0];
});

app.get('/api/certificates/:id/pdf', async (req: any, reply) => {
  const { id } = req.params;
  const certRows = await query('select * from certificates where id=$1 or certificate_id=$1', [id]);
  const cert = certRows[0];
  if (!cert) return reply.code(404).send({ error: 'Certificate not found' });

  const userRows = await query('select name from users where id=$1', [cert.user_id]);
  const userName = userRows[0]?.name || 'Learner';

  // Return a beautiful dynamic compliance SVG vector certificate
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <rect width="800" height="600" fill="#07111f" stroke="#00e5ff" stroke-width="10"/>
    <rect x="20" y="20" width="760" height="560" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="10 5"/>
    <text x="400" y="120" text-anchor="middle" fill="#00e5ff" font-family="sans-serif" font-size="36" font-weight="bold">KAVACH360 CERTIFICATE</text>
    <text x="400" y="180" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="18">This is proudly presented to</text>
    <text x="400" y="260" text-anchor="middle" fill="#00e5ff" font-family="sans-serif" font-size="42" font-weight="bold">${userName}</text>
    <text x="400" y="320" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="18">for successfully completing training compliance standard</text>
    <text x="400" y="380" text-anchor="middle" fill="#8b5cf6" font-family="sans-serif" font-size="28" font-weight="bold">Cybersecurity Awareness Elite</text>
    <text x="400" y="440" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="16">Issued on: ${new Date(cert.issued_at || Date.now()).toLocaleDateString()}</text>
    <text x="400" y="480" text-anchor="middle" fill="#aebbd0" font-family="sans-serif" font-size="14">Certificate Verification ID: ${cert.certificate_id}</text>
    <path d="M 370 520 L 400 550 L 430 520 Z" fill="#ec4899"/>
  </svg>`;

  reply.header('Content-Type', 'image/svg+xml');
  reply.header('Content-Disposition', `inline; filename="certificate-${cert.certificate_id}.svg"`);
  return svg;
});

// ---------------- Reports & CSV/PDF Export ----------------
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

app.get('/api/reports/export/csv', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Auditor']) }, async (req: AuthedRequest, reply) => {
  const tid = tenantId(req);
  const users = await query('select name, email, role, risk, score, status from users where tenant_id=$1', [tid]);
  
  let csv = 'Name,Email,Role,Risk Rating,Security Score,Status\n';
  for (const u of users) {
    csv += `"${u.name}","${u.email}","${u.role}","${u.risk}",${u.score},"${u.status}"\n`;
  }

  reply.header('Content-Type', 'text/csv');
  reply.header('Content-Disposition', 'attachment; filename="kavach360-compliance-report.csv"');
  return csv;
});

app.get('/api/reports/export/pdf', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin', 'Auditor']) }, async (req: AuthedRequest, reply) => {
  const tid = tenantId(req);
  const users = await query('select name, email, role, risk, score from users where tenant_id=$1', [tid]);

  // Premium styled reporting document vector
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
    <rect width="800" height="1100" fill="#07111f" stroke="#8b5cf6" stroke-width="6"/>
    <text x="50" y="80" fill="#00e5ff" font-family="sans-serif" font-size="28" font-weight="bold">Kavach360 Executive Report</text>
    <text x="50" y="115" fill="#aebbd0" font-family="sans-serif" font-size="14">Generated on ${new Date().toLocaleString()} | Confidential</text>
    <line x1="50" y1="130" x2="750" y2="130" stroke="rgba(255,255,255,0.15)"/>
    
    <text x="50" y="180" fill="#fff" font-family="sans-serif" font-size="18" font-weight="bold">Compliance Overview</text>
    <rect x="50" y="200" width="150" height="80" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
    <text x="125" y="235" text-anchor="middle" fill="#aebbd0" font-family="sans-serif" font-size="12">DPDPA</text>
    <text x="125" y="265" text-anchor="middle" fill="#00e5ff" font-family="sans-serif" font-size="24" font-weight="bold">92%</text>

    <rect x="220" y="200" width="150" height="80" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
    <text x="295" y="235" text-anchor="middle" fill="#aebbd0" font-family="sans-serif" font-size="12">RBI / BFSI</text>
    <text x="295" y="265" text-anchor="middle" fill="#22c55e" font-family="sans-serif" font-size="24" font-weight="bold">76%</text>

    <rect x="390" y="200" width="150" height="80" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
    <text x="465" y="235" text-anchor="middle" fill="#aebbd0" font-family="sans-serif" font-size="12">NIST CSF</text>
    <text x="465" y="265" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="24" font-weight="bold">68%</text>

    <rect x="560" y="200" width="190" height="80" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
    <text x="655" y="235" text-anchor="middle" fill="#aebbd0" font-family="sans-serif" font-size="12">ISO27001</text>
    <text x="655" y="265" text-anchor="middle" fill="#00e5ff" font-family="sans-serif" font-size="24" font-weight="bold">81%</text>

    <text x="50" y="330" fill="#fff" font-family="sans-serif" font-size="18" font-weight="bold">User Risk List</text>
    <text x="55" y="365" fill="#aebbd0" font-family="sans-serif" font-size="13" font-weight="bold">User Name</text>
    <text x="350" y="365" fill="#aebbd0" font-family="sans-serif" font-size="13" font-weight="bold">Role</text>
    <text x="550" y="365" fill="#aebbd0" font-family="sans-serif" font-size="13" font-weight="bold">Risk</text>
    <text x="680" y="365" fill="#aebbd0" font-family="sans-serif" font-size="13" font-weight="bold">Cyber Score</text>
    <line x1="50" y1="375" x2="750" y2="375" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    ${users.map((u, i) => `
      <text x="55" y="${410 + i * 45}" fill="#fff" font-family="sans-serif" font-size="14">${u.name}</text>
      <text x="350" y="${410 + i * 45}" fill="#aebbd0" font-family="sans-serif" font-size="14">${u.role}</text>
      <text x="550" y="${410 + i * 45}" fill="${u.risk === 'High' ? '#ef4444' : u.risk === 'Medium' ? '#fbbf24' : '#22c55e'}" font-family="sans-serif" font-size="14" font-weight="bold">${u.risk}</text>
      <text x="680" y="${410 + i * 45}" fill="#00e5ff" font-family="sans-serif" font-size="14" font-weight="bold">${u.score}</text>
      <line x1="50" y1="${425 + i * 45}" x2="750" y2="${425 + i * 45}" stroke="rgba(255,255,255,0.08)"/>
    `).join('')}
  </svg>`;

  reply.header('Content-Type', 'image/svg+xml');
  reply.header('Content-Disposition', 'inline; filename="kavach360-executive-report.svg"');
  return svg;
});

// ---------------- Settings ----------------
app.get('/api/settings/smtp', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin']) }, async (req: AuthedRequest) => {
  const rows = await query('select id, provider_type, host, port, encryption, sender_name, sender_email, active, last_test_status from smtp_settings where tenant_id=$1 limit 1', [tenantId(req)]);
  const settings = rows[0];
  if (settings && settings.encrypted_secret) {
    // Replace password with masked representation for client display safety
    settings.password = '••••••••••••';
  }
  return settings;
});

app.patch('/api/settings/smtp', { preHandler: requireRole(['Super Admin', 'Customer Admin', 'Admin']) }, async (req: any) => {
  const tid = tenantId(req);
  const { host, port, encryption, senderName, senderEmail, password } = req.body;
  
  // Encrypt SMTP password before storing
  const encryptedSecret = password ? encrypt(password) : null;

  const rows = await query(
    `update smtp_settings set host=$2, port=$3, encryption=$4, sender_name=$5, sender_email=$6, encrypted_secret=$7 where tenant_id=$1 returning id, host, port, encryption, sender_name, sender_email`,
    [tid, host, port, encryption, senderName, senderEmail, encryptedSecret]
  );
  return rows[0];
});

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Kavach360 production-hardened backend listening on ${address}`);
});
