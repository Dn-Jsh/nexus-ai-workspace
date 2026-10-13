export type Role = "owner" | "admin" | "member" | "viewer"

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  description: string | null
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: Role
  joined_at: string
  user?: User
}

export interface Project {
  id: string
  workspace_id: string
  title: string
  description: string | null
  status: "active" | "completed" | "archived"
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string | null
  workspace_id: string
  title: string
  description: string | null
  priority: "low" | "medium" | "high" | "urgent"
  status: "backlog" | "todo" | "in_progress" | "done"
  due_date: string | null
  assignee_id: string | null
  column: string
  position: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  workspace_id: string
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface File {
  id: string
  workspace_id: string
  name: string
  url: string
  size: number
  type: string
  uploaded_by: string
  created_at: string
}

export interface AIChat {
  id: string
  user_id: string
  workspace_id: string | null
  title: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  chat_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface Document {
  id: string
  file_id: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface CalendarEvent {
  id: string
  workspace_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  all_day: boolean
  created_by: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
}

export interface Whiteboard {
  id: string
  workspace_id: string
  name: string
  snapshot: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface GitHubConnection {
  id: string
  user_id: string
  access_token: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  workspace_name: string | null
  workspace_description: string | null
  email_notifications: boolean
  push_notifications: boolean
  openrouter_api_key: string | null
  default_model: string | null
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stars: number
  forks: number
  owner: {
    login: string
    avatar_url: string
  }
}
