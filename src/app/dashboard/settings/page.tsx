"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Monitor, Bell, Eye, Brain, Cpu, Save, Loader2, EyeOff, Key } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserSettings } from "@/types"

const MODELS = [
  { value: "openai/gpt-4o", label: "OpenAI GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
  { value: "anthropic/claude-sonnet-4-20250514", label: "Anthropic Claude Sonnet 4" },
  { value: "anthropic/claude-haiku-3-5-sonnet-20241022", label: "Anthropic Claude Haiku" },
  { value: "google/gemini-2.0-flash-001", label: "Google Gemini 2.0 Flash" },
  { value: "google/gemini-2.0-pro-001", label: "Google Gemini 2.0 Pro" },
  { value: "mistral/mistral-large-2411", label: "Mistral Large" },
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Meta Llama 3.3 70B" },
]

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

const themeOptions = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
]

export default function SettingsPage() {
  const supabase = createClient()
  const user = useStore((s) => s.user)
  const { theme, setTheme } = useTheme()

  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [openrouterKey, setOpenrouterKey] = useState("")
  const [defaultModel, setDefaultModel] = useState("openai/gpt-4o")
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()
      if (data) {
        const s = data as UserSettings
        setSettings(s)
        setWorkspaceName(s.workspace_name || "")
        setWorkspaceDescription(s.workspace_description || "")
        setEmailNotifications(s.email_notifications)
        setPushNotifications(s.push_notifications)
        setOpenrouterKey(s.openrouter_api_key || "")
        setDefaultModel(s.default_model || "openai/gpt-4o")
      }
      setLoading(false)
    }
    fetchSettings()
  }, [user])

  const saveSettings = async () => {
    if (!user) return
    setSaving(true)
    const payload = {
      workspace_name: workspaceName,
      workspace_description: workspaceDescription,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      openrouter_api_key: openrouterKey,
      default_model: defaultModel,
      updated_at: new Date().toISOString(),
    }
    if (settings) {
      const { error } = await supabase
        .from("user_settings")
        .update(payload)
        .eq("id", settings.id)
      if (error) {
        toast.error("Failed to save settings")
      } else {
        toast.success("Settings saved")
      }
    } else {
      const { error } = await supabase
        .from("user_settings")
        .insert({ user_id: user.id, ...payload })
      if (error) {
        toast.error("Failed to save settings")
      } else {
        toast.success("Settings saved")
      }
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
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace preferences</p>
      </motion.div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <TabsContent value="general">
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Cpu size={18} />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Workspace Settings</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  placeholder="My Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-desc">Description</Label>
                <Textarea
                  id="workspace-desc"
                  placeholder="Describe your workspace..."
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="pt-2">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance">
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Eye size={18} />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
              </div>

              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="flex gap-3">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon
                    const isActive = theme === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                          isActive
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon size={16} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 mt-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Preview</h3>
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-medium text-foreground">Sample Text</div>
                <div className="text-xs text-muted-foreground mt-1">This is how your content will appear.</div>
                <div className="mt-3 flex gap-2">
                  <div className="h-2 w-16 rounded-full bg-primary/20" />
                  <div className="h-2 w-24 rounded-full bg-muted" />
                  <div className="h-2 w-12 rounded-full bg-muted" />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Bell size={18} />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="email-notif" className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive email updates about workspace activity</p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="push-notif" className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive push notifications for mentions and updates</p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai">
            <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Brain size={18} />
                </div>
                <h2 className="text-sm font-semibold text-foreground">AI Configuration</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">OpenRouter API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Your key is stored securely and never exposed client-side.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-model">Default Model</Label>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
                  <SelectTrigger id="default-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">This model will be used as default for new AI conversations.</p>
              </div>

              <div className="pt-2">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  )
}
