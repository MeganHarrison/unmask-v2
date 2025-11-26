import EventsClient from "./events-client"
import { createClient } from "@supabase/supabase-js"

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
  tag?: string;
  category?: string;
}

export default async function RelationshipEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1")
  const limit = parseInt(searchParams.limit || "200")
  const search = searchParams.search || ""
  const startDate = searchParams.startDate
  const endDate = searchParams.endDate
  const year = searchParams.year || "all"
  const tag = searchParams.tag || ""
  const category = searchParams.category || ""

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error("Supabase environment variables are missing")
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false } }
    )

    // determine year bounds from date or year columns
    const minDateRes = await supabase
      .from("relationship_events")
      .select("date")
      .order("date", { ascending: true })
      .limit(1)

    const maxDateRes = await supabase
      .from("relationship_events")
      .select("date")
      .order("date", { ascending: false })
      .limit(1)

    const minYearColRes = await supabase
      .from("relationship_events")
      .select("year")
      .not("year", "is", null)
      .order("year", { ascending: true })
      .limit(1)

    const maxYearColRes = await supabase
      .from("relationship_events")
      .select("year")
      .not("year", "is", null)
      .order("year", { ascending: false })
      .limit(1)

    const nowYear = new Date().getFullYear()
    const minYearCandidate = minDateRes.data?.[0]?.date
      ? new Date(minDateRes.data[0].date as string).getFullYear()
      : (minYearColRes.data?.[0]?.year ? Number(minYearColRes.data[0].year) : nowYear)
    const maxYearCandidate = maxDateRes.data?.[0]?.date
      ? new Date(maxDateRes.data[0].date as string).getFullYear()
      : (maxYearColRes.data?.[0]?.year ? Number(maxYearColRes.data[0].year) : nowYear)

    const minYear = isFinite(minYearCandidate) ? minYearCandidate : nowYear
    const maxYear = isFinite(maxYearCandidate) ? maxYearCandidate : nowYear

    const yearOptions = ["all", ...Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(maxYear - i))]

    let query = supabase
      .from("relationship_events")
      .select("*", { count: "exact" })
      .order("date", { ascending: false, nullsFirst: true })
      .order("inserted_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (year !== "all") {
      const start = `${year}-01-01`
      const end = `${Number(year) + 1}-01-01`
      query = query.gte("date", start).lt("date", end)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%,location.ilike.%${search}%`)
    }
    if (tag) {
      query = query.eq("tag", tag)
    }
    if (category) {
      query = query.eq("category", category)
    }
    if (startDate) {
      query = query.gte("date", startDate)
    }
    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const events = data || []
    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    return (
      <EventsClient
        initialEvents={events}
        initialPagination={pagination}
        yearOptions={yearOptions}
        activeYear={year}
        initialFilters={{ search, startDate, endDate, tag, category }}
      />
    )
  } catch (error) {
    console.error("Server error:", error)
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-red-600">
          Failed to load relationship events: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    )
  }
}
