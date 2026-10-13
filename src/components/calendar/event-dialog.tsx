"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import type { CalendarEvent } from "@/types"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CalendarEvent | null
  defaultDate: string
  onSaved: () => void
}

const defaultForm = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  all_day: false,
}

export function EventDialog({ open, onOpenChange, event, defaultDate, onSaved }: EventDialogProps) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const workspace = useStore((s) => s.workspace)
  const user = useStore((s) => s.user)
  const supabase = createClient()

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description || "",
        start_date: event.all_day ? event.start_date.slice(0, 10) : event.start_date.slice(0, 16),
        end_date: event.all_day ? event.end_date.slice(0, 10) : event.end_date.slice(0, 16),
        all_day: event.all_day,
      })
    } else {
      const date = defaultDate || new Date().toISOString().slice(0, 10)
      setForm({
        title: "",
        description: "",
        start_date: `${date}T09:00`,
        end_date: `${date}T10:00`,
        all_day: false,
      })
    }
  }, [event, defaultDate, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !workspace) return
    setSaving(true)

    const startDate = form.all_day ? form.start_date.slice(0, 10) : form.start_date
    const endDate = form.all_day ? form.end_date.slice(0, 10) : form.end_date

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_date: startDate,
      end_date: endDate,
      all_day: form.all_day,
      workspace_id: workspace.id,
    }

    if (event) {
      const { error } = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", event.id)
      if (!error) {
        onSaved()
        onOpenChange(false)
      }
    } else {
      const { error } = await supabase
        .from("calendar_events")
        .insert({ ...payload, created_by: user?.id })
      if (!error) {
        onSaved()
        onOpenChange(false)
      }
    }

    setSaving(false)
  }

  async function handleDelete() {
    if (!event) return
    setDeleting(true)
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", event.id)
    if (!error) {
      onSaved()
      onOpenChange(false)
    }
    setDeleting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Update the event details below." : "Create a new event for your workspace."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Enter event title"
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.all_day}
              onChange={(e) => {
                setForm((f) => ({ ...f, all_day: e.target.checked }))
              }}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-xs font-medium text-muted-foreground">All day</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start</label>
              <Input
                type={form.all_day ? "date" : "datetime-local"}
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">End</label>
              <Input
                type={form.all_day ? "date" : "datetime-local"}
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {event && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.title.trim()}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {event ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
