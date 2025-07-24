'use client';

import { useState, useEffect } from 'react';
import { MessageTable } from '@/components/ui/MessageTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sender, setSender] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [page, setPage] = useState(1);
  
  // Generate years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);
  
  // Month names
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build date filters from month/year selections
      let dateFilters: { startDate?: string; endDate?: string } = {};
      
      if (selectedMonth && selectedYear) {
        // If both month and year are selected, filter for that specific month
        const startOfMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
        const endOfMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0);
        dateFilters.startDate = format(startOfMonth, 'yyyy-MM-dd');
        dateFilters.endDate = format(endOfMonth, 'yyyy-MM-dd');
      } else if (selectedYear && !selectedMonth) {
        // If only year is selected, filter for the entire year
        const startOfYear = new Date(parseInt(selectedYear), 0, 1);
        const endOfYear = new Date(parseInt(selectedYear), 11, 31);
        dateFilters.startDate = format(startOfYear, 'yyyy-MM-dd');
        dateFilters.endDate = format(endOfYear, 'yyyy-MM-dd');
      }
      
      // Also include manual date range if set
      if (startDate && !selectedMonth && !selectedYear) {
        dateFilters.startDate = format(startDate, 'yyyy-MM-dd');
      }
      if (endDate && !selectedMonth && !selectedYear) {
        dateFilters.endDate = format(endDate, 'yyyy-MM-dd');
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        ...(search && { search }),
        ...(sender && { sender }),
        ...dateFilters,
      });

      const response = await fetch(`/api/messages?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { messages: Message[]; pagination: PaginationData };
      
      setMessages(data.messages || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
      setMessages([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, sender, startDate, endDate, selectedMonth, selectedYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">Browse and search through your conversation history</p>
        
        {/* Active Filters Display */}
        {(selectedMonth || selectedYear || search || sender || startDate || endDate) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Search: &quot;{search}&quot;
              </span>
            )}
            {sender && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                Sender: {sender}
              </span>
            )}
            {selectedMonth && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                Month: {months.find(m => m.value === selectedMonth)?.label}
              </span>
            )}
            {selectedYear && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                Year: {selectedYear}
              </span>
            )}
            {startDate && !selectedMonth && !selectedYear && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-sm">
                From: {format(startDate, "PP")}
              </span>
            )}
            {endDate && !selectedMonth && !selectedYear && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-sm">
                To: {format(endDate, "PP")}
              </span>
            )}
          </div>
        )}
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

            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedMonth('');
                setSelectedYear('');
                setSearch('');
                setSender('');
                setStartDate(undefined);
                setEndDate(undefined);
                setPage(1);
              }}
              className="text-gray-600"
            >
              Clear Filters
            </Button>
          </div>

          {/* Advanced date range (optional, collapsed by default) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Advanced: Custom Date Range
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                    onSelect={(date) => {
                      setStartDate(date);
                      // Clear month/year filters when using custom dates
                      setSelectedMonth('');
                      setSelectedYear('');
                    }}
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
                    onSelect={(date) => {
                      setEndDate(date);
                      // Clear month/year filters when using custom dates
                      setSelectedMonth('');
                      setSelectedYear('');
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </details>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold">Error loading messages</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results Summary */}
      {pagination && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
        </div>
      )}

      {/* Message Table */}
      <MessageTable 
        messages={messages} 
        loading={loading}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}