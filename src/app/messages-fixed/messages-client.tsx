'use client';

import { useState } from 'react';
// Remove MessageTable import - we'll create a simple table inline
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  date: string;
  time: string;
  date_time: string;
  type: string;
  sender: string;
  message: string;
  attachment: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  conflict_detected: boolean;
  emotional_score: number | null;
  tags_json: string | null;
  relationship_id: number;
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
}

export default function MessagesClient({ initialMessages, initialPagination }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sender, setSender] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      page: '1',
      limit: initialPagination.limit.toString(),
      ...(search && { search }),
      ...(sender && { sender }),
      ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
      ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
    });
    router.push(`/messages-fixed?${params}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams({
      page: newPage.toString(),
      limit: initialPagination.limit.toString(),
      ...(search && { search }),
      ...(sender && { sender }),
      ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
      ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
    });
    router.push(`/messages-fixed?${params}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Text Messages</h1>
        <p className="text-gray-600">
          {initialPagination.total} messages between You and Brandon
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              value={sender} 
              onChange={(e) => setSender(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Senders</option>
              <option value="You">You</option>
              <option value="Brandon">Brandon</option>
            </select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start Date"}
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
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End Date"}
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

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                setSender('');
                setStartDate(undefined);
                setEndDate(undefined);
                router.push('/messages-fixed');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Message Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialMessages.map((message) => (
                <tr key={message.id} className={message.conflict_detected ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.date} {message.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {message.sender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xl truncate">
                    {message.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.sentiment_score ? `${message.sentiment_score}/10` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {initialPagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(initialPagination.page - 1)}
            disabled={!initialPagination.hasPrevPage}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
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
    </div>
  );
}