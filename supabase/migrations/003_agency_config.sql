-- Add config column to agency_settings for storing JSON settings like report preferences
ALTER TABLE agency_settings ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN agency_settings.config IS 'Stores various agency configuration as JSON (report settings, preferences, etc.)';
