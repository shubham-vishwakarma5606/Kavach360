-- Kavach360 production database starter schema
CREATE TABLE tenants (id UUID PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, status TEXT DEFAULT 'trial', created_at TIMESTAMP DEFAULT now());
CREATE TABLE users (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), name TEXT NOT NULL, email TEXT NOT NULL, department TEXT, role TEXT DEFAULT 'Learner', risk TEXT DEFAULT 'Low', score INT DEFAULT 0, status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT now());
CREATE TABLE licences (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), plan TEXT, status TEXT, start_date DATE, end_date DATE, max_users INT, features_json JSONB);
CREATE TABLE modules (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), title TEXT NOT NULL, type TEXT, category TEXT, difficulty TEXT, status TEXT DEFAULT 'published', protected BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT now());
CREATE TABLE training_assignments (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), module_id UUID REFERENCES modules(id), user_id UUID REFERENCES users(id), status TEXT DEFAULT 'assigned', score INT DEFAULT 0, completed_at TIMESTAMP);
CREATE TABLE phishing_templates (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), name TEXT, subject TEXT, body_html TEXT, difficulty TEXT, status TEXT DEFAULT 'published');
CREATE TABLE phishing_campaigns (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), template_id UUID REFERENCES phishing_templates(id), name TEXT, scheduled_at TIMESTAMP, status TEXT, consent_json JSONB, approved_by UUID, created_at TIMESTAMP DEFAULT now());
CREATE TABLE phishing_targets (id UUID PRIMARY KEY, campaign_id UUID REFERENCES phishing_campaigns(id), user_id UUID REFERENCES users(id), email TEXT, delivery_status TEXT DEFAULT 'pending');
CREATE TABLE phishing_events (id UUID PRIMARY KEY, campaign_id UUID REFERENCES phishing_campaigns(id), target_id UUID REFERENCES phishing_targets(id), event_type TEXT, event_time TIMESTAMP DEFAULT now(), metadata_json JSONB);
CREATE TABLE smtp_settings (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), host TEXT, port INT, username TEXT, encrypted_secret TEXT, encryption TEXT, sender_email TEXT, active BOOLEAN DEFAULT true);
CREATE TABLE policies (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), title TEXT, version TEXT, status TEXT, content TEXT);
CREATE TABLE policy_acknowledgements (id UUID PRIMARY KEY, policy_id UUID REFERENCES policies(id), user_id UUID REFERENCES users(id), acknowledged_at TIMESTAMP DEFAULT now());
CREATE TABLE certificates (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), user_id UUID REFERENCES users(id), certificate_id TEXT UNIQUE, level TEXT, score INT, issued_at TIMESTAMP DEFAULT now(), pdf_url TEXT);
CREATE TABLE audit_logs (id UUID PRIMARY KEY, tenant_id UUID REFERENCES tenants(id), actor_user_id UUID, action TEXT, resource_type TEXT, resource_id UUID, created_at TIMESTAMP DEFAULT now(), metadata_json JSONB);
