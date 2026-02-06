-- Widget System Tables

-- Client dashboards (each client can have multiple dashboard layouts)
CREATE TABLE IF NOT EXISTS client_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Dashboard',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES client_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('metric_card', 'line_chart', 'bar_chart', 'pie_chart')),
  title TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'linkedin', 'youtube', 'tiktok', 'all')),
  account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT 'small' CHECK (size IN ('small', 'medium', 'large')),
  position INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency customization settings
CREATE TABLE IF NOT EXISTS agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e293b',
  email_from_name TEXT,
  email_footer_text TEXT,
  report_logo_url TEXT,
  report_header_text TEXT,
  report_footer_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('report_delivery', 'welcome', 'notification', 'custom')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stored metrics (for historical data and charts)
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, metric_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_client ON client_dashboards(client_id);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_account_date ON metric_snapshots(account_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_email_templates_agency ON email_templates(agency_id);

-- RLS Policies
ALTER TABLE client_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies (simplified - users can access their agency's data)
CREATE POLICY "Users can view their agency dashboards" ON client_dashboards
  FOR ALL USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agency_members am ON am.agency_id = c.agency_id
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their agency widgets" ON dashboard_widgets
  FOR ALL USING (
    dashboard_id IN (
      SELECT cd.id FROM client_dashboards cd
      JOIN clients c ON c.id = cd.client_id
      JOIN agency_members am ON am.agency_id = c.agency_id
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their agency settings" ON agency_settings
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their agency templates" ON email_templates
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their agency metrics" ON metric_snapshots
  FOR ALL USING (
    account_id IN (
      SELECT ca.id FROM connected_accounts ca
      JOIN clients c ON c.id = ca.client_id
      JOIN agency_members am ON am.agency_id = c.agency_id
      WHERE am.user_id = auth.uid()
    )
  );
