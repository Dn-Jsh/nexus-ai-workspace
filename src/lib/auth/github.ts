import { createClient } from "@/lib/supabase/client"

export async function signInWithGitHub() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) console.error("GitHub auth error:", error.message)
}
