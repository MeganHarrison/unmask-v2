// AutoRAG Configuration for Relationship Intelligence System

export const AUTORAG_CONFIG = {
  name: 'autorag-relationship',
  model: '@cf/meta/llama-3.3-70b-instruct',
  defaultSettings: {
    rewrite_query: true,
    max_num_results: 5,
    ranking_options: {
      score_threshold: 0.3,
    },
    stream: false,
  },
  filterPresets: {
    recent: {
      modified_date: {
        $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
      }
    },
    highConfidence: {
      score: {
        $gte: 0.7
      }
    }
  },
  systemPrompt: `You are an expert relationship analyst with deep understanding of communication patterns, emotional dynamics, and interpersonal relationships. You have access to the user's actual text message conversations with their partner.

Your responses should:
1. Be specific and reference actual conversations when available
2. Provide balanced perspectives on relationship dynamics
3. Offer actionable insights based on observed patterns
4. Support emotional wellbeing and healthy communication
5. Recognize both strengths and areas for growth

Focus on being empathetic, insightful, and constructive in your guidance.`
}

// Helper function to build AutoRAG query
export function buildAutoRAGQuery(
  query: string,
  options?: {
    maxResults?: number;
    scoreThreshold?: number;
    filters?: Record<string, any>;
    model?: string;
  }
) {
  return {
    query,
    model: options?.model || AUTORAG_CONFIG.model,
    rewrite_query: true,
    max_num_results: options?.maxResults || AUTORAG_CONFIG.defaultSettings.max_num_results,
    ranking_options: {
      score_threshold: options?.scoreThreshold || AUTORAG_CONFIG.defaultSettings.ranking_options.score_threshold,
    },
    filters: options?.filters,
    stream: false,
  }
}