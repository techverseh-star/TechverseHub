-- FIX PROJECT ID TYPE
-- The 'projects' table apparently has 'id' as UUID, but our data uses TEXT ids (e.g. 'py-1').
-- We need to change this column to TEXT.

-- 1. Disable constraints temporarily (if any depend on it, this might be needed, but simple ALTER might work)
-- simple ALTER is best first attempt.

ALTER TABLE projects ALTER COLUMN id TYPE TEXT USING id::text;

-- If the above fails due to Foreign Key constraints (e.g. project_files referencing projects.id),
-- we would need to drop the FK, alter, and re-add.
-- But let's assume standard setup first.

-- Verify other columns just in case
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
    END IF;
END $$;
