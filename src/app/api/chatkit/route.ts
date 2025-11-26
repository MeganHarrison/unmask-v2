import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { searchMessages } from "@/lib/rag/searchMessages"

const SYSTEM_PROMPT = `You are a grounded relationship insights assistant.
- Use only the provided message snippets as evidence.
- Cite each point with [sender, YYYY-MM-DD] using the snippet's sender and date_time.
- If nothing relevant is found, say you don't have supporting messages.
- Keep answers concise and actionable.`

export async function POST(req: NextRequest) {
  try {
    const { message, relationshipId, startDate, endDate, topK } = await req.json()
    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "message is required" }, { status: 400 })
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: "OPENAI_API_KEY missing" }, { status: 500 })
    }

    // Retrieve context from Supabase vectors
    const results = await searchMessages(message, {
      relationshipId: relationshipId ? Number(relationshipId) : undefined,
      startDate,
      endDate,
      limit: topK ?? 8,
    })

    const context = results
      .map((r) => {
        const date = r.date_time ? new Date(r.date_time).toISOString().split("T")[0] : "unknown-date"
        const sender = r.sender || "Unknown"
        return `[${sender}, ${date}] ${r.content}`
      })
      .join("\n\n")

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "assistant",
          content: `Relevant snippets:\n${context || "(none)"}`,
        },
        { role: "user", content: message },
      ],
    })

    const answer = completion.choices[0]?.message?.content || ""

    return NextResponse.json({
      success: true,
      answer,
      sources: results.map((r) => ({
        id: r.id,
        sender: r.sender,
        date_time: r.date_time,
        snippet: r.content,
        score: r.score,
        source_ids: r.metadata?.source_ids,
      })),
    })
  } catch (error) {
    console.error("POST /api/chatkit error", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
