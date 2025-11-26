import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status })

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...fields } = body || {}

    if (!id) return errorResponse("id is required", 400)

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase environment variables are missing", 500)
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false } }
    )

    const allowedKeys = [
      "name",
      "location",
      "category",
      "tag",
      "rating",
      "notes",
      "date",
      "end_date",
      "image_url",
      "image_thumbnail_url",
      "photo",
    ]

    const updatePayload: Record<string, any> = {}
    for (const key of allowedKeys) {
      if (fields[key] !== undefined) {
        updatePayload[key] = fields[key]
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return errorResponse("No fields to update", 400)
    }

    updatePayload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("relationship_events")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      return errorResponse(error.message, 500)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Unexpected error updating relationship_events:", error)
    return errorResponse("Failed to update event", 500)
  }
}
