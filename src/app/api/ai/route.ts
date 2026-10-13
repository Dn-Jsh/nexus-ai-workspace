import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const MODELS = ["openai/gpt-3.5-turbo", "openai/gpt-4o-mini", "anthropic/claude-3-haiku", "google/gemini-2.0-flash"]

export async function POST(request: Request) {
  try {
    const { messages, chat_id } = await request.json()

    if (!messages || !chat_id) {
      return NextResponse.json({ error: "Missing messages or chat_id" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userMessage = messages[messages.length - 1]

    const { error: saveUserError } = await supabase.from("ai_messages").insert({
      chat_id,
      role: "user",
      content: userMessage.content,
    })

    if (saveUserError) {
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    const apiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

    let aiContent = ""
    let usedModel = ""

    for (const model of MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            "HTTP-Referer": SITE_URL,
            "X-Title": "Nexus AI Workspace",
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            max_tokens: 4096,
          }),
        })

        if (!response.ok) {
          if (response.status === 429) continue
          const body = await response.text()
          console.error(`Model ${model} failed:`, response.status, body)
          continue
        }

        const data = await response.json()
        aiContent = data.choices?.[0]?.message?.content || ""
        usedModel = model
        break
      } catch (err) {
        console.error(`Model ${model} error:`, err)
        continue
      }
    }

    if (!aiContent) {
      return NextResponse.json({ error: "All AI models failed" }, { status: 502 })
    }

    const { error: saveAIError } = await supabase.from("ai_messages").insert({
      chat_id,
      role: "assistant",
      content: aiContent,
    })

    if (saveAIError) {
      console.error("Failed to save AI response:", saveAIError)
    }

    await supabase.from("ai_chats").update({ updated_at: new Date().toISOString() }).eq("id", chat_id)

    return NextResponse.json({
      content: aiContent,
      model: usedModel,
    })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
