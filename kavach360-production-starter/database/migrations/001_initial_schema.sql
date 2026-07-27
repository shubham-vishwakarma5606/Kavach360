CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  country TEXT DEFAULT 'IN',
  status TEXT DEFAULT 'trial',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manager_user_id UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  employee_id TEXT,
  job_title TEXT,
  role TEXT DEFAULT 'Learner',
  risk TEXT DEFAULT 'Low',
  score INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  password_hash TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, email)
);

ALTER TABLE departments ADD CONSTRAINT departments_manager_fk FOREIGN KEY (manager_user_id) REFERENCES users(id);

CREATE TABLE licences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'trial',
  status TEXT DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  trial_extended_until DATE,
  max_users INT DEFAULT 50,
  features_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  source_type TEXT DEFAULT 'master',
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'Interactive Module',
  category TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  estimated_minutes INT DEFAULT 5,
  status TEXT DEFAULT 'published',
  protected BOOLEAN DEFAULT true,
  content_json JSONB DEFAULT '{}'::jsonb,
  framework_mapping_json JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE training_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  assigned_to_type TEXT NOT NULL,
  assigned_to_id UUID,
  due_date DATE,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES training_assignments(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'not_started',
  progress_percent INT DEFAULT 0,
  score INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, module_id, assignment_id)
);

CREATE TABLE phishing_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  source_type TEXT DEFAULT 'master',
  name TEXT NOT NULL,
  category TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  sender_name TEXT,
  sender_email TEXT,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  landing_page_html TEXT,
  red_flags_json JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE phishing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES phishing_templates(id),
  name TEXT NOT NULL,
  scheduled_at TIMESTAMP,
  status TEXT DEFAULT 'draft',
  audience_type TEXT DEFAULT 'all',
  consent_json JSONB DEFAULT '{}'::jsonb,
  redirect_rule_json JSONB DEFAULT '{}'::jsonb,
  approved_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE phishing_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES phishing_campaigns(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  tracking_token_hash TEXT,
  delivery_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE phishing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES phishing_campaigns(id) ON DELETE CASCADE,
  target_id UUID REFERENCES phishing_targets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_time TIMESTAMP DEFAULT now(),
  metadata_json JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE smtp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type TEXT DEFAULT 'smtp',
  host TEXT,
  port INT,
  username TEXT,
  encrypted_secret TEXT,
  encryption TEXT DEFAULT 'starttls',
  sender_name TEXT,
  sender_email TEXT,
  reply_to_email TEXT,
  active BOOLEAN DEFAULT true,
  last_test_status TEXT,
  last_test_at TIMESTAMP
);

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'published',
  content TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  certificate_id TEXT UNIQUE NOT NULL,
  level TEXT,
  score INT,
  issued_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  pdf_url TEXT
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now()
);
