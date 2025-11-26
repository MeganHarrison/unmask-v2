import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error("Supabase environment variables are missing")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = (page - 1) * limit

    const query = supabase
      .from("texts_brandon")
      .select("id,date_time,sender,message,notes,category,tag,relationship_id", { count: "exact" })
      .order("date_time", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    const pagination = {
      page,
      limit,
      total: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    }

    return NextResponse.json({ success: true, data, pagination })
  } catch (error) {
    console.error("GET /api/texts-brandon error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, field, value } = body || {}

    if (!id || !field) {
      return NextResponse.json({ success: false, error: "id and field are required" }, { status: 400 })
    }

    const allowed = ["notes", "category", "tag", "sender"]
    if (!allowed.includes(field)) {
      return NextResponse.json({ success: false, error: "Field not allowed" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("texts_brandon")
      .update({ [field]: value })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("PUT /api/texts-brandon error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }

    const { error } = await supabase.from("texts_brandon").delete().eq("id", Number(id))
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/texts-brandon error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
