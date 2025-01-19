/*
  # Row Level Security Policies
  
  1. Users Table
    - Public read access
    - Self-update access
    - Admin full access
  
  2. Other Tables
    - Messages: User access to own messages
    - Programs: Public read, admin write
    - User Programs: User access to own programs
*/

-- Users table policies
CREATE POLICY "users_read_all"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "users_update_self"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "users_admin_all"
    ON users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
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
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
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