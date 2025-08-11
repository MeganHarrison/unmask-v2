/**
 * Enhanced Relationship Intelligence Worker
 * Provides contextual analysis based on physical presence, messages, events, and patterns
 */

interface DailyContext {
  date: string;
  physical_status: 'together' | 'apart' | 'partial';
  location_together?: string;
  location_apart_user?: string;
  location_apart_partner?: string;
  relationship_satisfaction?: number;
  user_energy_level?: number;
  partner_energy_level?: number;
  external_stressors?: string[];
  hours_together?: number;
  quality_time_rating?: number;
}

interface Message {
  date: string;
  timestamp: string;
  sender: 'user' | 'partner';
  content: string;
  sentiment_score?: number;
  emotional_intensity?: number;
  response_time_minutes?: number;
  conversation_thread_id?: string;
}

interface RelationshipEvent {
  date: string;
  event_type: 'conflict' | 'breakthrough' | 'celebration' | 'milestone' | 'trigger' | 'reconnection' | 'distance_moment';
  title: string;
  description?: string;
  severity?: number;
  positivity?: number;
  resolution_quality?: number;
  time_to_resolve_hours?: number;
  initiated_by?: 'user' | 'partner' | 'mutual' | 'external';
}

interface ContextualAnalysisRequest {
  query: string;
  date_range?: {
    start: string;
    end: string;
  };
  analysis_type: 'pattern_recognition' | 'relationship_health' | 'communication_analysis' | 'conflict_insights' | 'connection_trends';
}

// Helper function to add CORS headers to responses
function corsResponse(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Daily Context Management
      if (path === '/api/daily-context' && request.method === 'POST') {
        return await handleDailyContextEntry(request, env);
      }
      
      if (path === '/api/daily-context' && request.method === 'GET') {
        return await getDailyContext(request, env);
      }

      // Message Processing with Context
      if (path === '/api/messages/process' && request.method === 'POST') {
        return await processMessagesWithContext(request, env);
      }

      // Event Logging
      if (path === '/api/events' && request.method === 'POST') {
        return await logRelationshipEvent(request, env);
      }

      // Contextual Analysis
      if (path === '/api/analyze' && request.method === 'POST') {
        return await performContextualAnalysis(request, env);
      }

      // Pattern Detection
      if (path === '/api/patterns/detect' && request.method === 'POST') {
        return await detectRelationshipPatterns(request, env);
      }

      // Health Dashboard Data
      if (path === '/api/dashboard' && request.method === 'GET') {
        return await getRelationshipDashboard(request, env);
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handleDailyContextEntry(request: Request, env: any): Promise<Response> {
  const data: DailyContext = await request.json();
  
  const stmt = env.DB.prepare(`
    INSERT OR REPLACE INTO daily_context 
    (date, physical_status, relationship_satisfaction, personal_energy, 
     external_stressors, connection_quality, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  await stmt.bind(
    data.date,
    data.physical_status,
    data.relationship_satisfaction || null,
    data.personal_energy || null,
    data.external_stressors || null,
    data.connection_quality || null,
    data.notes || null
  ).run();

  // Trigger connection metrics calculation
  await calculateDailyConnectionMetrics(data.date, env);

  return new Response(JSON.stringify({ success: true, message: 'Daily context saved' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDailyContext(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  
  if (!date) {
    return new Response(JSON.stringify({ error: 'Date parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const stmt = env.DB.prepare('SELECT * FROM daily_context WHERE date = ?');
    const context = await stmt.bind(date).first();
    
    return new Response(JSON.stringify({ 
      success: true,
      data: context || null,
      message: context ? 'Context found' : 'No context found for this date'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching daily context:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function processMessagesWithContext(request: Request, env: any): Promise<Response> {
  const { messages }: { messages: Message[] } = await request.json();
  
  for (const message of messages) {
    // Get daily context for this message
    const contextStmt = env.DB.prepare('SELECT * FROM daily_context WHERE date = ?');
    const context = await contextStmt.bind(message.date).first();
    
    // Calculate response time
    const prevMessageStmt = env.DB.prepare(`
      SELECT date_time as timestamp FROM "texts-bc" 
      WHERE date(date_time) = ? AND sender != ? 
      ORDER BY timestamp DESC LIMIT 1
    `);
    const prevMessage = await prevMessageStmt.bind(message.date, message.sender).first();
    
    let responseTime = null;
    if (prevMessage) {
      const prevTime = new Date(prevMessage.timestamp).getTime();
      const currentTime = new Date(message.timestamp).getTime();
      responseTime = Math.round((currentTime - prevTime) / (1000 * 60)); // minutes
    }

    // Enhanced sentiment analysis considering context
    const sentimentScore = await analyzeContextualSentiment(message, context, env);
    
    // Store message with enhanced data
    const insertStmt = env.DB.prepare(`
      INSERT INTO contextual_messages 
      (date, timestamp, sender, content, message_length, sentiment_score, 
       emotional_intensity, response_time_minutes, conversation_thread_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await insertStmt.bind(
      message.date,
      message.timestamp,
      message.sender,
      message.content,
      message.content.length,
      sentimentScore.sentiment,
      sentimentScore.intensity,
      responseTime,
      message.conversation_thread_id
    ).run();
  }

  return new Response(JSON.stringify({ success: true, processed: messages.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function analyzeContextualSentiment(message: Message, context: any, env: any) {
  // Enhanced sentiment analysis that considers physical context
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze this message considering the relationship context. 
          Physical Status: ${context?.physical_status || 'unknown'}
          Relationship Satisfaction: ${context?.relationship_satisfaction || 'unknown'}/10
          
          Return JSON with:
          - sentiment: number from -1 (very negative) to 1 (very positive)
          - intensity: emotional intensity from 0 to 1
          - contextual_interpretation: how physical context affects meaning`
        },
        {
          role: 'user',
          content: message.content
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200
    }),
  });

  const result = await openaiResponse.json();
  const analysis = JSON.parse(result.choices[0].message.content);
  
  return {
    sentiment: analysis.sentiment,
    intensity: analysis.intensity,
    interpretation: analysis.contextual_interpretation
  };
}

async function logRelationshipEvent(request: Request, env: any): Promise<Response> {
  const event: RelationshipEvent = await request.json();
  
  try {
    // Get daily context for this date
    const contextStmt = env.DB.prepare('SELECT id FROM daily_context WHERE date = ?');
    const context = await contextStmt.bind(event.date).first();
    
    const stmt = env.DB.prepare(`
      INSERT INTO relationship_events 
      (date, event_type, title, description, impact_score, resolution_status, daily_context_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      event.date,
      event.event_type,
      event.title,
      event.description || null,
      event.severity || event.positivity || 0,
      'pending', // default status
      context?.id || null
    ).run();
    
    return new Response(JSON.stringify({ success: true, message: 'Event logged successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error logging event:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function performContextualAnalysis(request: Request, env: any): Promise<Response> {
  const { query, date_range, analysis_type }: ContextualAnalysisRequest = await request.json();
  
  // Gather contextual data for the specified range
  const dateCondition = date_range 
    ? `WHERE date BETWEEN '${date_range.start}' AND '${date_range.end}'`
    : `WHERE date >= date('now', '-30 days')`;

  // Get daily contexts
  const contextsStmt = env.DB.prepare(`
    SELECT * FROM daily_context ${dateCondition} ORDER BY date
  `);
  const contexts = await contextsStmt.all();

  // Get messages with context
  const messagesStmt = env.DB.prepare(`
    SELECT m.*, dc.physical_status, dc.relationship_satisfaction
    FROM "texts-bc" m
    LEFT JOIN daily_context dc ON m.date = dc.date
    ${dateCondition.replace('WHERE', 'WHERE m.')}
    ORDER BY m.timestamp
  `);
  const messages = await messagesStmt.all();

  // Get relationship events
  const eventsStmt = env.DB.prepare(`
    SELECT * FROM relationship_events ${dateCondition} ORDER BY date
  `);
  const events = await eventsStmt.all();

  // Generate contextual insights using OpenAI
  const analysisPrompt = generateAnalysisPrompt(analysis_type, query, contexts.results, messages.results, events.results);
  
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert relationship intelligence analyst. Provide deep, contextual insights 
          that consider the interplay between physical presence, digital communication, and emotional dynamics.
          Be specific, actionable, and brutally honest in your analysis.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 2000
    }),
  });

  const result = await openaiResponse.json();
  const analysis = result.choices[0].message.content;

  return new Response(JSON.stringify({
    query,
    analysis_type,
    insights: analysis,
    data_points: {
      contexts_analyzed: contexts.results.length,
      messages_analyzed: messages.results.length,
      events_analyzed: events.results.length
    }
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function generateAnalysisPrompt(analysisType: string, query: string, contexts: any[], messages: any[], events: any[]): string {
  const baseContext = `
RELATIONSHIP DATA ANALYSIS REQUEST

Query: "${query}"
Analysis Type: ${analysisType}

DAILY CONTEXTS (${contexts.length} days):
${contexts.map(c => `${c.date}: ${c.physical_status} | Satisfaction: ${c.relationship_satisfaction}/10 | Energy: ${c.user_energy_level}/10`).join('\n')}

COMMUNICATION PATTERNS:
- Total Messages: ${messages.length}
- When Together: ${messages.filter(m => m.physical_status === 'together').length} messages
- When Apart: ${messages.filter(m => m.physical_status === 'apart').length} messages
- Average Sentiment: ${(messages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / messages.length).toFixed(2)}

RELATIONSHIP EVENTS (${events.length} events):
${events.map(e => `${e.date}: ${e.event_type} - ${e.title} (${e.severity ? `Severity: ${e.severity}/10` : `Positivity: ${e.positivity}/10`})`).join('\n')}
  `;

  switch (analysisType) {
    case 'pattern_recognition':
      return `${baseContext}

TASK: Identify hidden patterns in this relationship data. Look for:
1. How communication changes based on physical presence
2. Cyclical patterns in connection/distance
3. Triggers that lead to conflicts or breakthroughs
4. The relationship between external stressors and relationship health
5. Early warning signs of relationship drift

Provide specific, actionable insights with examples from the data.`;

    case 'communication_analysis':
      return `${baseContext}

TASK: Analyze communication effectiveness considering physical context:
1. How does message quality differ when together vs apart?
2. What communication patterns strengthen vs weaken connection?
3. How do response times correlate with relationship satisfaction?
4. Digital communication compensation during distance periods
5. Optimal communication strategies for this specific relationship

Provide tactical recommendations for improving communication.`;

    case 'relationship_health':
      return `${baseContext}

TASK: Assess current relationship health and trajectory:
1. Overall relationship health score (0-100) with reasoning
2. Strongest relationship assets and biggest vulnerabilities
3. Trend analysis: improving, declining, or volatile?
4. Risk factors requiring immediate attention
5. Growth opportunities and specific action items

Be brutally honest about areas needing improvement.`;

    default:
      return `${baseContext}

TASK: Provide comprehensive relationship intelligence addressing the user's specific query. 
Consider all available data points and their interconnections.`;
  }
}

async function calculateDailyConnectionMetrics(date: string, env: any): Promise<void> {
  // Get all relevant data for this date
  const contextStmt = env.DB.prepare('SELECT * FROM daily_context WHERE date = ?');
  const context = await contextStmt.bind(date).first();
  
  const messagesStmt = env.DB.prepare('SELECT * FROM "texts-bc" WHERE date(date_time) = ?');
  const messages = await messagesStmt.bind(date).all();
  
  const eventsStmt = env.DB.prepare('SELECT * FROM relationship_events WHERE date = ?');
  const events = await eventsStmt.bind(date).all();
  
  if (!context) return;

  // Calculate scores (0-100)
  const scores = {
    overall_health_score: calculateOverallConnectionScore(context, messages.results, events.results),
    communication_score: calculateCommunicationQuality(messages.results, context),
    emotional_score: calculateEmotionalIntimacy(messages.results, events.results, context),
    conflict_resolution_score: calculateConflictResolution(events.results),
    physical_presence_score: calculatePresenceScore(context)
  };

  // Store calculated metrics
  const insertStmt = env.DB.prepare(`
    INSERT OR REPLACE INTO connection_metrics 
    (date, daily_context_id, overall_health_score, communication_score, emotional_score,
     presence_score, trend_direction, ai_insights)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Determine trend direction
  const trend = scores.overall_health_score > 75 ? 'improving' : 
                scores.overall_health_score > 50 ? 'stable' : 'declining';
  
  await insertStmt.bind(
    date,
    context?.id || null, // daily_context_id
    scores.overall_health_score,
    scores.communication_score,
    scores.emotional_score,
    scores.physical_presence_score || 50, // presence_score
    trend, // trend_direction
    JSON.stringify({ // ai_insights
      message_count: messages.results.length,
      context: context,
      calculation_date: new Date().toISOString()
    })
  ).run();
}

function calculateOverallConnectionScore(context: any, messages: any[], events: any[]): number {
  let score = 50; // baseline

  // Physical presence bonus
  if (context.physical_status === 'together') {
    score += 20;
    score += (context.quality_time_rating || 5) * 3; // 0-30 bonus
  }

  // Relationship satisfaction impact
  if (context.relationship_satisfaction) {
    score += (context.relationship_satisfaction - 5) * 5; // -25 to +25
  }

  // Communication quality
  const avgSentiment = messages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / (messages.length || 1);
  score += avgSentiment * 15; // -15 to +15

  // Event impact
  const positiveEvents = events.filter(e => ['breakthrough', 'celebration', 'milestone'].includes(e.event_type));
  const negativeEvents = events.filter(e => ['conflict', 'trigger'].includes(e.event_type));
  
  score += positiveEvents.length * 10;
  score -= negativeEvents.length * 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateCommunicationQuality(messages: any[], context: any): number {
  if (messages.length === 0) return context.physical_status === 'together' ? 70 : 30;

  let score = 50;
  
  // Sentiment quality
  const avgSentiment = messages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / messages.length;
  score += avgSentiment * 30;
  
  // Message depth (longer messages often indicate deeper communication)
  const avgLength = messages.reduce((sum, m) => sum + m.message_length, 0) / messages.length;
  if (avgLength > 100) score += 15;
  else if (avgLength > 50) score += 10;
  
  // Response time (faster responses when apart indicate attention)
  if (context.physical_status === 'apart') {
    const avgResponseTime = messages
      .filter(m => m.response_time_minutes)
      .reduce((sum, m) => sum + m.response_time_minutes, 0) / messages.length;
    
    if (avgResponseTime < 30) score += 15;
    else if (avgResponseTime < 120) score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateEmotionalIntimacy(messages: any[], events: any[], context: any): number {
  let score = 50;

  // High-intimacy events
  const intimateEvents = events.filter(e => 
    ['breakthrough', 'reconnection'].includes(e.event_type) ||
    (e.event_type === 'celebration' && e.positivity >= 8)
  );
  score += intimateEvents.length * 20;

  // Emotional intensity in messages
  const avgIntensity = messages
    .filter(m => m.emotional_intensity)
    .reduce((sum, m) => sum + m.emotional_intensity, 0) / messages.length || 0;
  score += avgIntensity * 30;

  // Context factors
  if (context.relationship_satisfaction >= 8) score += 20;
  if (context.physical_status === 'together' && context.quality_time_rating >= 8) score += 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateConflictResolution(events: any[]): number {
  const conflicts = events.filter(e => e.event_type === 'conflict');
  if (conflicts.length === 0) return 80; // No conflicts is good

  const avgResolutionQuality = conflicts
    .filter(c => c.resolution_quality)
    .reduce((sum, c) => sum + c.resolution_quality, 0) / conflicts.length || 5;

  return Math.round(avgResolutionQuality * 10); // Convert 1-10 to 0-100
}

function calculatePresenceScore(context: any): number {
  if (context.physical_status === 'together') {
    return 70 + (context.quality_time_rating || 5) * 3;
  } else if (context.physical_status === 'partial') {
    return 40 + (context.hours_together || 2) * 5;
  } else {
    return 20; // Apart but can be compensated by other factors
  }
}

async function detectRelationshipPatterns(request: Request, env: any): Promise<Response> {
  const { days = 30 } = await request.json();
  
  try {
    // This would typically involve more complex pattern detection logic
    // For now, return a simple response
    return new Response(JSON.stringify({
      success: true,
      patterns: [],
      message: 'Pattern detection not yet implemented'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error detecting patterns:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getRelationshipDashboard(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30');
  
  // Get recent connection metrics
  const metricsStmt = env.DB.prepare(`
    SELECT * FROM connection_metrics 
    WHERE date >= date('now', '-${days} days')
    ORDER BY date DESC
  `);
  const metrics = await metricsStmt.all();

  // Get recent patterns
  const patternsStmt = env.DB.prepare(`
    SELECT * FROM pattern_recognition 
    WHERE last_observed >= date('now', '-7 days')
    ORDER BY confidence_score DESC
    LIMIT 5
  `);
  const patterns = await patternsStmt.all();

  // Calculate current health score
  const latestMetric = metrics.results[0];
  const healthScore = latestMetric?.overall_health_score || 50;

  // Trend analysis
  const trend = calculateTrend(metrics.results);

  return corsResponse(new Response(JSON.stringify({
    health_score: healthScore,
    trend,
    metrics: metrics.results,
    recent_patterns: patterns.results,
    insights: generateDashboardInsights(metrics.results, patterns.results)
  }), {
    headers: { 'Content-Type': 'application/json' },
  }));
}

function calculateTrend(metrics: any[]): string {
  if (metrics.length < 7) return 'insufficient_data';
  
  const recent = metrics.slice(0, 7).reduce((sum, m) => sum + m.overall_health_score, 0) / 7;
  const previous = metrics.slice(7, 14).reduce((sum, m) => sum + m.overall_health_score, 0) / 7;
  
  const difference = recent - previous;
  
  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

function generateDashboardInsights(metrics: any[], patterns: any[]): string[] {
  const insights = [];
  
  if (metrics.length > 0) {
    const latest = metrics[0];
    if (latest.overall_health_score > 80) {
      insights.push("🔥 Your relationship is in a strong phase - connection levels are high!");
    } else if (latest.overall_health_score < 50) {
      insights.push("⚠️ Connection levels need attention - consider focusing on quality time and communication.");
    }
  }

  patterns.forEach(pattern => {
    if (pattern.confidence_score > 0.8) {
      insights.push(`🔍 Pattern detected: ${pattern.pattern_name} - ${pattern.description}`);
    }
  });

  return insights;
}