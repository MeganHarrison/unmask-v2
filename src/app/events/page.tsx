"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Add this import
import { EventsDataTable } from "@/components/events-data-table";

interface RelationshipEvent {
  id: number;
  relationship_id: number | null;
  date: string;
  end_date: string | null;
  name: string;
  category: string;
  tag: string;
  notes: string;
  location: string | null;
  photo: string | null;
  rating: number | null;
  year: number;
  inserted_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data?: RelationshipEvent[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<RelationshipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const fetchEvents = async (page: number = 1, limit: number = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/relationship-events?page=${page}&limit=${limit}`);
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data && result.pagination) {
        setEvents(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchEvents(newPage, pagination.limit);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchEvents(1, newSize);
  };

  const handleUpdateRow = async (id: number, field: string, value: string) => {
    try {
      const response = await fetch('/api/relationship-events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, field, value }),
      });

      const result = await response.json() as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to update event');
      }

      // Optionally refresh the data
      fetchEvents(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">Error loading events</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={() => fetchEvents()}
              className="mt-2 text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <EventsDataTable
          data={events}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onUpdateRow={handleUpdateRow}
        />
        <div className="mt-6 flex justify-end">
          <Link href="/events/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Event
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}