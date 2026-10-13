-- Nexus AI Workspace Database Schema
-- Run this in Supabase SQL Editor to create all tables and RLS policies

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read workspace" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = workspaces.id)
  );

CREATE POLICY "Owner can update workspace" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete workspace" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read workspace members" ON workspace_members
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = workspace_members.workspace_id)
  );

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read projects" ON projects
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = projects.workspace_id)
  );

CREATE POLICY "Members can insert projects" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = projects.workspace_id)
  );

CREATE POLICY "Members can update projects" ON projects
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = projects.workspace_id)
  );

CREATE POLICY "Members can delete projects" ON projects
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = projects.workspace_id)
  );

-- Tasks (Kanban)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'done')),
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  column_name TEXT NOT NULL DEFAULT 'todo',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read tasks" ON tasks
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = tasks.workspace_id)
  );

CREATE POLICY "Members can insert tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = tasks.workspace_id)
  );

CREATE POLICY "Members can update tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = tasks.workspace_id)
  );

CREATE POLICY "Members can delete tasks" ON tasks
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = tasks.workspace_id)
  );

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read notes" ON notes
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = notes.workspace_id)
  );

CREATE POLICY "Members can insert notes" ON notes
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = notes.workspace_id)
  );

CREATE POLICY "Members can update notes" ON notes
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = notes.workspace_id)
  );

CREATE POLICY "Members can delete notes" ON notes
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = notes.workspace_id)
  );

-- Files (Storage tracking)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read files" ON files
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = files.workspace_id)
  );

CREATE POLICY "Members can insert files" ON files
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = files.workspace_id)
  );

-- AI Chats
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chats" ON ai_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON ai_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON ai_chats
  FOR DELETE USING (auth.uid() = user_id);

-- AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages" ON ai_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM ai_chats WHERE id = ai_messages.chat_id)
  );

CREATE POLICY "Users can insert messages" ON ai_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM ai_chats WHERE id = ai_messages.chat_id)
  );

-- Documents (for RAG / PDF chat)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read documents" ON documents
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id IN (
      SELECT workspace_id FROM files WHERE id = documents.file_id
    ))
  );

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read events" ON calendar_events
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = calendar_events.workspace_id)
  );

CREATE POLICY "Members can insert events" ON calendar_events
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = calendar_events.workspace_id)
  );

CREATE POLICY "Members can update events" ON calendar_events
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = calendar_events.workspace_id)
  );

CREATE POLICY "Members can delete events" ON calendar_events
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = calendar_events.workspace_id)
  );

-- Whiteboards
CREATE TABLE IF NOT EXISTS whiteboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled',
  snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read whiteboards" ON whiteboards
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = whiteboards.workspace_id)
  );

CREATE POLICY "Members can insert whiteboards" ON whiteboards
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = whiteboards.workspace_id)
  );

CREATE POLICY "Members can update whiteboards" ON whiteboards
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = whiteboards.workspace_id)
  );

CREATE POLICY "Members can delete whiteboards" ON whiteboards
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = whiteboards.workspace_id)
  );

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- GitHub Connections
CREATE TABLE IF NOT EXISTS github_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE github_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own github connection" ON github_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own github connection" ON github_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own github connection" ON github_connections
  FOR UPDATE USING (auth.uid() = user_id);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_name TEXT,
  workspace_description TEXT,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  openrouter_api_key TEXT,
  default_model TEXT DEFAULT 'gpt-3.5-turbo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_notes_fts ON notes USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_projects_fts ON projects USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_tasks_fts ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_whiteboards_updated_at
  BEFORE UPDATE ON whiteboards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default workspace
  INSERT INTO workspaces (id, owner_id, name, description)
  VALUES (
    uuid_generate_v4(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My') || '''s Workspace',
    'Your default workspace'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
