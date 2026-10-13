"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIMessage } from "@/types"

interface ChatMessageProps {
  message: AIMessage
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("flex gap-3 w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
          <Bot className="size-4 text-purple-400" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-tr-sm"
            : "glass-card rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || (isStreaming ? "" : "...")}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-flex gap-0.5 ml-0.5">
                <span className="size-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
              </span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
          <User className="size-4 text-purple-400" />
        </div>
      )}
    </motion.div>
  )
}
