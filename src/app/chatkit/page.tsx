"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Source = {
  id: number
  sender: string | null
  date_time: string | null
  snippet: string
  score: number
  source_ids?: number[]
}

export default function ChatkitPage() {
  const [message, setMessage] = useState("")
  const [relationshipId, setRelationshipId] = useState<string>("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    setLoading(true)
    setError(null)
    setAnswer("")
    setSources([])
    try {
      const res = await fetch("/api/chatkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          relationshipId: relationshipId ? Number(relationshipId) : undefined,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Request failed")
      }
      setAnswer(json.answer)
      setSources(json.sources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-3xl font-semibold">Chat (Supabase RAG via ChatKit endpoint)</h1>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Relationship ID (optional)"
          value={relationshipId}
          onChange={(e) => setRelationshipId(e.target.value)}
          className="w-48"
        />
      </div>
      <Textarea
        placeholder="Ask a question about the texts..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[120px]"
      />
      <Button onClick={onSubmit} disabled={loading || !message.trim()}>
        {loading ? "Thinking..." : "Ask"}
      </Button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {answer && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium mb-2">Answer</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
      {sources.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <h3 className="font-medium text-gray-900">Citations</h3>
          {sources.map((src) => (
            <div key={src.id} className="rounded border border-gray-100 bg-gray-50 p-2">
              <div className="text-xs text-gray-600">
                {src.sender || "Unknown"} — {src.date_time || "unknown date"} (score {src.score.toFixed(3)})
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-900">{src.snippet}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
