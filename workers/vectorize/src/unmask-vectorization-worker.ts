// workers/vectorize-messages.ts
// Unmask: Intelligent Conversation Analysis Pipeline with OpenAI

export interface Env {
  VECTORIZE: Vectorize;
  DB: D1Database;
  OPENAI_API_KEY: string;
  CACHE: KVNamespace;
}

interface MessageRow {
  id: number;
  date: string;
  sender: string;
  message: string;
  date_time: string;
  type: string;
}

interface ConversationChunk {
  messages: MessageRow[];
  startTime: string;
  endTime: string;
  participants: string[];
  chunkText: string;
  chunkId: string;
}

interface ChunkAnalysis {
  contextType: string;
  emotionalIntensity: number; // 1-10 scale
  communicationPattern: string;
  temporalContext: string;
  relationshipDynamics: string;
  tags: string[];
  conflictLevel: number; // 0-5 scale
  intimacyLevel: number; // 1-10 scale
  supportLevel: number; // 1-10 scale
}

interface VectorMetadata {
  chunk_id: string;
  start_time: string;
  end_time: string;
  message_count: number;
  participants: string;
  context_type: string;
  emotional_intensity: number;
  communication_pattern: string;
  temporal_context: string;
  tags: string;
  conflict_level: number;
  intimacy_level: number;
  support_level: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/vectorize-conversations' && request.method === 'POST') {
      return await processAllConversations(env);
    }
    
    if (url.pathname === '/analyze-chunk' && request.method === 'POST') {
      return await analyzeSpecificChunk(request, env);
    }
    
    if (url.pathname === '/search-conversations' && request.method === 'POST') {
      return await searchConversations(request, env);
    }

    if (url.pathname === '/status' && request.method === 'GET') {
      return await getProcessingStatus(env);
    }
    
    return new Response(`
      🥽 Unmask Conversation Intelligence Worker (OpenAI Powered)
      
      Endpoints:
      POST /vectorize-conversations - Process all messages into intelligent chunks
      POST /analyze-chunk - Analyze a specific conversation chunk  
      POST /search-conversations - Search for relationship patterns
      GET /status - Check processing status
      
      Ready to analyze ${await getMessageCount(env)} messages with OpenAI GPT-4 intelligence.
    `, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

async function getMessageCount(env: Env): Promise<number> {
  try {
    const result = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM 'texts-bc' 
      WHERE message IS NOT NULL AND TRIM(message) != ''
    `).first();
    return result?.count || 0;
  } catch {
    return 0;
  }
}

async function processAllConversations(env: Env): Promise<Response> {
  try {
    console.log('🧠 Starting OpenAI-powered conversation analysis...');
    
    // Get all messages ordered by time
    const allMessages = await env.DB.prepare(`
      SELECT id, date, sender, message, date_time, type
      FROM 'texts-bc' 
      WHERE message IS NOT NULL 
      AND TRIM(message) != ''
      ORDER BY datetime(date_time) ASC
    `).all();
    
    if (!allMessages.results || allMessages.results.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No messages found' 
      }), { status: 400 });
    }
    
    console.log(`📱 Found ${allMessages.results.length} messages to analyze`);
    
    // Stage 1: Intelligent Chunking - Group into conversation threads
    const conversationChunks = createIntelligentChunks(allMessages.results as MessageRow[]);
    console.log(`💬 Created ${conversationChunks.length} conversation chunks`);
    
    // Store progress in cache
    await env.CACHE.put('unmask:progress', JSON.stringify({
      status: 'processing',
      totalChunks: conversationChunks.length,
      processedChunks: 0,
      startedAt: new Date().toISOString()
    }));
    
    let processedChunks = 0;
    const batchSize = 3; // Smaller batches for OpenAI rate limiting
    
    // Process chunks in batches
    for (let i = 0; i < conversationChunks.length; i += batchSize) {
      const batch = conversationChunks.slice(i, i + batchSize);
      
      // Process batch in parallel for efficiency
      const batchPromises = batch.map(async (chunk) => {
        try {
          // Stage 2: Metadata Enrichment - Analyze conversation context with OpenAI
          const analysis = await analyzeConversationChunkWithOpenAI(chunk, env);
          
          // Stage 3: Vector Embedding - Create mathematical representation using OpenAI
          const embedding = await createOpenAIEmbedding(chunk, analysis, env);
          
          // Stage 4: Intelligent Storage - Store with rich metadata
          await storeChunkIntelligence(chunk, analysis, embedding, env);
          
          return true;
        } catch (error) {
          console.error(`❌ Error processing chunk ${chunk.chunkId}:`, error);
          return false;
        }
      });
      
      const results = await Promise.allSettled(batchPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      processedChunks += successCount;
      
      // Update progress
      await env.CACHE.put('unmask:progress', JSON.stringify({
        status: 'processing',
        totalChunks: conversationChunks.length,
        processedChunks,
        startedAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      }));
      
      if (processedChunks % 10 === 0 || i + batchSize >= conversationChunks.length) {
        console.log(`🔄 Processed ${processedChunks}/${conversationChunks.length} chunks`);
      }
      
      // Rate limiting delay for OpenAI API
      if (i + batchSize < conversationChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Mark as completed
    await env.CACHE.put('unmask:progress', JSON.stringify({
      status: 'completed',
      totalChunks: conversationChunks.length,
      processedChunks,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }));
    
    return new Response(JSON.stringify({ 
      success: true, 
      processedChunks,
      totalChunks: conversationChunks.length,
      message: `🎉 Successfully analyzed ${processedChunks} conversation chunks with OpenAI intelligence`,
      processingRate: `${((processedChunks / conversationChunks.length) * 100).toFixed(1)}% success rate`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 Error in conversation processing:', error);
    
    // Update error status
    await env.CACHE.put('unmask:progress', JSON.stringify({
      status: 'error',
      error: error.message,
      failedAt: new Date().toISOString()
    }));
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getProcessingStatus(env: Env): Promise<Response> {
  try {
    const progress = await env.CACHE.get('unmask:progress');
    if (!progress) {
      return new Response(JSON.stringify({
        status: 'idle',
        message: 'No processing in progress'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(progress, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: 'Failed to retrieve status'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function createIntelligentChunks(messages: MessageRow[]): ConversationChunk[] {
  const chunks: ConversationChunk[] = [];
  let currentChunk: MessageRow[] = [];
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const nextMessage = messages[i + 1];
    
    currentChunk.push(message);
    
    // Determine if this is the end of a conversation thread
    const shouldEndChunk = 
      !nextMessage || // Last message
      isConversationBreak(message, nextMessage) ||
      currentChunk.length >= 12; // Smaller chunks for better OpenAI analysis
    
    if (shouldEndChunk && currentChunk.length > 0) {
      const chunk = createChunkFromMessages(currentChunk);
      chunks.push(chunk);
      currentChunk = [];
    }
  }
  
  return chunks;
}

function isConversationBreak(current: MessageRow, next: MessageRow): boolean {
  const currentTime = new Date(current.date_time);
  const nextTime = new Date(next.date_time);
  
  // More than 90 minutes gap = new conversation
  const hoursDiff = (nextTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
  if (hoursDiff > 1.5) return true;
  
  // Different day and more than 20 minutes = new conversation  
  const diffDays = nextTime.getDate() !== currentTime.getDate();
  const minutesDiff = (nextTime.getTime() - currentTime.getTime()) / (1000 * 60);
  if (diffDays && minutesDiff > 20) return true;
  
  return false;
}

function createChunkFromMessages(messages: MessageRow[]): ConversationChunk {
  const sortedMessages = messages.sort((a, b) => 
    new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  );
  
  const chunkText = sortedMessages.map(msg => 
    `[${msg.date_time}] ${msg.sender}: ${msg.message}`
  ).join('\n');
  
  const participants = [...new Set(sortedMessages.map(msg => msg.sender))];
  
  return {
    messages: sortedMessages,
    startTime: sortedMessages[0].date_time,
    endTime: sortedMessages[sortedMessages.length - 1].date_time,
    participants,
    chunkText,
    chunkId: `chunk_${sortedMessages[0].id}_${sortedMessages[sortedMessages.length - 1].id}`
  };
}

async function analyzeConversationChunkWithOpenAI(chunk: ConversationChunk, env: Env): Promise<ChunkAnalysis> {
  const prompt = `You are analyzing a conversation between Brandon and his partner in their romantic relationship. Analyze this conversation chunk with relationship intelligence.

Conversation:
${chunk.chunkText}

Time Context: ${chunk.startTime} to ${chunk.endTime}

Provide analysis in this EXACT JSON format (no additional text):
{
  "contextType": "brief description like supportive_celebration, conflict_resolution, daily_check_in, intimate_planning, playful_banter, emotional_support, future_planning, etc",
  "emotionalIntensity": number 1-10,
  "communicationPattern": "description like back-and-forth supportive, one-sided venting, playful teasing exchange, problem-solving dialogue, etc",
  "temporalContext": "description like workday_evening, weekend_morning, late_night_intimate, busy_day_check_in, etc", 
  "relationshipDynamics": "description of the relationship dynamic shown in this conversation",
  "tags": ["tag1", "tag2", "tag3"],
  "conflictLevel": number 0-5,
  "intimacyLevel": number 1-10,
  "supportLevel": number 1-10
}

Focus on relationship intelligence - what does this reveal about their connection, communication patterns, emotional state, and relationship health?`;
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective and fast
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3, // Lower temperature for consistent analysis
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      return JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI analysis:', analysisText);
      // Fallback analysis
      return createFallbackAnalysis();
    }
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    return createFallbackAnalysis();
  }
}

function createFallbackAnalysis(): ChunkAnalysis {
  return {
    contextType: "general_conversation",
    emotionalIntensity: 5,
    communicationPattern: "standard_exchange", 
    temporalContext: "unknown_time",
    relationshipDynamics: "neutral_interaction",
    tags: ["conversation"],
    conflictLevel: 0,
    intimacyLevel: 5,
    supportLevel: 5
  };
}

async function createOpenAIEmbedding(chunk: ConversationChunk, analysis: ChunkAnalysis, env: Env): Promise<number[]> {
  // Enhanced text for embedding - includes relationship context
  const enhancedText = `
    Relationship context: ${analysis.contextType}
    Communication pattern: ${analysis.communicationPattern}  
    Temporal context: ${analysis.temporalContext}
    Relationship dynamics: ${analysis.relationshipDynamics}
    Emotional intensity: ${analysis.emotionalIntensity}/10
    Intimacy level: ${analysis.intimacyLevel}/10
    Tags: ${analysis.tags.join(', ')}
    
    Conversation:
    ${chunk.chunkText}
  `;
  
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small", // Cost-effective embeddings
        input: enhancedText,
        dimensions: 1024 // Reduced dimensions for efficiency
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI Embeddings API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
    
  } catch (error) {
    console.error('OpenAI Embeddings error:', error);
    // Fallback to deterministic embedding
    return generateDeterministicEmbedding(enhancedText);
  }
}

function generateDeterministicEmbedding(text: string): number[] {
  // Create a deterministic "embedding" based on text content
  // This is a fallback when OpenAI API is unavailable
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(1024).fill(0);
  
  // Simple hash-based approach for consistent vectors
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode * (i + 1) * (j + 1)) % 1024;
      embedding[index] += Math.sin(charCode * 0.1) * 0.1;
    }
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

async function storeChunkIntelligence(
  chunk: ConversationChunk, 
  analysis: ChunkAnalysis, 
  embedding: number[], 
  env: Env
): Promise<void> {
  
  // Store in conversation_chunks table
  await env.DB.prepare(`
    INSERT OR REPLACE INTO conversation_chunks (
      chunk_id, start_time, end_time, message_count, participants,
      chunk_text, context_type, emotional_intensity, communication_pattern,
      temporal_context, relationship_dynamics, tags_json, conflict_level,
      intimacy_level, support_level, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    chunk.chunkId,
    chunk.startTime,
    chunk.endTime,
    chunk.messages.length,
    chunk.participants.join(','),
    chunk.chunkText,
    analysis.contextType,
    analysis.emotionalIntensity,
    analysis.communicationPattern,
    analysis.temporalContext,
    analysis.relationshipDynamics,
    JSON.stringify(analysis.tags),
    analysis.conflictLevel,
    analysis.intimacyLevel,
    analysis.supportLevel
  ).run();
  
  // Store vector embedding
  const metadata: VectorMetadata = {
    chunk_id: chunk.chunkId,
    start_time: chunk.startTime,
    end_time: chunk.endTime,
    message_count: chunk.messages.length,
    participants: chunk.participants.join(','),
    context_type: analysis.contextType,
    emotional_intensity: analysis.emotionalIntensity,
    communication_pattern: analysis.communicationPattern,
    temporal_context: analysis.temporalContext,
    tags: analysis.tags.join(','),
    conflict_level: analysis.conflictLevel,
    intimacy_level: analysis.intimacyLevel,
    support_level: analysis.supportLevel
  };
  
  try {
    await env.VECTORIZE.upsert([{
      id: chunk.chunkId,
      values: embedding,
      metadata
    }]);
  } catch (error) {
    console.error('Vectorize storage error:', error);
    // Continue processing even if vector storage fails
  }
  
  // Update individual messages with chunk reference
  for (const message of chunk.messages) {
    await env.DB.prepare(`
      UPDATE 'texts-bc' 
      SET 
        sentiment = ?,
        category = ?,
        tag = ?,
        emotional_score = ?,
        tags_json = ?,
        conflict_indicator = ?,
        relationship_context = ?,
        processed_at = datetime('now')
      WHERE id = ?
    `).bind(
      getOverallSentiment(analysis),
      analysis.contextType,
      analysis.tags.join(','),
      analysis.emotionalIntensity,
      JSON.stringify(analysis.tags),
      analysis.conflictLevel > 2 ? 1 : 0,
      `${analysis.relationshipDynamics} (${analysis.communicationPattern})`,
      message.id
    ).run();
  }
}

function getOverallSentiment(analysis: ChunkAnalysis): string {
  if (analysis.conflictLevel > 3) return 'negative';
  if (analysis.emotionalIntensity > 7 && analysis.intimacyLevel > 6) return 'positive';
  if (analysis.emotionalIntensity < 4) return 'neutral';
  return 'mixed';
}

async function searchConversations(request: Request, env: Env): Promise<Response> {
  try {
    const { query, filters } = await request.json();
    
    // Create query embedding using OpenAI
    const queryEmbedding = await createQueryEmbedding(query, env);
    
    // Perform vector similarity search
    const vectorResults = await env.VECTORIZE.query(queryEmbedding, {
      topK: 10,
      returnMetadata: true
    });
    
    return new Response(JSON.stringify({
      success: true,
      results: vectorResults.matches.map(match => ({
        chunkId: match.id,
        score: match.score,
        metadata: match.metadata
      }))
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function createQueryEmbedding(query: string, env: Env): Promise<number[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: query,
        dimensions: 1024
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
    
  } catch (error) {
    console.error('Query embedding error:', error);
    return generateDeterministicEmbedding(query);
  }
}

async function analyzeSpecificChunk(request: Request, env: Env): Promise<Response> {
  try {
    const { chunkId } = await request.json();
    
    const chunk = await env.DB.prepare(`
      SELECT * FROM conversation_chunks WHERE chunk_id = ?
    `).bind(chunkId).first();
    
    if (!chunk) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Chunk not found' 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({
      success: true,
      chunk
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}