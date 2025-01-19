/*
  # Initial Schema Setup
  
  1. Tables
    - Creates users table with all necessary fields
    - Creates messages table for chat history
    - Creates programs and user_programs tables
  
  2. Security
    - Enables RLS on all tables
    - Sets up basic security policies
*/

-- Create users table
CREATE TABLE users (
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

-- Create messages table
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create programs table
CREATE TABLE programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    template TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_programs table
CREATE TABLE user_programs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
    customized_plan TEXT NOT NULL,
    pdf_url TEXT,
    pdf_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;