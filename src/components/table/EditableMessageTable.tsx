// components/ui/EditableMessageTable.tsx
// Editable table for correcting conflict detection and other tags

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit, Save, AlertTriangle } from 'lucide-react';

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

interface EditableMessageTableProps {
  messages: Message[];
  loading: boolean;
  onUpdateMessage: (messageId: number, updates: Partial<Message>) => Promise<void>;
}

export function EditableMessageTable({ messages, loading, onUpdateMessage }: EditableMessageTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Message>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const startEditing = (message: Message) => {
    setEditingId(message.id);
    setEditData({
      sentiment: message.sentiment || '',
      conflict_detected: message.conflict_detected,
      emotional_score: message.emotional_score || 0,
      tags_json: message.tags_json || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveChanges = async (messageId: number) => {
    setSaving(messageId);
    try {
      await onUpdateMessage(messageId, editData);
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Failed to save changes:', error);
      // You could add toast notification here
    } finally {
      setSaving(null);
    }
  };

  const parseTagsJson = (tagsJson: string | null): string[] => {
    if (!tagsJson) return [];
    try {
      const parsed = JSON.parse(tagsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return tagsJson.split(',').map(tag => tag.trim()).filter(Boolean);
    }
  };

  const formatTagsForSave = (tags: string): string => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    return JSON.stringify(tagArray);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conflict
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emotional Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50">
                {/* Message Content */}
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <div className="font-medium text-gray-900">
                      {message.sender} - {message.date} {message.time}
                    </div>
                    <div className="text-gray-600 mt-1 max-w-md">
                      {message.message.length > 100 
                        ? `${message.message.substring(0, 100)}...`
                        : message.message
                      }
                    </div>
                  </div>
                </td>

                {/* Sentiment */}
                <td className="px-6 py-4">
                  {editingId === message.id ? (
                    <select
                      value={editData.sentiment || ''}
                      onChange={(e) => setEditData({...editData, sentiment: e.target.value})}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Unknown</option>
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  ) : (
                    <Badge 
                      variant={
                        message.sentiment === 'positive' ? 'default' :
                        message.sentiment === 'negative' ? 'destructive' :
                        message.sentiment === 'neutral' ? 'secondary' : 'outline'
                      }
                    >
                      {message.sentiment || 'Unknown'}
                    </Badge>
                  )}
                </td>

                {/* Conflict Detection */}
                <td className="px-6 py-4">
                  {editingId === message.id ? (
                    <input
                      type="checkbox"
                      checked={editData.conflict_detected || false}
                      onChange={(e) => setEditData({...editData, conflict_detected: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <div className="flex items-center">
                      {message.conflict_detected ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      <span className="ml-2 text-sm">
                        {message.conflict_detected ? 'Conflict' : 'Peaceful'}
                      </span>
                    </div>
                  )}
                </td>

                {/* Emotional Score */}
                <td className="px-6 py-4">
                  {editingId === message.id ? (
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={editData.emotional_score || 0}
                      onChange={(e) => setEditData({...editData, emotional_score: parseFloat(e.target.value)})}
                      className="w-20 text-sm"
                    />
                  ) : (
                    <span className="text-sm">
                      {message.emotional_score?.toFixed(1) || 'N/A'}
                    </span>
                  )}
                </td>

                {/* Tags */}
                <td className="px-6 py-4">
                  {editingId === message.id ? (
                    <Input
                      value={editData.tags_json || ''}
                      onChange={(e) => setEditData({...editData, tags_json: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                      className="text-sm"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {parseTagsJson(message.tags_json).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {parseTagsJson(message.tags_json).length === 0 && (
                        <span className="text-sm text-gray-400">No tags</span>
                      )}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  {editingId === message.id ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => saveChanges(message.id)}
                        disabled={saving === message.id}
                        className="h-8 w-8 p-0"
                      >
                        {saving === message.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={saving === message.id}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(message)}
                      disabled={editingId !== null}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No messages found
        </div>
      )}
    </div>
  );
}