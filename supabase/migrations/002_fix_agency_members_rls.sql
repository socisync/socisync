-- Fix: Allow users to see their own agency_members rows
-- The original policy had a circular dependency issue

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view agency members" ON agency_members;

-- New policy: Users can see agency_members rows where they are the user
CREATE POLICY "Users can view own memberships" ON agency_members
  FOR SELECT USING (user_id = auth.uid());

-- Also allow users to see other members of agencies they belong to
CREATE POLICY "Users can view co-members" ON agency_members
  FOR SELECT USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );
