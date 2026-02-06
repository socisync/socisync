-- Socisync Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENCIES (Multi-tenant: each agency is a customer)
-- ============================================
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  website TEXT,
  subscription_tier TEXT DEFAULT 'trial', -- trial, starter, pro, enterprise
  subscription_status TEXT DEFAULT 'trialing', -- trialing, active, canceled, past_due
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENCY_MEMBERS (Users belonging to an agency)
-- ============================================
CREATE TABLE agency_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  invited_email TEXT,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, user_id)
);

-- ============================================
-- CLIENTS (The agency's clients/businesses)
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONNECTED_ACCOUNTS (OAuth connections to platforms)
-- ============================================
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- meta, linkedin, youtube, tiktok
  platform_account_id TEXT NOT NULL, -- ID from the platform
  platform_account_name TEXT, -- Display name
  platform_account_type TEXT, -- page, profile, channel, etc.
  access_token TEXT, -- Encrypted in production
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[], -- Array of granted scopes
  metadata JSONB DEFAULT '{}', -- Platform-specific data
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, platform, platform_account_id)
);

-- ============================================
-- REPORTS (Generated client reports)
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- monthly, weekly, custom
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  platforms TEXT[], -- Which platforms included
  pdf_url TEXT, -- Generated PDF storage URL
  status TEXT DEFAULT 'draft', -- draft, generating, ready, sent
  sent_at TIMESTAMPTZ,
  sent_to TEXT[], -- Email addresses
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- METRICS_CACHE (Cached metrics from platforms)
-- ============================================
CREATE TABLE metrics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- followers, reach, impressions, engagement, etc.
  metric_value NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connected_account_id, metric_date, metric_type)
);

-- ============================================
-- AUDIT_LOG (Track important actions)
-- ============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's agency IDs
CREATE OR REPLACE FUNCTION get_user_agency_ids()
RETURNS SETOF UUID AS $$
  SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Agencies: Users can only see agencies they belong to
CREATE POLICY "Users can view their agencies" ON agencies
  FOR SELECT USING (id IN (SELECT get_user_agency_ids()));

CREATE POLICY "Owners can update their agencies" ON agencies
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create agencies" ON agencies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Agency Members: Can see members of agencies they belong to
CREATE POLICY "Users can view agency members" ON agency_members
  FOR SELECT USING (agency_id IN (SELECT get_user_agency_ids()));

CREATE POLICY "Admins can manage members" ON agency_members
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Clients: Can see/manage clients of their agencies
CREATE POLICY "Users can view clients" ON clients
  FOR SELECT USING (agency_id IN (SELECT get_user_agency_ids()));

CREATE POLICY "Users can manage clients" ON clients
  FOR ALL USING (agency_id IN (SELECT get_user_agency_ids()));

-- Connected Accounts: Through clients
CREATE POLICY "Users can view connected accounts" ON connected_accounts
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE agency_id IN (SELECT get_user_agency_ids()))
  );

CREATE POLICY "Users can manage connected accounts" ON connected_accounts
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE agency_id IN (SELECT get_user_agency_ids()))
  );

-- Reports: Through clients
CREATE POLICY "Users can view reports" ON reports
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE agency_id IN (SELECT get_user_agency_ids()))
  );

CREATE POLICY "Users can manage reports" ON reports
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE agency_id IN (SELECT get_user_agency_ids()))
  );

-- Metrics Cache: Through connected accounts
CREATE POLICY "Users can view metrics" ON metrics_cache
  FOR SELECT USING (
    connected_account_id IN (
      SELECT ca.id FROM connected_accounts ca
      JOIN clients c ON ca.client_id = c.id
      WHERE c.agency_id IN (SELECT get_user_agency_ids())
    )
  );

-- Audit Log: Through agencies
CREATE POLICY "Users can view audit logs" ON audit_log
  FOR SELECT USING (agency_id IN (SELECT get_user_agency_ids()));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_agency_members_user ON agency_members(user_id);
CREATE INDEX idx_agency_members_agency ON agency_members(agency_id);
CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_connected_accounts_client ON connected_accounts(client_id);
CREATE INDEX idx_connected_accounts_platform ON connected_accounts(platform);
CREATE INDEX idx_reports_client ON reports(client_id);
CREATE INDEX idx_metrics_cache_account ON metrics_cache(connected_account_id);
CREATE INDEX idx_metrics_cache_date ON metrics_cache(metric_date);
CREATE INDEX idx_audit_log_agency ON audit_log(agency_id);

-- ============================================
-- TRIGGER: Auto-create agency membership on agency creation
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_agency()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agency_members (agency_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_agency_created
  AFTER INSERT ON agencies
  FOR EACH ROW EXECUTE FUNCTION handle_new_agency();

-- ============================================
-- TRIGGER: Update updated_at timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
