// Define UserIntent type
export type UserIntent = 
  | 'IMMEDIATE_COACHING'
  | 'PATTERN_ANALYSIS'
  | 'CONFLICT_ANALYSIS'
  | 'EMOTIONAL_CHECK'
  | 'HISTORICAL_INSIGHT'
  | 'PREDICTIVE_GUIDANCE'
  | 'DATA_QUERY'
  | 'RELATIONSHIP_HEALTH'
  | 'ATTACHMENT_COACHING'
  | 'COMMUNICATION_TRAINING';

// Define UserContext interface
export interface UserContext {
  currentHealthScore?: number;
  primaryConcerns: string[];
}

export interface IntentClassificationResult {
  intent: UserIntent;
  confidence: number;
  reasoning: string;
  keyPhrases: string[];
  emotionalContext: 'positive' | 'negative' | 'neutral' | 'mixed';
  urgency: 'low' | 'medium' | 'high';
}

export class IntentClassifier {
  private patterns: Record<UserIntent, string[]> = {
    'IMMEDIATE_COACHING': [
      'help me respond', 'what should I say', 'how do I handle',
      'just happened', 'right now', 'urgent', 'need advice',
      'don\'t know what to do', 'help me figure out'
    ],
    'PATTERN_ANALYSIS': [
      'how has', 'over time', 'changed', 'pattern', 'trend',
      'compared to', 'different now', 'used to', 'lately',
      'evolution', 'shift', 'development'
    ],
    'CONFLICT_ANALYSIS': [
      'fight', 'argue', 'disagree', 'conflict', 'tension',
      'keeps happening', 'same issue', 'always about',
      'why do we', 'problem with', 'struggle with'
    ],
    'EMOTIONAL_CHECK': [
      'how are we', 'feeling about', 'relationship status',
      'doing well', 'worried about', 'concerned',
      'overall', 'general', 'check in'
    ],
    'HISTORICAL_INSIGHT': [
      'show me', 'find', 'when did', 'remember when',
      'look back', 'what happened', 'during', 'period',
      'conversations about', 'messages from'
    ],
    'PREDICTIVE_GUIDANCE': [
      'what should', 'focus on', 'work on', 'improve',
      'next steps', 'going forward', 'future', 'recommend',
      'suggest', 'priority', 'goals'
    ],
    'DATA_QUERY': [
      'search', 'find messages', 'show conversations',
      'data about', 'statistics', 'count', 'frequency',
      'when did we', 'how often', 'filter'
    ],
    'RELATIONSHIP_HEALTH': [
      'health score', 'how healthy', 'relationship status',
      'overall rating', 'metrics', 'scoring', 'assessment',
      'evaluation', 'grade', 'measure'
    ],
    'ATTACHMENT_COACHING': [
      'attachment', 'insecure', 'anxious', 'avoidant',
      'secure', 'emotional needs', 'intimacy',
      'connection style', 'bonding', 'dependency'
    ],
    'COMMUNICATION_TRAINING': [
      'communicate better', 'improve communication',
      'better at talking', 'express myself', 'listening',
      'conversation skills', 'articulate', 'understand each other'
    ]
  };

  classifyIntent(
    message: string, 
    context: UserContext,
    conversationHistory: any[]
  ): IntentClassificationResult {
    const lowercaseMessage = message.toLowerCase();
    const scores: Record<UserIntent, number> = {} as any;
    const keyPhrases: string[] = [];

    // Pattern matching scoring
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      let score = 0;
      for (const pattern of patterns) {
        if (lowercaseMessage.includes(pattern)) {
          score += 1;
          keyPhrases.push(pattern);
        }
      }
      scores[intent as UserIntent] = score;
    }

    // Context-based adjustments
    this.adjustScoresBasedOnContext(scores, context, conversationHistory);

    // Find highest scoring intent
    const sortedIntents = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    if (sortedIntents.length === 0) {
      return {
        intent: 'IMMEDIATE_COACHING',
        confidence: 0.3,
        reasoning: 'No clear patterns detected, defaulting to coaching',
        keyPhrases: [],
        emotionalContext: this.detectEmotionalContext(message),
        urgency: this.detectUrgency(message)
      };
    }

    const [topIntent, topScore] = sortedIntents[0];
    const confidence = Math.min(topScore * 0.2, 0.95); // Cap at 95%

    return {
      intent: topIntent as UserIntent,
      confidence,
      reasoning: `Detected patterns: ${keyPhrases.slice(0, 3).join(', ')}`,
      keyPhrases: keyPhrases.slice(0, 5),
      emotionalContext: this.detectEmotionalContext(message),
      urgency: this.detectUrgency(message)
    };
  }

  private adjustScoresBasedOnContext(
    scores: Record<UserIntent, number>,
    context: UserContext,
    conversationHistory: any[]
  ): void {
    // Recent coaching requests increase coaching intent
    const recentCoaching = conversationHistory
      .slice(-3)
      .some(msg => msg.agentType === 'coaching-agent');
    if (recentCoaching) {
      scores['IMMEDIATE_COACHING'] += 0.5;
    }

    // Low health score increases emotional check intent
    if (context.currentHealthScore && context.currentHealthScore < 5) {
      scores['EMOTIONAL_CHECK'] += 1;
      scores['RELATIONSHIP_HEALTH'] += 1;
    }

    // Recent conflicts increase conflict analysis
    const hasRecentConflicts = context.primaryConcerns
      .some(concern => concern.toLowerCase().includes('conflict'));
    if (hasRecentConflicts) {
      scores['CONFLICT_ANALYSIS'] += 1;
    }
  }

  private detectEmotionalContext(message: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const positiveWords = ['good', 'great', 'happy', 'love', 'wonderful', 'amazing', 'better'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'worse', 'angry', 'sad', 'frustrated'];
    
    const lowercaseMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowercaseMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowercaseMessage.includes(word)).length;

    if (positiveCount > 0 && negativeCount > 0) return 'mixed';
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgent', 'now', 'immediately', 'asap', 'emergency', 'crisis'];
    const mediumWords = ['soon', 'today', 'quickly', 'important', 'need to'];
    
    const lowercaseMessage = message.toLowerCase();
    
    if (urgentWords.some(word => lowercaseMessage.includes(word))) return 'high';
    if (mediumWords.some(word => lowercaseMessage.includes(word))) return 'medium';
    return 'low';
  }
}

// Cloudflare Worker handler
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/classify' && request.method === 'POST') {
      try {
        const body = await request.json() as {
          message: string;
          context: UserContext;
          conversationHistory: any[];
        };
        
        const classifier = new IntentClassifier();
        const result = classifier.classifyIntent(
          body.message,
          body.context,
          body.conversationHistory
        );
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to classify intent' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    return new Response('Not Found', { status: 404 });
  },
};