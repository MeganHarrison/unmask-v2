// Fixed messages page with server-side data fetching
import MessagesClient from "./messages-client"
import { createClient } from "@supabase/supabase-js"

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  sender?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1")
  const limit = parseInt(searchParams.limit || "200")
  const search = searchParams.search || ""
  const sender = searchParams.sender || ""
  const startDate = searchParams.startDate
  const endDate = searchParams.endDate
  const year = searchParams.year || "all"
  
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error("Supabase environment variables are missing")
    }
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false } }
    )

    // find year bounds
    const minRes = await supabase
      .from("texts_brandon")
      .select("date_time")
      .order("date_time", { ascending: true })
      .limit(1)
    const maxRes = await supabase
      .from("texts_brandon")
      .select("date_time")
      .order("date_time", { ascending: false })
      .limit(1)

    const minYear = minRes.data?.[0]?.date_time
      ? new Date(minRes.data[0].date_time as string).getFullYear()
      : new Date().getFullYear()
    const maxYear = maxRes.data?.[0]?.date_time
      ? new Date(maxRes.data[0].date_time as string).getFullYear()
      : new Date().getFullYear()
    const yearOptions = ["all", ...Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(maxYear - i))]

    let query = supabase
      .from("texts_brandon")
      .select("*", { count: "exact" })
      .order("date_time", { ascending: false, nullsFirst: false })
      .range((page - 1) * limit, page * limit - 1)

    if (year !== "all") {
      const start = `${year}-01-01T00:00:00Z`
      const end = `${Number(year) + 1}-01-01T00:00:00Z`
      query = query.gte("date_time", start).lt("date_time", end)
    }
    if (search) {
      query = query.ilike("message", `%${search}%`)
    }
    if (sender) {
      query = query.eq("sender", sender)
    }
    if (startDate) {
      query = query.gte("date_time", startDate)
    }
    if (endDate) {
      query = query.lte("date_time", endDate)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const messages = data || []
    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return <MessagesClient initialMessages={messages} initialPagination={pagination} yearOptions={yearOptions} activeYear={year} />;
  } catch (error) {
    console.error('Server error:', error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">
          Failed to load messages: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}
