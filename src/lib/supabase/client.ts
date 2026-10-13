import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

function createMockClient(): SupabaseClient {
  const handler = {
    get(_target: unknown, prop: string) {
      if (prop === "auth") {
        return {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
        }
      }
      if (prop === "from") return () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }), single: () => Promise.resolve({ data: null, error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }), insert: () => Promise.resolve({ data: null, error: null }), update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }), delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) })
      if (prop === "storage") return { from: () => ({ upload: () => Promise.resolve({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) }
      if (prop === "channel") return () => ({ on: () => ({ subscribe: () => {} }), unsubscribe: () => {} })
      if (typeof prop === "string") return () => Promise.resolve({ data: null, error: null })
      return undefined
    },
  }
  return new Proxy({} as any, handler) as SupabaseClient
}

export function createClient(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || url === "your_supabase_url") {
    client = createMockClient()
    return client
  }

  client = createBrowserClient(url, anonKey)
  return client
}
