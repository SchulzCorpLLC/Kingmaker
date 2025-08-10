/*
# Create function to update total points automatically

1. Functions
  - `update_user_points()` - Automatically updates total_points in profiles when quest is completed
  - `calculate_user_total_points(user_id)` - Calculates total points for a user

2. Triggers
  - Trigger on quest_completions to automatically update profile points
*/

-- Function to calculate total points for a user
CREATE OR REPLACE FUNCTION calculate_user_total_points(target_user_id uuid)
RETURNS integer AS $$
DECLARE
  total integer := 0;
BEGIN
  SELECT COALESCE(SUM(q.points_value), 0)
  INTO total
  FROM quest_completions qc
  JOIN quests q ON qc.quest_id = q.id
  WHERE qc.user_id = target_user_id;
  
  RETURN total;
END;
$$ language 'plpgsql';

-- Function to update user points when quest is completed
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_points = calculate_user_total_points(NEW.user_id)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update points when quest is completed
CREATE TRIGGER update_points_on_quest_completion
  AFTER INSERT ON quest_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

-- Update existing users' points (in case there are any)
UPDATE profiles 
SET total_points = calculate_user_total_points(id);