// app/messages/edit/page.tsx
// Page for editing message tags and conflict detection

'use client';

import { useState, useEffect } from 'react';
import { EditableMessageTable } from '@/components/EditableMessageTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Search, Edit, AlertTriangle } from 'lucide-react';
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

export default function EditMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sender, setSender] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [conflictFilter, setConflictFilter] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Smaller limit for editing
        ...(search && { search }),
        ...(sender && { sender }),
        ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
        ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
        ...(conflictFilter && { conflictFilter }),
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

  const updateMessage = async (messageId: number, updates: Partial<Message>) => {
    try {
      const response = await fetch('/api/messages/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, updates })
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      await response.json();
      
      // Update the message in the local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, ...updates }
          : msg
      ));
    } catch (error) {
      console.error('Failed to update message:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, sender, startDate, endDate, conflictFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Edit className="mr-2 h-8 w-8" />
          Edit Messages
        </h1>
        <p className="text-gray-600">
          Review and correct sentiment analysis, conflict detection, and tags
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

            <select 
              value={conflictFilter} 
              onChange={(e) => setConflictFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Messages</option>
              <option value="conflicts">Conflicts Only</option>
              <option value="peaceful">Peaceful Only</option>
              <option value="untagged">Unprocessed Only</option>
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
          </div>
        </form>

        {/* Quick Stats */}
        {pagination && (
          <div className="mt-4 p-3 bg-gray-50 rounded flex justify-between text-sm">
            <div className="flex space-x-4">
              <span>Total: {pagination.total} messages</span>
              <span className="text-orange-600">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Conflicts: {messages.filter(m => m.conflict_detected).length}
              </span>
              <span className="text-gray-500">
                Untagged: {messages.filter(m => !m.tags_json).length}
              </span>
            </div>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold">Error loading messages</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Editable Message Table */}
      <EditableMessageTable 
        messages={messages} 
        loading={loading}
        onUpdateMessage={updateMessage}
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