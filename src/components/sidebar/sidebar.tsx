"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  Calendar,
  FileText,
  Pencil,
  Brain,
  Search,
  GitFork,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/actions"

const navItems = [
  { href: "/dashboard/workspace", label: "Workspace", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/whiteboard", label: "Whiteboard", icon: Pencil },
  { href: "/dashboard/ai", label: "AI Chat", icon: Brain },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/github", label: "GitHub", icon: GitFork },
]

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 64 }}
      className="fixed left-0 top-0 z-40 h-screen glass border-r border-border flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 h-16">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Nexus
            </motion.span>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="shrink-0"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3",
                  active && "glass text-foreground font-medium"
                )}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3",
                  active && "glass text-foreground font-medium"
                )}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          )
        })}
        <form action={signOut}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 px-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm truncate"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </form>
      </div>
    </motion.aside>
  )
}
