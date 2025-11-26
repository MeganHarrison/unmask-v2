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

interface Message {
  id: number;
  created_at: string | null;
  date_time: string | null;
  date: string | null;
  time: string | null;
  type: string | null;
  sender: string | null;
  message: string | null;
  category: string | null;
  tag: string | null;
  notes: string | null;
  relationship_id: number | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Props {
  initialMessages: Message[];
  initialPagination: PaginationData;
  yearOptions: string[];
  activeYear: string;
}

export default function MessagesClient({ initialMessages, initialPagination, yearOptions, activeYear }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sender, setSender] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [year, setYear] = useState<string>(activeYear || 'all')

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams({
      page: '1',
      limit: initialPagination.limit.toString(),
      year,
      ...(search && { search }),
      ...(sender && { sender }),
      ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
      ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
    })
    router.push(`/text-messages?${params}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams({
      page: newPage.toString(),
      limit: initialPagination.limit.toString(),
      year,
      ...(search && { search }),
      ...(sender && { sender }),
      ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
      ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
    })
    router.push(`/text-messages?${params}`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Supabase · texts_brandon</p>
          <h1 className="text-3xl font-semibold text-slate-900">Text Messages</h1>
          <p className="text-slate-500 text-sm">{initialPagination.total} messages</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch('')
              setSender('')
              setStartDate(undefined)
              setEndDate(undefined)
              router.push('/text-messages')
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
                  ...(sender && { sender }),
                  ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
                  ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
                })
                router.push(`/text-messages?${params}`)
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
                  placeholder="Search messages"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <select
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              >
                <option value="">All senders</option>
                <option value="You">You</option>
                <option value="Brandon">Brandon</option>
              </select>
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
            {sender && <Badge variant="outline">Sender: {sender}</Badge>}
            {startDate && <Badge variant="outline">From: {format(startDate, 'PP')}</Badge>}
            {endDate && <Badge variant="outline">To: {format(endDate, 'PP')}</Badge>}
            {!search && !sender && !startDate && !endDate && (
              <span className="text-muted-foreground">No filters applied</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date / Time</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Sender</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Message</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tag</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {initialMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-slate-800 whitespace-nowrap">
                      {(() => {
                        const dateSource = message.date_time || message.date || message.created_at
                        return dateSource ? format(new Date(dateSource), 'PP p') : '—'
                      })()}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {message.sender || '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-900">
                      {message.message || '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      {message.tag || message.category || '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      {message.category || '—'}
                    </td>
                  </tr>
                ))}
                {initialMessages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                      No messages found for this view.
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
