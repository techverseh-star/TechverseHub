-- Drop existing policies (run this before create-tables.sql if you get policy already exists errors)

DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON lessons;
DROP POLICY IF EXISTS "Problems are viewable by everyone" ON problems;
DROP POLICY IF EXISTS "Testcases are viewable by everyone" ON testcases;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can insert own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON submissions;
