"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Tldraw, type Editor } from "tldraw"
import "tldraw/tldraw.css"
import { motion } from "framer-motion"
import { Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WhiteboardList } from "@/components/whiteboard/whiteboard-list"
import type { Whiteboard } from "@/types"

export default function WhiteboardPage() {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [ready, setReady] = useState(false)
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()
  const editorRef = useRef<Editor>(null)
  const snapshotLoadedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const selectedWhiteboard = whiteboards.find((wb) => wb.id === selectedId) || null

  useEffect(() => {
    if (!workspace) return
    const fetchWhiteboards = async () => {
      const { data } = await supabase
        .from("whiteboards")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("updated_at", { ascending: false })
      if (data) setWhiteboards(data as Whiteboard[])
      setLoading(false)
    }
    fetchWhiteboards()
  }, [workspace])

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor
    setReady(true)
  }, [])

  useEffect(() => {
    if (!selectedWhiteboard || !ready) return
    snapshotLoadedRef.current = false
  }, [selectedId])

  useEffect(() => {
    if (!selectedWhiteboard || !ready || snapshotLoadedRef.current) return
    if (selectedWhiteboard.snapshot) {
      editorRef.current?.loadSnapshot(selectedWhiteboard.snapshot as never)
    }
    snapshotLoadedRef.current = true
  }, [selectedWhiteboard, ready])

  const handleSave = useCallback(async () => {
    const editor = editorRef.current
    if (!editor || !selectedWhiteboard) return
    setSaving(true)
    const snapshot = editor.getSnapshot() as unknown as Record<string, unknown>
    const now = new Date().toISOString()
    const { error } = await supabase
      .from("whiteboards")
      .update({ snapshot, updated_at: now })
      .eq("id", selectedWhiteboard.id)
    if (!error) {
      setIsSaved(true)
      setWhiteboards((prev) =>
        prev.map((wb) =>
          wb.id === selectedWhiteboard.id
            ? { ...wb, snapshot, updated_at: now }
            : wb
        )
      )
    }
    setSaving(false)
  }, [selectedWhiteboard, supabase])

  useEffect(() => {
    if (!selectedWhiteboard || !ready || !snapshotLoadedRef.current) return
    const editor = editorRef.current
    if (!editor) return

    const unsubscribe = editor.store.listen(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setIsSaved(false)
      debounceRef.current = setTimeout(() => {
        handleSave()
      }, 2000)
    })

    return () => {
      unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [selectedWhiteboard, ready, handleSave])

  const handleSelect = useCallback(async (id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsSaved(true)
    setSelectedId(id)
    snapshotLoadedRef.current = false
  }, [])

  const handleNew = async () => {
    if (!workspace) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const { data } = await supabase
      .from("whiteboards")
      .insert({
        workspace_id: workspace.id,
        name: "Untitled",
        snapshot: null,
      })
      .select()
      .single()
    if (data) {
      const wb = data as Whiteboard
      setWhiteboards((prev) => [wb, ...prev])
      setSelectedId(wb.id)
      snapshotLoadedRef.current = false
      setIsSaved(true)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from("whiteboards").delete().eq("id", id)
    setWhiteboards((prev) => prev.filter((wb) => wb.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      snapshotLoadedRef.current = false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-72 lg:w-80 border-r flex flex-col">
        <WhiteboardList
          whiteboards={whiteboards}
          selectedId={selectedId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onNew={handleNew}
        />
      </div>
      <div className="flex-1 flex flex-col">
        {selectedWhiteboard ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium text-foreground">
                  {selectedWhiteboard.name || "Untitled"}
                </h2>
                <span className={cn(
                  "text-xs transition-colors",
                  isSaved ? "text-muted-foreground/50" : "text-muted-foreground"
                )}>
                  {isSaved ? "Saved" : "Unsaved"}
                </span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || isSaved}
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 relative"
            >
              <div className="absolute inset-2 rounded-xl overflow-hidden bg-background/40 backdrop-blur-xl border shadow-2xl">
                <Tldraw onMount={handleMount} />
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-md"
            >
              <div className="size-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10 backdrop-blur-sm">
                <svg
                  className="size-10 text-primary/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-foreground mb-2">
                No whiteboard selected
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select a whiteboard from the sidebar or create a new one to start brainstorming, diagramming, and sketching ideas.
              </p>
              <Button onClick={handleNew} className="gap-2">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Whiteboard
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
