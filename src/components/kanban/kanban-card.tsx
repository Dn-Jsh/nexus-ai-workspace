"use client"

import type { CSSProperties } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { Calendar, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

const priorityStyles: Record<string, { dot: string; label: string }> = {
  urgent: { dot: "bg-red-500", label: "Urgent" },
  high: { dot: "bg-orange-500", label: "High" },
  medium: { dot: "bg-blue-500", label: "Medium" },
  low: { dot: "bg-gray-400", label: "Low" },
}

export function KanbanCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } })

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? "relative" : undefined,
  }

  const priority = priorityStyles[task.priority] || priorityStyles.low

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border p-3 cursor-default transition-shadow",
        "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
        "border-white/20 dark:border-white/10",
        "shadow-sm hover:shadow-md",
        isDragging && "shadow-lg ring-2 ring-primary/30"
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted/50">
              <span className={cn("size-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>
            {task.due_date && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="size-3" />
                {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
