-- Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_team_size INTEGER DEFAULT 4,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Run the following in your Supabase SQL Editor if RLS is blocking public/anon access:
-- ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_details DISABLE ROW LEVEL SECURITY;
-- OR enable public access policies:
-- CREATE POLICY "Allow public read-write on workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow public read-write on event_details" ON event_details FOR ALL USING (true) WITH CHECK (true);

-- Workspace Applications Table
CREATE TABLE IF NOT EXISTS workspace_applications (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  university TEXT,
  bio TEXT,
  tech_stack TEXT[],
  skills TEXT[],
  github TEXT,
  socials JSONB,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table (Updated with workspace_id)
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Open Innovation',
  "oneLiner" TEXT,
  submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Judges Table (Updated with workspace_id, name, email, password, title)
CREATE TABLE IF NOT EXISTS judges (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT,
  email TEXT,
  password TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments Table (Updated with workspace_id & snake_case columns)
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  "judgeId" TEXT REFERENCES judges(id) ON DELETE CASCADE,
  "teamId" TEXT REFERENCES teams(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("judgeId", "teamId")
);

-- Event Details Table (Updated with workspace_id)
CREATE TABLE IF NOT EXISTS event_details (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  "eventName" TEXT NOT NULL,
  "roundLabel" TEXT NOT NULL,
  late_submissions BOOLEAN DEFAULT FALSE,
  public_leaderboard BOOLEAN DEFAULT TRUE,
  max_team_size INTEGER DEFAULT 4
);

-- Audit Log Table (Updated with workspace_id)
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT
);

-- Announcements Table (Updated with workspace_id)
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT[] NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table (Updated with workspace_id)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  icon TEXT,
  text TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread BOOLEAN DEFAULT TRUE
);

-- Criteria Table (Judging Rubric per Workspace)
CREATE TABLE IF NOT EXISTS criteria (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  max INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE criteria DISABLE ROW LEVEL SECURITY;

