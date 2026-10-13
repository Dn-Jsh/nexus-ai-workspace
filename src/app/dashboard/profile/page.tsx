"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Calendar, Save, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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

export default function ProfilePage() {
  const supabase = createClient()
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)

  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.name || "")
    setAvatarUrl(user.avatar_url || "")
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("name, avatar_url, bio")
        .eq("id", user.id)
        .single()
      if (data) {
        setDisplayName(data.name || "")
        setAvatarUrl(data.avatar_url || "")
        setBio(data.bio || "")
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from("users")
      .upsert({ id: user.id, name: displayName, avatar_url: avatarUrl, bio })
    if (error) {
      toast.error("Failed to save profile")
    } else {
      setUser({ ...user, name: displayName, avatar_url: avatarUrl })
      toast.success("Profile updated")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl space-y-6">
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 flex flex-col items-center text-center">
          <div className="relative group">
            <Avatar className="size-24 ring-2 ring-purple-500/20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-2xl bg-purple-500/10 text-purple-400">
                {(displayName || user?.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="size-6 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-foreground mt-4">{displayName || "Unnamed"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <User size={18} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Edit Profile</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="pt-2">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Profile
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Mail size={18} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Account</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Verified</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium text-foreground">
                  {user?.created_at ? format(new Date(user.created_at), "MMMM yyyy") : "—"}
                </p>
              </div>
              <Calendar className="size-4 text-muted-foreground" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
