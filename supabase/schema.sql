-- DEFINITIVE SUPABASE SCHEMA FOR TECHVERSEHUB (Paranoid ver.)

-- 1. LANGUAGES
CREATE TABLE IF NOT EXISTS languages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  lessons_count INTEGER DEFAULT 0,
  prefix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. LESSONS
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'language') THEN
        ALTER TABLE lessons ADD COLUMN language TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'language_id') THEN
        ALTER TABLE lessons ADD COLUMN language_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'code_example') THEN
        ALTER TABLE lessons ADD COLUMN code_example TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'try_starter') THEN
        ALTER TABLE lessons ADD COLUMN try_starter TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'order') THEN
        ALTER TABLE lessons ADD COLUMN "order" INTEGER;
    END IF;
END $$;


-- 3. PRACTICE_PROBLEMS
CREATE TABLE IF NOT EXISTS practice_problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_problems' AND column_name = 'language') THEN
        ALTER TABLE practice_problems ADD COLUMN language TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_problems' AND column_name = 'language_id') THEN
        ALTER TABLE practice_problems ADD COLUMN language_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_problems' AND column_name = 'examples') THEN
        ALTER TABLE practice_problems ADD COLUMN examples TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_problems' AND column_name = 'solution') THEN
        ALTER TABLE practice_problems ADD COLUMN solution TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_problems' AND column_name = 'hints') THEN
        ALTER TABLE practice_problems ADD COLUMN hints TEXT;
    END IF;
END $$;


-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  -- We don't enforce title here in CREATE because if it exists without title, we want to catch it in DO block
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    -- Ensure basic columns exist even if table was created minimally
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title') THEN
        ALTER TABLE projects ADD COLUMN title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'language') THEN
        ALTER TABLE projects ADD COLUMN language TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'language_id') THEN
        ALTER TABLE projects ADD COLUMN language_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'difficulty') THEN
        ALTER TABLE projects ADD COLUMN difficulty TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'duration') THEN
        ALTER TABLE projects ADD COLUMN duration TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'overview') THEN
        ALTER TABLE projects ADD COLUMN overview TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'concepts') THEN
        ALTER TABLE projects ADD COLUMN concepts JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'steps') THEN
        ALTER TABLE projects ADD COLUMN steps JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'starter_code') THEN
        ALTER TABLE projects ADD COLUMN starter_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'solution_code') THEN
        ALTER TABLE projects ADD COLUMN solution_code TEXT;
    END IF;
END $$;

-- 5. RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
