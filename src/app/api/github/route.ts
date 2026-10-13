import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { fetchRepos, fetchIssues, fetchPullRequests } from "@/lib/github/api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const owner = searchParams.get("owner")
    const repo = searchParams.get("repo")

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: connection, error: connError } = await supabase
      .from("github_connections")
      .select("access_token")
      .eq("user_id", user.id)
      .single()

    if (connError || !connection) {
      return NextResponse.json({ error: "GitHub not connected. Please connect your GitHub account." }, { status: 400 })
    }

    const token = connection.access_token

    switch (action) {
      case "repos": {
        const repos = await fetchRepos(token)
        return NextResponse.json({ data: repos })
      }
      case "issues": {
        if (!owner || !repo) {
          return NextResponse.json({ error: "Missing owner or repo parameters" }, { status: 400 })
        }
        const issues = await fetchIssues(token, owner, repo)
        return NextResponse.json({ data: issues })
      }
      case "pulls": {
        if (!owner || !repo) {
          return NextResponse.json({ error: "Missing owner or repo parameters" }, { status: 400 })
        }
        const pulls = await fetchPullRequests(token, owner, repo)
        return NextResponse.json({ data: pulls })
      }
      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error("GitHub API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
