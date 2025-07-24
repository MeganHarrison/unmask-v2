// components/MessagesList.tsx
// Connect your frontend to the working API

'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: number;
  date: string;
  type: 'Incoming' | 'Outgoing';
  sender: string;
  message: string;
  time: string;
  date_time: string;
  sentiment?: string;
  category?: string;
  conflict_indicator?: number;
}

interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string;
    semanticSearch: string;
  };
  metadata: {
    databaseId: string;
    searchType: string;
    timestamp: string;
  };
}

export default function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [search, setSearch] = useState('');

  const fetchMessages = async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/messages?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: MessagesResponse = await response.json();
      
      setMessages(data.messages);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchMessages(newPage, search);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error Loading Messages</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => fetchMessages()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {messages.length} of {pagination.total.toLocaleString()} messages
        </span>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages found. Try adjusting your search.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${
                message.type === 'Outgoing' 
                  ? 'bg-blue-50 border-blue-200 ml-8' 
                  : 'bg-gray-50 border-gray-200 mr-8'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    message.type === 'Outgoing' ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {message.sender || 'You'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    message.type === 'Outgoing' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.type}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {message.date} {message.time}
                </div>
              </div>
              
              <p className="text-gray-800">{message.message}</p>
              
              {message.conflict_indicator === 1 && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  ⚠️ Potential conflict detected
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 border border-gray-300 rounded-lg bg-blue-50">
            {pagination.page} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}