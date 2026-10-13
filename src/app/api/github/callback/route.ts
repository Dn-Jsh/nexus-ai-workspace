import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")

  if (errorParam) {
    return NextResponse.redirect(`${origin}/dashboard/github?error=${errorParam}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/github?error=no_code`)
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.redirect(
        `${origin}/dashboard/github?error=${tokenData.error_description || tokenData.error}`
      )
    }

    const accessToken = tokenData.access_token

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "nexus-ai-workspace",
      },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect(`${origin}/dashboard/github?error=user_fetch_failed`)
    }

    const githubUser = await userResponse.json()

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=auth_required`)
    }

    const { error: upsertError } = await supabase
      .from("github_connections")
      .upsert({
        user_id: user.id,
        access_token: accessToken,
        username: githubUser.login,
        avatar_url: githubUser.avatar_url,
      }, { onConflict: "user_id" })

    if (upsertError) {
      console.error("Failed to save GitHub connection:", upsertError)
      return NextResponse.redirect(`${origin}/dashboard/github?error=save_failed`)
    }

    return NextResponse.redirect(`${origin}/dashboard/github?connected=true`)
  } catch (err) {
    console.error("GitHub OAuth error:", err)
    return NextResponse.redirect(`${origin}/dashboard/github?error=oauth_failed`)
  }
}
