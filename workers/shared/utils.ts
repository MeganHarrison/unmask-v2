export class RelationshipUtils {
  static calculateHealthScore(metrics: {
    communicationFrequency: number;
    averageSentiment: number;
    conflictFrequency: number;
    intimacyIndicators: number;
    responsiveness: number;
  }): number {
    const weights = {
      communication: 0.25,
      sentiment: 0.3,
      conflict: 0.2, // Lower conflict = higher score
      intimacy: 0.15,
      responsiveness: 0.1
    };

    const normalizedMetrics = {
      communication: Math.min(metrics.communicationFrequency / 50, 1), // Normalize to daily messages
      sentiment: (metrics.averageSentiment + 1) / 2, // Convert -1,1 to 0,1
      conflict: Math.max(0, 1 - (metrics.conflictFrequency / 10)), // Invert conflict frequency
      intimacy: Math.min(metrics.intimacyIndicators / 10, 1),
      responsiveness: Math.min(metrics.responsiveness, 1)
    };

    const score = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (normalizedMetrics[key as keyof typeof normalizedMetrics] * weight);
    }, 0);

    return Math.round(score * 10 * 100) / 100; // Scale to 0-10, round to 2 decimals
  }

  static detectEmotionalSeasons(messages: BaseMessage[]): Array<{
    period: string;
    avgSentiment: number;
    theme: string;
    keyEvents: string[];
  }> {
    // Group messages by month
    const monthlyGroups = this.groupMessagesByMonth(messages);
    
    return Object.entries(monthlyGroups).map(([month, msgs]) => {
      const avgSentiment = msgs.reduce((sum, msg) => sum + (msg.sentimentScore || 0), 0) / msgs.length;
      
      return {
        period: month,
        avgSentiment,
        theme: this.determineEmotionalTheme(avgSentiment, msgs),
        keyEvents: this.extractKeyEvents(msgs)
      };
    });
  }

  private static groupMessagesByMonth(messages: BaseMessage[]): Record<string, BaseMessage[]> {
    return messages.reduce((groups, message) => {
      const month = new Date(message.timestamp).toISOString().substring(0, 7); // YYYY-MM
      if (!groups[month]) groups[month] = [];
      groups[month].push(message);
      return groups;
    }, {} as Record<string, BaseMessage[]>);
  }

  private static determineEmotionalTheme(avgSentiment: number, messages: BaseMessage[]): string {
    if (avgSentiment > 0.5) return 'High Connection';
    if (avgSentiment > 0.2) return 'Stable Period';
    if (avgSentiment > -0.2) return 'Neutral Phase';
    if (avgSentiment > -0.5) return 'Tension Period';
    return 'Conflict Phase';
  }

  private static extractKeyEvents(messages: BaseMessage[]): string[] {
    // Simple keyword extraction for now - could be enhanced with NLP
    const keywords = ['birthday', 'anniversary', 'vacation', 'work', 'family', 'fight', 'celebration'];
    const events: string[] = [];
    
    messages.forEach(msg => {
      keywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword) && !events.includes(keyword)) {
          events.push(keyword);
        }
      });
    });
    
    return events.slice(0, 3); // Top 3 events
  }

  static formatInsightForUser(
    insight: string, 
    supportingData: any[], 
    confidence: number
  ): string {
    const confidenceText = confidence > 0.8 ? 'High confidence' : 
                          confidence > 0.6 ? 'Moderate confidence' : 'Initial assessment';
    
    return `${insight}\n\n*${confidenceText} based on ${supportingData.length} data points*`;
  }
}

export default RelationshipUtils;