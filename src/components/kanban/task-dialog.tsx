"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import type { Task } from "@/types"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSaved: () => void
}

const defaultForm = {
  title: "",
  description: "",
  priority: "medium" as Task["priority"],
  status: "backlog" as Task["status"],
  due_date: "",
}

export function TaskDialog({ open, onOpenChange, task, onSaved }: TaskDialogProps) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      })
    } else {
      setForm(defaultForm)
    }
  }, [task, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !workspace) return
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      column: form.status,
      due_date: form.due_date || null,
      workspace_id: workspace.id,
    }

    if (task) {
      const { error } = await supabase
        .from("tasks")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", task.id)
      if (!error) {
        onSaved()
        onOpenChange(false)
      }
    } else {
      const maxPos = await supabase
        .from("tasks")
        .select("position")
        .eq("workspace_id", workspace.id)
        .eq("column", form.status)
        .order("position", { ascending: false })
        .limit(1)

      const nextPos = (maxPos.data?.[0]?.position ?? -1) + 1

      const { error } = await supabase
        .from("tasks")
        .insert({
          ...payload,
          position: nextPos,
          project_id: null,
          assignee_id: null,
        })
      if (!error) {
        onSaved()
        onOpenChange(false)
      }
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details below." : "Create a new task for your workspace."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Enter task title"
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Task["priority"] }))}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Column</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Task["status"] }))}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Due Date</label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.title.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
