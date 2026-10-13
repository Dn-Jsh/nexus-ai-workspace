"use client"

import { useRef, useCallback, KeyboardEvent } from "react"
import { motion } from "framer-motion"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea || isLoading) return
    const value = textarea.value.trim()
    if (!value) return
    onSend(value)
    textarea.value = ""
    textarea.style.height = "auto"
  }, [onSend, isLoading])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }, [])

  return (
    <div className="border-t border-border/50 p-4">
      <div className="max-w-4xl mx-auto relative">
        <div className="glass-card rounded-2xl flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nexus AI anything..."
            rows={1}
            disabled={isLoading}
            className={cn(
              "flex-1 bg-transparent resize-none outline-none text-sm px-3 py-2",
              "placeholder:text-muted-foreground/50",
              "max-h-[150px]",
              "disabled:opacity-50"
            )}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              "size-9 rounded-xl flex items-center justify-center shrink-0",
              "bg-gradient-to-br from-purple-600 to-purple-500 text-white",
              "hover:from-purple-500 hover:to-purple-400",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </motion.button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">
          Powered by OpenRouter • Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
