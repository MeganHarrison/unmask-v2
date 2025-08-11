// workers/agents/orchestrator/index.ts
import { Ai } from '@cloudflare/ai';

export interface Env {
  AI: Ai;
  ANTHROPIC_API_KEY: string;
  ORCHESTRATOR_KV: KVNamespace;
  USER_CONTEXT_D1: D1Database;
}

// Intent Classification Types
export type UserIntent = 
  | 'IMMEDIATE_COACHING'      // "Help me respond to this text"
  | 'PATTERN_ANALYSIS'        // "How has our communication changed?"
  | 'CONFLICT_ANALYSIS'       // "Why do we keep fighting about money?"
  | 'EMOTIONAL_CHECK'         // "How is our relationship doing?"
  | 'HISTORICAL_INSIGHT'      // "Show me our best/worst periods"
  | 'PREDICTIVE_GUIDANCE'     // "What should I focus on this week?"
  | 'DATA_QUERY'              // "Find conversations about work stress"
  | 'RELATIONSHIP_HEALTH'     // "What's our current health score?"
  | 'ATTACHMENT_COACHING'     // "Help me understand my attachment style"
  | 'COMMUNICATION_TRAINING'  // "How can I communicate better?"

export interface AgentRoute {
  primary: string;
  secondary?: string[];
  confidence: number;
  reasoning: string;
}

export interface UserContext {
  userId: string;
  relationshipStartDate?: string;
  partnerName?: string;
  recentConversations: any[];
  currentHealthScore?: number;
  primaryConcerns: string[];
  communicationStyle: string;
  attachmentStyle?: string;
  lastInteraction: string;
}

export interface AgentResponse {
  agentType: string;
  response: string;
  confidence: number;
  supportingData?: any;
  nextSteps?: string[];
  relatedInsights?: string[];
}

class MasterOrchestrator {
  private ai: Ai;
  private anthropicKey: string;
  private kv: KVNamespace;
  private db: D1Database;

  constructor(env: Env) {
    this.ai = env.AI;
    this.anthropicKey = env.ANTHROPIC_API_KEY;
    this.kv = env.ORCHESTRATOR_KV;
    this.db = env.USER_CONTEXT_D1;
  }

  async processUserQuery(
    userId: string, 
    message: string, 
    conversationHistory: any[] = []
  ): Promise<AgentResponse> {
    try {
      // 1. Load user context
      const userContext = await this.loadUserContext(userId);
      
      // 2. Classify user intent
      const intent = await this.classifyIntent(message, userContext, conversationHistory);
      
      // 3. Route to appropriate agent
      const agentRoute = await this.routeToAgent(intent, message, userContext);
      
      // 4. Execute agent and get response
      const response = await this.executeAgent(agentRoute, message, userContext);
      
      // 5. Update user context
      await this.updateUserContext(userId, message, response);
      
      return response;
    } catch (error) {
      console.error('Orchestrator error:', error);
      return this.generateFallbackResponse(message);
    }
  }

  private async classifyIntent(
    message: string, 
    userContext: UserContext,
    conversationHistory: any[]
  ): Promise<UserIntent> {
    const prompt = `You are an expert relationship coach intent classifier. Analyze this user message and classify their intent.

USER CONTEXT:
- Relationship duration: ${userContext.relationshipStartDate ? this.calculateRelationshipDuration(userContext.relationshipStartDate) : 'Unknown'}
- Partner: ${userContext.partnerName || 'Unknown'}
- Recent health score: ${userContext.currentHealthScore || 'Not calculated'}
- Primary concerns: ${userContext.primaryConcerns.join(', ') || 'None identified'}
- Communication style: ${userContext.communicationStyle}
- Last interaction: ${userContext.lastInteraction}

RECENT CONVERSATION:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER MESSAGE: "${message}"

INTENT CATEGORIES:
1. IMMEDIATE_COACHING - Needs help with current situation, drafting responses, handling conflict
2. PATTERN_ANALYSIS - Wants to understand trends, changes, or patterns over time
3. CONFLICT_ANALYSIS - Analyzing specific fights, recurring issues, or relationship tension
4. EMOTIONAL_CHECK - General relationship health inquiry, mood check
5. HISTORICAL_INSIGHT - Looking for specific past conversations, periods, or events
6. PREDICTIVE_GUIDANCE - Wants recommendations for future actions or focus areas
7. DATA_QUERY - Searching for specific information from their relationship data
8. RELATIONSHIP_HEALTH - Asking about overall relationship metrics and scores
9. ATTACHMENT_COACHING - Questions about attachment styles, emotional needs, security
10. COMMUNICATION_TRAINING - Wants to improve communication skills or techniques

Respond with just the intent category (e.g., "IMMEDIATE_COACHING").`;

    const response = await this.callAnthropic(prompt);
    return this.parseIntent(response);
  }

  private async routeToAgent(
    intent: UserIntent, 
    message: string, 
    userContext: UserContext
  ): Promise<AgentRoute> {
    const routingMap: Record<UserIntent, AgentRoute> = {
      'IMMEDIATE_COACHING': {
        primary: 'coaching-agent',
        secondary: ['emotional-agent'],
        confidence: 0.95,
        reasoning: 'User needs immediate relationship guidance'
      },
      'PATTERN_ANALYSIS': {
        primary: 'pattern-agent',
        secondary: ['memory-agent', 'emotional-agent'],
        confidence: 0.9,
        reasoning: 'Analyzing communication and behavioral patterns'
      },
      'CONFLICT_ANALYSIS': {
        primary: 'conflict-agent',
        secondary: ['pattern-agent', 'coaching-agent'],
        confidence: 0.95,
        reasoning: 'Specialized conflict analysis and resolution needed'
      },
      'EMOTIONAL_CHECK': {
        primary: 'emotional-agent',
        secondary: ['pattern-agent'],
        confidence: 0.85,
        reasoning: 'Emotional intelligence and sentiment analysis'
      },
      'HISTORICAL_INSIGHT': {
        primary: 'memory-agent',
        secondary: ['pattern-agent'],
        confidence: 0.9,
        reasoning: 'Retrieving and analyzing historical data'
      },
      'PREDICTIVE_GUIDANCE': {
        primary: 'coaching-agent',
        secondary: ['pattern-agent', 'emotional-agent'],
        confidence: 0.8,
        reasoning: 'Forward-looking strategic relationship guidance'
      },
      'DATA_QUERY': {
        primary: 'memory-agent',
        secondary: [],
        confidence: 0.95,
        reasoning: 'Direct data retrieval and search'
      },
      'RELATIONSHIP_HEALTH': {
        primary: 'emotional-agent',
        secondary: ['pattern-agent'],
        confidence: 0.9,
        reasoning: 'Health metrics and relationship scoring'
      },
      'ATTACHMENT_COACHING': {
        primary: 'emotional-agent',
        secondary: ['coaching-agent'],
        confidence: 0.85,
        reasoning: 'Attachment style analysis and emotional coaching'
      },
      'COMMUNICATION_TRAINING': {
        primary: 'coaching-agent',
        secondary: ['pattern-agent'],
        confidence: 0.9,
        reasoning: 'Communication skill development and training'
      }
    };

    return routingMap[intent];
  }

  private async executeAgent(
    route: AgentRoute, 
    message: string, 
    userContext: UserContext
  ): Promise<AgentResponse> {
    const agentUrl = `https://unmask-${route.primary}.your-subdomain.workers.dev`;
    
    const payload = {
      message,
      userContext,
      confidence: route.confidence,
      secondaryAgents: route.secondary || []
    };

    try {
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Agent ${route.primary} failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error executing ${route.primary}:`, error);
      
      // Fallback to coaching agent for any failures
      if (route.primary !== 'coaching-agent') {
        return this.executeAgent(
          { primary: 'coaching-agent', confidence: 0.7, reasoning: 'Fallback execution' },
          message,
          userContext
        );
      }
      
      throw error;
    }
  }

  private async loadUserContext(userId: string): Promise<UserContext> {
    try {
      // Try cache first
      const cached = await this.kv.get(`user_context:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Load from database
      const query = `
        SELECT 
          u.relationship_start_date,
          u.partner_name,
          u.communication_style,
          u.attachment_style,
          u.last_interaction,
          rs.health_score as current_health_score,
          GROUP_CONCAT(c.concern_text) as concerns
        FROM users u
        LEFT JOIN relationship_scores rs ON rs.user_id = u.id 
          AND rs.created_at = (SELECT MAX(created_at) FROM relationship_scores WHERE user_id = u.id)
        LEFT JOIN user_concerns c ON c.user_id = u.id AND c.is_active = 1
        WHERE u.id = ?
        GROUP BY u.id
      `;

      const result = await this.db.prepare(query).bind(userId).first();
      
      if (!result) {
        // New user - create basic context
        return {
          userId,
          recentConversations: [],
          primaryConcerns: [],
          communicationStyle: 'unknown',
          lastInteraction: new Date().toISOString()
        };
      }

      const context: UserContext = {
        userId,
        relationshipStartDate: result.relationship_start_date,
        partnerName: result.partner_name,
        recentConversations: await this.loadRecentConversations(userId),
        currentHealthScore: result.current_health_score,
        primaryConcerns: result.concerns ? result.concerns.split(',') : [],
        communicationStyle: result.communication_style || 'unknown',
        attachmentStyle: result.attachment_style,
        lastInteraction: result.last_interaction || new Date().toISOString()
      };

      // Cache for 5 minutes
      await this.kv.put(`user_context:${userId}`, JSON.stringify(context), { expirationTtl: 300 });
      
      return context;
    } catch (error) {
      console.error('Error loading user context:', error);
      return {
        userId,
        recentConversations: [],
        primaryConcerns: [],
        communicationStyle: 'unknown',
        lastInteraction: new Date().toISOString()
      };
    }
  }

  private async loadRecentConversations(userId: string, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT sender, content, timestamp, sentiment_score
      FROM messages 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    const result = await this.db.prepare(query).bind(userId, limit).all();
    return result.results || [];
  }

  private async updateUserContext(
    userId: string, 
    userMessage: string, 
    agentResponse: AgentResponse
  ): Promise<void> {
    try {
      // Update last interaction
      await this.db.prepare(`
        UPDATE users 
        SET last_interaction = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(new Date().toISOString(), userId).run();

      // Log interaction for pattern analysis
      await this.db.prepare(`
        INSERT INTO user_interactions (user_id, user_message, agent_type, agent_response, confidence, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        userId, 
        userMessage, 
        agentResponse.agentType, 
        agentResponse.response,
        agentResponse.confidence
      ).run();

      // Invalidate cache
      await this.kv.delete(`user_context:${userId}`);
    } catch (error) {
      console.error('Error updating user context:', error);
    }
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }

  private parseIntent(response: string): UserIntent {
    const cleaned = response.trim().toUpperCase();
    const validIntents: UserIntent[] = [
      'IMMEDIATE_COACHING', 'PATTERN_ANALYSIS', 'CONFLICT_ANALYSIS',
      'EMOTIONAL_CHECK', 'HISTORICAL_INSIGHT', 'PREDICTIVE_GUIDANCE',
      'DATA_QUERY', 'RELATIONSHIP_HEALTH', 'ATTACHMENT_COACHING',
      'COMMUNICATION_TRAINING'
    ];

    for (const intent of validIntents) {
      if (cleaned.includes(intent)) {
        return intent;
      }
    }

    // Default fallback
    return 'IMMEDIATE_COACHING';
  }

  private calculateRelationshipDuration(startDate: string): string {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }

  private generateFallbackResponse(message: string): AgentResponse {
    return {
      agentType: 'orchestrator-fallback',
      response: `I understand you're looking for relationship guidance. While I process your request, let me help you think through this situation. Could you provide a bit more context about what's specifically on your mind right now?`,
      confidence: 0.5,
      nextSteps: [
        'Try rephrasing your question with more specific details',
        'Share what outcome you\'re hoping for',
        'Let me know if this is about a recent conversation or ongoing pattern'
      ]
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
      const { userId, message, conversationHistory } = await request.json();
      
      if (!userId || !message) {
        return new Response('Missing required fields', { status: 400 });
      }

      const orchestrator = new MasterOrchestrator(env);
      const response = await orchestrator.processUserQuery(userId, message, conversationHistory);
      
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
};