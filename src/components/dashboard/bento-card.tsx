"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BentoCardProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  href?: string
  className?: string
}

export function BentoCard({ title, icon: Icon, children, href, className }: BentoCardProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass-card rounded-xl p-5 h-full flex flex-col cursor-pointer transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
