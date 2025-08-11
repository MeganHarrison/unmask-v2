// workers/agents/memory-agent/index.ts
export interface Env {
  OPENAI_API_KEY: string;
  MEMORY_KV: KVNamespace;
  USER_DATA_D1: D1Database;
  VECTORIZE_INDEX: VectorizeIndex;
}

export interface MemoryRequest {
  userId: string;
  queryType: 'search' | 'timeline' | 'patterns' | 'context' | 'insights';
  query?: string;
  timeframe?: {
    start?: string;
    end?: string;
  };
  filters?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    sender?: 'user' | 'partner';
    emotionalTags?: string[];
    conflictRelated?: boolean;
  };
  limit?: number;
  includeContext?: boolean;
}

export interface MemoryResponse {
  agentType: string;
  results: MemoryResult[];
  totalCount: number;
  insights?: string[];
  timeline?: TimelineEvent[];
  patterns?: PatternInsight[];
  confidence: number;
  searchSummary?: string;
}

export interface MemoryResult {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'partner';
  sentimentScore: number;
  emotionalTags: string[];
  context: {
    conversationId?: string;
    threadLength?: number;
    relatedMessages?: MemoryResult[];
  };
  relevanceScore?: number;
}

export interface TimelineEvent {
  date: string;
  type: 'high_connection' | 'conflict' | 'milestone' | 'pattern_shift' | 'emotional_peak';
  title: string;
  description: string;
  healthScore?: number;
  keyMessages: string[];
  insights: string[];
}

export interface PatternInsight {
  type: 'communication_frequency' | 'sentiment_trend' | 'response_time' | 'conflict_cycle' | 'intimacy_level';
  title: string;
  description: string;
  trend: 'improving' | 'declining' | 'stable' | 'cyclical';
  confidence: number;
  timeframe: string;
  supportingData: any[];
}

class RelationshipMemoryAgent {
  private openaiKey: string;
  private kv: KVNamespace;
  private db: D1Database;
  private vectorize: VectorizeIndex;

  constructor(env: Env) {
    this.openaiKey = env.OPENAI_API_KEY;
    this.kv = env.MEMORY_KV;
    this.db = env.USER_DATA_D1;
    this.vectorize = env.VECTORIZE_INDEX;
  }

  async processMemoryRequest(request: MemoryRequest): Promise<MemoryResponse> {
    try {
      switch (request.queryType) {
        case 'search':
          return await this.performSemanticSearch(request);
        case 'timeline':
          return await this.generateTimeline(request);
        case 'patterns':
          return await this.analyzePatterns(request);
        case 'context':
          return await this.retrieveContext(request);
        case 'insights':
          return await this.generateInsights(request);
        default:
          throw new Error(`Unknown query type: ${request.queryType}`);
      }
    } catch (error) {
      console.error('Memory agent error:', error);
      return this.generateFallbackResponse(request);
    }
  }

  private async performSemanticSearch(request: MemoryRequest): Promise<MemoryResponse> {
    const { userId, query, timeframe, filters, limit = 10 } = request;

    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query || '');

    // Perform vector search
    const vectorResults = await this.vectorize.query(queryEmbedding, {
      topK: limit * 2, // Get more results to filter
      returnMetadata: true,
      filter: {
        userId,
        ...(timeframe?.start && { timestamp_gte: timeframe.start }),
        ...(timeframe?.end && { timestamp_lte: timeframe.end }),
        ...(filters?.sender && { sender: filters.sender }),
        ...(filters?.sentiment && { sentiment_category: filters.sentiment })
      }
    });

    // Enrich results with database context
    const enrichedResults = await this.enrichWithContext(vectorResults.matches, request.includeContext);

    // Generate search summary using OpenAI
    const searchSummary = await this.generateSearchSummary(query || '', enrichedResults);

    // Extract insights from search results
    const insights = await this.extractSearchInsights(enrichedResults, query || '');

    return {
      agentType: 'memory-agent',
      results: enrichedResults.slice(0, limit),
      totalCount: vectorResults.count,
      insights,
      confidence: this.calculateSearchConfidence(vectorResults.matches, query || ''),
      searchSummary
    };
  }

  private async generateTimeline(request: MemoryRequest): Promise<MemoryResponse> {
    const { userId, timeframe } = request;
    
    // Get all messages in timeframe
    const timelineQuery = `
      SELECT 
        m.*,
        DATE(m.timestamp) as message_date,
        COUNT(*) OVER (PARTITION BY DATE(m.timestamp)) as daily_count,
        AVG(m.sentiment_score) OVER (PARTITION BY DATE(m.timestamp)) as daily_sentiment
      FROM messages m
      WHERE m.user_id = ?
      ${timeframe?.start ? 'AND m.timestamp >= ?' : ''}
      ${timeframe?.end ? 'AND m.timestamp <= ?' : ''}
      ORDER BY m.timestamp ASC
    `;

    const params = [userId];
    if (timeframe?.start) params.push(timeframe.start);
    if (timeframe?.end) params.push(timeframe.end);

    const timelineData = await this.db.prepare(timelineQuery).bind(...params).all();
    
    // Process timeline data into events
    const timelineEvents = await this.processTimelineData(timelineData.results || []);
    
    // Generate timeline insights
    const insights = await this.generateTimelineInsights(timelineEvents);

    return {
      agentType: 'memory-agent',
      results: [],
      totalCount: timelineEvents.length,
      timeline: timelineEvents,
      insights,
      confidence: 0.85
    };
  }

  private async analyzePatterns(request: MemoryRequest): Promise<MemoryResponse> {
    const { userId, timeframe, limit = 5 } = request;

    // Analyze different pattern types
    const patternAnalyses = await Promise.all([
      this.analyzeCommunicationFrequency(userId, timeframe),
      this.analyzeSentimentTrends(userId, timeframe),
      this.analyzeResponseTimes(userId, timeframe),
      this.analyzeConflictCycles(userId, timeframe),
      this.analyzeIntimacyLevels(userId, timeframe)
    ]);

    const patterns = patternAnalyses.filter(p => p !== null).slice(0, limit);
    
    // Generate overall pattern insights
    const insights = await this.generatePatternInsights(patterns);

    return {
      agentType: 'memory-agent',
      results: [],
      totalCount: patterns.length,
      patterns,
      insights,
      confidence: 0.9
    };
  }

  private async retrieveContext(request: MemoryRequest): Promise<MemoryResponse> {
    const { userId, query, limit = 20 } = request;

    // Get recent conversations for context
    const contextQuery = `
      SELECT m.*, 
        LAG(m.content, 1) OVER (ORDER BY m.timestamp) as previous_message,
        LEAD(m.content, 1) OVER (ORDER BY m.timestamp) as next_message
      FROM messages m
      WHERE m.user_id = ?
      ORDER BY m.timestamp DESC
      LIMIT ?
    `;

    const contextData = await this.db.prepare(contextQuery).bind(userId, limit).all();
    
    // Convert to memory results format
    const results = (contextData.results || []).map(this.dbRowToMemoryResult);
    
    // Generate contextual insights
    const insights = await this.generateContextualInsights(results);

    return {
      agentType: 'memory-agent',
      results,
      totalCount: results.length,
      insights,
      confidence: 0.8
    };
  }

  private async generateInsights(request: MemoryRequest): Promise<MemoryResponse> {
    const { userId, timeframe } = request;

    // Get comprehensive data for insight generation
    const insightQuery = `
      SELECT 
        COUNT(*) as total_messages,
        AVG(sentiment_score) as avg_sentiment,
        COUNT(CASE WHEN sentiment_score > 0.5 THEN 1 END) as positive_messages,
        COUNT(CASE WHEN sentiment_score < -0.5 THEN 1 END) as negative_messages,
        COUNT(CASE WHEN sender = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN sender = 'partner' THEN 1 END) as partner_messages,
        MIN(timestamp) as first_message,
        MAX(timestamp) as last_message
      FROM messages 
      WHERE user_id = ?
      ${timeframe?.start ? 'AND timestamp >= ?' : ''}
      ${timeframe?.end ? 'AND timestamp <= ?' : ''}
    `;

    const params = [userId];
    if (timeframe?.start) params.push(timeframe.start);
    if (timeframe?.end) params.push(timeframe.end);

    const statsData = await this.db.prepare(insightQuery).bind(...params).first();
    
    // Generate AI-powered insights
    const insights = await this.generateAIInsights(statsData, userId);

    return {
      agentType: 'memory-agent',
      results: [],
      totalCount: 0,
      insights,
      confidence: 0.85
    };
  }

  private async enrichWithContext(
    vectorMatches: any[], 
    includeContext: boolean = false
  ): Promise<MemoryResult[]> {
    const results: MemoryResult[] = [];

    for (const match of vectorMatches) {
      const metadata = match.metadata;
      
      let relatedMessages: MemoryResult[] = [];
      
      if (includeContext && metadata.conversationId) {
        // Get surrounding messages in the same conversation
        const contextQuery = `
          SELECT * FROM messages 
          WHERE conversation_id = ? 
          AND timestamp BETWEEN ? AND ?
          ORDER BY timestamp ASC
          LIMIT 5
        `;
        
        const contextStart = new Date(new Date(metadata.timestamp).getTime() - 5 * 60 * 1000).toISOString(); // 5 minutes before
        const contextEnd = new Date(new Date(metadata.timestamp).getTime() + 5 * 60 * 1000).toISOString(); // 5 minutes after
        
        const contextData = await this.db.prepare(contextQuery)
          .bind(metadata.conversationId, contextStart, contextEnd)
          .all();
        
        relatedMessages = (contextData.results || []).map(this.dbRowToMemoryResult);
      }

      results.push({
        id: metadata.id,
        content: metadata.content,
        timestamp: metadata.timestamp,
        sender: metadata.sender,
        sentimentScore: metadata.sentiment_score || 0,
        emotionalTags: metadata.emotional_tags ? metadata.emotional_tags.split(',') : [],
        context: {
          conversationId: metadata.conversationId,
          threadLength: metadata.threadLength,
          relatedMessages
        },
        relevanceScore: match.score
      });
    }

    return results;
  }

  private async processTimelineData(messages: any[]): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];
    
    // Group messages by day
    const dailyGroups = this.groupMessagesByDay(messages);
    
    for (const [date, dayMessages] of Object.entries(dailyGroups)) {
      const avgSentiment = dayMessages.reduce((sum: number, msg: any) => sum + (msg.sentiment_score || 0), 0) / dayMessages.length;
      const messageCount = dayMessages.length;
      
      // Determine event type based on patterns
      let eventType: TimelineEvent['type'] = 'milestone';
      let title = '';
      let description = '';
      
      if (avgSentiment > 0.7) {
        eventType = 'high_connection';
        title = 'High Connection Day';
        description = `Strong positive communication with ${messageCount} messages`;
      } else if (avgSentiment < -0.3) {
        eventType = 'conflict';
        title = 'Tension Period';
        description = `Challenging communication patterns detected`;
      } else if (messageCount > 50) {
        eventType = 'emotional_peak';
        title = 'High Activity Day';
        description = `Intense communication with ${messageCount} exchanges`;
      } else {
        continue; // Skip unremarkable days
      }

      // Get key messages from this day
      const keyMessages = dayMessages
        .sort((a: any, b: any) => Math.abs(b.sentiment_score || 0) - Math.abs(a.sentiment_score || 0))
        .slice(0, 3)
        .map((msg: any) => msg.content.substring(0, 100) + '...');

      events.push({
        date,
        type: eventType,
        title,
        description,
        healthScore: this.calculateDailyHealthScore(dayMessages),
        keyMessages,
        insights: await this.generateEventInsights(dayMessages, eventType)
      });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private async generateSearchSummary(query: string, results: MemoryResult[]): Promise<string> {
    if (results.length === 0) return `No messages found matching "${query}".`;

    const prompt = `Analyze these search results for the query "${query}" and provide a concise summary.

SEARCH RESULTS:
${results.slice(0, 5).map((r, i) => 
  `${i + 1}. [${r.timestamp}] ${r.sender}: ${r.content.substring(0, 150)}...`
).join('\n')}

Provide a 2-3 sentence summary of what these results reveal about this topic in their relationship.`;

    return await this.callOpenAI([
      { role: 'user', content: prompt }
    ], 'gpt-4o', 0.7, 200);
  }

  private async generateAIInsights(statsData: any, userId: string): Promise<string[]> {
    const prompt = `Based on this relationship communication data, generate 3-5 key insights.

RELATIONSHIP STATS:
- Total messages: ${statsData.total_messages}
- Average sentiment: ${statsData.avg_sentiment?.toFixed(2) || 'N/A'}
- Positive messages: ${statsData.positive_messages} (${((statsData.positive_messages / statsData.total_messages) * 100).toFixed(1)}%)
- Negative messages: ${statsData.negative_messages} (${((statsData.negative_messages / statsData.total_messages) * 100).toFixed(1)}%)
- User vs Partner balance: ${statsData.user_messages}:${statsData.partner_messages}
- Communication span: ${statsData.first_message} to ${statsData.last_message}

Generate insights as a JSON array of strings. Each insight should be:
1. Specific and actionable
2. Based on the actual data patterns
3. Focused on relationship health and communication

Example format: ["Insight 1", "Insight 2", "Insight 3"]`;

    try {
      const response = await this.callOpenAI([
        { role: 'user', content: prompt }
      ], 'gpt-4o', 0.7, 400);

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [
        'Communication patterns analyzed across relationship timeline',
        'Sentiment trends identified for relationship health assessment',
        'Message frequency and response patterns evaluated'
      ];
    }
  }

  private async analyzeCommunicationFrequency(
    userId: string, 
    timeframe?: { start?: string; end?: string }
  ): Promise<PatternInsight | null> {
    const query = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as daily_count,
        AVG(COUNT(*)) OVER (ORDER BY DATE(timestamp) ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_avg
      FROM messages 
      WHERE user_id = ?
      ${timeframe?.start ? 'AND timestamp >= ?' : ''}
      ${timeframe?.end ? 'AND timestamp <= ?' : ''}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 30
    `;

    const params = [userId];
    if (timeframe?.start) params.push(timeframe.start);
    if (timeframe?.end) params.push(timeframe.end);

    const data = await this.db.prepare(query).bind(...params).all();
    const results = data.results || [];

    if (results.length < 7) return null;

    // Calculate trend
    const recent = results.slice(0, 7);
    const older = results.slice(7, 14);
    const recentAvg = recent.reduce((sum: number, row: any) => sum + row.daily_count, 0) / recent.length;
    const olderAvg = older.reduce((sum: number, row: any) => sum + row.daily_count, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: PatternInsight['trend'] = 'stable';
    if (change > 15) trend = 'improving';
    else if (change < -15) trend = 'declining';

    return {
      type: 'communication_frequency',
      title: 'Communication Frequency Pattern',
      description: `Average ${recentAvg.toFixed(1)} messages per day recently, ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% from previous week`,
      trend,
      confidence: 0.85,
      timeframe: `Last ${results.length} days`,
      supportingData: results
    };
  }

  private async analyzeSentimentTrends(
    userId: string, 
    timeframe?: { start?: string; end?: string }
  ): Promise<PatternInsight | null> {
    const query = `
      SELECT 
        DATE(timestamp) as date,
        AVG(sentiment_score) as daily_sentiment,
        COUNT(*) as message_count
      FROM messages 
      WHERE user_id = ? AND sentiment_score IS NOT NULL
      ${timeframe?.start ? 'AND timestamp >= ?' : ''}
      ${timeframe?.end ? 'AND timestamp <= ?' : ''}
      GROUP BY DATE(timestamp)
      HAVING COUNT(*) >= 3
      ORDER BY date DESC
      LIMIT 30
    `;

    const params = [userId];
    if (timeframe?.start) params.push(timeframe.start);
    if (timeframe?.end) params.push(timeframe.end);

    const data = await this.db.prepare(query).bind(...params).all();
    const results = data.results || [];

    if (results.length < 7) return null;

    // Calculate sentiment trend
    const recent = results.slice(0, 7);
    const older = results.slice(7, 14);
    const recentAvg = recent.reduce((sum: number, row: any) => sum + row.daily_sentiment, 0) / recent.length;
    const olderAvg = older.reduce((sum: number, row: any) => sum + row.daily_sentiment, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    let trend: PatternInsight['trend'] = 'stable';
    if (change > 0.1) trend = 'improving';
    else if (change < -0.1) trend = 'declining';

    return {
      type: 'sentiment_trend',
      title: 'Emotional Sentiment Trend',
      description: `Recent sentiment: ${recentAvg.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)} from previous week)`,
      trend,
      confidence: 0.8,
      timeframe: `Last ${results.length} days`,
      supportingData: results
    };
  }

  private async analyzeResponseTimes(
    userId: string, 
    timeframe?: { start?: string; end?: string }
  ): Promise<PatternInsight | null> {
    // This would analyze message timing patterns
    // Implementation depends on having conversation threading
    return null; // Placeholder for now
  }

  private async analyzeConflictCycles(
    userId: string, 
    timeframe?: { start?: string; end?: string }
  ): Promise<PatternInsight | null> {
    const query = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(CASE WHEN sentiment_score < -0.3 THEN 1 END) as negative_messages,
        COUNT(*) as total_messages,
        AVG(sentiment_score) as daily_sentiment
      FROM messages 
      WHERE user_id = ? AND sentiment_score IS NOT NULL
      ${timeframe?.start ? 'AND timestamp >= ?' : ''}
      ${timeframe?.end ? 'AND timestamp <= ?' : ''}
      GROUP BY DATE(timestamp)
      HAVING COUNT(*) >= 5
      ORDER BY date DESC
      LIMIT 60
    `;

    const params = [userId];
    if (timeframe?.start) params.push(timeframe.start);
    if (timeframe?.end) params.push(timeframe.end);

    const data = await this.db.prepare(query).bind(...params).all();
    const results = data.results || [];

    if (results.length < 14) return null;

    // Identify conflict days (high negative sentiment)
    const conflictDays = results.filter((row: any) => 
      row.daily_sentiment < -0.2 && (row.negative_messages / row.total_messages) > 0.3
    );

    if (conflictDays.length < 2) return null;

    return {
      type: 'conflict_cycle',
      title: 'Conflict Pattern Analysis',
      description: `${conflictDays.length} challenging days identified in the past ${results.length} days`,
      trend: conflictDays.length > results.length * 0.15 ? 'declining' : 'improving',
      confidence: 0.75,
      timeframe: `Last ${results.length} days`,
      supportingData: conflictDays
    };
  }

  private async analyzeIntimacyLevels(
    userId: string, 
    timeframe?: { start?: string; end?: string }
  ): Promise<PatternInsight | null> {
    // This would analyze intimacy indicators in messages
    // Implementation would look for emotional language, frequency patterns, etc.
    return null; // Placeholder for now
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  private async callOpenAI(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gpt-4o',
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private dbRowToMemoryResult = (row: any): MemoryResult => ({
    id: row.id,
    content: row.content,
    timestamp: row.timestamp,
    sender: row.sender,
    sentimentScore: row.sentiment_score || 0,
    emotionalTags: row.emotional_tags ? row.emotional_tags.split(',') : [],
    context: {
      conversationId: row.conversation_id,
      threadLength: row.thread_length
    }
  });

  private groupMessagesByDay(messages: any[]): Record<string, any[]> {
    return messages.reduce((groups, message) => {
      const date = new Date(message.timestamp).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private calculateDailyHealthScore(messages: any[]): number {
    const avgSentiment = messages.reduce((sum, msg) => sum + (msg.sentiment_score || 0), 0) / messages.length;
    const messageCount = messages.length;
    
    // Normalize to 1-10 scale
    let score = 5 + (avgSentiment * 3); // Base 5, sentiment can add/subtract up to 3
    
    // Adjust for communication frequency
    if (messageCount > 20) score += 0.5; // Bonus for high engagement
    if (messageCount < 5) score -= 0.5;   // Penalty for low engagement
    
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }

  private async generateEventInsights(messages: any[], eventType: string): Promise<string[]> {
    // Generate contextual insights based on event type and messages
    const insights = [];
    
    switch (eventType) {
      case 'high_connection':
        insights.push('Strong emotional resonance detected');
        insights.push('High engagement and positive communication');
        break;
      case 'conflict':
        insights.push('Communication challenges identified');
        insights.push('Opportunity for resolution and growth');
        break;
      case 'emotional_peak':
        insights.push('Intense communication period');
        insights.push('High emotional investment from both parties');
        break;
    }
    
    return insights;
  }

  private async extractSearchInsights(results: MemoryResult[], query: string): Promise<string[]> {
    if (results.length === 0) return ['No relevant conversations found for this topic'];
    
    const insights = [];
    
    // Analyze sentiment distribution
    const avgSentiment = results.reduce((sum, r) => sum + r.sentimentScore, 0) / results.length;
    if (avgSentiment > 0.3) {
      insights.push('Generally positive conversations about this topic');
    } else if (avgSentiment < -0.3) {
      insights.push('This topic tends to create tension in conversations');
    }
    
    // Analyze frequency
    const timeSpan = new Date(results[0].timestamp).getTime() - new Date(results[results.length - 1].timestamp).getTime();
    const days = timeSpan / (1000 * 60 * 60 * 24);
    if (days > 0) {
      const frequency = results.length / days;
      if (frequency > 1) {
        insights.push('This is a frequently discussed topic');
      } else if (frequency < 0.1) {
        insights.push('This topic comes up occasionally in conversations');
      }
    }
    
    return insights.slice(0, 3);
  }

  private async generateTimelineInsights(events: TimelineEvent[]): Promise<string[]> {
    const insights = [];
    
    const conflictEvents = events.filter(e => e.type === 'conflict').length;
    const connectionEvents = events.filter(e => e.type === 'high_connection').length;
    
    if (connectionEvents > conflictEvents * 2) {
      insights.push('Your relationship shows strong patterns of positive connection');
    } else if (conflictEvents > connectionEvents) {
      insights.push('Recent period shows some communication challenges to address');
    } else {
      insights.push('Balanced mix of connection and growth opportunities');
    }
    
    // Analyze health score trends
    const healthScores = events.filter(e => e.healthScore).map(e => e.healthScore!);
    if (healthScores.length > 1) {
      const trend = healthScores[0] - healthScores[healthScores.length - 1];
      if (trend > 1) {
        insights.push('Relationship health trending upward');
      } else if (trend < -1) {
        insights.push('Opportunity to focus on relationship health improvement');
      }
    }
    
    return insights;
  }

  private async generatePatternInsights(patterns: PatternInsight[]): Promise<string[]> {
    const insights = [];
    
    const improvingPatterns = patterns.filter(p => p.trend === 'improving').length;
    const decliningPatterns = patterns.filter(p => p.trend === 'declining').length;
    
    if (improvingPatterns > decliningPatterns) {
      insights.push('Multiple communication patterns are trending positively');
    } else if (decliningPatterns > improvingPatterns) {
      insights.push('Some communication patterns need attention and improvement');
    } else {
      insights.push('Communication patterns show stability with room for optimization');
    }
    
    // Highlight the strongest pattern
    const highConfidencePatterns = patterns.filter(p => p.confidence > 0.8);
    if (highConfidencePatterns.length > 0) {
      insights.push(`Strong pattern detected: ${highConfidencePatterns[0].title.toLowerCase()}`);
    }
    
    return insights;
  }

  private async generateContextualInsights(results: MemoryResult[]): Promise<string[]> {
    const insights = [];
    
    // Analyze recent communication patterns
    const recentCount = results.length;
    if (recentCount > 15) {
      insights.push('High recent communication activity');
    } else if (recentCount < 5) {
      insights.push('Lower recent communication frequency');
    }
    
    // Sentiment analysis
    const avgSentiment = results.reduce((sum, r) => sum + r.sentimentScore, 0) / results.length;
    if (avgSentiment > 0.3) {
      insights.push('Recent conversations have been generally positive');
    } else if (avgSentiment < -0.3) {
      insights.push('Recent conversations show some challenges');
    }
    
    return insights;
  }

  private calculateSearchConfidence(matches: any[], query: string): number {
    if (matches.length === 0) return 0.1;
    
    const avgScore = matches.reduce((sum, match) => sum + match.score, 0) / matches.length;
    const resultCount = Math.min(matches.length / 10, 1); // More results = higher confidence
    
    return Math.min(0.95, avgScore * 0.6 + resultCount * 0.3 + 0.1);
  }

  private generateFallbackResponse(request: MemoryRequest): MemoryResponse {
    return {
      agentType: 'memory-agent-fallback',
      results: [],
      totalCount: 0,
      insights: ['Unable to process memory request at this time'],
      confidence: 0.1
    };
  }
}

// Worker entry point
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const memoryRequest: MemoryRequest = await request.json();
      
      if (!memoryRequest.userId || !memoryRequest.queryType) {
        return new Response('Missing required fields', { status: 400 });
      }

      const memoryAgent = new RelationshipMemoryAgent(env);
      const response = await memoryAgent.processMemoryRequest(memoryRequest);
      
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Memory worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
};