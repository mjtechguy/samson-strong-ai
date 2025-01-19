-- Drop existing policies
DROP POLICY IF EXISTS "users_read_all" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;
DROP POLICY IF EXISTS "messages_read_own" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "programs_read_all" ON programs;
DROP POLICY IF EXISTS "programs_admin_all" ON programs;
DROP POLICY IF EXISTS "user_programs_read_own" ON user_programs;
DROP POLICY IF EXISTS "user_programs_insert_own" ON user_programs;

-- Users table policies (avoiding recursion)
CREATE POLICY "users_read_all"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "users_update_self"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "users_insert_self"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_admin_all"
    ON users FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'email' = 'admin@example.com'
    );

-- Messages table policies
CREATE POLICY "messages_read_own"
    ON messages FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "messages_insert_own"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Programs table policies
CREATE POLICY "programs_read_all"
    ON programs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "programs_admin_all"
    ON programs FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'email' = 'admin@example.com'
    );

-- User programs table policies
CREATE POLICY "user_programs_read_own"
    ON user_programs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "user_programs_insert_own"
    ON user_programs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());