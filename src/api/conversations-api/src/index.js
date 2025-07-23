// Cloudflare Worker for Unmask Conversations API
// Deploy this to handle real-time conversation data from D1

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (path) {
        case '/api/conversations':
          return await handleConversations(request, env, corsHeaders);
        case '/api/conversations/stats':
          return await handleStats(request, env, corsHeaders);
        case '/api/conversations/search':
          return await handleSearch(request, env, corsHeaders);
        default:
          return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

// Handle main conversations endpoint with pagination and filtering
async function handleConversations(request, env, corsHeaders) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  // Filter parameters
  const entity = url.searchParams.get('entity');
  const emotion = url.searchParams.get('emotion');
  const context = url.searchParams.get('context');
  const dateRange = url.searchParams.get('dateRange');
  const search = url.searchParams.get('search');

  // Build dynamic SQL query
  let query = `
    SELECT 
      id,
      date,
      time,
      date_time,
      sender,
      message,
      sentiment,
      category,
      tag,
      attachment,
      emotional_score,
      conflict_indicator,
      relationship_context
    FROM \`texts-bc\`
  `;

  const conditions = [];
  const params = [];

  // Apply filters
  if (entity) {
    conditions.push('sender = ?');
    params.push(entity);
  }

  if (emotion) {
    // Map emotion filter to sentiment values
    const sentimentMap = {
      'positive': 'positive',
      'negative': 'negative', 
      'neutral': 'neutral',
      'mixed': 'mixed'
    };
    if (sentimentMap[emotion]) {
      conditions.push('sentiment = ?');
      params.push(sentimentMap[emotion]);
    }
  }

  if (context) {
    conditions.push('category = ?');
    params.push(context);
  }

  if (search) {
    conditions.push('message LIKE ?');
    params.push(`%${search}%`);
  }

  if (dateRange) {
    const dateCondition = getDateRangeCondition(dateRange);
    if (dateCondition) {
      conditions.push(dateCondition);
    }
  }

  // Add WHERE clause if we have conditions
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Add ordering and pagination
  query += ' ORDER BY date_time DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count for pagination (with same filters)
    let countQuery = 'SELECT COUNT(*) as total FROM `texts-bc`';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...params.slice(0, -2)).first();
    const totalCount = countResult?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Transform data to match frontend expectations
    const conversations = result.results.map(row => ({
      id: row.id,
      date: row.date,
      time: row.time || extractTimeFromDateTime(row.date_time),
      datetime: row.date_time,
      entity: row.sender,
      message: row.message || '',
      emotion: mapSentimentToEmotion(row.sentiment),
      context: row.category || 'general_conversation',
      attachment: row.attachment ? detectAttachmentType(row.attachment) : null,
      emotional_score: row.emotional_score || 5,
      conflict_indicator: row.conflict_indicator || 0,
      relationship_context: row.relationship_context
    }));

    const response = {
      conversations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        entity,
        emotion,
        context,
        dateRange,
        search
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

// Handle statistics endpoint
async function handleStats(request, env, corsHeaders) {
  try {
    // Get total message count
    const totalResult = await env.DB.prepare('SELECT COUNT(*) as total FROM `texts-bc`').first();
    const totalMessages = totalResult?.total || 0;

    // Get date range
    const dateRangeResult = await env.DB.prepare(`
      SELECT 
        MIN(date_time) as earliest,
        MAX(date_time) as latest
      FROM \`texts-bc\`
      WHERE date_time IS NOT NULL
    `).first();

    // Get entity breakdown
    const entityResult = await env.DB.prepare(`
      SELECT 
        sender,
        COUNT(*) as count
      FROM \`texts-bc\`
      GROUP BY sender
    `).all();

    // Get emotion breakdown
    const emotionResult = await env.DB.prepare(`
      SELECT 
        sentiment,
        COUNT(*) as count
      FROM \`texts-bc\`
      WHERE sentiment IS NOT NULL
      GROUP BY sentiment
    `).all();

    // Calculate journey span
    let journeySpan = '2.5 Years';
    if (dateRangeResult?.earliest && dateRangeResult?.latest) {
      const start = new Date(dateRangeResult.earliest);
      const end = new Date(dateRangeResult.latest);
      const years = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
      journeySpan = years >= 1 ? `${years.toFixed(1)} Years` : `${Math.ceil(years * 12)} Months`;
    }

    const stats = {
      totalMessages,
      journeySpan,
      dateRange: {
        earliest: dateRangeResult?.earliest,
        latest: dateRangeResult?.latest
      },
      entities: entityResult.results || [],
      emotions: emotionResult.results || []
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Stats query error:', error);
    throw new Error(`Stats query failed: ${error.message}`);
  }
}

// Handle search endpoint (for typeahead/suggestions)
async function handleSearch(request, env, corsHeaders) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!query || query.length < 2) {
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const result = await env.DB.prepare(`
      SELECT DISTINCT
        message,
        sender,
        date_time,
        sentiment
      FROM \`texts-bc\`
      WHERE message LIKE ?
      ORDER BY date_time DESC
      LIMIT ?
    `).bind(`%${query}%`, limit).all();

    const suggestions = result.results.map(row => ({
      message: row.message,
      entity: row.sender,
      datetime: row.date_time,
      emotion: mapSentimentToEmotion(row.sentiment)
    }));

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search query error:', error);
    throw new Error(`Search query failed: ${error.message}`);
  }
}

// Helper Functions

function getDateRangeCondition(dateRange) {
  const now = new Date();
  let startDate;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return null;
  }

  return `date_time >= '${startDate.toISOString()}'`;
}

function mapSentimentToEmotion(sentiment) {
  const mapping = {
    'positive': 'positive',
    'negative': 'negative',
    'neutral': 'neutral',
    'mixed': 'mixed'
  };
  return mapping[sentiment] || 'neutral';
}

function detectAttachmentType(attachmentString) {
  if (!attachmentString) return null;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const videoExtensions = ['.mp4', '.mov', '.avi'];
  const audioExtensions = ['.mp3', '.wav', '.m4a'];
  
  const lower = attachmentString.toLowerCase();
  
  if (imageExtensions.some(ext => lower.includes(ext))) return 'image';
  if (videoExtensions.some(ext => lower.includes(ext))) return 'video';
  if (audioExtensions.some(ext => lower.includes(ext))) return 'audio';
  
  return 'other';
}

function extractTimeFromDateTime(dateTime) {
  if (!dateTime) return '00:00';
  try {
    return new Date(dateTime).toTimeString().split(' ')[0].slice(0, 5);
  } catch {
    return '00:00';
  }
}