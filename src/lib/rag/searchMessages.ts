import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

export type MessageVectorRow = {
  id: number
  content: string
  metadata: {
    source_ids?: number[]
    senders?: string[]
    start?: string
    end?: string
  } | null
  sender: string | null
  category: string | null
  tag: string | null
  date_time: string | null
  relationship_id: number | null
  embedding: number[]
}

export type SearchOptions = {
  limit?: number
  relationshipId?: number
  startDate?: string
  endDate?: string
}

function cosineSim(a: number[], b: number[]) {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-12)
}

export async function searchMessages(query: string, options: SearchOptions = {}) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase environment variables are missing")
  }
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing")
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

  // Embed query
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  })
  const queryEmbedding = embeddingRes.data[0].embedding

  // Fetch candidate rows (scoped) — we compute similarity client-side to avoid a new RPC dependency
  let candidates = supabase
    .from("message_vectors")
    .select("id,content,metadata,sender,category,tag,date_time,relationship_id,embedding")
    .order("date_time", { ascending: false })
    .limit(Math.max(options.limit || 8, 200)) // fetch a larger pool to rank

  if (options.relationshipId) {
    candidates = candidates.eq("relationship_id", options.relationshipId)
  }
  if (options.startDate) {
    candidates = candidates.gte("date_time", options.startDate)
  }
  if (options.endDate) {
    candidates = candidates.lte("date_time", options.endDate)
  }

  const { data, error } = await candidates
  if (error) {
    throw new Error(error.message)
  }

  const ranked = (data as unknown as MessageVectorRow[]).map((row) => ({
    row,
    score: cosineSim(queryEmbedding, row.embedding),
  }))

  ranked.sort((a, b) => b.score - a.score)
  const top = ranked.slice(0, options.limit ?? 8).map(({ row, score }) => ({
    ...row,
    score,
  }))

  return top
}
