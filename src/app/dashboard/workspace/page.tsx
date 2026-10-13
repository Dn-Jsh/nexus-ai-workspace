"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Brain, Calendar, KanbanSquare, FileText, FolderKanban, Activity } from "lucide-react"
import { format } from "date-fns"
import { BentoCard } from "@/components/dashboard/bento-card"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
}

export default function WorkspacePage() {
  const [greeting, setGreeting] = useState("")
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
    setDateStr(format(new Date(), "EEEE, MMMM d"))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <BentoCard title="AI Chat" icon={Brain} href="/dashboard/ai">
            <p className="text-xs text-muted-foreground line-clamp-2">
              Ask Nexus anything about your projects, notes, or tasks. Your AI workspace assistant is ready to help.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Online & ready
            </div>
          </BentoCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BentoCard title="Calendar" icon={Calendar} href="/dashboard/calendar">
            <p className="text-xs text-muted-foreground">No events scheduled today</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Your calendar is clear</p>
          </BentoCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BentoCard title="Kanban" icon={KanbanSquare} href="/dashboard/kanban">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Backlog</span>
                <span className="font-medium text-foreground">0</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium text-foreground">0</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Done</span>
                <span className="font-medium text-green-400">0</span>
              </div>
            </div>
          </BentoCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BentoCard title="Notes" icon={FileText} href="/dashboard/notes">
            <p className="text-xs text-muted-foreground">No recent notes</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Create your first note</p>
          </BentoCard>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-2">
          <BentoCard title="Projects" icon={FolderKanban} href="/dashboard/projects">
            <p className="text-xs text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Start a new project to organize your work</p>
          </BentoCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BentoCard title="Activity" icon={Activity} href="/dashboard/search">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Welcome to Nexus!</p>
              <p className="text-xs text-muted-foreground/50">Your recent activity will appear here</p>
            </div>
          </BentoCard>
        </motion.div>
      </motion.div>
    </div>
  )
}
