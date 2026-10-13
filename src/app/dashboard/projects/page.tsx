"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus, Search, FolderKanban, ChevronDown, ChevronUp, Loader2, Calendar, ListCheck } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import type { Project, Task } from "@/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
}

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const filters = ["All", "Active", "Completed", "Archived"] as const

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", description: "" })
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()

  useEffect(() => {
    if (!workspace) return
    const fetchData = async () => {
      const { data: projData } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
      if (projData) setProjects(projData as Project[])

      const { data: taskData } = await supabase
        .from("tasks")
        .select("id, project_id")
        .eq("workspace_id", workspace.id)
      if (taskData) {
        const counts: Record<string, number> = {}
        for (const t of taskData) {
          if (t.project_id) counts[t.project_id] = (counts[t.project_id] || 0) + 1
        }
        setTaskCounts(counts)
        setTasks(taskData as Task[])
      }

      setLoading(false)
    }
    fetchData()
  }, [workspace])

  const filteredProjects = useMemo(() => {
    let result = projects
    if (activeFilter !== "All") {
      result = result.filter((p) => p.status === activeFilter.toLowerCase())
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.title.toLowerCase().includes(q))
    }
    return result
  }, [projects, activeFilter, searchQuery])

  const expandedTasks = useMemo(() => {
    if (!expandedId) return []
    return tasks.filter((t) => t.project_id === expandedId)
  }, [expandedId, tasks])

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  async function handleCreateProject() {
    if (!form.title.trim() || !workspace) return
    setSaving(true)
    const { data } = await supabase
      .from("projects")
      .insert({
        workspace_id: workspace.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: "active",
      })
      .select()
      .single()
    if (data) {
      setProjects((prev) => [data as Project, ...prev])
      setForm({ title: "", description: "" })
      setDialogOpen(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your workspace projects</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="size-4" />
          New Project
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </motion.div>

      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 mb-4">
            <FolderKanban className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {searchQuery || activeFilter !== "All"
              ? "Try adjusting your search or filter."
              : "Get started by creating your first project."}
          </p>
          {!searchQuery && activeFilter === "All" && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="size-4" />
              Create Project
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={itemVariants} layout className="flex flex-col">
              <button
                onClick={() => toggleExpand(project.id)}
                className="glass-card rounded-xl p-5 text-left w-full transition-all hover:bg-white/[0.12] dark:hover:bg-black/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{project.title}</h3>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor[project.status] || statusColor.active}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ListCheck className="size-3" />
                    {taskCounts[project.id] || 0} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {format(new Date(project.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  {expandedId === project.id ? (
                    <><ChevronUp className="size-3" /> Hide tasks</>
                  ) : (
                    <><ChevronDown className="size-3" /> Show tasks</>
                  )}
                </div>
              </button>

              {expandedId === project.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card rounded-xl p-4 mt-2 space-y-2"
                >
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</h4>
                  {expandedTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No tasks in this project yet.</p>
                  ) : (
                    expandedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <span className="text-sm text-foreground truncate">{task.title}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          task.status === "done"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : task.status === "in_progress"
                            ? "bg-amber-500/10 text-amber-500"
                            : task.status === "todo"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-gray-500/10 text-gray-500"
                        }`}>
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a new project to organize your tasks and work.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreateProject() }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Project name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.title.trim()}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
