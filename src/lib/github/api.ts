const GITHUB_API = "https://api.github.com"

class GitHubRateLimitError extends Error {
  resetAt: number
  constructor(resetAt: number) {
    super(`GitHub API rate limit exceeded. Resets at ${new Date(resetAt * 1000).toLocaleString()}`)
    this.name = "GitHubRateLimitError"
    this.resetAt = resetAt
  }
}

async function githubFetch<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "nexus-ai-workspace",
    },
  })

  if (response.status === 403) {
    const remaining = response.headers.get("x-ratelimit-remaining")
    if (remaining === "0") {
      const resetAt = parseInt(response.headers.get("x-ratelimit-reset") || "0", 10)
      throw new GitHubRateLimitError(resetAt)
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `GitHub API error: ${response.status}` }))
    throw new Error(error.message || `GitHub API error: ${response.status}`)
  }

  return response.json()
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stars: number
  forks: number
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubIssue {
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

export interface GitHubPullRequest {
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

export async function fetchRepos(accessToken: string): Promise<GitHubRepo[]> {
  const repos = await githubFetch<any[]>(`${GITHUB_API}/user/repos?per_page=100&sort=updated&type=all`, accessToken)
  return repos.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    html_url: r.html_url,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    owner: {
      login: r.owner.login,
      avatar_url: r.owner.avatar_url,
    },
  }))
}

export async function fetchIssues(accessToken: string, owner: string, repo: string): Promise<GitHubIssue[]> {
  const issues = await githubFetch<any[]>(
    `${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=50&sort=created&direction=desc`,
    accessToken
  )
  return issues
    .filter((i) => !i.pull_request)
    .map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      body: i.body,
      state: i.state,
      html_url: i.html_url,
      user: { login: i.user.login, avatar_url: i.user.avatar_url },
      labels: i.labels.map((l: any) => ({ name: l.name, color: l.color })),
      comments: i.comments,
      created_at: i.created_at,
      updated_at: i.updated_at,
    }))
}

export async function fetchPullRequests(accessToken: string, owner: string, repo: string): Promise<GitHubPullRequest[]> {
  const pulls = await githubFetch<any[]>(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls?state=open&per_page=50&sort=created&direction=desc`,
    accessToken
  )
  return pulls.map((pr) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state,
    html_url: pr.html_url,
    user: { login: pr.user.login, avatar_url: pr.user.avatar_url },
    draft: pr.draft,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    head: { ref: pr.head.label, sha: pr.head.sha },
    base: { ref: pr.base.label },
  }))
}

export { GitHubRateLimitError }
