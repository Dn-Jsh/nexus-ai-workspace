"use client"

import { motion } from "framer-motion"
import { FileText, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import type { Note } from "@/types"

interface NoteListProps {
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function NoteList({ notes, selectedId, onSelect, searchQuery, onSearchChange }: NoteListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileText className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No notes match your search" : "No notes yet"}
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              {searchQuery ? "Try a different search term" : "Create your first note to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {notes.map((note, i) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => onSelect(note.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  selectedId === note.id
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <h3 className={cn(
                  "text-sm font-medium truncate",
                  selectedId === note.id && "text-foreground"
                )}>
                  {note.title || "Untitled"}
                </h3>
                {note.content && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                    {note.content.slice(0, 80)}{note.content.length > 80 ? "..." : ""}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/50 mt-1.5">
                  {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
