-- Drop existing policies first
DROP POLICY IF EXISTS "users_read" ON users;
DROP POLICY IF EXISTS "users_insert_self" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;

-- Create new policies with unique names
CREATE POLICY "users_read_v2"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "users_insert_self_v2"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_self_v2"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "users_admin_all_v2"
    ON users FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'email' = 'admin@example.com'
    );