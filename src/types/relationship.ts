// types/relationship.ts

export interface DailyContext {
  date: string;
  physical_status: 'together' | 'apart' | 'partial';
  location_together?: string;
  location_apart_user?: string;
  location_apart_partner?: string;
  relationship_satisfaction: number; // 1-10
  user_energy_level: number; // 1-10
  partner_energy_level?: number; // 1-10
  external_stressors: string[];
  hours_together?: number; // For partial days
  quality_time_rating: number; // 1-10
  created_at?: string;
  updated_at?: string;
}

export interface RelationshipEvent {
  id?: string;
  date: string;
  event_type: 'conflict' | 'breakthrough' | 'celebration' | 'milestone' | 'trigger' | 'reconnection' | 'distance_moment';
  title: string;
  description?: string;
  severity?: number; // 1-10 for conflicts/triggers
  positivity?: number; // 1-10 for positive events
  resolution_quality?: number; // 1-10
  time_to_resolve_hours?: number;
  initiated_by?: 'user' | 'partner' | 'mutual' | 'external';
  lessons_learned?: string;
  created_at?: string;
}

export interface MessageSummary {
  date: string;
  total_count: number;
  user_count: number;
  partner_count: number;
  avg_sentiment: number; // -1 to 1
  avg_emotional_intensity: number; // 0 to 1
  avg_response_time_minutes: number;
  communication_quality_score: number; // 0-100
}

export interface ConnectionMetrics {
  date: string;
  overall_connection_score: number; // 0-100
  communication_quality_score: number; // 0-100
  emotional_intimacy_score: number; // 0-100
  conflict_resolution_score: number; // 0-100
  physical_presence_score: number; // 0-100
  message_count: number;
  relationship_trend: 'improving' | 'stable' | 'declining' | 'volatile';
  calculated_at: string;
}

export interface RelationshipDay {
  date: string;
  context?: DailyContext;
  events: RelationshipEvent[];
  messages?: MessageSummary;
  metrics?: ConnectionMetrics;
  insights?: string[];
}

export interface CalendarData {
  [date: string]: RelationshipDay;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardData {
  health_score: number;
  trend: 'improving' | 'stable' | 'declining';
  metrics: ConnectionMetrics[];
  recent_patterns: RelationshipPattern[];
  insights: string[];
}

export interface RelationshipPattern {
  id: string;
  pattern_type: 'communication' | 'conflict' | 'connection' | 'distance' | 'seasonal' | 'trigger' | 'resolution';
  pattern_name: string;
  description: string;
  confidence_score: number; // 0-1
  frequency_detected: number;
  date_range_start: string;
  date_range_end: string;
  recommendations: string[];
  last_detected: string;
}

// Form types
export interface DailyTrackerForm {
  date: string;
  physical_status: 'together' | 'apart' | 'partial';
  location_together?: string;
  hours_together?: number;
  relationship_satisfaction: number;
  user_energy_level: number;
  quality_time_rating: number;
  external_stressors: string;
}

export interface EventForm {
  date: string;
  event_type: RelationshipEvent['event_type'];
  title: string;
  description?: string;
  severity?: number;
  positivity?: number;
}

// UI State types
export interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'week';
  showDetailPanel: boolean;
  loading: boolean;
  error: string | null;
}

export interface TrackerModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  selectedDate: string;
  initialData?: Partial<DailyContext>;
}

// Utility types
export type PhysicalStatusIcon = '🏠' | '📱' | '⏰';
export type EventIcon = '⚠️' | '🎉' | '💡' | '🎯' | '⚡' | '💖' | '📍';

export interface CalendarDayDisplay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  data?: RelationshipDay;
  physicalStatusIcon?: PhysicalStatusIcon;
  connectionScore?: number;
  scoreClass: string;
  eventIndicators: EventIcon[];
}

// Hooks return types
export interface UseRelationshipDataReturn {
  data: CalendarData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateDay: (date: string, context: DailyContext) => Promise<void>;
  addEvent: (event: RelationshipEvent) => Promise<void>;
}

export interface UseCalendarNavigationReturn {
  currentMonth: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'week';
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  selectDate: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week') => void;
  goToToday: () => void;
}