import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

// Use real PostgreSQL if DATABASE_URL is provided in environment variables
const useRealDb = !!process.env.DATABASE_URL;
export const pool = useRealDb ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

// Mock database state matching our SQL schema
const mockDb = {
  tenants: [] as any[],
  licences: [] as any[],
  departments: [] as any[],
  users: [] as any[],
  modules: [] as any[],
  training_assignments: [] as any[],
  user_module_progress: [] as any[],
  phishing_templates: [] as any[],
  phishing_campaigns: [] as any[],
  phishing_targets: [] as any[],
  phishing_events: [] as any[],
  smtp_settings: [] as any[],
  policies: [] as any[],
  certificates: [] as any[],
  audit_logs: [] as any[]
};

// Seed Constants matching the SQL seed script
const TENANT_ID = 'e127393d-d1ef-466d-a7fa-80674d81239c';
const DEPT_FINANCE = 'f72033db-1111-4444-8888-c7e4811a2f60';
const DEPT_HR = 'e61133db-2222-4444-8888-c7e4811a2f60';
const DEPT_IT = '9a1133db-3333-4444-8888-c7e4811a2f60';

const USER_NINAD = '74ba0bb0-7987-43ca-a387-a25e24b07fb8';
const USER_ASHA = 'da3cf63b-67a3-4a11-b003-ef377f022ab3';
const USER_ROHIT = 'cd374e2d-94bb-4e94-87cf-49b81cf71df7';
const USER_MEERA = '287cd52a-cb71-460d-8547-5d554a9d702d';
const USER_PRIYA = 'ba9173db-5555-4444-8888-c7e4811a2f60';

const MOD_PHISH = '433fb1ef-7a5b-42ef-a6bc-b0c4765d7ffc';
const MOD_DPDPA = '7f549c7f-94a2-4a0f-90db-2b5d491f63cb';
const MOD_MOBILE = '9f82d2f3-3eb2-4fe3-90d5-b040e34c2ab1';
const MOD_RBI = '018bf0a4-325b-4235-96bd-66ee76ffb601';

const TEMP_EXPIRY = 'f8101431-7a2e-4b47-b8db-4bf00ef12ab3';
const CAMP_DRILL = '761b0c0a-cb54-4a4b-90f7-b02fef32ab0a';

function seedMockDb() {
  // Pre-calculate hash for security
  const passwordHash = bcrypt.hashSync('Admin@123', 10);

  // 1. Tenants
  mockDb.tenants.push({
    id: TENANT_ID,
    name: 'Kavach360 Demo Customer',
    slug: 'demo',
    industry: 'BFSI',
    country: 'IN',
    status: 'trial',
    primary_contact_name: 'Ninad Lad',
    primary_contact_email: 'admin@kavach360.local',
    created_at: new Date()
  });

  // 2. Licences
  mockDb.licences.push({
    id: randomUUID(),
    tenant_id: TENANT_ID,
    plan: 'professional_trial',
    status: 'active',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    max_users: 50,
    features_json: { training: true, phishing: true, smtp: true, reports: true, certificates: true, customer_content: true },
    created_at: new Date(),
    updated_at: new Date()
  });

  // 3. Departments
  mockDb.departments.push(
    { id: DEPT_FINANCE, tenant_id: TENANT_ID, name: 'Finance', created_at: new Date() },
    { id: DEPT_HR, tenant_id: TENANT_ID, name: 'HR', created_at: new Date() },
    { id: DEPT_IT, tenant_id: TENANT_ID, name: 'IT', created_at: new Date() }
  );

  // 4. Users (All pre-seeded with modern secure bcrypt hashes)
  mockDb.users.push(
    { id: USER_NINAD, tenant_id: TENANT_ID, department_id: DEPT_IT, name: 'Ninad Lad', email: 'admin@kavach360.local', role: 'Customer Admin', risk: 'Low', score: 96, status: 'active', password_hash: passwordHash, created_at: new Date() },
    { id: USER_ASHA, tenant_id: TENANT_ID, department_id: DEPT_FINANCE, name: 'Asha Rao', email: 'asha@kavach360.local', role: 'Learner', risk: 'Medium', score: 82, status: 'active', password_hash: passwordHash, created_at: new Date() },
    { id: USER_ROHIT, tenant_id: TENANT_ID, department_id: DEPT_IT, name: 'Rohit Mehta', email: 'rohit@kavach360.local', role: 'Admin', risk: 'Low', score: 94, status: 'active', password_hash: passwordHash, created_at: new Date() },
    { id: USER_MEERA, tenant_id: TENANT_ID, department_id: DEPT_HR, name: 'Meera Shah', email: 'meera@kavach360.local', role: 'Manager', risk: 'Low', score: 89, status: 'active', password_hash: passwordHash, created_at: new Date() },
    { id: USER_PRIYA, tenant_id: TENANT_ID, department_id: DEPT_FINANCE, name: 'Priya Nair', email: 'priya@kavach360.local', role: 'Learner', risk: 'High', score: 61, status: 'active', password_hash: passwordHash, created_at: new Date() }
  );

  // 5. Modules
  mockDb.modules.push(
    { id: MOD_PHISH, tenant_id: TENANT_ID, source_type: 'master', title: 'Phishing Basics', description: 'Spot suspicious sender, links, urgency and attachments.', type: 'Interactive Module', category: 'Email Security', difficulty: 'Beginner', estimated_minutes: 7, status: 'published', protected: true, content_json: { video: 'phishing-basics.mp4', quiz: [{ q: 'What should you do with a suspicious email?', a: 'Report it' }], redirect_enabled: true }, framework_mapping_json: { NIST: 'Protect', ISO27001: 'Awareness' }, created_by: USER_NINAD, created_at: new Date() },
    { id: MOD_DPDPA, tenant_id: TENANT_ID, source_type: 'master', title: 'DPDPA Awareness', description: 'Personal data, safe sharing and breach reporting.', type: 'Interactive Module', category: 'Privacy', difficulty: 'Beginner', estimated_minutes: 9, status: 'published', protected: true, content_json: { video: 'dpdpa-awareness.mp4', scenario: 'Wrong recipient email', quiz: [{ q: 'When should a breach be reported?', a: 'Immediately' }] }, framework_mapping_json: { DPDPA: 'Core', ISO27001: 'Privacy' }, created_by: USER_NINAD, created_at: new Date() },
    { id: MOD_MOBILE, tenant_id: TENANT_ID, source_type: 'master', title: 'Mobile, WhatsApp and OTP Fraud', description: 'Smishing, fake manager messages, OTP and UPI scams.', type: 'Video + Quiz', category: 'Mobile Security', difficulty: 'Beginner', estimated_minutes: 7, status: 'published', protected: true, content_json: { video: 'mobile-scams.mp4', quiz: [{ q: 'Should OTP be shared with IT?', a: 'No' }] }, created_by: USER_NINAD, created_at: new Date() },
    { id: MOD_RBI, tenant_id: TENANT_ID, source_type: 'master', title: 'RBI / BFSI Cyber Awareness', description: 'Customer data, digital payment fraud and regulatory escalation.', type: 'Interactive Module', category: 'Compliance', difficulty: 'Intermediate', estimated_minutes: 10, status: 'published', protected: true, content_json: { video: 'rbI-bfsi-awareness.mp4', quiz: [{ q: 'What should happen to payment change requests?', a: 'Verify via approved process' }] }, framework_mapping_json: { RBI: 'Cyber Awareness', 'CERT-In': 'Incident Reporting' }, created_by: USER_NINAD, created_at: new Date() }
  );

  // 6. Assignments
  mockDb.training_assignments.push(
    { id: randomUUID(), tenant_id: TENANT_ID, module_id: MOD_PHISH, assigned_to_type: 'all', assigned_to_id: null, due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), created_by: USER_NINAD, created_at: new Date() },
    { id: randomUUID(), tenant_id: TENANT_ID, module_id: MOD_DPDPA, assigned_to_type: 'department', assigned_to_id: DEPT_FINANCE, due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), created_by: USER_NINAD, created_at: new Date() }
  );

  // 7. Progress
  mockDb.user_module_progress.push(
    { id: randomUUID(), tenant_id: TENANT_ID, user_id: USER_ASHA, module_id: MOD_DPDPA, status: 'completed', progress_percent: 100, score: 92, completed_at: new Date(), updated_at: new Date() },
    { id: randomUUID(), tenant_id: TENANT_ID, user_id: USER_ASHA, module_id: MOD_PHISH, status: 'in_progress', progress_percent: 70, score: 70, updated_at: new Date() },
    { id: randomUUID(), tenant_id: TENANT_ID, user_id: USER_ROHIT, module_id: MOD_PHISH, status: 'completed', progress_percent: 100, score: 96, completed_at: new Date(), updated_at: new Date() }
  );

  // 8. Phishing Templates
  mockDb.phishing_templates.push({
    id: TEMP_EXPIRY,
    tenant_id: TENANT_ID,
    source_type: 'master',
    name: 'Password Expiry',
    category: 'Credential Phishing',
    difficulty: 'Intermediate',
    sender_name: 'IT Support',
    sender_email: 'support@training.customer-domain.com',
    subject: 'Urgent: Your mailbox password expires today',
    body_html: '<p>Dear {{first_name}}, your mailbox password expires today. Verify using {{training_link}}</p>',
    body_text: 'Dear {{first_name}}, your mailbox password expires today. Verify using {{training_link}}',
    landing_page_html: '<h1>You clicked a training link</h1><p>No password was collected.</p>',
    red_flags_json: ['Urgency pressure', 'Lookalike login link', 'Generic greeting'],
    created_by: USER_NINAD,
    created_at: new Date()
  });

  // 9. Campaigns
  mockDb.phishing_campaigns.push({
    id: CAMP_DRILL,
    tenant_id: TENANT_ID,
    template_id: TEMP_EXPIRY,
    name: 'July Password Expiry Drill',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
    audience_type: 'department',
    consent_json: { management_approval: true, hr_legal_review: true, no_credential_collection: true, approved_domain: true },
    redirect_rule_json: { on_click: 'interactive_module', module: 'Phishing Basics', auto_assign_remedial: true, micro_quiz: true },
    approved_by: USER_NINAD,
    created_by: USER_NINAD,
    created_at: new Date()
  });

  // 10. Phishing Targets
  mockDb.phishing_targets.push(
    { id: randomUUID(), tenant_id: TENANT_ID, campaign_id: CAMP_DRILL, user_id: USER_ASHA, email: 'asha@kavach360.local', delivery_status: 'pending', created_at: new Date() },
    { id: randomUUID(), tenant_id: TENANT_ID, campaign_id: CAMP_DRILL, user_id: USER_MEERA, email: 'meera@kavach360.local', delivery_status: 'pending', created_at: new Date() }
  );

  // 11. Policies
  mockDb.policies.push(
    { id: randomUUID(), tenant_id: TENANT_ID, title: 'Acceptable Use Policy', version: '1.0', status: 'published', content: 'Use company systems safely and report suspicious activity.', created_at: new Date() },
    { id: randomUUID(), tenant_id: TENANT_ID, title: 'Incident Reporting Policy', version: '1.0', status: 'published', content: 'Report suspected incidents immediately.', created_at: new Date() }
  );

  // 12. SMTP Settings
  mockDb.smtp_settings.push({
    id: randomUUID(),
    tenant_id: TENANT_ID,
    provider_type: 'smtp',
    host: 'localhost',
    port: 1025,
    encryption: 'none',
    sender_name: 'Kavach360 Training',
    sender_email: 'training@kavach360.local',
    active: true,
    created_at: new Date()
  });
}

// Seed on module load if in mock mode
if (!useRealDb) {
  seedMockDb();
}

/**
 * Runs a database query. Automatically routes to mock database if PostgreSQL is not active.
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  if (useRealDb && pool) {
    try {
      const result = await pool.query(text, params);
      return result.rows as T[];
    } catch (err) {
      console.warn('Real DB query failed, falling back to mock database emulator. Error:', err);
    }
  }

  // Normalize query for matching
  const sql = text.replace(/\s+/g, ' ').trim().toLowerCase();

  // 1. SELECT user by email & status
  if (sql.includes('select * from users where email=$1 and status=$2')) {
    const email = params[0];
    const status = params[1];
    return mockDb.users.filter(u => u.email === email && u.status === status) as T[];
  }

  // 2. UPDATE user last login
  if (sql.includes('update users set last_login_at=now() where id=$1')) {
    const id = params[0];
    const u = mockDb.users.find(x => x.id === id);
    if (u) {
      u.last_login_at = new Date();
    }
    return [] as T[];
  }

  // 3. SELECT user by id
  if (sql.includes('select id, tenant_id, name, email, role, risk, score from users where id=$1')) {
    const id = params[0];
    return mockDb.users.filter(u => u.id === id) as T[];
  }

  // 4. SELECT count from users
  if (sql.includes('select count(*) from users where tenant_id=$1')) {
    const tid = params[0];
    const count = mockDb.users.filter(u => u.tenant_id === tid).length;
    return [{ count: String(count) }] as any as T[];
  }

  // 5. SELECT count from modules
  if (sql.includes('select count(*) from modules where tenant_id=$1')) {
    const tid = params[0];
    const count = mockDb.modules.filter(m => m.tenant_id === tid).length;
    return [{ count: String(count) }] as any as T[];
  }

  // 6. SELECT count from campaigns
  if (sql.includes('select count(*) from phishing_campaigns where tenant_id=$1')) {
    const tid = params[0];
    const count = mockDb.phishing_campaigns.filter(c => c.tenant_id === tid).length;
    return [{ count: String(count) }] as any as T[];
  }

  // 7. SELECT count completed progress
  if (sql.includes("select count(*) from user_module_progress where tenant_id=$1 and status='completed'")) {
    const tid = params[0];
    const count = mockDb.user_module_progress.filter(p => p.tenant_id === tid && p.status === 'completed').length;
    return [{ count: String(count) }] as any as T[];
  }

  // 8. SELECT tenants
  if (sql.includes('select * from tenants order by created_at desc')) {
    return [...mockDb.tenants].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()) as T[];
  }

  // 9. INSERT tenant
  if (sql.startsWith('insert into tenants')) {
    const [name, slug, industry, primaryContactEmail] = params;
    const newTenant = {
      id: randomUUID(),
      name,
      slug,
      industry,
      country: 'IN',
      status: 'trial',
      primary_contact_name: name.split(' ')[0] || 'Admin',
      primary_contact_email: primaryContactEmail,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.tenants.push(newTenant);

    // Create corresponding default licence & smtp settings for this tenant
    mockDb.licences.push({
      id: randomUUID(),
      tenant_id: newTenant.id,
      plan: 'professional_trial',
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      max_users: 50,
      features_json: { training: true, phishing: true, smtp: true, reports: true, certificates: true },
      created_at: new Date(),
      updated_at: new Date()
    });

    mockDb.smtp_settings.push({
      id: randomUUID(),
      tenant_id: newTenant.id,
      provider_type: 'smtp',
      host: 'localhost',
      port: 1025,
      encryption: 'none',
      sender_name: 'Kavach360 Training',
      sender_email: 'training@kavach360.local',
      active: true,
      created_at: new Date()
    });

    return [newTenant] as T[];
  }

  // 10. SELECT licences
  if (sql.includes('select * from licences where tenant_id=$1 order by created_at desc limit 1')) {
    const tid = params[0];
    const matching = mockDb.licences
      .filter(l => l.tenant_id === tid)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return (matching.length > 0 ? [matching[0]] : []) as T[];
  }

  // 11. UPDATE licence extension
  if (sql.includes('update licences set trial_extended_until')) {
    const tid = params[0];
    const days = parseInt(params[1]) || 15;
    const licence = mockDb.licences.find(l => l.tenant_id === tid);
    if (licence) {
      const currentVal = licence.trial_extended_until || licence.end_date || new Date();
      licence.trial_extended_until = new Date(new Date(currentVal).getTime() + days * 24 * 60 * 60 * 1000);
      licence.updated_at = new Date();
      return [licence] as T[];
    }
    return [] as T[];
  }

  // 12. SELECT users list
  if (sql.includes('select id, name, email, role, risk, score, status from users where tenant_id=$1 order by created_at desc')) {
    const tid = params[0];
    const list = mockDb.users
      .filter(u => u.tenant_id === tid)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return list as T[];
  }

  // 13. INSERT user (handles password_hash too!)
  if (sql.startsWith('insert into users')) {
    const [tid, name, email, role, risk, passwordHash] = params;
    const newUser = {
      id: randomUUID(),
      tenant_id: tid,
      name,
      email,
      role: role || 'Learner',
      risk: risk || 'Low',
      score: 75,
      status: 'active',
      password_hash: passwordHash || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.users.push(newUser);
    return [newUser] as T[];
  }

  // 14. DELETE user
  if (sql.startsWith('delete from users where id=$1 and tenant_id=$2')) {
    const [id, tid] = params;
    const index = mockDb.users.findIndex(u => u.id === id && u.tenant_id === tid);
    if (index !== -1) {
      mockDb.users.splice(index, 1);
    }
    return [] as T[];
  }

  // 15. SELECT modules list
  if (sql.includes('select id, title, type, category, difficulty, status, protected, content_json from modules where tenant_id=$1 order by created_at desc')) {
    const tid = params[0];
    const list = mockDb.modules
      .filter(m => m.tenant_id === tid)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return list as T[];
  }

  // 16. INSERT module
  if (sql.startsWith('insert into modules')) {
    const [tid, title, type, category, difficulty, estimatedMinutes, contentJson, createdBy] = params;
    const newModule = {
      id: randomUUID(),
      tenant_id: tid,
      title,
      type: type || 'Interactive Module',
      category,
      difficulty: difficulty || 'Beginner',
      estimated_minutes: estimatedMinutes || 5,
      content_json: contentJson || {},
      status: 'published',
      protected: true,
      created_by: createdBy,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.modules.push(newModule);
    return [newModule] as T[];
  }

  // 17. INSERT training assignment
  if (sql.startsWith('insert into training_assignments')) {
    const [tid, moduleId, assignedToType, assignedToId, dueDate, createdBy] = params;
    const newAssignment = {
      id: randomUUID(),
      tenant_id: tid,
      module_id: moduleId,
      assigned_to_type: assignedToType,
      assigned_to_id: assignedToId,
      due_date: dueDate ? new Date(dueDate) : null,
      status: 'active',
      created_by: createdBy,
      created_at: new Date()
    };
    mockDb.training_assignments.push(newAssignment);

    // Auto-generate starting user module progress records for target learners
    let targetUsers = [] as any[];
    if (assignedToType === 'all') {
      targetUsers = mockDb.users.filter(u => u.tenant_id === tid);
    } else if (assignedToType === 'department' && assignedToId) {
      targetUsers = mockDb.users.filter(u => u.tenant_id === tid && u.department_id === assignedToId);
    } else if (assignedToType === 'users' && assignedToId) {
      targetUsers = mockDb.users.filter(u => u.id === assignedToId);
    } else if (assignedToType === 'me') {
      targetUsers = mockDb.users.filter(u => u.id === createdBy);
    }

    targetUsers.forEach(u => {
      const exists = mockDb.user_module_progress.some(p => p.user_id === u.id && p.module_id === moduleId);
      if (!exists) {
        mockDb.user_module_progress.push({
          id: randomUUID(),
          tenant_id: tid,
          user_id: u.id,
          module_id: moduleId,
          assignment_id: newAssignment.id,
          status: 'not_started',
          progress_percent: 0,
          score: 0,
          updated_at: new Date()
        });
      }
    });

    return [newAssignment] as T[];
  }

  // 18. SELECT progress list
  if (sql.includes('select p.*, u.name as user_name, m.title as module_title from user_module_progress p')) {
    const tid = params[0];
    const list = mockDb.user_module_progress
      .filter(p => p.tenant_id === tid)
      .map(p => {
        const u = mockDb.users.find(x => x.id === p.user_id);
        const m = mockDb.modules.find(x => x.id === p.module_id);
        return {
          ...p,
          user_name: u ? u.name : 'Unknown User',
          module_title: m ? m.title : 'Unknown Module'
        };
      })
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
    return list as T[];
  }

  // 19. SELECT phishing templates list
  if (sql.includes('select * from phishing_templates where tenant_id=$1 order by created_at desc')) {
    const tid = params[0];
    const list = mockDb.phishing_templates
      .filter(t => t.tenant_id === tid)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return list as T[];
  }

  // 20. INSERT phishing template
  if (sql.startsWith('insert into phishing_templates')) {
    const [tid, name, subject, bodyHtml, bodyText, difficulty, redFlagsJson, createdBy] = params;
    const newTemplate = {
      id: randomUUID(),
      tenant_id: tid,
      source_type: 'master',
      name,
      subject,
      body_html: bodyHtml,
      body_text: bodyText,
      difficulty: difficulty || 'Beginner',
      red_flags_json: typeof redFlagsJson === 'string' ? JSON.parse(redFlagsJson) : redFlagsJson,
      sender_name: 'IT Support',
      sender_email: 'support@company.com',
      created_by: createdBy,
      created_at: new Date()
    };
    mockDb.phishing_templates.push(newTemplate);
    return [newTemplate] as T[];
  }

  // 21. SELECT phishing campaigns list
  if (sql.includes('select * from phishing_campaigns where tenant_id=$1 order by created_at desc')) {
    const tid = params[0];
    const list = mockDb.phishing_campaigns
      .filter(c => c.tenant_id === tid)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return list as T[];
  }

  // 22. INSERT phishing campaign
  if (sql.startsWith('insert into phishing_campaigns')) {
    const [tid, templateId, name, scheduledAt, audienceType, consentJson, redirectRuleJson, createdBy] = params;
    const newCampaign = {
      id: randomUUID(),
      tenant_id: tid,
      template_id: templateId,
      name,
      scheduled_at: scheduledAt ? new Date(scheduledAt) : new Date(),
      status: 'scheduled',
      audience_type: audienceType || 'all',
      consent_json: typeof consentJson === 'string' ? JSON.parse(consentJson) : consentJson,
      redirect_rule_json: typeof redirectRuleJson === 'string' ? JSON.parse(redirectRuleJson) : redirectRuleJson,
      created_by: createdBy,
      created_at: new Date()
    };
    mockDb.phishing_campaigns.push(newCampaign);

    // Auto-create phishing targets based on audience
    let targetUsers = [] as any[];
    if (audienceType === 'all') {
      targetUsers = mockDb.users.filter(u => u.tenant_id === tid);
    } else {
      targetUsers = mockDb.users.filter(u => u.tenant_id === tid).slice(0, 2); // Default to a slice of users
    }

    targetUsers.forEach(u => {
      mockDb.phishing_targets.push({
        id: randomUUID(),
        tenant_id: tid,
        campaign_id: newCampaign.id,
        user_id: u.id,
        email: u.email,
        delivery_status: 'pending',
        created_at: new Date()
      });
    });

    return [newCampaign] as T[];
  }

  // 23. INSERT phishing event
  if (sql.startsWith('insert into phishing_events')) {
    const [tid, campaignId, targetId, eventType, metadataJson] = params;
    const newEvent = {
      id: randomUUID(),
      tenant_id: tid,
      campaign_id: campaignId,
      target_id: targetId,
      event_type: eventType,
      metadata_json: typeof metadataJson === 'string' ? JSON.parse(metadataJson) : metadataJson,
      event_time: new Date()
    };
    mockDb.phishing_events.push(newEvent);

    // Update target delivery status or user risk score on click / report
    const target = mockDb.phishing_targets.find(t => t.id === targetId);
    if (target) {
      if (eventType === 'clicked') {
        target.delivery_status = 'clicked';
        // Impact user score negatively
        const u = mockDb.users.find(x => x.id === target.user_id);
        if (u) {
          u.score = Math.max(0, u.score - 15);
          u.risk = u.score < 65 ? 'High' : u.score < 85 ? 'Medium' : 'Low';
        }
      } else if (eventType === 'reported') {
        target.delivery_status = 'reported';
        // Benefit user score
        const u = mockDb.users.find(x => x.id === target.user_id);
        if (u) {
          u.score = Math.min(100, u.score + 5);
          u.risk = u.score < 65 ? 'High' : u.score < 85 ? 'Medium' : 'Low';
        }
      }
    }

    return [newEvent] as T[];
  }

  // 24. SELECT user details for reports
  if (sql.includes('select id, name, email, role, risk, score from users where id=$1 and tenant_id=$2')) {
    const [id, tid] = params;
    return mockDb.users.filter(u => u.id === id && u.tenant_id === tid) as T[];
  }

  // 25. SELECT user progress join module for reports
  if (sql.includes('select m.title, p.status, p.score, p.progress_percent from user_module_progress p join modules m')) {
    const [uid, tid] = params;
    const progress = mockDb.user_module_progress
      .filter(p => p.user_id === uid && p.tenant_id === tid)
      .map(p => {
        const m = mockDb.modules.find(x => x.id === p.module_id);
        return {
          title: m ? m.title : 'Unknown Module',
          status: p.status,
          score: p.score,
          progress_percent: p.progress_percent
        };
      });
    return progress as T[];
  }

  // 26. SELECT SMTP settings
  if (sql.includes('select id, provider_type, host, port, encryption, sender_name, sender_email, active, last_test_status from smtp_settings where tenant_id=$1 limit 1')) {
    const tid = params[0];
    const settings = mockDb.smtp_settings.filter(s => s.tenant_id === tid);
    return (settings.length > 0 ? [settings[0]] : []) as T[];
  }

  // 27. UPDATE SMTP settings
  if (sql.includes('update smtp_settings set host=$2, port=$3, encryption=$4, sender_name=$5, sender_email=$6')) {
    const [tid, host, port, encryption, senderName, senderEmail, encryptedSecret] = params;
    let settings = mockDb.smtp_settings.find(s => s.tenant_id === tid);
    if (!settings) {
      settings = {
        id: randomUUID(),
        tenant_id: tid,
        provider_type: 'smtp',
        created_at: new Date()
      };
      mockDb.smtp_settings.push(settings);
    }
    settings.host = host;
    settings.port = parseInt(port) || 1025;
    settings.encryption = encryption;
    settings.sender_name = senderName;
    settings.sender_email = senderEmail;
    settings.encrypted_secret = encryptedSecret || settings.encrypted_secret;
    settings.active = true;
    settings.updated_at = new Date();

    return [{
      id: settings.id,
      host: settings.host,
      port: settings.port,
      encryption: settings.encryption,
      sender_name: settings.sender_name,
      sender_email: settings.sender_email
    }] as T[];
  }

  // 28. INSERT certificate
  if (sql.startsWith('insert into certificates')) {
    const [tid, userId, moduleId, certificateId, level, score] = params;
    const newCert = {
      id: randomUUID(),
      tenant_id: tid,
      user_id: userId,
      module_id: moduleId,
      certificate_id: certificateId,
      level: level || 'Certified Learner',
      score: score || 100,
      issued_at: new Date()
    };
    mockDb.certificates.push(newCert);
    return [newCert] as T[];
  }

  // 29. SELECT certificate
  if (sql.includes('select * from certificates where id=$1 or certificate_id=$1')) {
    const id = params[0];
    return mockDb.certificates.filter(c => (c.id === id || c.certificate_id === id)) as T[];
  }

  // 30. INSERT audit_logs
  if (sql.startsWith('insert into audit_logs')) {
    const [tid, actorId, action, resourceType, metadataJson] = params;
    const newLog = {
      id: randomUUID(),
      tenant_id: tid,
      actor_user_id: actorId,
      action,
      resource_type: resourceType,
      metadata_json: typeof metadataJson === 'string' ? JSON.parse(metadataJson) : metadataJson,
      created_at: new Date()
    };
    mockDb.audit_logs.push(newLog);
    return [newLog] as T[];
  }

  // General fallback for unmapped select queries or generic tables
  console.log(`[Mock DB Debug] Unmapped SQL query: "${text}". params:`, params);
  return [] as T[];
}
