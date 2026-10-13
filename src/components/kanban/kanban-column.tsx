"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"
import { KanbanCard } from "@/components/kanban/kanban-card"

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  color: string
}

const statusColors: Record<string, string> = {
  backlog: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  todo: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
  in_progress: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  done: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
}

const headerColors: Record<string, string> = {
  backlog: "text-blue-400",
  todo: "text-violet-400",
  in_progress: "text-amber-400",
  done: "text-emerald-400",
}

export function KanbanColumn({ id, title, tasks, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const gradient = statusColors[color] || statusColors.backlog
  const headerColor = headerColors[color] || headerColors.backlog

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border bg-gradient-to-b p-4 backdrop-blur-xl min-h-[400px] transition-shadow",
        "bg-white/40 dark:bg-black/20",
        gradient,
        isOver && "shadow-lg ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-sm font-semibold tracking-wide uppercase", headerColor)}>
            {title}
          </h3>
          <span className={cn(
            "inline-flex items-center justify-center size-5 rounded-md text-[11px] font-bold",
            "bg-white/20 dark:bg-white/10 text-muted-foreground"
          )}>
            {tasks.length}
          </span>
        </div>
      </div>
      <SortableContext id={id} items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 rounded-xl border-2 border-dashed border-white/10 dark:border-white/5 py-8 px-4">
              <p className="text-xs text-muted-foreground/60">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => <KanbanCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
