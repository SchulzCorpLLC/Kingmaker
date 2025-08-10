/*
# Create profiles table

1. New Tables
  - `profiles`
    - `id` (uuid, primary key) - Links to auth.users
    - `username` (text, unique) - User's display name
    - `avatar_url` (text) - Profile picture URL
    - `bio` (text) - Personal biography
    - `business_focus` (text) - Business area of focus
    - `scripture` (text) - Favorite scripture verse
    - `total_points` (integer, default 0) - Total points earned
    - `created_at` (timestamp) - Account creation date
    - `updated_at` (timestamp) - Last profile update

2. Security
  - Enable RLS on `profiles` table
  - Add policy for users to read all profiles (for leaderboard)
  - Add policy for users to update only their own profile
  - Add policy for users to insert their own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  bio text,
  business_focus text,
  scripture text,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();