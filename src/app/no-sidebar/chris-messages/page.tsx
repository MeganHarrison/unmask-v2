"use client"

import { TextsDataTableEditable } from "@/components/tables/texts-data-table-editable"
import { useEffect, useState, useCallback } from "react"

interface TextMessage {
  id: number;
  date_time: string;
  sender: string;
  message: string;
  sentiment: string;
  category: string;
  tag: string;
  conflict_detected: boolean;
}

interface TextsApiResponse {
  success: boolean;
  data?: TextMessage[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ChrisMessagesPage() {
  const [textsData, setTextsData] = useState<TextMessage[]>([]);
  const [textsLoading, setTextsLoading] = useState(true);
  const [textsPagination, setTextsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const fetchTextsData = async (page: number = 1, limit: number = 50) => {
    setTextsLoading(true);
    try {
      const response = await fetch(`/api/texts-bc/chris?page=${page}&limit=${limit}`);
      const result: TextsApiResponse = await response.json();
      
      if (result.success && result.data) {
        setTextsData(result.data);
        if (result.pagination) {
          setTextsPagination(result.pagination);
        }
      } else {
        console.error('Failed to fetch Chris messages:', result.error);
        setTextsData([]);
      }
    } catch (err) {
      console.error('Error fetching Chris messages:', err);
    } finally {
      setTextsLoading(false);
    }
  };

  useEffect(() => {
    fetchTextsData();
  }, []);

  const handlePageChange = (page: number) => {
    fetchTextsData(page, textsPagination.limit);
  };

  const handlePageSizeChange = (limit: number) => {
    fetchTextsData(1, limit);
  };

  const handleUpdateRow = async (id: number, field: string, value: string) => {
    try {
      const response = await fetch('/api/texts-bc/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });
      
      const result = await response.json() as { success: boolean; error?: string };
      
      if (result.success) {
        // Update local data
        setTextsData(prev => 
          prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
          )
        );
      } else {
        console.error('Failed to update:', result.error);
      }
    } catch (error) {
      console.error('Error updating row:', error);
    }
  };

  const handleDeleteRow = async (id: number) => {
    if (!confirm(`Are you sure you want to delete message #${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/texts-bc/delete?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json() as { success: boolean; error?: string };
      
      if (result.success) {
        // Remove from local data
        setTextsData(prev => prev.filter(item => item.id !== id));
        // Update pagination total
        setTextsPagination(prev => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit)
        }));
      } else {
        console.error('Failed to delete:', result.error);
        alert(`Failed to delete message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('Error deleting message');
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 bg-white">
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Messages Tagged with Chris</h1>
          <p className="text-gray-600 mt-2">
            All messages that have been tagged with "Chris" (case-insensitive). 
            Total: {textsPagination.total} messages
          </p>
        </div>
        <TextsDataTableEditable 
          data={textsData}
          loading={textsLoading}
          pagination={textsPagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
        />
      </div>
    </div>
  )
}