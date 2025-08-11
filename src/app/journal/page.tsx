/**
 * @page /journal
 * @description Journal entries page with table view
 * @uses JournalEntriesTable component
 * @dataFlow journal_entries table → useTableData → JournalEntriesTable → This page
 */

'use client';

import React, { useState } from 'react';
import { JournalEntriesTable } from '@/components/tables/JournalEntriesTable';
import { useTableMutation } from '@/hooks/useTableData';

export default function JournalPage() {
  const [showPrivate, setShowPrivate] = useState(true);
  const [filterTag, setFilterTag] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Hook for creating new entries
  const { create, loading: creating } = useTableMutation('journal_entries');

  // Form state
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood: '',
    tags: [] as string[],
    is_private: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(newEntry);
      setShowAddForm(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        mood: '',
        tags: [],
        is_private: false
      });
      // The table will auto-refresh due to the refetch interval
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">My Journal</h1>
        <p className="text-gray-600">
          Track your thoughts, feelings, and daily experiences
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showAddForm ? 'Cancel' : '+ New Entry'}
        </button>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showPrivate}
            onChange={(e) => setShowPrivate(e.target.checked)}
            className="mr-2"
          />
          Show private entries
        </label>

        <input
          type="text"
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-4 py-2 border rounded"
        />
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">New Journal Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Optional title..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                rows={4}
                required
                placeholder="Write your thoughts..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mood</label>
                <select
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select mood...</option>
                  <option value="happy">😊 Happy</option>
                  <option value="sad">😢 Sad</option>
                  <option value="angry">😠 Angry</option>
                  <option value="anxious">😰 Anxious</option>
                  <option value="calm">😌 Calm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  onChange={(e) => setNewEntry({
                    ...newEntry, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="work, personal, goals..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newEntry.is_private}
                  onChange={(e) => setNewEntry({...newEntry, is_private: e.target.checked})}
                  className="mr-2"
                />
                Private entry
              </label>

              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {creating ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Journal Table */}
      <JournalEntriesTable 
        showPrivate={showPrivate}
        filterTag={filterTag}
      />
    </div>
  );
}