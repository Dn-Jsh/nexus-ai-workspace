"use client"

import { useEffect, useState, useMemo, useCallback, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import {
  GitFork,
  Star,
  AlertCircle,
  GitPullRequest,
  ExternalLink,
  Search,
  Loader2,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { GitHubConnection, GitHubRepo } from "@/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
}

const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || ""}&redirect_uri=${typeof window !== "undefined" ? window.location.origin : ""}/api/github/callback&scope=repo,user`

interface Issue {
  id: number
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  user: { login: string; avatar_url: string }
  labels: { name: string; color: string }[]
  comments: number
  created_at: string
  updated_at: string
}

interface PullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  user: { login: string; avatar_url: string }
  draft: boolean
  created_at: string
  updated_at: string
  head: { ref: string; sha: string }
  base: { ref: string }
}

function GitHubPageInner() {
  const searchParams = useSearchParams()
  const [connection, setConnection] = useState<GitHubConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectLoading, setConnectLoading] = useState(false)

  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)

  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [issues, setIssues] = useState<Issue[]>([])
  const [pulls, setPulls] = useState<PullRequest[]>([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [pullsLoading, setPullsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [languageFilter, setLanguageFilter] = useState<string>("All")
  const [tab, setTab] = useState("repos")

  const supabase = createClient()

  useEffect(() => {
    const fetchConnection = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("github_connections")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (data) {
        setConnection(data as GitHubConnection)
      }
      setLoading(false)
    }
    fetchConnection()
  }, [searchParams.get("connected")])

  const fetchReposData = useCallback(async () => {
    setReposLoading(true)
    setRepoError(null)
    try {
      const res = await fetch("/api/github?action=repos")
      const json = await res.json()
      if (!res.ok) {
        setRepoError(json.error)
      } else {
        setRepos(json.data)
        if (json.data.length > 0) {
          const full = json.data[0].full_name
          setSelectedRepo(full)
        }
      }
    } catch {
      setRepoError("Failed to fetch repositories")
    }
    setReposLoading(false)
  }, [])

  useEffect(() => {
    if (connection) {
      fetchReposData()
    }
  }, [connection, fetchReposData])

  const owner = useMemo(() => selectedRepo.split("/")[0] || "", [selectedRepo])
  const repoName = useMemo(() => selectedRepo.split("/")[1] || "", [selectedRepo])

  useEffect(() => {
    if (!connection || !owner || !repoName || tab !== "issues") return
    const fetchData = async () => {
      setIssuesLoading(true)
      try {
        const res = await fetch(`/api/github?action=issues&owner=${owner}&repo=${repoName}`)
        const json = await res.json()
        if (res.ok) setIssues(json.data)
      } catch {
        setIssues([])
      }
      setIssuesLoading(false)
    }
    fetchData()
  }, [connection, owner, repoName, tab])

  useEffect(() => {
    if (!connection || !owner || !repoName || tab !== "pulls") return
    const fetchData = async () => {
      setPullsLoading(true)
      try {
        const res = await fetch(`/api/github?action=pulls&owner=${owner}&repo=${repoName}`)
        const json = await res.json()
        if (res.ok) setPulls(json.data)
      } catch {
        setPulls([])
      }
      setPullsLoading(false)
    }
    fetchData()
  }, [connection, owner, repoName, tab])

  const languages = useMemo(() => {
    const langs = new Set<string>()
    for (const r of repos) {
      if (r.language) langs.add(r.language)
    }
    return ["All", ...Array.from(langs).sort()]
  }, [repos])

  const filteredRepos = useMemo(() => {
    let result = repos
    if (languageFilter !== "All") {
      result = result.filter((r) => r.language === languageFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
      )
    }
    return result.sort((a, b) => b.stars - a.stars)
  }, [repos, languageFilter, searchQuery])

  const repoOptions = useMemo(() => {
    return repos.map((r) => ({ value: r.full_name, label: r.name }))
  }, [repos])

  function handleConnect() {
    setConnectLoading(true)
    window.location.href = GITHUB_AUTH_URL
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!connection) {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">GitHub</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect your GitHub account to manage repositories, issues, and pull requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto mt-12"
        >
          <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 mb-6">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-12">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect GitHub</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Link your GitHub account to browse repositories, track issues, and manage pull requests directly from Nexus.
          </p>
          <Button onClick={handleConnect} disabled={connectLoading} size="lg" className="gap-3 text-base h-10 px-6">
            {connectLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            Connect with GitHub
          </Button>
        </motion.div>
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
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-purple-500/20">
            <AvatarImage src={connection.avatar_url || undefined} />
            <AvatarFallback>
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">GitHub</h1>
            <p className="text-sm text-muted-foreground">{connection.username}</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="repos" className="gap-2">
            <BookOpen className="size-4" />
            Repositories
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertCircle className="size-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="pulls" className="gap-2">
            <GitPullRequest className="size-4" />
            Pull Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repos" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4"
          >
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {languages.slice(0, 6).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    languageFilter === lang
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang}
                </button>
              ))}
              {languages.length > 6 && (
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="h-7 border-0 bg-transparent px-2 text-sm text-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.slice(6).map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </motion.div>

          {reposLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : repoError ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-destructive text-sm">{repoError}</p>
              <Button onClick={fetchReposData} variant="outline" className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 mb-4">
                <BookOpen className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No repositories found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery || languageFilter !== "All"
                  ? "Try adjusting your search or filter."
                  : "No GitHub repositories available."}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filteredRepos.map((repo) => (
                <motion.a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="glass-card rounded-xl p-5 block transition-all hover:bg-white/[0.12] dark:hover:bg-black/40"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={repo.owner.avatar_url} />
                      <AvatarFallback>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">{repo.name}</h3>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{repo.description}</p>
                      )}
                    </div>
                    <ExternalLink className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-purple-400" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="size-3" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="size-3" />
                      {repo.forks}
                    </span>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-0">
          <div className="mb-4">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedRepo ? (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 mb-4">
                <AlertCircle className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a repository</h3>
              <p className="text-sm text-muted-foreground">Choose a repository to view its open issues.</p>
            </div>
          ) : issuesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : issues.length === 0 ? (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No open issues</h3>
              <p className="text-sm text-muted-foreground">This repository has no open issues. Great job!</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {issues.map((issue) => (
                <motion.a
                  key={issue.id}
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="glass-card rounded-xl p-4 flex items-start gap-3 transition-all hover:bg-white/[0.12] dark:hover:bg-black/40"
                >
                  <AlertCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-medium text-foreground truncate">{issue.title}</h3>
                      <ExternalLink className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>#{issue.number}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3" />
                        {issue.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                      </span>
                      <Avatar className="size-4">
                        <AvatarImage src={issue.user.avatar_url} />
                        <AvatarFallback className="text-[8px]">{issue.user.login.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{issue.user.login}</span>
                    </div>
                    {issue.labels.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {issue.labels.map((label) => (
                          <span
                            key={label.name}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `#${label.color}20`,
                              color: `#${label.color}`,
                              border: `1px solid #${label.color}40`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="pulls" className="mt-0">
          <div className="mb-4">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedRepo ? (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 mb-4">
                <GitPullRequest className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a repository</h3>
              <p className="text-sm text-muted-foreground">Choose a repository to view its open pull requests.</p>
            </div>
          ) : pullsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : pulls.length === 0 ? (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No open pull requests</h3>
              <p className="text-sm text-muted-foreground">This repository has no open pull requests.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {pulls.map((pr) => (
                <motion.a
                  key={pr.id}
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="glass-card rounded-xl p-4 flex items-start gap-3 transition-all hover:bg-white/[0.12] dark:hover:bg-black/40"
                >
                  {pr.draft ? (
                    <GitPullRequest className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  ) : (
                    <GitPullRequest className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">{pr.title}</h3>
                        {pr.draft && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                            Draft
                          </span>
                        )}
                      </div>
                      <ExternalLink className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>#{pr.number}</span>
                      <span className="flex items-center gap-1">
                        {pr.draft ? (
                          <XCircle className="size-3 text-muted-foreground" />
                        ) : (
                          <GitPullRequest className="size-3 text-emerald-500" />
                        )}
                        {pr.draft ? "Draft" : "Open"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                      </span>
                      <Avatar className="size-4">
                        <AvatarImage src={pr.user.avatar_url} />
                        <AvatarFallback className="text-[8px]">{pr.user.login.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{pr.user.login}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <span className="text-muted-foreground/70">{pr.head.ref}</span>
                      <span className="text-muted-foreground/40">&rarr;</span>
                      <span className="text-muted-foreground/70">{pr.base.ref}</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function GitHubPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>}>
      <GitHubPageInner />
    </Suspense>
  )
}
