"use client"

import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Heart, Flower2, MessageCircle, Star, AlertCircle, Gift, Calendar as CalendarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const localizer = momentLocalizer(moment)

interface RelationshipEvent extends CalendarEvent {
  id?: number
  event_type: string
  description?: string
  notes?: string
  category?: string
  sentiment?: string
  significance?: number
  initiated_by?: string
  location?: string
  mood_before?: string
  mood_after?: string
}

const eventTypes = [
  { value: 'flowers_received', label: 'Received Flowers', icon: Flower2, color: 'bg-pink-100 text-pink-700' },
  { value: 'flowers_given', label: 'Gave Flowers', icon: Flower2, color: 'bg-pink-100 text-pink-700' },
  { value: 'said_i_love_you', label: 'Said "I love you"', icon: Heart, color: 'bg-red-100 text-red-700' },
  { value: 'heard_i_love_you', label: 'Heard "I love you"', icon: Heart, color: 'bg-red-100 text-red-700' },
  { value: 'physical_affection', label: 'Physical Affection', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { value: 'quality_time', label: 'Quality Time', icon: CalendarDays, color: 'bg-blue-100 text-blue-700' },
  { value: 'date_night', label: 'Date Night', icon: Star, color: 'bg-purple-100 text-purple-700' },
  { value: 'meaningful_conversation', label: 'Meaningful Conversation', icon: MessageCircle, color: 'bg-green-100 text-green-700' },
  { value: 'thoughtful_gift', label: 'Thoughtful Gift', icon: Gift, color: 'bg-amber-100 text-amber-700' },
  { value: 'conflict_started', label: 'Conflict Started', icon: AlertCircle, color: 'bg-orange-100 text-orange-700' },
  { value: 'conflict_resolved', label: 'Conflict Resolved', icon: AlertCircle, color: 'bg-teal-100 text-teal-700' },
  { value: 'milestone', label: 'Milestone', icon: Star, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'other', label: 'Other', icon: CalendarIcon, color: 'bg-gray-100 text-gray-700' }
]

export default function EventsPage() {
  const [events, setEvents] = useState<RelationshipEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<RelationshipEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('calendar')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    event_date: new Date().toISOString().split('T')[0],
    event_time: '',
    event_type: 'other',
    title: '',
    description: '',
    notes: '',
    category: 'general',
    sentiment: 'positive',
    significance: 3,
    initiated_by: 'Brandon',
    location: '',
    mood_before: '',
    mood_after: ''
  })

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/relationship-events')
      const result = await response.json()
      
      if (result.success && result.data) {
        const formattedEvents = result.data.map((event: any) => ({
          ...event,
          start: new Date(event.event_date + ' ' + (event.event_time || '00:00:00')),
          end: new Date(event.event_date + ' ' + (event.event_time || '00:00:00')),
          title: event.title
        }))
        setEvents(formattedEvents)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setFormData({
      ...formData,
      event_date: start.toISOString().split('T')[0],
      event_time: '',
      title: '',
      description: '',
      notes: ''
    })
    setIsEditMode(false)
    setIsDialogOpen(true)
  }, [formData])

  const handleSelectEvent = useCallback((event: RelationshipEvent) => {
    setSelectedEvent(event)
    const eventDate = new Date(event.start!)
    setFormData({
      event_date: eventDate.toISOString().split('T')[0],
      event_time: eventDate.toTimeString().slice(0, 5),
      event_type: event.event_type,
      title: event.title as string,
      description: event.description || '',
      notes: event.notes || '',
      category: event.category || 'general',
      sentiment: event.sentiment || 'positive',
      significance: event.significance || 3,
      initiated_by: event.initiated_by || 'Brandon',
      location: event.location || '',
      mood_before: event.mood_before || '',
      mood_after: event.mood_after || ''
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    
    try {
      const url = '/api/relationship-events'
      const method = isEditMode ? 'PUT' : 'POST'
      const body = isEditMode 
        ? { id: selectedEvent?.id, ...formData }
        : formData
      
      console.log('Submitting event:', body)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const result = await response.json()
      console.log('API response:', result)
      
      if (result.success) {
        await fetchEvents()
        setIsDialogOpen(false)
        resetForm()
      } else {
        setError(result.error || 'Failed to save event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent?.id) return
    
    try {
      const response = await fetch(`/api/relationship-events?id=${selectedEvent.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchEvents()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      event_date: new Date().toISOString().split('T')[0],
      event_time: '',
      event_type: 'other',
      title: '',
      description: '',
      notes: '',
      category: 'general',
      sentiment: 'positive',
      significance: 3,
      initiated_by: 'Brandon',
      location: '',
      mood_before: '',
      mood_after: ''
    })
    setSelectedEvent(null)
    setIsEditMode(false)
  }

  const eventStyleGetter = (event: RelationshipEvent) => {
    const eventType = eventTypes.find(type => type.value === event.event_type)
    const colorClass = eventType?.color || 'bg-gray-100 text-gray-700'
    
    return {
      style: {
        backgroundColor: eventType?.value.includes('conflict') ? '#FEE2E2' : 
                        eventType?.value.includes('love') ? '#FEE2E2' :
                        eventType?.value.includes('flower') ? '#FCE7F3' :
                        '#E0E7FF',
        color: '#1F2937',
        border: 'none',
        borderRadius: '0.375rem'
      }
    }
  }

  const getEventIcon = (eventType: string) => {
    const type = eventTypes.find(t => t.value === eventType)
    const Icon = type?.icon || CalendarIcon
    return <Icon className="h-4 w-4" />
  }

  const getEventStats = () => {
    const stats = {
      totalEvents: events.length,
      lastFlowers: events
        .filter(e => e.event_type.includes('flowers'))
        .sort((a, b) => new Date(b.start!).getTime() - new Date(a.start!).getTime())[0],
      lastILoveYou: events
        .filter(e => e.event_type.includes('i_love_you'))
        .sort((a, b) => new Date(b.start!).getTime() - new Date(a.start!).getTime())[0],
      lastAffection: events
        .filter(e => e.event_type === 'physical_affection')
        .sort((a, b) => new Date(b.start!).getTime() - new Date(a.start!).getTime())[0],
      positiveEvents: events.filter(e => e.sentiment === 'positive').length,
      conflicts: events.filter(e => e.event_type.includes('conflict')).length
    }
    return stats
  }

  const stats = getEventStats()

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'oklch(0.61 0.27 19.72)' }}>Relationship Events</h1>
        <p className="text-gray-600">Track meaningful moments and milestones in your relationship</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Last Flowers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flower2 className="h-5 w-5 text-pink-500" />
              <div>
                <p className="font-semibold">
                  {stats.lastFlowers 
                    ? moment(stats.lastFlowers.start).fromNow()
                    : 'No record'}
                </p>
                {stats.lastFlowers && (
                  <p className="text-xs text-gray-500">
                    {moment(stats.lastFlowers.start).format('MMM D, YYYY')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Last "I Love You"</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-semibold">
                  {stats.lastILoveYou 
                    ? moment(stats.lastILoveYou.start).fromNow()
                    : 'No record'}
                </p>
                {stats.lastILoveYou && (
                  <p className="text-xs text-gray-500">
                    {moment(stats.lastILoveYou.start).format('MMM D, YYYY')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Positive Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.positiveEvents}</p>
                <p className="text-xs text-gray-500">Total recorded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div style={{ height: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'agenda']}
                  defaultView='month'
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {loading ? (
                  <p className="text-center text-gray-500">Loading events...</p>
                ) : events.length === 0 ? (
                  <p className="text-center text-gray-500">No events recorded yet</p>
                ) : (
                  events.map((event) => {
                    const eventType = eventTypes.find(t => t.value === event.event_type)
                    return (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectEvent(event)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${eventType?.color}`}>
                            {getEventIcon(event.event_type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {moment(event.start).format('MMM D, YYYY')} • {event.initiated_by}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={event.sentiment === 'positive' ? 'default' : 'secondary'}>
                            {event.sentiment}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {moment(event.start).fromNow()}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="event_time">Time (optional)</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <Select 
                value={formData.event_type} 
                onValueChange={(value) => setFormData({...formData, event_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief title for the event"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What happened?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Personal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="How did this make you feel? Any thoughts to remember?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initiated_by">Initiated By</Label>
                <Select 
                  value={formData.initiated_by} 
                  onValueChange={(value) => setFormData({...formData, initiated_by: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brandon">Brandon</SelectItem>
                    <SelectItem value="Me">Me</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sentiment">Sentiment</Label>
                <Select 
                  value={formData.sentiment} 
                  onValueChange={(value) => setFormData({...formData, sentiment: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="significance">Significance (1-5)</Label>
              <Input
                id="significance"
                type="number"
                min="1"
                max="5"
                value={formData.significance}
                onChange={(e) => setFormData({...formData, significance: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Where did this happen?"
              />
            </div>

            <DialogFooter>
              {isEditMode && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create') + ' Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}