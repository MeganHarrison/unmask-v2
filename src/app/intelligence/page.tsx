"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Loader2, Calendar, Heart, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: Array<{
    text: string
    score: number
    metadata?: any
  }>
}

interface DailyContext {
  date: string
  physical_status: "together" | "apart" | "mixed"
  relationship_satisfaction?: number
  personal_energy?: number
  external_stressors?: string
  connection_quality?: string
  notes?: string
}

interface RelationshipEvent {
  date: string
  event_type: "conflict" | "breakthrough" | "milestone" | "transition"
  title: string
  description?: string
  impact_score?: number
}

interface HealthMetrics {
  health_score: number
  trend: string
  metrics: Array<{
    date: string
    overall_health_score: number
    communication_score: number
    emotional_score: number
    presence_score: number
    trend_direction: string
  }>
  insights: string[]
}

export default function IntelligencePage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your relationship intelligence assistant. I can help you understand patterns, log daily context, track events, and provide insights about your relationship. What would you like to explore?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Daily context state
  const [todayContext, setTodayContext] = useState<DailyContext>({
    date: new Date().toISOString().split('T')[0],
    physical_status: "together"
  })
  const [contextLoading, setContextLoading] = useState(false)
  const [contextMessage, setContextMessage] = useState("")

  // Event state
  const [newEvent, setNewEvent] = useState<RelationshipEvent>({
    date: new Date().toISOString().split('T')[0],
    event_type: "milestone",
    title: ""
  })
  const [eventLoading, setEventLoading] = useState(false)
  const [eventMessage, setEventMessage] = useState("")

  // Dashboard state
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)

  // Auto-scroll chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard()
  }, [])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content })
      })

      const data = await response.json()

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          sources: data.relatedInsights?.map((text: string, idx: number) => ({
            text,
            score: 0.85 - (idx * 0.1),
            metadata: {}
          }))
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const saveDailyContext = async () => {
    setContextLoading(true)
    setContextMessage("")

    try {
      const response = await fetch("/api/intelligence/daily-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todayContext)
      })

      const data = await response.json()
      if (data.success) {
        setContextMessage("Daily context saved successfully!")
        // Reload dashboard to show updated metrics
        loadDashboard()
      } else {
        throw new Error(data.error || "Failed to save context")
      }
    } catch (error) {
      console.error("Context error:", error)
      setContextMessage("Failed to save context. Please try again.")
    } finally {
      setContextLoading(false)
    }
  }

  const logEvent = async () => {
    if (!newEvent.title) {
      setEventMessage("Please enter an event title")
      return
    }

    setEventLoading(true)
    setEventMessage("")

    try {
      const response = await fetch("/api/intelligence/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
      })

      const data = await response.json()
      if (data.success) {
        setEventMessage("Event logged successfully!")
        setNewEvent({
          date: new Date().toISOString().split('T')[0],
          event_type: "milestone",
          title: "",
          description: ""
        })
        // Reload dashboard
        loadDashboard()
      } else {
        throw new Error(data.error || "Failed to log event")
      }
    } catch (error) {
      console.error("Event error:", error)
      setEventMessage("Failed to log event. Please try again.")
    } finally {
      setEventLoading(false)
    }
  }

  const loadDashboard = async () => {
    setMetricsLoading(true)

    try {
      const response = await fetch("/api/intelligence/dashboard?days=30")
      const data = await response.json()
      setHealthMetrics(data)
    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setMetricsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === "declining") return <AlertCircle className="w-4 h-4 text-red-600" />
    return <CheckCircle className="w-4 h-4 text-blue-600" />
  }

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Relationship Intelligence Hub
        </h1>
        <p className="text-gray-600 mt-2">
          Track, analyze, and understand your relationship patterns with AI-powered insights
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="context">Daily Context</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Relationship Insights Chat
              </CardTitle>
              <CardDescription>
                Ask questions about your relationship patterns and get AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[70%] ${
                          message.role === "user" 
                            ? "bg-purple-600 text-white rounded-2xl rounded-tr-sm" 
                            : "bg-gray-100 rounded-2xl rounded-tl-sm"
                        } p-4`}
                      >
                        <p className={`text-sm ${message.role === "user" ? "text-white" : "text-gray-800"} whitespace-pre-wrap`}>
                          {message.content}
                        </p>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Based on:</p>
                            <div className="space-y-1">
                              {message.sources.slice(0, 3).map((source, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-white rounded p-2">
                                  <p className="line-clamp-2">{source.text}</p>
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    Relevance: {(source.score * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className={`text-xs mt-2 ${
                          message.role === "user" ? "text-purple-200" : "text-gray-400"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your relationship patterns..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Context Tab */}
        <TabsContent value="context">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Context Tracker
              </CardTitle>
              <CardDescription>
                Log today's relationship context to enhance AI insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={todayContext.date}
                    onChange={(e) => setTodayContext({...todayContext, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Physical Status</Label>
                  <Select 
                    value={todayContext.physical_status}
                    onValueChange={(value: "together" | "apart" | "mixed") => 
                      setTodayContext({...todayContext, physical_status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="together">Together</SelectItem>
                      <SelectItem value="apart">Apart</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Relationship Satisfaction (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={todayContext.relationship_satisfaction || ""}
                    onChange={(e) => setTodayContext({
                      ...todayContext, 
                      relationship_satisfaction: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Personal Energy (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={todayContext.personal_energy || ""}
                    onChange={(e) => setTodayContext({
                      ...todayContext, 
                      personal_energy: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>External Stressors</Label>
                <Input
                  placeholder="e.g., Work deadline, family issues"
                  value={todayContext.external_stressors || ""}
                  onChange={(e) => setTodayContext({
                    ...todayContext, 
                    external_stressors: e.target.value
                  })}
                />
              </div>

              <div>
                <Label>Connection Quality</Label>
                <Input
                  placeholder="e.g., Deep conversations, quality time"
                  value={todayContext.connection_quality || ""}
                  onChange={(e) => setTodayContext({
                    ...todayContext, 
                    connection_quality: e.target.value
                  })}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional context about today..."
                  value={todayContext.notes || ""}
                  onChange={(e) => setTodayContext({
                    ...todayContext, 
                    notes: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <Button 
                onClick={saveDailyContext}
                disabled={contextLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {contextLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Daily Context"
                )}
              </Button>

              {contextMessage && (
                <Alert className={contextMessage.includes("success") ? "border-green-500" : "border-red-500"}>
                  <AlertDescription>{contextMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Relationship Events
              </CardTitle>
              <CardDescription>
                Log significant moments in your relationship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Event Type</Label>
                  <Select 
                    value={newEvent.event_type}
                    onValueChange={(value: "conflict" | "breakthrough" | "milestone" | "transition") => 
                      setNewEvent({...newEvent, event_type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="breakthrough">Breakthrough</SelectItem>
                      <SelectItem value="conflict">Conflict</SelectItem>
                      <SelectItem value="transition">Transition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Event Title</Label>
                <Input
                  placeholder="e.g., Anniversary celebration, Deep conversation"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what happened and how it impacted your relationship..."
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={4}
                />
              </div>

              <div>
                <Label>Impact Score (-10 to +10)</Label>
                <Input
                  type="number"
                  min="-10"
                  max="10"
                  value={newEvent.impact_score || ""}
                  onChange={(e) => setNewEvent({
                    ...newEvent, 
                    impact_score: parseInt(e.target.value)
                  })}
                />
              </div>

              <Button 
                onClick={logEvent}
                disabled={eventLoading || !newEvent.title}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {eventLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging Event...
                  </>
                ) : (
                  "Log Event"
                )}
              </Button>

              {eventMessage && (
                <Alert className={eventMessage.includes("success") ? "border-green-500" : "border-red-500"}>
                  <AlertDescription>{eventMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="space-y-4">
            {/* Health Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Relationship Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : healthMetrics ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getHealthColor(healthMetrics.health_score)}`}>
                        {healthMetrics.health_score}%
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {getTrendIcon(healthMetrics.trend)}
                        <span className="text-sm text-gray-600 capitalize">
                          {healthMetrics.trend.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <Progress value={healthMetrics.health_score} className="h-3" />

                    {/* Insights */}
                    {healthMetrics.insights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">AI Insights</h4>
                        <div className="space-y-2">
                          {healthMetrics.insights.map((insight, idx) => (
                            <Alert key={idx}>
                              <AlertDescription>{insight}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No data available. Start logging daily context to see metrics.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            {healthMetrics && healthMetrics.metrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Metrics</CardTitle>
                  <CardDescription>
                    Your relationship scores over the past {healthMetrics.metrics.length} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthMetrics.metrics.slice(0, 5).map((metric, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{metric.date}</span>
                          <Badge variant={metric.trend_direction === "improving" ? "default" : "secondary"}>
                            {metric.trend_direction}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Overall: </span>
                            <span className={`font-medium ${getHealthColor(metric.overall_health_score)}`}>
                              {metric.overall_health_score}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Communication: </span>
                            <span className={`font-medium ${getHealthColor(metric.communication_score)}`}>
                              {metric.communication_score}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Emotional: </span>
                            <span className={`font-medium ${getHealthColor(metric.emotional_score)}`}>
                              {metric.emotional_score}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Presence: </span>
                            <span className={`font-medium ${getHealthColor(metric.presence_score)}`}>
                              {metric.presence_score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}