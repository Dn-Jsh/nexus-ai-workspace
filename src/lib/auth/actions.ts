"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  revalidatePath("/")
  return { success: true }
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath("/dashboard/workspace")
  redirect("/dashboard/workspace")
}

export async function signInWithGitHub() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  })
  if (error) throw new Error(error.message)
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath("/login")
  redirect("/login")
}

export async function resetPassword(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect_to=/dashboard/settings`,
  })
  if (error) return { error: error.message }

  return { success: true }
}
