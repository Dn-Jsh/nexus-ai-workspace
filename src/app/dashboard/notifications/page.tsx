"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, CheckCheck, Loader2, Inbox } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
}

const typeConfig: Record<Notification["type"], { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10" },
  success: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
}

export default function NotificationsPage() {
  const supabase = createClient()
  const user = useStore((s) => s.user)
  const notifications = useStore((s) => s.notifications)
  const setNotifications = useStore((s) => s.setNotifications)
  const markNotificationRead = useStore((s) => s.markNotificationRead)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (data) setNotifications(data as Notification[])
      setLoading(false)
    }
    fetchNotifications()
  }, [user])

  const handleMarkRead = useCallback(async (id: string) => {
    markNotificationRead(id)
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)
    if (error) toast.error("Failed to mark notification as read")
  }, [markNotificationRead, supabase])

  const handleMarkAllRead = useCallback(async () => {
    if (!user) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds)
    if (error) {
      toast.error("Failed to mark all as read")
    } else {
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      toast.success("All notifications marked as read")
    }
  }, [user, notifications, supabase, setNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="size-4" />
          Mark all as read
        </Button>
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="p-4 rounded-full bg-muted mb-4">
            <Inbox className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No notifications yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            When you receive notifications from workspace activity, they will appear here.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type]
            const Icon = config.icon
            return (
              <motion.button
                key={notification.id}
                variants={itemVariants}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
                className={`glass-card rounded-xl p-4 w-full text-left transition-all hover:bg-white/5 ${
                  !notification.read ? "ring-1 ring-purple-500/20" : "opacity-70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.color} shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
