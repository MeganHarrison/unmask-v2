// lib/agents/orchestrator.ts
import { ChatMessage, AGENT_REGISTRY, AgentCapabilities } from './types';

export class OrchestratorClient {
  private apiUrl: string;

  constructor(baseUrl: string = '/api') {
    this.apiUrl = baseUrl;
  }

  async sendMessage(
    message: string, 
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatMessage> {
    const response = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: data.response,
      timestamp: data.timestamp,
      agentType: data.agentType,
      confidence: data.confidence,
      metadata: {
        nextSteps: data.nextSteps,
        relatedInsights: data.relatedInsights,
      },
    };
  }

  async getInsights(type: 'patterns' | 'timeline' | 'health-score', params: any = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${this.apiUrl}/insights/${type}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Insights request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  getAgentCapabilities(agentType: string): AgentCapabilities | null {
    return AGENT_REGISTRY[agentType] || null;
  }

  static formatAgentResponse(
    response: string, 
    agentType: string, 
    confidence: number
  ): string {
    const agent = AGENT_REGISTRY[agentType];
    const agentName = agent?.name || 'AI Coach';
    
    let confidenceText = '';
    if (confidence >= 0.9) confidenceText = '🎯 High confidence';
    else if (confidence >= 0.7) confidenceText = '✓ Moderate confidence';
    else confidenceText = '⚠️ Initial assessment';

    return `**${agentName}** ${confidenceText}\n\n${response}`;
  }
}