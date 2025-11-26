'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon, Search } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface RelationshipEvent {
  id: number;
  inserted_at: string;
  updated_at: string;
  name: string | null;
  photo: string | null;
  date: string | null;
  end_date: string | null;
  year: number | null;
  location: string | null;
  rating: number | null;
  notes: string | null;
  tag: string | null;
  category: string | null;
  relationship_id: number | null;
  image_url: string | null;
  image_thumbnail_url: string | null;
  image_cdn_id: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface InitialFilters {
  search: string;
  startDate?: string;
  endDate?: string;
  tag: string;
  category: string;
}

interface Props {
  initialEvents: RelationshipEvent[];
  initialPagination: PaginationData;
  yearOptions: string[];
  activeYear: string;
  initialFilters: InitialFilters;
}

export default function EventsClient({
  initialEvents,
  initialPagination,
  yearOptions,
  activeYear,
  initialFilters,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialFilters.search || '')
  const [startDate, setStartDate] = useState<Date | undefined>(initialFilters.startDate ? new Date(initialFilters.startDate) : undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(initialFilters.endDate ? new Date(initialFilters.endDate) : undefined)
  const [year, setYear] = useState<string>(activeYear || 'all')
  const [tag, setTag] = useState(initialFilters.tag || '')
  const [category, setCategory] = useState(initialFilters.category || '')

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams({
      page: '1',
      limit: initialPagination.limit.toString(),
      year,
      ...(search && { search }),
      ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
      ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
      ...(tag && { tag }),
      ...(category && { category }),
    })
    router.push(`/relationship-events?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams({
      page: newPage.toString(),
      limit: initialPagination.limit.toString(),
      year,
      ...(search && { search }),
      ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
      ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
      ...(tag && { tag }),
      ...(category && { category }),
    })
    router.push(`/relationship-events?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Supabase · relationship_events</p>
          <h1 className="text-3xl font-semibold text-slate-900">Relationship Events</h1>
          <p className="text-slate-500 text-sm">{initialPagination.total} records</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch('')
              setStartDate(undefined)
              setEndDate(undefined)
              setTag('')
              setCategory('')
              router.push('/relationship-events')
            }}
          >
            Clear filters
          </Button>
          <Button type="submit" onClick={handleSearch}>Apply filters</Button>
        </div>
      </header>

      <form onSubmit={handleSearch} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={year}
              onValueChange={(val) => {
                setYear(val)
                const params = new URLSearchParams({
                  page: '1',
                  limit: initialPagination.limit.toString(),
                  year: val,
                  ...(search && { search }),
                  ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
                  ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
                  ...(tag && { tag }),
                  ...(category && { category }),
                })
                router.push(`/relationship-events?${params.toString()}`)
              }}
            >
              <TabsList className="h-9 bg-slate-100">
                {yearOptions.map((y) => (
                  <TabsTrigger key={y} value={y} className="capitalize">
                    {y === 'all' ? 'All' : y}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search events"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <Input
                type="text"
                placeholder="Tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none lg:w-40"
              />
              <Input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none lg:w-40"
              />
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 justify-start gap-2",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 justify-start gap-2",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 text-xs">
            {search && <Badge variant="outline">Search: {search}</Badge>}
            {tag && <Badge variant="outline">Tag: {tag}</Badge>}
            {category && <Badge variant="outline">Category: {category}</Badge>}
            {startDate && <Badge variant="outline">From: {format(startDate, 'PP')}</Badge>}
            {endDate && <Badge variant="outline">To: {format(endDate, 'PP')}</Badge>}
            {!search && !startDate && !endDate && !tag && !category && (
              <span className="text-muted-foreground">No filters applied</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Photo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tag</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rating</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {initialEvents.map((event) => {
                  const imgSrc = event.image_thumbnail_url || event.image_url || event.photo || ''
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3 whitespace-nowrap">
                        {imgSrc ? (
                          <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
                            {/* use native img to avoid domain config issues */}
                            <img
                              src={imgSrc}
                              alt={event.name || 'Event photo'}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-800 whitespace-nowrap">
                        {event.date ? format(new Date(event.date), 'PP') : '—'}
                        {event.end_date ? ` – ${format(new Date(event.end_date), 'PP')}` : ''}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {event.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-800 whitespace-nowrap">
                        {event.location || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        {event.category || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        {event.tag || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-800 whitespace-nowrap">
                        {event.rating != null ? event.rating : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-800">
                        {event.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
                {initialEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-muted-foreground">
                      No events found for this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {initialPagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(initialPagination.page - 1)}
              disabled={!initialPagination.hasPrevPage}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Page {initialPagination.page} of {initialPagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(initialPagination.page + 1)}
              disabled={!initialPagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
