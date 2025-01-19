-- Drop all existing policies
DROP POLICY IF EXISTS "users_read_v2" ON users;
DROP POLICY IF EXISTS "users_insert_self_v2" ON users;
DROP POLICY IF EXISTS "users_update_self_v2" ON users;
DROP POLICY IF EXISTS "users_admin_all_v2" ON users;

-- Create simplified policies that avoid recursion
CREATE POLICY "allow_read_all"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "allow_insert_self"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_self"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "allow_admin_all"
    ON users FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'email' = 'admin@example.com'
    );

-- Update admin user status
UPDATE users 
SET 
    is_admin = true,
    is_profile_complete = true
WHERE email = 'admin@example.com';