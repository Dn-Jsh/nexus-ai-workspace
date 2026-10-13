"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  Calendar,
  FileText,
  Pencil,
  Brain,
  Search,
  GitPullRequest,
  Settings,
  User,
} from "lucide-react"

interface CommandPaletteContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
})

export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}

const navigationItems = [
  { href: "/dashboard/workspace", label: "Workspace", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/whiteboard", label: "Whiteboard", icon: Pencil },
  { href: "/dashboard/ai", label: "AI Chat", icon: Brain },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/github", label: "GitHub", icon: GitPullRequest },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

const actionItems = [
  { id: "new-note", label: "New Note", icon: FileText, href: "/dashboard/notes" },
  { id: "new-project", label: "New Project", icon: FolderKanban, href: "/dashboard/projects" },
  { id: "new-task", label: "New Task", icon: KanbanSquare, href: "/dashboard/kanban" },
  { id: "ai-chat", label: "Open AI Chat", icon: Brain, href: "/dashboard/ai" },
]

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [open])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Command className="rounded-xl border border-border shadow-2xl">
                <CommandInput
                  placeholder="Search or jump to..."
                  autoFocus
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <CommandItem
                          key={item.href}
                          value={item.label}
                          onSelect={() => handleSelect(item.href)}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Actions">
                    {actionItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <CommandItem
                          key={item.id}
                          value={item.label}
                          onSelect={() => handleSelect(item.href)}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CommandPaletteContext.Provider>
  )
}

export function CommandPaletteTrigger({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  const { toggle } = useCommandPalette()
  return (
    <button onClick={toggle} className={className}>
      {children}
    </button>
  )
}
