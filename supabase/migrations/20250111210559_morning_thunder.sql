/*
  # System Settings Migration
  
  1. Table
    - Creates system_settings table if it doesn't exist
  
  2. Policies
    - Enables RLS
    - Adds read policy for all users
    - Adds admin management policy
  
  3. Default Settings
    - Inserts default system settings
*/

-- Create system settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "settings_read_all" ON system_settings;
DROP POLICY IF EXISTS "settings_admin_all" ON system_settings;

-- Allow all users to read settings
CREATE POLICY "settings_read_all"
    ON system_settings FOR SELECT
    TO authenticated
    USING (true);

-- Allow admin to manage settings
CREATE POLICY "settings_admin_all"
    ON system_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Store admin email in settings using environment variable
INSERT INTO system_settings (key, value, description)
VALUES (
    'admin_email',
    'admin@example.com',  -- Default value matching VITE_DEFAULT_ADMIN_EMAIL
    'Default admin user email'
) ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- Add other default settings
INSERT INTO system_settings (key, value, description)
VALUES 
    ('app_title', 'Fitness AI', 'Application title'),
    ('max_context_length', '128000', 'Maximum context length for AI responses'),
    ('max_response_length', '16000', 'Maximum length for AI responses')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;