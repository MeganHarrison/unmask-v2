// components/RelationshipCalendar.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, Heart } from 'lucide-react';
import { useRelationshipData } from '@/hooks/useRelationshipData';
import { DailyTrackerModal } from './DailyTrackerModal';
import { 
  CalendarDayDisplay, 
  RelationshipDay, 
  DailyContext,
  PhysicalStatusIcon,
  EventIcon 
} from '@/types/relationship';

export function RelationshipCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [trackerModal, setTrackerModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit',
    selectedDate: '',
  });

  const { data, loading, error, updateDay, addEvent } = useRelationshipData(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDayDisplay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateKey = date.toISOString().split('T')[0];
      const dayData = data[dateKey];
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push({
        date,
        dateKey,
        isCurrentMonth,
        isToday,
        isSelected,
        data: dayData,
        physicalStatusIcon: getPhysicalStatusIcon(dayData?.context?.physical_status),
        connectionScore: dayData?.metrics?.overall_connection_score,
        scoreClass: getScoreClass(dayData?.metrics?.overall_connection_score),
        eventIndicators: getEventIndicators(dayData),
      });
    }

    return days;
  }, [currentMonth, data, selectedDate]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = selectedDate.toISOString().split('T')[0];
    return data[dateKey];
  }, [selectedDate, data]);

  const monthlyHealthScore = useMemo(() => {
    const monthData = Object.values(data).filter(day => 
      day.metrics && new Date(day.date).getMonth() === currentMonth.getMonth()
    );
    
    if (monthData.length === 0) return null;
    
    const avgScore = monthData.reduce((sum, day) => 
      sum + (day.metrics?.overall_connection_score || 0), 0
    ) / monthData.length;
    
    return Math.round(avgScore);
  }, [data, currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
    setSelectedDate(null);
    setShowDetailPanel(false);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setShowDetailPanel(true);
  };

  const openTracker = (date: Date, mode: 'create' | 'edit' = 'create') => {
    const dateKey = date.toISOString().split('T')[0];
    setTrackerModal({
      isOpen: true,
      mode,
      selectedDate: dateKey,
    });
  };

  const closeTracker = () => {
    setTrackerModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveTracker = async (contextData: DailyContext) => {
    await updateDay(contextData.date, contextData);
  };

  const quickEntryToday = () => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const existingData = data[todayKey];
    
    openTracker(today, existingData?.context ? 'edit' : 'create');
  };

  if (loading && Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your relationship data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error loading data</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Unmask</h1>
            </div>
            
            {monthlyHealthScore && (
              <div className="flex items-center gap-3 px-4 py-2 bg-green-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Health: {monthlyHealthScore}</span>
              </div>
            )}
          </div>

          <button
            onClick={quickEntryToday}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Quick Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
                setShowDetailPanel(true);
              }}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day) => (
              <CalendarDay
                key={day.dateKey}
                day={day}
                onSelect={() => selectDate(day.date)}
                onQuickEntry={() => openTracker(day.date, day.data?.context ? 'edit' : 'create')}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 h-fit">
          {showDetailPanel && selectedDate ? (
            <DayDetailPanel 
              date={selectedDate}
              data={selectedDayData}
              onEdit={() => openTracker(selectedDate, 'edit')}
              onAddEvent={() => {/* TODO: Implement add event */}}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Day</h3>
              <p className="text-gray-600">Click on any calendar day to view details and insights</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Tracker Modal */}
      <DailyTrackerModal
        isOpen={trackerModal.isOpen}
        onClose={closeTracker}
        onSave={handleSaveTracker}
        selectedDate={trackerModal.selectedDate}
        initialData={data[trackerModal.selectedDate]?.context}
        mode={trackerModal.mode}
      />
    </div>
  );
}

// Calendar Day Component
interface CalendarDayProps {
  day: CalendarDayDisplay;
  onSelect: () => void;
  onQuickEntry: () => void;
}

function CalendarDay({ day, onSelect, onQuickEntry }: CalendarDayProps) {
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickEntry();
  };

  return (
    <div
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={`
        relative aspect-square rounded-lg p-2 cursor-pointer transition-all border-2
        ${day.scoreClass}
        ${day.isSelected ? 'border-indigo-500 ring-4 ring-indigo-200' : 'border-transparent'}
        ${!day.isCurrentMonth ? 'opacity-30' : ''}
        ${day.isToday ? 'ring-2 ring-yellow-400' : ''}
        hover:scale-105 hover:shadow-lg
      `}
      title={`Double-click to ${day.data?.context ? 'edit' : 'add'} daily context`}
    >
      {/* Day Number */}
      <div className="text-sm font-semibold text-center mb-1">
        {day.date.getDate()}
      </div>

      {/* Physical Status Icon */}
      {day.physicalStatusIcon && (
        <div className="text-lg text-center mb-1">
          {day.physicalStatusIcon}
        </div>
      )}

      {/* Event Indicators */}
      {day.eventIndicators.length > 0 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {day.eventIndicators.slice(0, 3).map((icon, index) => (
            <div key={index} className="w-1.5 h-1.5 rounded-full bg-white/80" />
          ))}
        </div>
      )}

      {/* Today indicator */}
      {day.isToday && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
      )}
    </div>
  );
}

// Day Detail Panel Component
interface DayDetailPanelProps {
  date: Date;
  data: RelationshipDay | null | undefined;
  onEdit: () => void;
  onAddEvent: () => void;
}

function DayDetailPanel({ date, data, onEdit, onAddEvent }: DayDetailPanelProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">{formatDate(date)}</h3>
        {data?.context && (
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <span>{getPhysicalStatusIcon(data.context.physical_status)}</span>
            <span className="capitalize">{data.context.physical_status}</span>
            {data.metrics && (
              <>
                <span>•</span>
                <span>Score: {data.metrics.overall_connection_score}</span>
              </>
            )}
          </div>
        )}
      </div>

      {data?.context ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="Satisfaction" 
              value={data.context.relationship_satisfaction}
              max={10}
            />
            <MetricCard 
              label="Energy" 
              value={data.context.user_energy_level}
              max={10}
            />
            <MetricCard 
              label="Quality Time" 
              value={data.context.quality_time_rating}
              max={10}
            />
            {data.metrics && (
              <MetricCard 
                label="Connection" 
                value={data.metrics.overall_connection_score}
                max={100}
              />
            )}
          </div>

          {/* Events */}
          {data.events.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Events</h4>
              <div className="space-y-2">
                {data.events.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{getEventIcon(event.event_type)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-gray-600">{event.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Stressors */}
          {data.context.external_stressors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">External Stressors</h4>
              <div className="flex flex-wrap gap-2">
                {data.context.external_stressors.map((stressor, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {stressor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Edit Day
            </button>
            <button
              onClick={onAddEvent}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Add Event
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="font-semibold text-gray-900 mb-2">No Data Yet</h4>
          <p className="text-gray-600 mb-4">Track this day's relationship context</p>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add Daily Context
          </button>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: number;
  max: number;
}

function MetricCard({ label, value, max }: MetricCardProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs font-semibold text-gray-600 uppercase mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Helper Functions
function getPhysicalStatusIcon(status?: string): PhysicalStatusIcon | undefined {
  switch (status) {
    case 'together': return '🏠';
    case 'apart': return '📱';
    case 'partial': return '⏰';
    default: return undefined;
  }
}

function getScoreClass(score?: number): string {
  if (!score) return 'bg-gray-100 text-gray-600';
  if (score >= 85) return 'bg-gradient-to-br from-green-400 to-green-500 text-white';
  if (score >= 70) return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white';
  if (score >= 50) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white';
  return 'bg-gradient-to-br from-red-400 to-red-500 text-white';
}

function getEventIndicators(day?: RelationshipDay): EventIcon[] {
  if (!day?.events) return [];
  return day.events.map(event => getEventIcon(event.event_type));
}

function getEventIcon(eventType: string): EventIcon {
  switch (eventType) {
    case 'conflict': return '⚠️';
    case 'celebration': return '🎉';
    case 'breakthrough': return '💡';
    case 'milestone': return '🎯';
    case 'trigger': return '⚡';
    case 'reconnection': return '💖';
    case 'distance_moment': return '📍';
    default: return '💡';
  }
}