// workers/agents/coaching-agent/index.ts
export interface Env {
  OPENAI_API_KEY: string;
  COACHING_KV: KVNamespace;
  USER_DATA_D1: D1Database;
  VECTORIZE_INDEX: VectorizeIndex;
}

export interface CoachingRequest {
  message: string;
  userContext: UserContext;
  confidence: number;
  secondaryAgents?: string[];
}

export interface CoachingResponse {
  agentType: string;
  response: string;
  confidence: number;
  supportingData?: any;
  nextSteps?: string[];
  relatedInsights?: string[];
  coachingStyle: 'strategic' | 'supportive' | 'direct' | 'exploratory';
  interventionType?: 'immediate' | 'short_term' | 'long_term';
}

class RelationshipCoachingAgent {
  private openaiKey: string;
  private kv: KVNamespace;
  private db: D1Database;
  private vectorize: VectorizeIndex;

  constructor(env: Env) {
    this.openaiKey = env.OPENAI_API_KEY;
    this.kv = env.COACHING_KV;
    this.db = env.USER_DATA_D1;
    this.vectorize = env.VECTORIZE_INDEX;
  }

  async processCoachingRequest(request: CoachingRequest): Promise<CoachingResponse> {
    try {
      // 1. Analyze coaching needs
      const coachingAnalysis = await this.analyzeCoachingNeeds(request.message, request.userContext);
      
      // 2. Retrieve relevant context from relationship history
      const relevantContext = await this.retrieveRelevantContext(request.message, request.userContext.userId);
      
      // 3. Generate personalized coaching response
      const coachingResponse = await this.generateCoachingResponse(
        request.message,
        request.userContext,
        relevantContext,
        coachingAnalysis
      );
      
      // 4. Extract actionable next steps
      const nextSteps = await this.extractActionableSteps(coachingResponse, request.userContext);
      
      // 5. Find related insights
      const relatedInsights = await this.findRelatedInsights(request.message, request.userContext.userId);

      return {
        agentType: 'coaching-agent',
        response: coachingResponse,
        confidence: this.calculateConfidence(request.userContext, relevantContext),
        supportingData: relevantContext,
        nextSteps,
        relatedInsights,
        coachingStyle: coachingAnalysis.style,
        interventionType: coachingAnalysis.interventionType
      };
    } catch (error) {
      console.error('Coaching agent error:', error);
      return this.generateFallbackCoaching(request.message);
    }
  }

  private async analyzeCoachingNeeds(
    message: string, 
    userContext: UserContext
  ): Promise<{
    style: 'strategic' | 'supportive' | 'direct' | 'exploratory';
    interventionType: 'immediate' | 'short_term' | 'long_term';
    primaryNeed: string;
    emotionalState: string;
  }> {
    const analysisPrompt = `Analyze this relationship coaching request to determine the optimal coaching approach.

USER CONTEXT:
- Relationship duration: ${this.getRelationshipDuration(userContext)}
- Health score: ${userContext.currentHealthScore || 'Unknown'}/10
- Communication style: ${userContext.communicationStyle}
- Primary concerns: ${userContext.primaryConcerns.join(', ') || 'None'}

USER MESSAGE: "${message}"

Determine:
1. COACHING STYLE needed:
   - strategic: Complex relationship planning, pattern breaking
   - supportive: Emotional support, reassurance, validation
   - direct: Clear action needed, tough love, reality check
   - exploratory: Self-discovery, understanding emotions/patterns

2. INTERVENTION TYPE:
   - immediate: Crisis, urgent response needed right now
   - short_term: Issue to resolve in days/weeks
   - long_term: Deep patterns requiring months of work

3. PRIMARY NEED: One sentence describing their core need
4. EMOTIONAL STATE: Their current emotional condition

Respond in JSON format:
{
  "style": "strategic|supportive|direct|exploratory",
  "interventionType": "immediate|short_term|long_term",
  "primaryNeed": "description",
  "emotionalState": "description"
}`;

    try {
      const response = await this.callOpenAI([
        { role: 'user', content: analysisPrompt }
      ], 'gpt-4o', 0.3, 300);

      return JSON.parse(response);
    } catch (error) {
      // Fallback analysis
      return {
        style: 'supportive',
        interventionType: 'short_term',
        primaryNeed: 'General relationship guidance',
        emotionalState: 'Seeking support'
      };
    }
  }

  private async retrieveRelevantContext(
    message: string, 
    userId: string
  ): Promise<any[]> {
    try {
      // Generate embedding for the user's message
      const embedding = await this.generateEmbedding(message);
      
      // Search for similar conversations/contexts
      const vectorResults = await this.vectorize.query(embedding, {
        topK: 5,
        returnMetadata: true,
        filter: { userId }
      });

      // Also get recent high-impact conversations
      const recentImportantQuery = `
        SELECT content, sender, timestamp, sentiment_score, emotional_tags
        FROM messages 
        WHERE user_id = ? 
        AND (sentiment_score < -0.5 OR sentiment_score > 0.7 OR emotional_tags LIKE '%conflict%' OR emotional_tags LIKE '%love%')
        ORDER BY timestamp DESC 
        LIMIT 10
      `;
      
      const recentImportant = await this.db.prepare(recentImportantQuery).bind(userId).all();

      return [
        ...vectorResults.matches.map(match => match.metadata),
        ...recentImportant.results
      ];
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  private async generateCoachingResponse(
    message: string,
    userContext: UserContext,
    relevantContext: any[],
    analysis: any
  ): Promise<string> {
    // Use the Ultimate Relationship Intelligence Coach prompt
    return await this.generateUltimateCoachingResponse(message, userContext, relevantContext, analysis);
  }

  private async generateUltimateCoachingResponse(
    message: string,
    userContext: UserContext,
    relevantContext: any[],
    analysis: any
  ): Promise<string> {
    // Build evidence from relevant context with richer details
    const evidenceContext = relevantContext.slice(0, 5).map((ctx, index) => 
      `Evidence ${index + 1} (${new Date(ctx.timestamp).toLocaleDateString()}): "${ctx.content}" (Sender: ${ctx.sender}, Sentiment: ${ctx.sentimentScore?.toFixed(2) || 'N/A'})`
    ).join('\n');

    const ultimateCoachPrompt = `You are the Ultimate Relationship Intelligence Coach - an AI trained on intimate communication data with the emotional intelligence of the world's best therapists combined with the pattern recognition of an advanced data scientist.

You have access to complete conversation history through RAG (Retrieval-Augmented Generation). Your purpose is to help users see their relationship with radical clarity, develop profound self-awareness, and navigate complex emotional patterns with both compassion and strategic precision.

## Your Core Identity & Mission

You are **Truth with Love** personified - delivering surgical insights wrapped in warmth and understanding. You see what others miss, speak what others avoid, and guide with both honesty and heart.

**Your Ultimate Goal**: Help users see truth with love and grow from it.

## Your Response Format

Always structure responses as:

### 1. **Insight Summary**
Name the core pattern or dynamic you've identified. Be specific and bold.

### 2. **Supporting Evidence**
Include 2-3 specific message excerpts or conversation patterns from the RAG data that prove your point. Always explain WHY this evidence matters.

### 3. **Coaching Questions**
Offer 2-3 powerful questions that prompt deeper self-reflection and awareness.

### 4. **Suggested Next Step**
One specific, actionable practice or mindset shift they can implement immediately.

## Key Relationship Dynamics to Watch For

- **Pursuit-Distance Cycles**: One chases, one withdraws
- **Emotional Labor Imbalances**: Unequal investment in relationship maintenance
- **Conflict Avoidance vs. Engagement**: How they handle difficult conversations
- **Support-Seeking vs. Support-Giving**: Reciprocity in emotional care
- **Future-Planning Energy**: Investment in shared dreams and goals
- **Stress Spillover**: How external pressures affect their dynamic
- **Repair Attempt Success**: How well they recover from disconnection

Your mission is to help them see everything with radical clarity and compassionate truth.`;

    const userPrompt = `## Current Situation
USER QUERY: "${message}"

## Relationship Context
- Partner: ${userContext.partnerName || 'Partner'}
- Relationship Duration: ${this.getRelationshipDuration(userContext)}
- Communication Style: ${userContext.communicationStyle}
- Current Health Score: ${userContext.currentHealthScore || 'Not calculated'}/10
- Primary Concerns: ${userContext.primaryConcerns.join(', ') || 'None identified'}
- Coaching Style Needed: ${analysis.style}
- Primary Need: ${analysis.primaryNeed}
- Emotional State: ${analysis.emotionalState}

## Relevant Conversation History
${evidenceContext}

## Your Analysis Focus
Based on the user's query and relationship context, provide coaching using your Ultimate Relationship Intelligence framework:

1. **Insight Summary**: Identify the core pattern or dynamic (be specific and bold)
2. **Supporting Evidence**: Reference specific messages from the history above and explain WHY this evidence matters
3. **Coaching Questions**: 2-3 powerful reflection questions
4. **Suggested Next Step**: One specific, actionable practice they can implement

Remember: Be radically honest but emotionally attuned. Use their actual conversation data as evidence. This isn't generic advice - it's surgical relationship intelligence based on their unique dynamic.`;

    return await this.callOpenAI([
      { role: 'system', content: ultimateCoachPrompt },
      { role: 'user', content: userPrompt }
    ], 'gpt-4o', 0.7, 800);
  }

  private getCoachingSystemPrompt(style: string, userContext: UserContext): string {
    const basePrompt = `You are an elite relationship coach combining the research-backed insights of John Gottman, the emotionally-focused therapy of Sue Johnson, and the transformational wisdom of Esther Perel.

USER PROFILE:
- Relationship duration: ${this.getRelationshipDuration(userContext)}
- Partner: ${userContext.partnerName || 'Partner'}
- Communication style: ${userContext.communicationStyle}
- Health score: ${userContext.currentHealthScore || 'Not assessed'}/10`;

    const stylePrompts = {
      strategic: `
STRATEGIC COACHING APPROACH:
- Focus on long-term relationship architecture and systematic change
- Identify root patterns, not just surface symptoms  
- Provide clear action plans with measurable outcomes
- Challenge them to see bigger patterns and take strategic action
- Reference research and proven relationship principles`,

      supportive: `
SUPPORTIVE COACHING APPROACH:
- Validate their feelings while guiding toward growth
- Build confidence and emotional safety
- Help them process emotions before moving to action
- Encourage self-compassion while maintaining accountability
- Focus on their strengths and past successes`,

      direct: `
DIRECT COACHING APPROACH:
- Give tough love with surgical precision
- Name what they're avoiding or not seeing clearly
- Cut through excuses and self-deception with compassion
- Provide clear, non-negotiable action steps
- Hold them accountable to their own stated values and goals`,

      exploratory: `
EXPLORATORY COACHING APPROACH:
- Ask powerful questions that reveal new insights
- Help them discover their own answers through guided reflection
- Explore underlying beliefs, fears, and desires
- Connect current patterns to deeper emotional themes
- Support self-discovery while providing gentle guidance`
    };

    return basePrompt + '\n' + stylePrompts[style as keyof typeof stylePrompts];
  }

  private async extractActionableSteps(
    coachingResponse: string,
    userContext: UserContext
  ): Promise<string[]> {
    const extractPrompt = `Extract 2-3 specific, actionable next steps from this relationship coaching response. Each step should be:
- Concrete and specific (not vague advice)
- Something they can do within the next 1-7 days
- Focused on their behavior/actions (what they can control)

COACHING RESPONSE:
"${coachingResponse}"

Return as a JSON array of strings. Example format:
["Have a 20-minute conversation with your partner about X tonight", "Write down 3 specific examples of Y", "Practice Z technique during your next interaction"]`;

    try {
      const response = await this.callOpenAI([
        { role: 'user', content: extractPrompt }
      ], 'gpt-4o', 0.3, 200);

      const steps = JSON.parse(response);
      return Array.isArray(steps) ? steps.slice(0, 3) : [];
    } catch (error) {
      // Fallback steps based on common coaching themes
      return [
        'Reflect on the insights shared and identify one pattern to focus on',
        'Have an honest conversation with your partner about what you discovered',
        'Practice the recommended approach in your next interaction'
      ];
    }
  }

  private async findRelatedInsights(
    message: string,
    userId: string
  ): Promise<string[]> {
    try {
      // Find related patterns or insights from past coaching sessions
      const relatedQuery = `
        SELECT agent_response, confidence, created_at
        FROM user_interactions 
        WHERE user_id = ? 
        AND agent_type LIKE '%coaching%' 
        AND confidence > 0.7
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      const related = await this.db.prepare(relatedQuery).bind(userId).all();
      
      if (related.results && related.results.length > 0) {
        return related.results.map((r: any) => 
          `Previous insight (${new Date(r.created_at).toLocaleDateString()}): ${r.agent_response.substring(0, 120)}...`
        );
      }
    } catch (error) {
      console.error('Error finding related insights:', error);
    }
    
    return [];
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private calculateConfidence(userContext: UserContext, relevantContext: any[]): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on available context
    if (relevantContext.length > 3) confidence += 0.1;
    if (userContext.currentHealthScore) confidence += 0.05;
    if (userContext.relationshipStartDate) confidence += 0.05;
    if (userContext.primaryConcerns.length > 0) confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private getRelationshipDuration(userContext: UserContext): string {
    if (!userContext.relationshipStartDate) return 'Unknown duration';
    
    const start = new Date(userContext.relationshipStartDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }

  private generateFallbackCoaching(message: string): CoachingResponse {
    return {
      agentType: 'coaching-agent-fallback',
      response: `I hear that you're looking for guidance about your relationship. While I gather more context about your specific situation, let me offer this: relationships thrive on intentional communication and mutual understanding. 

What specific outcome are you hoping for in this situation? Sometimes the clarity comes from naming exactly what you want to happen next.

The fact that you're seeking guidance shows you care about your relationship - that's already a strength to build on.`,
      confidence: 0.6,
      nextSteps: [
        'Clarify what specific outcome you want from this situation',
        'Identify one small action you can take today',
        'Consider what your partner might be experiencing right now'
      ],
      relatedInsights: [],
      coachingStyle: 'supportive',
      interventionType: 'short_term'
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
      const coachingRequest: CoachingRequest = await request.json();
      
      if (!coachingRequest.message || !coachingRequest.userContext) {
        return new Response('Missing required fields', { status: 400 });
      }

      const coach = new RelationshipCoachingAgent(env);
      const response = await coach.processCoachingRequest(coachingRequest);
      
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Coaching worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
};

// workers/agents/coaching-agent/wrangler.toml
name = "unmask-coaching-agent"
main = "index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.kv_namespaces]]
binding = "COACHING_KV"
id = "your-coaching-kv-namespace-id"

[[env.production.d1_databases]]
binding = "USER_DATA_D1"
database_name = "unmask-production"
database_id = "your-d1-database-id"

[[env.production.vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "unmask-relationship-vectors"

[env.development]
vars = { ENVIRONMENT = "development" }

[[env.development.kv_namespaces]]
binding = "COACHING_KV"
id = "your-dev-coaching-kv-namespace-id"

[[env.development.d1_databases]]
binding = "USER_DATA_D1"
database_name = "unmask-development"
database_id = "your-dev-d1-database-id"

[[env.development.vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "unmask-relationship-vectors-dev"