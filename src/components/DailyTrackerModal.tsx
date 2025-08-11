// components/DailyTrackerModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { X, Home, Smartphone, Clock } from 'lucide-react';
import { DailyContext, DailyTrackerForm } from '@/types/relationship';

interface DailyTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DailyContext) => Promise<void>;
  selectedDate: string;
  initialData?: Partial<DailyContext>;
  mode: 'create' | 'edit';
}

export function DailyTrackerModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  initialData,
  mode
}: DailyTrackerModalProps) {
  const [formData, setFormData] = useState<DailyTrackerForm>({
    date: selectedDate,
    physical_status: 'together',
    relationship_satisfaction: 7,
    user_energy_level: 7,
    quality_time_rating: 7,
    external_stressors: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: selectedDate,
        physical_status: initialData.physical_status || 'together',
        location_together: initialData.location_together || '',
        hours_together: initialData.hours_together || 4,
        relationship_satisfaction: initialData.relationship_satisfaction || 7,
        user_energy_level: initialData.user_energy_level || 7,
        quality_time_rating: initialData.quality_time_rating || 7,
        external_stressors: initialData.external_stressors?.join(', ') || '',
      });
    } else {
      setFormData({
        date: selectedDate,
        physical_status: 'together',
        relationship_satisfaction: 7,
        user_energy_level: 7,
        quality_time_rating: 7,
        external_stressors: '',
      });
    }
  }, [selectedDate, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const contextData: DailyContext = {
        date: formData.date,
        physical_status: formData.physical_status,
        location_together: formData.location_together,
        hours_together: formData.physical_status === 'partial' ? formData.hours_together : undefined,
        relationship_satisfaction: formData.relationship_satisfaction,
        user_energy_level: formData.user_energy_level,
        quality_time_rating: formData.quality_time_rating,
        external_stressors: formData.external_stressors
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0),
      };

      await onSave(contextData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit' : 'Track'} Daily Context
            </h2>
            <p className="text-gray-600 mt-1">{formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Physical Status */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Physical Status
            </label>
            <div className="flex gap-4">
              {[
                { value: 'together', icon: Home, label: 'Together', desc: 'Same location' },
                { value: 'apart', icon: Smartphone, label: 'Apart', desc: 'Long distance' },
                { value: 'partial', icon: Clock, label: 'Partial', desc: 'Some time together' },
              ].map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, physical_status: value as any }))}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.physical_status === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">{label}</div>
                  <div className="text-xs opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location (when together) */}
          {formData.physical_status === 'together' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location_together || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location_together: e.target.value }))}
                placeholder="e.g., Home, Vacation, etc."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Hours Together (when partial) */}
          {formData.physical_status === 'partial' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hours Together: {formData.hours_together}h
              </label>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={formData.hours_together || 4}
                onChange={(e) => setFormData(prev => ({ ...prev, hours_together: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0h</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>
          )}

          {/* Satisfaction Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Relationship Satisfaction: {formData.relationship_satisfaction}/10
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">😔</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.relationship_satisfaction}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship_satisfaction: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-2xl">😍</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Your Energy Level: {formData.user_energy_level}/10
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">😴</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.user_energy_level}
                onChange={(e) => setFormData(prev => ({ ...prev, user_energy_level: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-2xl">⚡</span>
            </div>
          </div>

          {/* Quality Time Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Quality Time Rating: {formData.quality_time_rating}/10
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">📱</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.quality_time_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, quality_time_rating: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-2xl">💝</span>
            </div>
          </div>

          {/* External Stressors */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              External Stressors (optional)
            </label>
            <textarea
              value={formData.external_stressors}
              onChange={(e) => setFormData(prev => ({ ...prev, external_stressors: e.target.value }))}
              placeholder="Work deadlines, family issues, travel, etc. (comma-separated)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'} Context
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}