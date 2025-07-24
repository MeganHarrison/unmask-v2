// app/conversations/page.tsx
// Page showing conversation chunks instead of individual messages

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Search, MessageCircle, Heart, AlertTriangle, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ConversationChunk {
  id: number;
  start_time: string;
  end_time: string;
  message_count: number;
  chunk_summary: string;
  emotional_tone: string;
  conflict_detected: boolean;
  sentiment_score: number;
  participants: string;
  conversation_type: string;
  relationship_id: number;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationChunk[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('');
  const [conversationType, setConversationType] = useState('');
  const [conflictFilter, setConflictFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20', // Fewer chunks per page since they're larger
        ...(search && { search }),
        ...(emotionalTone && { emotionalTone }),
        ...(conversationType && { conversationType }),
        ...(conflictFilter && { conflictFilter }),
        ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
        ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
      });

      const response = await fetch(`/api/conversations?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { conversations: ConversationChunk[]; pagination: PaginationData };
      
      setConversations(data.conversations || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch conversations');
      setConversations([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [page, emotionalTone, conversationType, conflictFilter, startDate, endDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchConversations();
  };

  const getEmotionalToneColor = (tone: string) => {
    switch (tone.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-yellow-100 text-yellow-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConversationTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conflict': return <AlertTriangle className="h-4 w-4" />;
      case 'affection': return <Heart className="h-4 w-4" />;
      case 'logistics': return <Clock className="h-4 w-4" />;
      case 'planning': return <Users className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)}h`;
    return `${Math.round(diffMinutes / 1440)}d`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <MessageCircle className="mr-2 h-8 w-8" />
          Conversation Threads
        </h1>
        <p className="text-gray-600">
          View conversations grouped by emotional context and topic themes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search conversation summaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button type="submit">Search</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={emotionalTone} onChange={(e) => setEmotionalTone(e.target.value)}>
              <option value="">All Tones</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
              <option value="mixed">Mixed</option>
            </Select>

            <Select value={conversationType} onChange={(e) => setConversationType(e.target.value)}>
              <option value="">All Types</option>
              <option value="affection">Affection</option>
              <option value="conflict">Conflict</option>
              <option value="logistics">Logistics</option>
              <option value="planning">Planning</option>
              <option value="general">General</option>
            </Select>

            <Select value={conflictFilter} onChange={(e) => setConflictFilter(e.target.value)}>
              <option value="">All Conversations</option>
              <option value="conflicts">Conflicts Only</option>
              <option value="peaceful">Peaceful Only</option>
            </Select>

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
                  {startDate ? format(startDate, "MMM dd") : "Start Date"}
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
                  {endDate ? format(endDate, "MMM dd") : "End Date"}
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
              <span>Total: {pagination.total} conversations</span>
              <span className="text-red-600">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Conflicts: {conversations.filter(c => c.conflict_detected).length}
              </span>
              <span className="text-green-600">
                <Heart className="inline h-4 w-4 mr-1" />
                Positive: {conversations.filter(c => c.emotional_tone === 'positive').length}
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
          <p className="font-semibold">Error loading conversations</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading conversations...</span>
        </div>
      )}

      {/* Conversations List */}
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Card key={conversation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {getConversationTypeIcon(conversation.conversation_type)}
                  <CardTitle className="text-lg">
                    {conversation.conversation_type || 'General'} Conversation
                  </CardTitle>
                  {conversation.conflict_detected && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Conflict
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(conversation.start_time), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {conversation.message_count} messages
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(conversation.start_time, conversation.end_time)}
                </span>
                <Badge className={getEmotionalToneColor(conversation.emotional_tone)}>
                  {conversation.emotional_tone}
                </Badge>
                <span className="flex items-center">
                  Sentiment: {conversation.sentiment_score.toFixed(1)}/10
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {conversation.chunk_summary || 'No summary available for this conversation.'}
              </CardDescription>
              
              {conversation.participants && (
                <div className="mt-3 text-sm text-gray-500">
                  <Users className="inline h-4 w-4 mr-1" />
                  Participants: {conversation.participants}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && conversations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No conversations found</h3>
          <p>Try adjusting your search filters or date range.</p>
        </div>
      )}

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