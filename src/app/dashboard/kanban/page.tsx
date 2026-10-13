"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus, Loader2 } from "lucide-react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { KanbanColumn } from "@/components/kanban/kanban-column"
import { KanbanCard } from "@/components/kanban/kanban-card"
import { TaskDialog } from "@/components/kanban/task-dialog"
import type { Task } from "@/types"

const columns = [
  { id: "backlog", title: "Backlog", color: "backlog" },
  { id: "todo", title: "Todo", color: "todo" },
  { id: "in_progress", title: "In Progress", color: "in_progress" },
  { id: "done", title: "Done", color: "done" },
]

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const fetchTasks = useCallback(async () => {
    if (!workspace) return
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("position", { ascending: true })
    if (data) setTasks(data as Task[])
    setLoading(false)
  }, [workspace])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const columnTasks = useMemo(() => {
    const map: Record<string, Task[]> = { backlog: [], todo: [], in_progress: [], done: [] }
    for (const task of tasks) {
      if (map[task.column]) {
        map[task.column].push(task)
      } else {
        map.backlog.push(task)
      }
    }
    return map
  }, [tasks])

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over || !workspace) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTaskData = tasks.find((t) => t.id === activeId)
    if (!activeTaskData) return

    const overTask = tasks.find((t) => t.id === overId)
    const targetColumn = overTask ? overTask.column : (overId as string)

    if (activeTaskData.column === targetColumn && overTask) {
      const colTasks = columnTasks[activeTaskData.column]
      const oldIndex = colTasks.findIndex((t) => t.id === activeId)
      const newIndex = colTasks.findIndex((t) => t.id === overId)
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(colTasks, oldIndex, newIndex)
        const updated = reordered.map((t, i) => ({ ...t, position: i }))
        setTasks((prev) =>
          prev.map((t) => updated.find((u) => u.id === t.id) || t)
        )
        for (const item of updated) {
          await supabase
            .from("tasks")
            .update({ position: item.position, updated_at: new Date().toISOString() })
            .eq("id", item.id)
        }
      }
    } else {
      const sourceCol = columnTasks[activeTaskData.column] || []
      const targetCol = targetColumn === overId ? (columnTasks[targetColumn] || []) : (columnTasks[targetColumn] || [])

      let targetIndex = targetCol.length
      if (overTask && overTask.column === targetColumn) {
        targetIndex = targetCol.findIndex((t) => t.id === overId)
        if (targetIndex === -1) targetIndex = targetCol.length
      }

      const filteredSource = sourceCol.filter((t) => t.id !== activeId)
      const reorderedTarget = [...targetCol]
      reorderedTarget.splice(targetIndex, 0, { ...activeTaskData, column: targetColumn, status: targetColumn as Task["status"] })

      const updatedSource = filteredSource.map((t, i) => ({ ...t, position: i }))
      const updatedTarget = reorderedTarget.map((t, i) => ({ ...t, position: i }))

      setTasks((prev) => {
        const remaining = prev.filter((t) => t.id !== activeId)
        return [...remaining, ...updatedTarget].sort((a, b) => {
          if (a.column !== b.column) return 0
          return a.position - b.position
        })
      })

      await supabase
        .from("tasks")
        .update({
          column: targetColumn,
          status: targetColumn as Task["status"],
          position: reorderedTarget.find((t) => t.id === activeId)?.position ?? targetIndex,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeId)

      for (const item of updatedSource) {
        await supabase
          .from("tasks")
          .update({ position: item.position, updated_at: new Date().toISOString() })
          .eq("id", item.id)
      }
    }
  }

  function handleAddTask() {
    setEditingTask(null)
    setDialogOpen(true)
  }

  function handleEditTask(task: Task) {
    setEditingTask(task)
    setDialogOpen(true)
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
          <h1 className="text-2xl font-bold text-foreground">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop tasks to manage your workflow
          </p>
        </div>
        <Button onClick={handleAddTask} className="gap-2">
          <Plus className="size-4" />
          Add Task
        </Button>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={columnTasks[col.id] || []}
              color={col.color}
            />
          ))}
        </motion.div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSaved={fetchTasks}
      />
    </div>
  )
}
