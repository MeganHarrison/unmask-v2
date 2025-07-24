// Unmask Relationship Intelligence API
// Deploy this as a Cloudflare Worker

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for frontend access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: Get monthly timeline data
      if (path === '/api/timeline' && request.method === 'GET') {
        const stmt = env.DB.prepare(`
          SELECT * FROM monthly_relationship_insights 
          ORDER BY month
        `);
        const results = await stmt.all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results.results,
          meta: {
            total_months: results.results.length,
            date_range: {
              start: results.results[0]?.month,
              end: results.results[results.results.length - 1]?.month
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route: Get detailed monthly drill-down
      if (path.startsWith('/api/month/') && request.method === 'GET') {
        const selectedMonth = path.split('/')[3]; // Extract month from /api/month/2024-08
        
        if (!selectedMonth || !selectedMonth.match(/^\d{4}-\d{2}$/)) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid month format. Use YYYY-MM' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get month overview
        const overviewStmt = env.DB.prepare(`
          SELECT * FROM monthly_relationship_insights 
          WHERE month = ?
        `);
        const overview = await overviewStmt.bind(selectedMonth).first();

        if (!overview) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Month not found' 
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get sample messages from that month
        const messagesStmt = env.DB.prepare(`
          SELECT date, time, sender, message, sentiment_score, emotional_score, category
          FROM \`texts-bc\`
          WHERE CASE 
            WHEN date LIKE '%/%/23' THEN '2023-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
            WHEN date LIKE '%/%/24' THEN '2024-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
            WHEN date LIKE '%/%/25' THEN '2025-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
            WHEN date LIKE '%/%/22' THEN '2022-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
          END = ?
          ORDER BY date, time
          LIMIT 50
        `);
        const messages = await messagesStmt.bind(selectedMonth).all();

        // Get daily summaries for trend analysis
        const dailyStmt = env.DB.prepare(`
          SELECT 
            date,
            COUNT(*) as daily_message_count,
            COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) as brandon_daily_messages,
            COUNT(CASE WHEN sender != 'Brandon' THEN 1 END) as user_daily_messages,
            AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END) as daily_avg_sentiment,
            COUNT(CASE WHEN conflict_detected = 1 THEN 1 END) as daily_conflicts,
            COUNT(CASE WHEN LOWER(message) LIKE '%love%' OR message LIKE '%❤%' OR message LIKE '%💕%' THEN 1 END) as daily_love_expressions
          FROM \`texts-bc\`
          WHERE CASE 
            WHEN date LIKE '%/%/23' THEN '2023-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
            WHEN date LIKE '%/%/24' THEN '2024-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
            WHEN date LIKE '%/%/25' THEN '2025-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
            WHEN date LIKE '%/%/22' THEN '2022-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
          END = ?
          GROUP BY date
          ORDER BY date
        `);
        const dailyTrends = await dailyStmt.bind(selectedMonth).all();

        return new Response(JSON.stringify({
          success: true,
          data: {
            overview,
            sample_messages: messages.results,
            daily_trends: dailyTrends.results,
            context: {
              total_messages: overview.message_count,
              avg_daily_frequency: overview.messages_per_day,
              emotional_indicators: {
                love_expressions: overview.love_expressions,
                conflicts: overview.conflict_count,
                relationship_phase: overview.relationship_phase
              },
              major_events: overview.story_events_list ? overview.story_events_list.split(' | ') : []
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route: Generate AI Analysis
      if (path === '/api/analyze' && request.method === 'POST') {
        const { month, force_refresh = false } = await request.json();
        
        if (!month || !month.match(/^\d{4}-\d{2}$/)) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid month format. Use YYYY-MM' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check cache first (unless force refresh)
        let cachedAnalysis = null;
        if (!force_refresh) {
          const cacheStmt = env.DB.prepare(`
            SELECT ai_analysis_json, created_at 
            FROM monthly_analysis_cache 
            WHERE month = ?
          `);
          cachedAnalysis = await cacheStmt.bind(month).first();
        }

        if (cachedAnalysis && !force_refresh) {
          return new Response(JSON.stringify({
            success: true,
            data: JSON.parse(cachedAnalysis.ai_analysis_json),
            cached: true,
            generated_at: cachedAnalysis.created_at
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get month data for AI analysis
        const monthDataStmt = env.DB.prepare(`
          SELECT * FROM monthly_relationship_insights WHERE month = ?
        `);
        const monthData = await monthDataStmt.bind(month).first();

        if (!monthData) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Month data not found' 
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Generate AI analysis using Claude
        const aiAnalysis = await generateAIAnalysis(monthData, env);

        // Cache the result
        const cacheInsertStmt = env.DB.prepare(`
          INSERT OR REPLACE INTO monthly_analysis_cache (month, ai_analysis_json, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `);
        await cacheInsertStmt.bind(month, JSON.stringify(aiAnalysis)).run();

        return new Response(JSON.stringify({
          success: true,
          data: aiAnalysis,
          cached: false,
          generated_at: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route: Health check
      if (path === '/api/health' && request.method === 'GET') {
        const healthStmt = env.DB.prepare(`
          SELECT COUNT(*) as total_messages FROM \`texts-bc\`
        `);
        const health = await healthStmt.first();
        
        return new Response(JSON.stringify({
          success: true,
          status: 'healthy',
          database_connected: true,
          total_messages: health.total_messages,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Route not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

// AI Analysis Function using Claude API
async function generateAIAnalysis(monthData, env) {
  const prompt = `Analyze this relationship month based on the following data:

Month: ${monthData.month}
Messages: ${monthData.message_count} total (${monthData.messages_per_day}/day)
Love expressions: ${monthData.love_expressions}
Communication balance: ${Math.round(monthData.brandon_message_ratio * 100)}% Brandon, ${Math.round((1 - monthData.brandon_message_ratio) * 100)}% User
Conflicts detected: ${monthData.conflict_count}
Major events: ${monthData.story_events_list || 'None recorded'}
Relationship phase: ${monthData.relationship_phase}
Average message length: ${monthData.avg_message_length} characters

Provide a brutally honest analysis in JSON format with these exact keys:
{
  "emotional_arc": "What was the emotional journey this month?",
  "communication_patterns": "What do the message patterns reveal?",
  "turning_points": "Any significant moments or shifts?",
  "growth_insights": "What strengths/weaknesses emerged?",
  "red_flags": "Any concerning patterns?",
  "relationship_strengths": "What worked well?",
  "summary_score": "Rate this month 1-10 for relationship health",
  "action_items": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
}

Be specific, data-driven, and focus on actionable insights. Your entire response must be valid JSON only.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    let analysisText = data.content[0].text;
    
    // Clean up the response (remove markdown formatting if present)
    analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const analysis = JSON.parse(analysisText);
    
    return {
      ...analysis,
      generated_at: new Date().toISOString(),
      month: monthData.month,
      raw_data: monthData
    };

  } catch (error) {
    console.error('Claude API Error:', error);
    
    // Fallback analysis if Claude API fails
    return {
      emotional_arc: `Month ${monthData.month} shows ${monthData.relationship_phase.toLowerCase()} patterns with ${monthData.message_count} messages and ${monthData.love_expressions} love expressions.`,
      communication_patterns: `Communication frequency of ${monthData.messages_per_day} messages/day suggests ${monthData.messages_per_day > 30 ? 'high engagement' : 'moderate engagement'}.`,
      turning_points: monthData.story_events_list || 'No major events recorded for this period.',
      growth_insights: `Balanced communication (${Math.round(monthData.brandon_message_ratio * 100)}% Brandon) shows healthy relationship dynamics.`,
      red_flags: monthData.conflict_count > 5 ? 'Multiple conflicts detected - monitor communication patterns.' : 'No significant red flags detected.',
      relationship_strengths: `Consistent communication and ${monthData.love_expressions} expressions of affection show strong emotional connection.`,
      summary_score: monthData.connection_level,
      action_items: ['Monitor communication patterns', 'Continue current relationship practices'],
      generated_at: new Date().toISOString(),
      month: monthData.month,
      fallback: true,
      error: error.message
    };
  }
}