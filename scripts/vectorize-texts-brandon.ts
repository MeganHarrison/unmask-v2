#!/usr/bin/env ts-node
// Vectorize texts_brandon into message_vectors with conversational chunking

import 'dotenv/config'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

type TextRow = {
  id: number
  date_time: string | null
  sender: string | null
  message: string | null
  category: string | null
  tag: string | null
  relationship_id: number | null
}

type Chunk = {
  sourceIds: number[]
  relationshipId: number | null
  start: string
  end: string
  senders: string[]
  content: string
  category: string | null
  tag: string | null
}

const MODEL = 'text-embedding-3-small'
const DIMENSION = 1536
const GAP_MINUTES = 45
const CHAR_LIMIT = 1200
const BATCH_SIZE = 500
const LOOKBACK_YEARS = 3

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function minutesBetween(a: Date, b: Date) {
  return Math.abs((b.getTime() - a.getTime()) / 60000)
}

function buildChunks(rows: TextRow[]): Chunk[] {
  const sorted = rows
    .filter((r) => r.date_time)
    .sort((a, b) => new Date(a.date_time as string).getTime() - new Date(b.date_time as string).getTime())

  const chunks: Chunk[] = []
  let current: Chunk | null = null

  for (const row of sorted) {
    const msg = row.message?.trim()
    const ts = row.date_time ? new Date(row.date_time) : null
    if (!ts) continue

    const line = `[${ts.toISOString()}] ${row.sender || 'Unknown'}: ${msg || ''}`

    const shouldBreak =
      !current ||
      minutesBetween(new Date(current.end), ts) >= GAP_MINUTES ||
      current.content.length + line.length >= CHAR_LIMIT ||
      new Date(current.end).getUTCDate() !== ts.getUTCDate() ||
      new Date(current.end).getUTCMonth() !== ts.getUTCMonth() ||
      new Date(current.end).getUTCFullYear() !== ts.getUTCFullYear()

    if (shouldBreak) {
      if (current) {
        chunks.push(current)
      }
      current = {
        sourceIds: [row.id],
        relationshipId: row.relationship_id,
        start: ts.toISOString(),
        end: ts.toISOString(),
        senders: row.sender ? [row.sender] : [],
        content: line,
        category: row.category,
        tag: row.tag,
      }
    } else {
      current.sourceIds.push(row.id)
      current.end = ts.toISOString()
      if (row.sender && !current.senders.includes(row.sender)) {
        current.senders.push(row.sender)
      }
      current.content += `\n${line}`
      // prefer non-null metadata if missing
      if (!current.category && row.category) current.category = row.category
      if (!current.tag && row.tag) current.tag = row.tag
    }
  }

  if (current) chunks.push(current)
  return chunks
}

async function fetchTexts(offset: number): Promise<TextRow[]> {
  const cutoff = new Date()
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - LOOKBACK_YEARS)
  const { data, error } = await supabase
    .from('texts_brandon')
    .select('id,date_time,sender,message,category,tag,relationship_id')
    .gte('date_time', cutoff.toISOString())
    .order('date_time', { ascending: true })
    .range(offset, offset + BATCH_SIZE - 1)

  if (error) throw error
  return data || []
}

async function embed(content: string) {
  const res = await openai.embeddings.create({
    model: MODEL,
    input: content,
  })
  return res.data[0].embedding
}

async function upsertChunk(chunk: Chunk, embedding: number[]) {
  const payload = {
    source_table: 'texts_brandon',
    source_id: chunk.sourceIds[0], // anchor id
    relationship_id: chunk.relationshipId,
    sender: chunk.senders.join(', '),
    category: chunk.category,
    tag: chunk.tag,
    content: chunk.content,
    metadata: {
      source_ids: chunk.sourceIds,
      senders: chunk.senders,
      start: chunk.start,
      end: chunk.end,
    },
    embedding,
    date_time: chunk.start,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('message_vectors')
    .upsert(payload, { onConflict: 'source_table,source_id' })

  if (error) throw error
}

async function main() {
  console.log('Starting vectorization for texts_brandon...')
  let offset = 0
  let totalProcessed = 0

  while (true) {
    const rows = await fetchTexts(offset)
    if (!rows.length) break

    console.log(`Fetched ${rows.length} rows (offset ${offset})`)
    const chunks = buildChunks(rows)
    console.log(`Built ${chunks.length} chunks`)

    for (const chunk of chunks) {
      const embedding = await embed(chunk.content)
      await upsertChunk(chunk, embedding)
      totalProcessed += 1
      if (totalProcessed % 20 === 0) {
        console.log(`Upserted ${totalProcessed} chunks...`)
      }
    }

    offset += rows.length
  }

  console.log(`Done. Upserted ${totalProcessed} chunks.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
