-- Drop all existing policies
DROP POLICY IF EXISTS "allow_read_all" ON users;
DROP POLICY IF EXISTS "allow_insert_self" ON users;
DROP POLICY IF EXISTS "allow_update_self" ON users;
DROP POLICY IF EXISTS "allow_admin_all" ON users;

-- Temporarily disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Ensure admin user exists and has correct status
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'
)
WHERE email = 'admin@example.com';

UPDATE users 
SET 
    is_admin = true,
    is_profile_complete = true
WHERE email = 'admin@example.com';

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create final, simplified policies
CREATE POLICY "allow_select_all"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "allow_insert_authenticated"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "allow_admin_manage"
    ON users FOR ALL
    TO authenticated
    USING (auth.jwt()->>'email' = 'admin@example.com');