-- Kavach360 demo seed data
-- Default dev login supported by API: admin@kavach360.local / Admin@123

DO $$
DECLARE
  v_tenant UUID;
  v_finance UUID;
  v_hr UUID;
  v_it UUID;
  v_admin UUID;
  v_asha UUID;
  v_rohit UUID;
  v_meera UUID;
  v_priya UUID;
  v_mod_phish UUID;
  v_mod_dpdpa UUID;
  v_mod_mobile UUID;
  v_mod_rbi UUID;
  v_template UUID;
  v_campaign UUID;
BEGIN
  INSERT INTO tenants (name, slug, industry, country, status, primary_contact_name, primary_contact_email)
  VALUES ('Kavach360 Demo Customer', 'demo', 'BFSI', 'IN', 'trial', 'Ninad Lad', 'admin@kavach360.local')
  RETURNING id INTO v_tenant;

  INSERT INTO licences (tenant_id, plan, status, start_date, end_date, max_users, features_json)
  VALUES (v_tenant, 'professional_trial', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 50,
  '{"training":true,"phishing":true,"smtp":true,"reports":true,"certificates":true,"customer_content":true}'::jsonb);

  INSERT INTO departments (tenant_id, name) VALUES (v_tenant, 'Finance') RETURNING id INTO v_finance;
  INSERT INTO departments (tenant_id, name) VALUES (v_tenant, 'HR') RETURNING id INTO v_hr;
  INSERT INTO departments (tenant_id, name) VALUES (v_tenant, 'IT') RETURNING id INTO v_it;

  INSERT INTO users (tenant_id, department_id, name, email, role, risk, score, status)
  VALUES (v_tenant, v_it, 'Ninad Lad', 'admin@kavach360.local', 'Customer Admin', 'Low', 96, 'active') RETURNING id INTO v_admin;
  INSERT INTO users (tenant_id, department_id, name, email, role, risk, score, status)
  VALUES (v_tenant, v_finance, 'Asha Rao', 'asha@kavach360.local', 'Learner', 'Medium', 82, 'active') RETURNING id INTO v_asha;
  INSERT INTO users (tenant_id, department_id, name, email, role, risk, score, status)
  VALUES (v_tenant, v_it, 'Rohit Mehta', 'rohit@kavach360.local', 'Admin', 'Low', 94, 'active') RETURNING id INTO v_rohit;
  INSERT INTO users (tenant_id, department_id, name, email, role, risk, score, status)
  VALUES (v_tenant, v_hr, 'Meera Shah', 'meera@kavach360.local', 'Manager', 'Low', 89, 'active') RETURNING id INTO v_meera;
  INSERT INTO users (tenant_id, department_id, name, email, role, risk, score, status)
  VALUES (v_tenant, v_finance, 'Priya Nair', 'priya@kavach360.local', 'Learner', 'High', 61, 'active') RETURNING id INTO v_priya;

  INSERT INTO modules (tenant_id, source_type, title, description, type, category, difficulty, estimated_minutes, content_json, framework_mapping_json, created_by)
  VALUES (v_tenant, 'master', 'Phishing Basics', 'Spot suspicious sender, links, urgency and attachments.', 'Interactive Module', 'Email Security', 'Beginner', 7,
  '{"video":"phishing-basics.mp4","quiz":[{"q":"What should you do with a suspicious email?","a":"Report it"}],"redirect_enabled":true}'::jsonb,
  '{"NIST":"Protect","ISO27001":"Awareness"}'::jsonb, v_admin) RETURNING id INTO v_mod_phish;

  INSERT INTO modules (tenant_id, source_type, title, description, type, category, difficulty, estimated_minutes, content_json, framework_mapping_json, created_by)
  VALUES (v_tenant, 'master', 'DPDPA Awareness', 'Personal data, safe sharing and breach reporting.', 'Interactive Module', 'Privacy', 'Beginner', 9,
  '{"video":"dpdpa-awareness.mp4","scenario":"Wrong recipient email","quiz":[{"q":"When should a breach be reported?","a":"Immediately"}]}'::jsonb,
  '{"DPDPA":"Core","ISO27001":"Privacy"}'::jsonb, v_admin) RETURNING id INTO v_mod_dpdpa;

  INSERT INTO modules (tenant_id, source_type, title, description, type, category, difficulty, estimated_minutes, content_json, created_by)
  VALUES (v_tenant, 'master', 'Mobile, WhatsApp and OTP Fraud', 'Smishing, fake manager messages, OTP and UPI scams.', 'Video + Quiz', 'Mobile Security', 'Beginner', 7,
  '{"video":"mobile-scams.mp4","quiz":[{"q":"Should OTP be shared with IT?","a":"No"}]}'::jsonb, v_admin) RETURNING id INTO v_mod_mobile;

  INSERT INTO modules (tenant_id, source_type, title, description, type, category, difficulty, estimated_minutes, content_json, framework_mapping_json, created_by)
  VALUES (v_tenant, 'master', 'RBI / BFSI Cyber Awareness', 'Customer data, digital payment fraud and regulatory escalation.', 'Interactive Module', 'Compliance', 'Intermediate', 10,
  '{"video":"rbI-bfsi-awareness.mp4","quiz":[{"q":"What should happen to payment change requests?","a":"Verify via approved process"}]}'::jsonb,
  '{"RBI":"Cyber Awareness","CERT-In":"Incident Reporting"}'::jsonb, v_admin) RETURNING id INTO v_mod_rbi;

  INSERT INTO training_assignments (tenant_id, module_id, assigned_to_type, assigned_to_id, due_date, created_by)
  VALUES (v_tenant, v_mod_phish, 'all', NULL, CURRENT_DATE + INTERVAL '14 days', v_admin);
  INSERT INTO training_assignments (tenant_id, module_id, assigned_to_type, assigned_to_id, due_date, created_by)
  VALUES (v_tenant, v_mod_dpdpa, 'department', v_finance, CURRENT_DATE + INTERVAL '7 days', v_admin);

  INSERT INTO user_module_progress (tenant_id, user_id, module_id, status, progress_percent, score, completed_at)
  VALUES (v_tenant, v_asha, v_mod_dpdpa, 'completed', 100, 92, now());
  INSERT INTO user_module_progress (tenant_id, user_id, module_id, status, progress_percent, score)
  VALUES (v_tenant, v_asha, v_mod_phish, 'in_progress', 70, 70);
  INSERT INTO user_module_progress (tenant_id, user_id, module_id, status, progress_percent, score, completed_at)
  VALUES (v_tenant, v_rohit, v_mod_phish, 'completed', 100, 96, now());

  INSERT INTO phishing_templates (tenant_id, source_type, name, category, difficulty, sender_name, sender_email, subject, body_html, body_text, landing_page_html, red_flags_json, created_by)
  VALUES (v_tenant, 'master', 'Password Expiry', 'Credential Phishing', 'Intermediate', 'IT Support', 'support@training.customer-domain.com',
  'Urgent: Your mailbox password expires today',
  '<p>Dear {{first_name}}, your mailbox password expires today. Verify using {{training_link}}</p>',
  'Dear {{first_name}}, your mailbox password expires today. Verify using {{training_link}}',
  '<h1>You clicked a training link</h1><p>No password was collected.</p>',
  '["Urgency pressure","Lookalike login link","Generic greeting"]'::jsonb, v_admin) RETURNING id INTO v_template;

  INSERT INTO phishing_campaigns (tenant_id, template_id, name, scheduled_at, status, audience_type, consent_json, redirect_rule_json, approved_by, created_by)
  VALUES (v_tenant, v_template, 'July Password Expiry Drill', now() + INTERVAL '2 days', 'scheduled', 'department',
  '{"management_approval":true,"hr_legal_review":true,"no_credential_collection":true,"approved_domain":true}'::jsonb,
  '{"on_click":"interactive_module","module":"Phishing Basics","auto_assign_remedial":true,"micro_quiz":true}'::jsonb,
  v_admin, v_admin) RETURNING id INTO v_campaign;

  INSERT INTO phishing_targets (tenant_id, campaign_id, user_id, email, delivery_status)
  VALUES (v_tenant, v_campaign, v_asha, 'asha@kavach360.local', 'pending');
  INSERT INTO phishing_targets (tenant_id, campaign_id, user_id, email, delivery_status)
  VALUES (v_tenant, v_campaign, v_meera, 'meera@kavach360.local', 'pending');

  INSERT INTO policies (tenant_id, title, version, status, content)
  VALUES (v_tenant, 'Acceptable Use Policy', '1.0', 'published', 'Use company systems safely and report suspicious activity.');
  INSERT INTO policies (tenant_id, title, version, status, content)
  VALUES (v_tenant, 'Incident Reporting Policy', '1.0', 'published', 'Report suspected incidents immediately.');

  INSERT INTO smtp_settings (tenant_id, provider_type, host, port, encryption, sender_name, sender_email, active)
  VALUES (v_tenant, 'smtp', 'localhost', 1025, 'none', 'Kavach360 Training', 'training@kavach360.local', true);
END $$;
