"use client"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Moon, Sun, Bell, Command } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette"
import type { User } from "@/types"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const { sidebarOpen } = useStore()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((res: { data: { user: { id: string; email?: string | null; user_metadata?: { full_name?: string; avatar_url?: string } | null; created_at: string } | null } | null }) => {
      if (!res.data?.user) return
      const u = res.data.user
      setUser({
        id: u.id,
        email: u.email ?? "",
        name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? null,
        avatar_url: u.user_metadata?.avatar_url ?? null,
        created_at: u.created_at,
      })
    })
  }, [])

  if (!mounted) return null

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 glass border-b border-border flex items-center justify-between px-6"
      style={{ left: sidebarOpen ? 240 : 64 }}
    >
      <div className="flex items-center gap-4">
        <CommandPaletteTrigger className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground glass rounded-md hover:text-foreground transition-colors cursor-pointer">
          <Command size={12} />K
          <span className="text-muted-foreground/50 ml-1">Search</span>
        </CommandPaletteTrigger>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
          </Button>
        </Link>

        <Link href="/dashboard/profile">
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all">
            <AvatarImage src={user?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
