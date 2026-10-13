"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { NoteList } from "@/components/notes/note-list"
import { NoteEditor } from "@/components/notes/note-editor"
import type { Note } from "@/types"

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(true)
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()
  const noteLoadedRef = useRef(false)

  const filteredNotes = searchQuery
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  useEffect(() => {
    if (!workspace) return
    const fetchNotes = async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("updated_at", { ascending: false })
      if (data) setNotes(data as Note[])
      setLoading(false)
    }
    fetchNotes()
  }, [workspace])

  useEffect(() => {
    if (!selectedNote || !noteLoadedRef.current) {
      noteLoadedRef.current = true
      return
    }
    setIsSaved(false)
    const timer = setTimeout(async () => {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from("notes")
        .update({
          title: selectedNote.title,
          content: selectedNote.content,
          updated_at: now,
        })
        .eq("id", selectedNote.id)
      if (!error) {
        setIsSaved(true)
        setNotes((prev) =>
          prev.map((n) =>
            n.id === selectedNote.id
              ? { ...n, title: selectedNote.title, content: selectedNote.content, updated_at: now }
              : n
          )
        )
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [selectedNote?.title, selectedNote?.content])

  const handleSelect = useCallback((id: string) => {
    const note = notes.find((n) => n.id === id) || null
    setSelectedNote(note)
    noteLoadedRef.current = false
    setIsSaved(true)
  }, [notes])

  const handleChange = useCallback((updates: Partial<Note>) => {
    setSelectedNote((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  const handleNewNote = async () => {
    if (!workspace) return
    const { data } = await supabase
      .from("notes")
      .insert({
        workspace_id: workspace.id,
        title: "",
        content: "",
        tags: [],
        is_pinned: false,
      })
      .select()
      .single()
    if (data) {
      const note = data as Note
      setNotes((prev) => [note, ...prev])
      setSelectedNote(note)
      noteLoadedRef.current = false
      setIsSaved(true)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
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
        <div className="p-3 border-b">
          <Button onClick={handleNewNote} className="w-full gap-2">
            <Plus className="size-4" />
            New Note
          </Button>
        </div>
        <NoteList
          notes={filteredNotes}
          selectedId={selectedNote?.id || null}
          onSelect={handleSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
      <div className="flex-1">
        <NoteEditor
          note={selectedNote}
          onChange={handleChange}
          onDelete={handleDelete}
          saved={isSaved}
        />
      </div>
    </div>
  )
}
