/*
  # Initial Schema Setup
  
  1. Tables
    - Creates users table with all necessary fields
  
  2. Security
    - Enables RLS
    - Sets up basic security policies
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER DEFAULT 30,
    weight INTEGER DEFAULT 70,
    height INTEGER DEFAULT 170,
    sex TEXT DEFAULT 'other',
    "fitnessGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceLevel" TEXT DEFAULT 'beginner',
    "unitSystem" TEXT DEFAULT 'metric',
    is_admin BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Add is_profile_complete column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "users_insert_profile"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_select"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.is_admin = true
            AND u.id != users.id
        )
    );

CREATE POLICY "users_update_own"
    ON users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_admin"
    ON users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.is_admin = true
            AND u.id != users.id
        )
    );

CREATE POLICY "users_delete_admin"
    ON users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.is_admin = true
            AND u.id != users.id
        )
    );