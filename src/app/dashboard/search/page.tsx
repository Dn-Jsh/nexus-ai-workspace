"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Search, FileText, FolderKanban, ListCheck, File, Loader2, X, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: "note" | "project" | "task" | "file"
  title: string
  preview: string
  href: string
}

const recentSearches = [
  "Getting started guide",
  "Project roadmap",
  "Design system",
]

const suggestions = [
  "Try searching for notes, projects, or tasks",
  "Use quotes for exact phrase matching",
  "Search across your entire workspace",
]

const typeConfig = {
  note: { icon: FileText, label: "Notes", color: "text-blue-400 bg-blue-500/10" },
  project: { icon: FolderKanban, label: "Projects", color: "text-emerald-400 bg-emerald-500/10" },
  task: { icon: ListCheck, label: "Tasks", color: "text-amber-400 bg-amber-500/10" },
  file: { icon: File, label: "Files", color: "text-purple-400 bg-purple-500/10" },
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-purple-500/20 text-purple-300 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export default function SearchPage() {
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!debouncedQuery.trim() || !workspace) {
      setResults([])
      setSearched(false)
      return
    }
    const performSearch = async () => {
      setLoading(true)
      setSearched(true)
      const q = `%${debouncedQuery}%`

      const [notesRes, projectsRes, tasksRes, filesRes] = await Promise.all([
        supabase
          .from("notes")
          .select("id, title, content, updated_at")
          .eq("workspace_id", workspace.id)
          .or(`title.ilike.${q},content.ilike.${q}`)
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select("id, title, description, updated_at")
          .eq("workspace_id", workspace.id)
          .or(`title.ilike.${q},description.ilike.${q}`)
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("tasks")
          .select("id, title, description, updated_at")
          .eq("workspace_id", workspace.id)
          .or(`title.ilike.${q},description.ilike.${q}`)
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("files")
          .select("id, name, type, created_at")
          .eq("workspace_id", workspace.id)
          .or(`name.ilike.${q},type.ilike.${q}`)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      const combined: SearchResult[] = []

      if (notesRes.data) {
        for (const note of notesRes.data) {
          const preview = (note.content || "").slice(0, 120)
          combined.push({
            id: note.id,
            type: "note",
            title: note.title || "Untitled",
            preview,
            href: "/dashboard/notes",
          })
        }
      }

      if (projectsRes.data) {
        for (const project of projectsRes.data) {
          combined.push({
            id: project.id,
            type: "project",
            title: project.title,
            preview: project.description || "",
            href: "/dashboard/projects",
          })
        }
      }

      if (tasksRes.data) {
        for (const task of tasksRes.data) {
          combined.push({
            id: task.id,
            type: "task",
            title: task.title,
            preview: task.description || "",
            href: "/dashboard/kanban",
          })
        }
      }

      if (filesRes.data) {
        for (const file of filesRes.data) {
          combined.push({
            id: file.id,
            type: "file",
            title: file.name,
            preview: file.type,
            href: "#",
          })
        }
      }

      setResults(combined)
      setLoading(false)
    }

    performSearch()
  }, [debouncedQuery, workspace])

  const groupedResults = results.reduce<Record<string, SearchResult[]>>(
    (acc, r) => {
      const key = typeConfig[r.type].label
      if (!acc[key]) acc[key] = []
      acc[key].push(r)
      return acc
    },
    {}
  )

  const handleClear = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    setResults([])
    setSearched(false)
    inputRef.current?.focus()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2 mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find anything across your workspace
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative"
      >
        <div className="glass-card rounded-2xl p-1">
          <div className="relative flex items-center">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across your workspace..."
              className="w-full bg-transparent text-lg py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        {query && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            {loading
              ? "Searching..."
              : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
          </p>
        )}
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 space-y-6"
        >
          {[1, 2, 3].map((group) => (
            <div key={group} className="space-y-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="glass-card rounded-xl p-4 space-y-2"
                >
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {!loading && searched && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-12 glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 mb-4">
            <Search className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground mb-2 max-w-xs">
            No matches for &ldquo;{debouncedQuery}&rdquo;. Try a different search term.
          </p>
          <Button variant="outline" onClick={handleClear} className="gap-2 mt-2">
            <X className="size-4" />
            Clear search
          </Button>
        </motion.div>
      )}

      {!loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 space-y-8"
        >
          {Object.entries(groupedResults).map(([groupLabel, items]) => {
            const typeKey = Object.entries(typeConfig).find(
              ([, v]) => v.label === groupLabel
            )?.[0] as keyof typeof typeConfig
            const config = typeConfig[typeKey]
            const Icon = config.icon

            return (
              <div key={groupLabel}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-1.5 rounded-lg", config.color)}>
                    <Icon className="size-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {groupLabel}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    ({items.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <Link key={`${item.type}-${item.id}`} href={item.href}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-4 flex items-start gap-4 group hover:bg-white/[0.12] dark:hover:bg-black/40 transition-all cursor-pointer"
                      >
                        <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", config.color)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-purple-400 transition-colors">
                            {highlightMatch(item.title, debouncedQuery)}
                          </h3>
                          {item.preview && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {highlightMatch(item.preview, debouncedQuery)}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground/50 group-hover:text-purple-400 transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </motion.div>
      )}

      {!query && !searched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Recent Searches
              </h2>
            </div>
            <div className="space-y-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="w-full text-left text-sm text-muted-foreground hover:text-foreground py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Tips
              </h2>
            </div>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <p key={s} className="text-sm text-muted-foreground py-1">
                  {s}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
