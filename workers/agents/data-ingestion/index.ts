// workers/data-ingestion/index.ts
export interface Env {
  OPENAI_API_KEY: string;
  INGESTION_KV: KVNamespace;
  USER_DATA_D1: D1Database;
  VECTORIZE_INDEX: VectorizeIndex;
  FILE_STORAGE_R2: R2Bucket;
  ENVIRONMENT: string;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  steps: ProcessingStep[];
  results?: ProcessingResults;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message: string;
  progress: number;
}

export interface ProcessingResults {
  totalMessages: number;
  dateRange: { start: string; end: string };
  participants: string[];
  sentimentStats: {
    avgSentiment: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
  };
  communicationStats: {
    averagePerDay: number;
    mostActiveDay: string;
    responseTimes?: {
      avgResponseTime: number;
      fastest: number;
      slowest: number;
    };
  };
  insights: string[];
  healthScore: number;
}

export interface MessageRow {
  content: string;
  timestamp: string;
  sender: string;
  recipient?: string;
  messageType?: string;
  threadId?: string;
}

class DataIngestionProcessor {
  private openaiKey: string;
  private kv: KVNamespace;
  private db: D1Database;
  private vectorize: VectorizeIndex;
  private r2: R2Bucket;

  constructor(env: Env) {
    this.openaiKey = env.OPENAI_API_KEY;
    this.kv = env.INGESTION_KV;
    this.db = env.USER_DATA_D1;
    this.vectorize = env.VECTORIZE_INDEX;
    this.r2 = env.FILE_STORAGE_R2;
  }

  async processCSVFile(
    userId: string,
    fileName: string,
    fileContent: string
  ): Promise<ProcessingJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ProcessingJob = {
      id: jobId,
      userId,
      fileName,
      fileSize: fileContent.length,
      status: 'queued',
      progress: 0,
      steps: [
        { name: 'Parsing CSV data', status: 'pending', message: 'Analyzing file structure', progress: 0 },
        { name: 'Validating messages', status: 'pending', message: 'Checking data quality', progress: 0 },
        { name: 'Sentiment analysis', status: 'pending', message: 'Analyzing emotional content', progress: 0 },
        { name: 'Vector embeddings', status: 'pending', message: 'Creating searchable representations', progress: 0 },
        { name: 'Pattern analysis', status: 'pending', message: 'Identifying communication patterns', progress: 0 },
        { name: 'Generating insights', status: 'pending', message: 'Creating personalized insights', progress: 0 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store initial job state
    await this.updateJobStatus(job);

    // Start processing asynchronously
    this.processJobAsync(job, fileContent);

    return job;
  }

  private async processJobAsync(job: ProcessingJob, fileContent: string): Promise<void> {
    try {
      job.status = 'processing';
      await this.updateJobStatus(job);

      // Step 1: Parse CSV
      await this.updateStepStatus(job, 0, 'active', 'Parsing CSV structure...');
      const messages = await this.parseCSV(fileContent);
      await this.updateStepStatus(job, 0, 'complete', `Parsed ${messages.length} messages`);
      job.progress = 15;

      // Step 2: Validate and clean data
      await this.updateStepStatus(job, 1, 'active', 'Validating message data...');
      const validatedMessages = await this.validateMessages(messages, job.userId);
      await this.updateStepStatus(job, 1, 'complete', `${validatedMessages.length} valid messages`);
      job.progress = 25;

      // Step 3: Sentiment analysis
      await this.updateStepStatus(job, 2, 'active', 'Analyzing emotional content...');
      const messagesWithSentiment = await this.analyzeSentimentBatch(validatedMessages);
      await this.updateStepStatus(job, 2, 'complete', 'Sentiment analysis complete');
      job.progress = 50;

      // Step 4: Store in database
      await this.updateStepStatus(job, 3, 'active', 'Storing messages in database...');
      await this.storeMessages(messagesWithSentiment, job.userId);
      await this.updateStepStatus(job, 3, 'complete', 'Messages stored successfully');
      job.progress = 70;

      // Step 5: Generate embeddings and store in vector database
      await this.updateStepStatus(job, 4, 'active', 'Creating vector embeddings...');
      await this.generateAndStoreEmbeddings(messagesWithSentiment, job.userId);
      await this.updateStepStatus(job, 4, 'complete', 'Vector embeddings created');
      job.progress = 85;

      // Step 6: Generate insights
      await this.updateStepStatus(job, 5, 'active', 'Generating insights...');
      const results = await this.generateProcessingResults(messagesWithSentiment, job.userId);
      await this.updateStepStatus(job, 5, 'complete', 'Insights generated');
      job.progress = 100;

      // Complete the job
      job.status = 'completed';
      job.results = results;
      await this.updateJobStatus(job);

    } catch (error) {
      console.error('Processing error:', error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error occurred';
      await this.updateJobStatus(job);
    }
  }

  private async parseCSV(content: string): Promise<MessageRow[]> {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file appears to be empty or invalid');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows = lines.slice(1);

    // Detect column mappings
    const columnMap = this.detectColumnMappings(headers);
    
    const messages: MessageRow[] = [];
    
    for (let i = 0; i < rows.length; i++) {
      try {
        const values = this.parseCSVRow(rows[i]);
        if (values.length < headers.length) continue; // Skip incomplete rows

        const message: MessageRow = {
          content: values[columnMap.content] || '',
          timestamp: values[columnMap.timestamp] || '',
          sender: values[columnMap.sender] || 'unknown',
          recipient: columnMap.recipient !== -1 ? values[columnMap.recipient] : undefined,
          messageType: columnMap.messageType !== -1 ? values[columnMap.messageType] : undefined,
          threadId: columnMap.threadId !== -1 ? values[columnMap.threadId] : undefined
        };

        // Basic validation
        if (message.content && message.timestamp && message.sender) {
          messages.push(message);
        }
      } catch (error) {
        console.warn(`Skipping row ${i + 2}: ${error}`);
      }
    }

    return messages;
  }

  private detectColumnMappings(headers: string[]): {
    content: number;
    timestamp: number;
    sender: number;
    recipient: number;
    messageType: number;
    threadId: number;
  } {
    const mapping = {
      content: -1,
      timestamp: -1,
      sender: -1,
      recipient: -1,
      messageType: -1,
      threadId: -1
    };

    // Content detection
    const contentKeywords = ['message', 'text', 'content', 'body', 'msg'];
    mapping.content = headers.findIndex(h => 
      contentKeywords.some(keyword => h.includes(keyword))
    );

    // Timestamp detection
    const timestampKeywords = ['date', 'time', 'timestamp', 'created', 'sent'];
    mapping.timestamp = headers.findIndex(h => 
      timestampKeywords.some(keyword => h.includes(keyword))
    );

    // Sender detection
    const senderKeywords = ['sender', 'from', 'author', 'user', 'contact'];
    mapping.sender = headers.findIndex(h => 
      senderKeywords.some(keyword => h.includes(keyword))
    );

    // Recipient detection (optional)
    const recipientKeywords = ['recipient', 'to', 'receiver'];
    mapping.recipient = headers.findIndex(h => 
      recipientKeywords.some(keyword => h.includes(keyword))
    );

    // Message type detection (optional)
    const typeKeywords = ['type', 'kind', 'category'];
    mapping.messageType = headers.findIndex(h => 
      typeKeywords.some(keyword => h.includes(keyword))
    );

    // Thread ID detection (optional)
    const threadKeywords = ['thread', 'conversation', 'chat'];
    mapping.threadId = headers.findIndex(h => 
      threadKeywords.some(keyword => h.includes(keyword))
    );

    // Validate required mappings
    if (mapping.content === -1) throw new Error('Could not detect message content column');
    if (mapping.timestamp === -1) throw new Error('Could not detect timestamp column');
    if (mapping.sender === -1) throw new Error('Could not detect sender column');

    return mapping;
  }

  private parseCSVRow(row: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values.map(v => v.replace(/^"|"$/g, '')); // Remove surrounding quotes
  }

  private async validateMessages(messages: MessageRow[], userId: string): Promise<MessageRow[]> {
    const validated: MessageRow[] = [];
    
    for (const message of messages) {
      // Normalize timestamp
      const normalizedTimestamp = this.normalizeTimestamp(message.timestamp);
      if (!normalizedTimestamp) continue;

      // Clean content
      const cleanContent = this.cleanMessageContent(message.content);
      if (!cleanContent || cleanContent.length < 2) continue;

      // Normalize sender
      const normalizedSender = this.normalizeSender(message.sender, userId);

      validated.push({
        ...message,
        content: cleanContent,
        timestamp: normalizedTimestamp,
        sender: normalizedSender
      });
    }

    return validated;
  }

  private normalizeTimestamp(timestamp: string): string | null {
    try {
      // Try parsing various timestamp formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
        /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/, // MM/DD/YYYY HH:MM:SS
        /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/, // M/D/YYYY H:MM
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, // YYYY-MM-DD HH:MM:SS
      ];

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return null;
      
      // Validate reasonable date range (last 10 years to 1 year in future)
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);
      const oneYearFuture = new Date(now.getFullYear() + 1, 11, 31);
      
      if (date < tenYearsAgo || date > oneYearFuture) return null;
      
      return date.toISOString();
    } catch {
      return null;
    }
  }

  private cleanMessageContent(content: string): string {
    if (!content) return '';
    
    return content
      .trim()
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .replace(/\s{2,}/g, ' ') // Normalize whitespace
      .substring(0, 2000); // Limit length
  }

  private normalizeSender(sender: string, userId: string): 'user' | 'partner' {
    const normalizedSender = sender.toLowerCase().trim();
    
    // Common patterns that indicate the user themselves
    const userIndicators = ['me', 'you', userId.toLowerCase(), 'self'];
    
    if (userIndicators.some(indicator => normalizedSender.includes(indicator))) {
      return 'user';
    }
    
    return 'partner';
  }

  private async analyzeSentimentBatch(messages: MessageRow[]): Promise<(MessageRow & { sentimentScore: number; emotionalTags: string[] })[]> {
    const batchSize = 50; // Process in batches to manage API limits
    const results: (MessageRow & { sentimentScore: number; emotionalTags: string[] })[] = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchResults = await this.analyzeSentimentForBatch(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  private async analyzeSentimentForBatch(
    messages: MessageRow[]
  ): Promise<(MessageRow & { sentimentScore: number; emotionalTags: string[] })[]> {
    const prompt = `Analyze the sentiment of these messages and provide emotional tags. Return a JSON array with sentiment scores (-1 to 1) and emotional tags for each message.

MESSAGES:
${messages.map((msg, i) => `${i}: "${msg.content}"`).join('\n')}

Return format:
[
  {"sentimentScore": 0.8, "emotionalTags": ["love", "appreciation"]},
  {"sentimentScore": -0.3, "emotionalTags": ["frustration", "work_stress"]},
  ...
]

Sentiment scale: -1 (very negative) to 1 (very positive)
Emotional tags: 1-3 relevant emotions/topics per message`;

    try {
      const response = await this.callOpenAI([
        { role: 'user', content: prompt }
      ], 'gpt-4o', 0.3, 2000);

      const sentimentData = JSON.parse(response);
      
      return messages.map((message, index) => ({
        ...message,
        sentimentScore: sentimentData[index]?.sentimentScore || 0,
        emotionalTags: sentimentData[index]?.emotionalTags || []
      }));
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      
      // Fallback: basic sentiment analysis
      return messages.map(message => ({
        ...message,
        sentimentScore: this.basicSentimentAnalysis(message.content),
        emotionalTags: []
      }));
    }
  }

  private basicSentimentAnalysis(content: string): number {
    const positiveWords = ['love', 'great', 'happy', 'good', 'wonderful', 'amazing', 'perfect', 'yes', 'thank'];
    const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'no', 'stop', 'angry', 'frustrated', 'sad'];
    
    const words = content.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  private async storeMessages(
    messages: (MessageRow & { sentimentScore: number; emotionalTags: string[] })[],
    userId: string
  ): Promise<void> {
    const batchSize = 100;
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      for (const message of batch) {
        await this.db.prepare(`
          INSERT INTO messages (
            user_id, content, timestamp, sender, sentiment_score, 
            emotional_tags, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
          userId,
          message.content,
          message.timestamp,
          message.sender,
          message.sentimentScore,
          message.emotionalTags.join(',')
        ).run();
      }
    }
  }

  private async generateAndStoreEmbeddings(
    messages: (MessageRow & { sentimentScore: number; emotionalTags: string[] })[],
    userId: string
  ): Promise<void> {
    const batchSize = 10; // Smaller batches for embedding generation
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      for (const message of batch) {
        try {
          // Generate embedding for the message content
          const embedding = await this.generateEmbedding(message.content);
          
          // Store in Vectorize
          await this.vectorize.upsert([{
            id: `${userId}_${Date.now()}_${Math.random()}`,
            values: embedding,
            metadata: {
              userId,
              content: message.content,
              timestamp: message.timestamp,
              sender: message.sender,
              sentiment_score: message.sentimentScore,
              emotional_tags: message.emotionalTags.join(','),
              sentiment_category: this.categorizeSentiment(message.sentimentScore)
            }
          }]);
        } catch (error) {
          console.error('Error generating embedding for message:', error);
        }
      }
    }
  }

  private async generateProcessingResults(
    messages: (MessageRow & { sentimentScore: number; emotionalTags: string[] })[],
    userId: string
  ): Promise<ProcessingResults> {
    // Calculate stats
    const timestamps = messages.map(m => new Date(m.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    const dateRange = {
      start: timestamps[0].toISOString(),
      end: timestamps[timestamps.length - 1].toISOString()
    };

    const participants = [...new Set(messages.map(m => m.sender))];
    
    const sentimentScores = messages.map(m => m.sentimentScore);
    const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    const sentimentStats = {
      avgSentiment,
      positiveCount: sentimentScores.filter(s => s > 0.1).length,
      negativeCount: sentimentScores.filter(s => s < -0.1).length,
      neutralCount: sentimentScores.filter(s => s >= -0.1 && s <= 0.1).length
    };

    // Communication stats
    const totalDays = Math.ceil((timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / (1000 * 60 * 60 * 24));
    const averagePerDay = messages.length / Math.max(totalDays, 1);
    
    const dailyCounts = this.groupMessagesByDay(messages);
    const mostActiveDay = Object.entries(dailyCounts)
      .sort(([,a], [,b]) => b.length - a.length)[0][0];

    const communicationStats = {
      averagePerDay,
      mostActiveDay
    };

    // Generate insights
    const insights = await this.generateInsights(messages, sentimentStats, communicationStats);
    
    // Calculate health score
    const healthScore = this.calculateHealthScore(sentimentStats, communicationStats, messages.length);

    return {
      totalMessages: messages.length,
      dateRange,
      participants,
      sentimentStats,
      communicationStats,
      insights,
      healthScore
    };
  }

  private async generateInsights(
    messages: any[],
    sentimentStats: any,
    communicationStats: any
  ): Promise<string[]> {
    const prompt = `Generate 3-5 key insights about this relationship based on message analysis.

DATA:
- Total messages: ${messages.length}
- Average sentiment: ${sentimentStats.avgSentiment.toFixed(2)}
- Positive messages: ${sentimentStats.positiveCount} (${(sentimentStats.positiveCount/messages.length*100).toFixed(1)}%)
- Negative messages: ${sentimentStats.negativeCount} (${(sentimentStats.negativeCount/messages.length*100).toFixed(1)}%)
- Average messages per day: ${communicationStats.averagePerDay.toFixed(1)}
- Most active day: ${communicationStats.mostActiveDay}

Generate insights as a JSON array of strings. Each insight should be:
1. Specific to their relationship patterns
2. Actionable and constructive
3. Based on the actual data

Example: ["Your communication shows consistent daily engagement", "Positive sentiment dominates your conversations", "Response patterns indicate strong mutual investment"]`;

    try {
      const response = await this.callOpenAI([
        { role: 'user', content: prompt }
      ], 'gpt-4o', 0.7, 500);

      return JSON.parse(response);
    } catch (error) {
      return [
        'Communication patterns analyzed across relationship timeline',
        'Sentiment trends identified for relationship health',
        'Message frequency indicates strong engagement'
      ];
    }
  }

  private calculateHealthScore(
    sentimentStats: any,
    communicationStats: any,
    totalMessages: number
  ): number {
    let score = 5; // Base score
    
    // Sentiment factor (30% of score)
    score += sentimentStats.avgSentiment * 3;
    
    // Communication frequency factor (20% of score)
    if (communicationStats.averagePerDay > 10) score += 1;
    else if (communicationStats.averagePerDay > 5) score += 0.5;
    else if (communicationStats.averagePerDay < 1) score -= 1;
    
    // Message volume factor (10% of score)
    if (totalMessages > 1000) score += 0.5;
    else if (totalMessages < 100) score -= 0.5;
    
    // Positive ratio factor (20% of score)
    const positiveRatio = sentimentStats.positiveCount / totalMessages;
    if (positiveRatio > 0.6) score += 1;
    else if (positiveRatio < 0.3) score -= 1;
    
    // Negative ratio factor (20% of score)
    const negativeRatio = sentimentStats.negativeCount / totalMessages;
    if (negativeRatio > 0.3) score -= 1;
    else if (negativeRatio < 0.1) score += 0.5;
    
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }

  private groupMessagesByDay(messages: any[]): Record<string, any[]> {
    return messages.reduce((groups, message) => {
      const date = new Date(message.timestamp).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private categorizeSentiment(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
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

  private async updateJobStatus(job: ProcessingJob): Promise<void> {
    job.updatedAt = new Date().toISOString();
    await this.kv.put(`job:${job.id}`, JSON.stringify(job), { expirationTtl: 86400 }); // 24 hours
  }

  private async updateStepStatus(
    job: ProcessingJob,
    stepIndex: number,
    status: ProcessingStep['status'],
    message: string
  ): Promise<void> {
    job.steps[stepIndex].status = status;
    job.steps[stepIndex].message = message;
    job.steps[stepIndex].progress = status === 'complete' ? 100 : status === 'active' ? 50 : 0;
    await this.updateJobStatus(job);
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    const jobData = await this.kv.get(`job:${jobId}`);
    return jobData ? JSON.parse(jobData) : null;
  }
}

// Worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const processor = new DataIngestionProcessor(env);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy',
        service: 'data-ingestion',
        environment: env.ENVIRONMENT 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process CSV file endpoint
    if (request.method === 'POST' && url.pathname === '/process') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file || !userId) {
          return new Response(JSON.stringify({ error: 'Missing file or userId' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const fileContent = await file.text();
        const job = await processor.processCSVFile(userId, file.name, fileContent);

        return new Response(JSON.stringify(job), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Processing error:', error);
        return new Response(JSON.stringify({ error: 'Processing failed' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Get job status endpoint
    if (request.method === 'GET' && url.pathname.startsWith('/status/')) {
      const jobId = url.pathname.split('/')[2];
      
      try {
        const job = await processor.getJobStatus(jobId);
        
        if (!job) {
          return new Response(JSON.stringify({ error: 'Job not found' }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(job), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Status check error:', error);
        return new Response(JSON.stringify({ error: 'Status check failed' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
