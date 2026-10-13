"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { EventDialog } from "@/components/calendar/event-dialog"
import type { CalendarEvent } from "@/types"



export default function CalendarPage() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarInstance, setCalendarInstance] = useState<Calendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    if (!workspace) return []
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("workspace_id", workspace.id)
    return (data as CalendarEvent[]) || []
  }, [workspace, supabase])

  useEffect(() => {
    if (!calendarRef.current || !workspace) {
      setLoading(false)
      return
    }

    const cal = new Calendar(calendarRef.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      buttonText: {
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
      },
      height: "auto",
      firstDay: 1,
      slotMinTime: "06:00:00",
      slotMaxTime: "22:00:00",
      events: async (fetchInfo, successCallback) => {
        const events = await fetchEvents()
        successCallback(
          events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start_date,
            end: e.end_date,
            allDay: e.all_day,
            extendedProps: { description: e.description },
          }))
        )
      },
      dateClick: (info) => {
        setSelectedDate(info.dateStr)
        setEditingEvent(null)
        setDialogOpen(true)
      },
      eventClick: (info) => {
        setEditingEvent({
          id: info.event.id,
          workspace_id: workspace.id,
          title: info.event.title,
          description: info.event.extendedProps.description || null,
          start_date: info.event.startStr,
          end_date: info.event.endStr,
          all_day: info.event.allDay,
          created_by: "",
          created_at: "",
        })
        setSelectedDate(info.event.startStr)
        setDialogOpen(true)
      },
    })

    cal.render()
    setCalendarInstance(cal)
    setLoading(false)

    return () => cal.destroy()
  }, [workspace, fetchEvents, supabase])

  function handleSaved() {
    calendarInstance?.refetchEvents()
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
      >
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your events and schedule
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-xl p-4"
      >
        <div ref={calendarRef} className="nexus-calendar" />
      </motion.div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        defaultDate={selectedDate}
        onSaved={handleSaved}
      />

      <style>{`
        .nexus-calendar {
          --fc-border-color: var(--border);
          --fc-button-bg-color: transparent;
          --fc-button-text-color: var(--foreground);
          --fc-button-border-color: var(--border);
          --fc-button-hover-bg-color: var(--muted);
          --fc-button-hover-border-color: var(--border);
          --fc-button-active-bg-color: var(--muted);
          --fc-button-active-border-color: var(--border);
          --fc-today-bg-color: color-mix(in oklch, var(--primary) 10%, transparent);
          --fc-event-bg-color: color-mix(in oklch, var(--primary) 80%, transparent);
          --fc-event-border-color: transparent;
          --fc-event-text-color: var(--primary-foreground);
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          --fc-neutral-text-color: var(--muted-foreground);
          --fc-list-event-hover-bg-color: var(--muted);
          --fc-now-indicator-color: var(--destructive);
          --fc-highlight-color: color-mix(in oklch, var(--accent) 50%, transparent);
          --fc-non-business-color: transparent;
        }
        .nexus-calendar a {
          color: var(--foreground);
        }
        .nexus-calendar .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--foreground);
        }
        .nexus-calendar .fc-button {
          border-radius: calc(var(--radius) - 2px);
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.25rem 0.625rem;
          height: 2rem;
          transition: background-color 0.15s, color 0.15s;
        }
        .nexus-calendar .fc-button:focus {
          box-shadow: none;
        }
        .nexus-calendar .fc-button-primary:not(:disabled).fc-button-active,
        .nexus-calendar .fc-button-primary:not(:disabled):active {
          background-color: var(--muted);
          border-color: var(--border);
          color: var(--foreground);
        }
        .nexus-calendar .fc-col-header-cell {
          padding: 0.5rem 0;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
        }
        .nexus-calendar .fc-col-header-cell-cushion {
          padding: 0;
        }
        .nexus-calendar .fc-daygrid-day-number {
          padding: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--foreground);
        }
        .nexus-calendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: var(--primary);
          color: var(--primary-foreground);
          border-radius: 9999px;
          width: 1.75rem;
          height: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .nexus-calendar .fc-daygrid-more-link {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
        .nexus-calendar .fc-event {
          border-radius: calc(var(--radius) - 4px);
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }
        .nexus-calendar .fc-timegrid-slot {
          height: 2.5rem;
        }
        .nexus-calendar .fc-timegrid-col.fc-day-today {
          background: color-mix(in oklch, var(--primary) 5%, transparent);
        }
        .nexus-calendar .fc-scrollgrid {
          border-color: var(--border);
          border-radius: calc(var(--radius) - 2px);
        }
        .nexus-calendar .fc-scrollgrid td:last-child {
          border-right: none;
        }
        .nexus-calendar .fc-scrollgrid-section > td {
          border: none;
        }
        .nexus-calendar .fc-day-other .fc-daygrid-day-top {
          opacity: 0.4;
        }
        .nexus-calendar .fc-popover {
          background: var(--popover);
          border-color: var(--border);
          border-radius: var(--radius);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .nexus-calendar .fc-popover-header {
          background: var(--popover);
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--foreground);
          border-bottom: 1px solid var(--border);
          border-radius: var(--radius) var(--radius) 0 0;
        }
        .nexus-calendar .fc-popover-body {
          padding: 0.25rem;
        }
        .nexus-calendar .fc-popover-close {
          color: var(--muted-foreground);
          font-size: 1rem;
        }
        .nexus-calendar .fc-timegrid-now-indicator-line {
          border-color: var(--destructive);
        }
        .nexus-calendar .fc-timegrid-now-indicator-arrow {
          border-color: var(--destructive);
          color: var(--destructive);
        }
      `}</style>
    </div>
  )
}
