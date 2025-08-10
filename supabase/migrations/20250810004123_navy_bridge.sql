/*
# Create quests and quest completions tables

1. New Tables
  - `quests`
    - `id` (uuid, primary key)
    - `title` (text) - Quest title
    - `description` (text) - Detailed description
    - `points_value` (integer) - Points awarded for completion
    - `category` (text) - Quest category (spiritual, business, health, etc.)
    - `is_active` (boolean, default true) - Whether quest is available
    - `created_at` (timestamp)

  - `quest_completions`
    - `id` (uuid, primary key)
    - `quest_id` (uuid, foreign key to quests)
    - `user_id` (uuid, foreign key to profiles)
    - `completed_at` (timestamp)
    - Unique constraint on (quest_id, user_id, DATE(completed_at)) to prevent multiple completions per day

2. Security
  - Enable RLS on both tables
  - Users can read all quests
  - Users can read all completions (for leaderboard calculations)
  - Users can only insert their own completions
*/

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_value integer NOT NULL DEFAULT 10,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create quest_completions table
CREATE TABLE IF NOT EXISTS quest_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(quest_id, user_id, DATE(completed_at AT TIME ZONE 'UTC'))
);

-- Enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;

-- Policies for quests
CREATE POLICY "Anyone can view active quests"
  ON quests
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for quest_completions
CREATE POLICY "Users can view all completions"
  ON quest_completions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own completions"
  ON quest_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert some default quests
INSERT INTO quests (title, description, points_value, category) VALUES
  ('Morning Prayer', 'Start your day with prayer and scripture reading', 10, 'spiritual'),
  ('Business Goal Review', 'Review and update your business goals for the day', 15, 'business'),
  ('Exercise/Fitness', 'Complete at least 30 minutes of physical activity', 10, 'health'),
  ('Scripture Study', 'Spend 15 minutes studying scripture', 15, 'spiritual'),
  ('Network Building', 'Reach out to one new business contact or client', 20, 'business'),
  ('Gratitude Journal', 'Write down 3 things you are grateful for today', 5, 'personal'),
  ('Skill Development', 'Spend 30 minutes learning a new business skill', 15, 'business'),
  ('Family Time', 'Spend quality time with family without distractions', 10, 'personal')
ON CONFLICT DO NOTHING;