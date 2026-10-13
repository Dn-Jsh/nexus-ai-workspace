"use client"

import { motion } from "framer-motion"
import { Plus, Trash2, Layout, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Whiteboard } from "@/types"

interface WhiteboardListProps {
  whiteboards: Whiteboard[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
  loading?: boolean
}

export function WhiteboardList({
  whiteboards,
  selectedId,
  onSelect,
  onDelete,
  onNew,
  loading,
}: WhiteboardListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <Button onClick={onNew} className="w-full gap-2">
          <Plus className="size-4" />
          New Whiteboard
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : whiteboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Layout className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No whiteboards yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Create your first whiteboard to get started
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {whiteboards.map((wb, i) => (
              <motion.div
                key={wb.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="group relative"
              >
                <button
                  onClick={() => onSelect(wb.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    selectedId === wb.id
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <h3 className={cn(
                    "text-sm font-medium truncate",
                    selectedId === wb.id && "text-foreground"
                  )}>
                    {wb.name || "Untitled"}
                  </h3>
                  <p className="text-xs text-muted-foreground/50 mt-1.5">
                    {formatDistanceToNow(new Date(wb.updated_at), { addSuffix: true })}
                  </p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(wb.id)
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
