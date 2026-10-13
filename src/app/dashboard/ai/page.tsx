"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MessageSquare, Bot, Trash2, ChevronLeft, Loader2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ChatMessage } from "@/components/ai/chat-message"
import { ChatInput } from "@/components/ai/chat-input"
import type { AIChat, AIMessage } from "@/types"

export default function AIPage() {
  const [chats, setChats] = useState<AIChat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useStore((s) => s.user)
  const workspace = useStore((s) => s.workspace)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!user || !supabase) return
    const fetchChats = async () => {
      let query = supabase.from("ai_chats").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
      if (workspace) {
        query = query.eq("workspace_id", workspace.id)
      }
      const { data } = await query
      if (data) {
        const chats = data as AIChat[]
        setChats(chats)
        if (chats.length > 0 && !activeChatId) {
          setActiveChatId(chats[0].id)
        }
      }
      setInitialLoading(false)
    }
    fetchChats()
  }, [user, workspace])

  useEffect(() => {
    if (!activeChatId) {
      setMessages([])
      return
    }
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true })
      if (data) setMessages(data as AIMessage[])
    }
    fetchMessages()
  }, [activeChatId])

  const createNewChat = async () => {
    if (!user) return
    const { data } = await supabase
      .from("ai_chats")
      .insert({
        user_id: user.id,
        workspace_id: workspace?.id || null,
        title: "New Chat",
      })
      .select()
      .single()
    if (data) {
      const chat = data as AIChat
      setChats((prev) => [chat, ...prev])
      setActiveChatId(chat.id)
      setMessages([])
    }
  }

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await supabase.from("ai_messages").delete().eq("chat_id", id)
    await supabase.from("ai_chats").delete().eq("id", id)
    setChats((prev) => prev.filter((c) => c.id !== id))
    if (activeChatId === id) {
      const next = chats.find((c) => c.id !== id)
      setActiveChatId(next?.id || null)
      setMessages([])
    }
  }

  const updateChatTitle = async (chatId: string, firstMessage: string) => {
    const title = firstMessage.length > 50 ? firstMessage.slice(0, 50) + "..." : firstMessage
    await supabase.from("ai_chats").update({ title, updated_at: new Date().toISOString() }).eq("id", chatId)
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title, updated_at: new Date().toISOString() } : c)))
  }

  const handleSend = async (content: string) => {
    if (!activeChatId && user) {
      const { data } = await supabase
        .from("ai_chats")
        .insert({
          user_id: user.id,
          workspace_id: workspace?.id || null,
          title: content.length > 50 ? content.slice(0, 50) + "..." : content,
        })
        .select()
        .single()
      if (!data) return
      const chat = data as AIChat
      setChats((prev) => [chat, ...prev])
      setActiveChatId(chat.id)
      setIsLoading(true)
      const userMsg: AIMessage = {
        id: crypto.randomUUID(),
        chat_id: chat.id,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      }
      setMessages([userMsg])
      await sendToAI(chat.id, [userMsg])
      return
    }

    if (!activeChatId) return

    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      chat_id: activeChatId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }

    const isFirstMessage = messages.length === 0
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    if (isFirstMessage) {
      await updateChatTitle(activeChatId, content)
    }

    await sendToAI(activeChatId, [...messages, userMsg])
  }

  const sendToAI = async (chatId: string, allMessages: AIMessage[]) => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          chat_id: chatId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("AI API error:", error)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      const aiMsg: AIMessage = {
        id: crypto.randomUUID(),
        chat_id: chatId,
        role: "assistant",
        content: data.content,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error("Send error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const activeChat = chats.find((c) => c.id === activeChatId)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-r border-border/50 flex flex-col overflow-hidden shrink-0"
          >
            <div className="p-3 border-b border-border/50">
              <button
                onClick={createNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white text-sm font-medium hover:from-purple-500 hover:to-purple-400 transition-all duration-200"
              >
                <Plus className="size-4" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {initialLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Sparkles className="size-8 text-purple-400/50 mb-3" />
                  <p className="text-xs text-muted-foreground">No conversations yet</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group",
                      activeChatId === chat.id
                        ? "bg-purple-500/10 border border-purple-500/20"
                        : "hover:bg-muted/50 border border-transparent"
                    )}
                  >
                    <MessageSquare
                      className={cn(
                        "size-4 mt-0.5 shrink-0",
                        activeChatId === chat.id ? "text-purple-400" : "text-muted-foreground"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{chat.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className={cn("size-4 transition-transform", !isSidebarOpen && "rotate-180")} />
          </button>
          {activeChat ? (
            <div className="flex items-center gap-2 min-w-0">
              <Bot className="size-4 text-purple-400 shrink-0" />
              <h2 className="text-sm font-medium text-foreground truncate">{activeChat.title}</h2>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              <h2 className="text-sm font-medium text-foreground">AI Chat</h2>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {!activeChatId && !initialLoading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                  <Sparkles className="size-8 text-purple-400" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Nexus AI</h1>
                <p className="text-sm text-muted-foreground max-w-md">
                  Your intelligent workspace assistant. Ask questions, get summaries, draft content, and more.
                </p>
                <button
                  onClick={createNewChat}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white text-sm font-medium hover:from-purple-500 hover:to-purple-400 transition-all duration-200"
                >
                  <Plus className="size-4" />
                  Start a New Chat
                </button>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}
            {isLoading && (
              <ChatMessage
                message={{
                  id: "streaming",
                  chat_id: activeChatId || "",
                  role: "assistant",
                  content: "",
                  created_at: new Date().toISOString(),
                }}
                isStreaming
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  )
}
