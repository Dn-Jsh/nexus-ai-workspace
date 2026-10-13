import { create } from "zustand"
import type { User, Workspace, WorkspaceMember, Notification } from "@/types"

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace | null) => void
  members: WorkspaceMember[]
  setMembers: (members: WorkspaceMember[]) => void
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  workspace: null,
  setWorkspace: (workspace) => set({ workspace }),
  members: [],
  setMembers: (members) => set({ members }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  theme: "dark",
  setTheme: (theme) => set({ theme }),
}))
