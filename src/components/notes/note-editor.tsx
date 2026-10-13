"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bold, Italic, Heading, List, Eye, Edit3, Trash2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Note } from "@/types"

interface NoteEditorProps {
  note: Note | null
  onChange: (updates: Partial<Note>) => void
  onDelete: (id: string) => void
  saved: boolean
}

export function NoteEditor({ note, onChange, onDelete, saved }: NoteEditorProps) {
  const [preview, setPreview] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = useCallback((before: string, after: string = "") => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)

    onChange({ content: newText })

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    })
  }, [onChange])

  const toolbarButtons = [
    { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: Heading, label: "Heading", action: () => insertMarkdown("### ") },
    { icon: List, label: "Bullet List", action: () => insertMarkdown("- ") },
  ]

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Select a note or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            saved ? "bg-green-500" : "bg-amber-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {saved ? "Saved" : "Unsaved"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.label}
              variant="ghost"
              size="icon-sm"
              onClick={btn.action}
              title={btn.label}
            >
              <btn.icon className="size-4" />
            </Button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant={preview ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setPreview(false)}
            title="Edit"
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant={preview ? "ghost" : "secondary"}
            size="icon-sm"
            onClick={() => setPreview(true)}
            title="Preview"
          >
            <Eye className="size-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(note.id)}
            title="Delete"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-4 pb-2">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Note title..."
            className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="px-6 pb-4">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-sm dark:prose-invert max-w-none min-h-[200px]"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content || "*No content*"}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  ref={contentRef}
                  value={note.content}
                  onChange={(e) => onChange({ content: e.target.value })}
                  placeholder="Start writing in markdown..."
                  className="w-full min-h-[calc(100vh-16rem)] bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50 font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
