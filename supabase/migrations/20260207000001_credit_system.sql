-- Credit System Schema for SociSync
-- Based on CREDIT_SYSTEM_MONETIZATION.md research

-- Credit balances for agencies
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  account_type VARCHAR(20) DEFAULT 'agency' CHECK (account_type IN ('agency', 'user', 'client')),
  credits_total INTEGER DEFAULT 0 NOT NULL,
  credits_used INTEGER DEFAULT 0 NOT NULL,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  next_reset_at TIMESTAMPTZ,
  rollover_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, account_type)
);

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'rollover', 'allocation', 'bonus')),
  credits_amount INTEGER NOT NULL, -- positive for credits added, negative for usage
  balance_after INTEGER NOT NULL,
  feature_type VARCHAR(50), -- 'image_standard', 'image_hd', 'text_post', 'text_long', 'video', 'voice', etc.
  description TEXT,
  underlying_cost_cents INTEGER, -- actual API cost in cents
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit packages available for purchase
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- retail price
  wholesale_price_cents INTEGER, -- for agencies buying in bulk
  stripe_price_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_cents, wholesale_price_cents, sort_order) VALUES
  ('50 Credits', 50, 700, NULL, 1),
  ('100 Credits', 100, 1200, 1000, 2),
  ('500 Credits', 500, 5500, 4500, 3),
  ('1,000 Credits', 1000, 10000, 8000, 4),
  ('5,000 Credits (Agency)', 5000, 45000, 37500, 5)
ON CONFLICT DO NOTHING;

-- Credit allocations for agencies distributing credits to clients
CREATE TABLE IF NOT EXISTS credit_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  credits_allocated INTEGER DEFAULT 0 NOT NULL,
  credits_used INTEGER DEFAULT 0 NOT NULL,
  markup_percentage DECIMAL(5,2) DEFAULT 50.00, -- agency's markup on credits
  budget_cap_credits INTEGER, -- optional hard cap
  low_balance_threshold INTEGER DEFAULT 20,
  custom_credit_name VARCHAR(50), -- white-label naming e.g. "Creative Points"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, client_id)
);

-- Credit alerts configuration
CREATE TABLE IF NOT EXISTS credit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_balance', 'budget_cap', 'spike', 'renewal', 'daily_limit')),
  threshold_value INTEGER,
  notification_channels JSONB DEFAULT '["in_app", "email"]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_balances_account ON credit_balances(account_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_account ON credit_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_allocations_agency ON credit_allocations(agency_id);
CREATE INDEX IF NOT EXISTS idx_credit_allocations_client ON credit_allocations(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_alerts_account ON credit_alerts(account_id);

-- RLS Policies
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can read packages (public catalog)
CREATE POLICY "Credit packages are viewable by everyone" ON credit_packages
  FOR SELECT USING (is_active = true);

-- Agency members can view their agency's balance
CREATE POLICY "Users can view their agency credit balance" ON credit_balances
  FOR SELECT USING (
    account_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Agency members can view their agency's transactions
CREATE POLICY "Users can view their agency credit transactions" ON credit_transactions
  FOR SELECT USING (
    account_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Agency members can view their agency's allocations
CREATE POLICY "Users can view their agency credit allocations" ON credit_allocations
  FOR SELECT USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Agency members can view their agency's alerts
CREATE POLICY "Users can view their agency credit alerts" ON credit_alerts
  FOR SELECT USING (
    account_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Function to deduct credits and log transaction
CREATE OR REPLACE FUNCTION deduct_credits(
  p_agency_id UUID,
  p_amount INTEGER,
  p_feature_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_underlying_cost_cents INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_total - credits_used INTO v_current_balance
  FROM credit_balances
  WHERE account_id = p_agency_id AND account_type = 'agency'
  FOR UPDATE;
  
  -- Check if enough credits
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE credit_balances
  SET credits_used = credits_used + p_amount,
      updated_at = NOW()
  WHERE account_id = p_agency_id AND account_type = 'agency'
  RETURNING credits_total - credits_used INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO credit_transactions (
    account_id, transaction_type, credits_amount, balance_after,
    feature_type, description, underlying_cost_cents
  ) VALUES (
    p_agency_id, 'usage', -p_amount, v_new_balance,
    p_feature_type, p_description, p_underlying_cost_cents
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits after purchase
CREATE OR REPLACE FUNCTION add_credits(
  p_agency_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Credit purchase'
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Insert or update balance
  INSERT INTO credit_balances (account_id, credits_total)
  VALUES (p_agency_id, p_amount)
  ON CONFLICT (account_id, account_type)
  DO UPDATE SET credits_total = credit_balances.credits_total + p_amount,
                updated_at = NOW()
  RETURNING credits_total - credits_used INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO credit_transactions (
    account_id, transaction_type, credits_amount, balance_after, description
  ) VALUES (
    p_agency_id, 'purchase', p_amount, v_new_balance, p_description
  );
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_balances_updated_at
  BEFORE UPDATE ON credit_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_allocations_updated_at
  BEFORE UPDATE ON credit_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment for documentation
COMMENT ON TABLE credit_balances IS 'Tracks credit balance for agencies. credits_available = credits_total - credits_used';
COMMENT ON TABLE credit_transactions IS 'Audit log of all credit movements (purchases, usage, refunds)';
COMMENT ON TABLE credit_packages IS 'Available credit packs for purchase with pricing';
COMMENT ON TABLE credit_allocations IS 'How agencies distribute credits to their clients with markup';
COMMENT ON TABLE credit_alerts IS 'Configurable alerts for low balance, budget caps, etc.';
