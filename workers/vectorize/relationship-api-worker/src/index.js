// Cloudflare Worker for Relationship Dashboard API
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    
    // Enable CORS for your Next.js app
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      switch (pathname) {
        case '/api/relationship-metrics':
          return await getRelationshipMetrics(env.HYPERDRIVE, corsHeaders);
        case '/api/text-analytics':
          return await getTextAnalytics(env.HYPERDRIVE, corsHeaders);
        case '/api/dashboard-summary':
          return await getDashboardSummary(env.HYPERDRIVE, corsHeaders);
        case '/api/relationship-health':
          return await getRelationshipHealth(env.HYPERDRIVE, corsHeaders);
        default:
          return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function getRelationshipMetrics(db, corsHeaders) {
  // Main relationship data with key metrics
  const relationships = await db.prepare(`
    SELECT 
      *,
      -- Calculate days since last contact
      EXTRACT(DAY FROM NOW() - last_contact_date) as days_since_contact,
      -- Calculate relationship health score (customize based on your fields)
      CASE 
        WHEN last_contact_date >= NOW() - INTERVAL '7 days' THEN 100
        WHEN last_contact_date >= NOW() - INTERVAL '14 days' THEN 85
        WHEN last_contact_date >= NOW() - INTERVAL '30 days' THEN 70
        WHEN last_contact_date >= NOW() - INTERVAL '60 days' THEN 50
        ELSE 25
      END as calculated_health_score
    FROM relationship_tracker 
    ORDER BY last_contact_date DESC
  `).all();
  
  return new Response(JSON.stringify({
    relationships: relationships.results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getTextAnalytics(db, corsHeaders) {
  // Text communication patterns and trends
  const textTrends = await db.prepare(`
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as message_count,
      AVG(LENGTH(message)) as avg_message_length,
      COUNT(DISTINCT sender) as unique_senders
    FROM texts_brandon 
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date DESC
  `).all();
  
  // Most active communication relationships
  const topCommunications = await db.prepare(`
    SELECT 
      sender,
      COUNT(*) as message_count,
      MAX(created_at) as last_message_date,
      AVG(LENGTH(message)) as avg_message_length
    FROM texts_brandon 
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY sender
    ORDER BY message_count DESC
    LIMIT 10
  `).all();
  
  // Response time analysis (assuming you have conversation threads)
  const responseAnalysis = await db.prepare(`
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      AVG(
        EXTRACT(EPOCH FROM (
          created_at - LAG(created_at) OVER (ORDER BY created_at)
        )) / 3600
      ) as avg_response_time_hours
    FROM texts_brandon 
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date DESC
  `).all();
  
  return new Response(JSON.stringify({
    textTrends: textTrends.results,
    topCommunications: topCommunications.results,
    responseAnalysis: responseAnalysis.results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getDashboardSummary(db, corsHeaders) {
  // High-level KPIs for the dashboard
  const summary = await db.prepare(`
    SELECT 
      COUNT(*) as total_relationships,
      COUNT(CASE WHEN last_contact_date >= NOW() - INTERVAL '7 days' THEN 1 END) as active_this_week,
      COUNT(CASE WHEN last_contact_date >= NOW() - INTERVAL '30 days' THEN 1 END) as active_this_month,
      AVG(
        CASE 
          WHEN last_contact_date >= NOW() - INTERVAL '7 days' THEN 100
          WHEN last_contact_date >= NOW() - INTERVAL '14 days' THEN 85
          WHEN last_contact_date >= NOW() - INTERVAL '30 days' THEN 70
          WHEN last_contact_date >= NOW() - INTERVAL '60 days' THEN 50
          ELSE 25
        END
      ) as avg_health_score
    FROM relationship_tracker
  `).first();
  
  // Text message summary for the same period
  const textSummary = await db.prepare(`
    SELECT 
      COUNT(*) as total_messages_30d,
      COUNT(DISTINCT sender) as unique_contacts_30d,
      AVG(LENGTH(message)) as avg_message_length
    FROM texts_brandon 
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `).first();
  
  // Calculate trend (comparing last 30 days vs previous 30 days)
  const previousPeriodTexts = await db.prepare(`
    SELECT COUNT(*) as prev_month_messages
    FROM texts_brandon 
    WHERE created_at >= NOW() - INTERVAL '60 days' 
      AND created_at < NOW() - INTERVAL '30 days'
  `).first();
  
  const communicationTrend = textSummary && previousPeriodTexts?.prev_month_messages > 0 
    ? ((textSummary.total_messages_30d - previousPeriodTexts.prev_month_messages) / previousPeriodTexts.prev_month_messages * 100).toFixed(1)
    : 0;
  
  return new Response(JSON.stringify({
    totalRelationships: summary?.total_relationships || 0,
    activeThisWeek: summary?.active_this_week || 0,
    activeThisMonth: summary?.active_this_month || 0,
    averageHealthScore: Math.round(summary?.avg_health_score || 0),
    totalMessages30d: textSummary?.total_messages_30d || 0,
    uniqueContacts30d: textSummary?.unique_contacts_30d || 0,
    communicationTrend: `${communicationTrend > 0 ? '+' : ''}${communicationTrend}%`,
    responsiveContacts: 89, // Calculate based on your response time logic
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getRelationshipHealth(db, corsHeaders) {
  // Advanced relationship health analysis
  const healthAnalysis = await db.prepare(`
    WITH relationship_stats AS (
      SELECT 
        rt.*,
        COUNT(tb.id) as message_count,
        MAX(tb.created_at) as last_text_date,
        AVG(LENGTH(tb.message)) as avg_message_length,
        EXTRACT(DAY FROM NOW() - GREATEST(rt.last_contact_date, MAX(tb.created_at))) as days_since_last_interaction
      FROM relationship_tracker rt
      LEFT JOIN texts_brandon tb ON rt.contact_id = tb.sender -- Adjust join condition based on your schema
      WHERE rt.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY rt.id
    )
    SELECT 
      *,
      CASE 
        WHEN days_since_last_interaction <= 7 THEN 'Excellent'
        WHEN days_since_last_interaction <= 14 THEN 'Good'
        WHEN days_since_last_interaction <= 30 THEN 'Fair'
        WHEN days_since_last_interaction <= 60 THEN 'Poor'
        ELSE 'Critical'
      END as health_status,
      CASE 
        WHEN days_since_last_interaction <= 7 THEN 95
        WHEN days_since_last_interaction <= 14 THEN 80
        WHEN days_since_last_interaction <= 30 THEN 65
        WHEN days_since_last_interaction <= 60 THEN 40
        ELSE 15
      END as health_score
    FROM relationship_stats
    ORDER BY health_score DESC, days_since_last_interaction ASC
  `).all();
  
  return new Response(JSON.stringify({
    healthAnalysis: healthAnalysis.results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Additional utility functions for your specific use cases

async function getRelationshipGrowth(db, corsHeaders) {
  // Track relationship network growth over time
  const growth = await db.prepare(`
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as new_relationships,
      SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_relationships
    FROM relationship_tracker
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month
  `).all();
  
  return new Response(JSON.stringify({
    growth: growth.results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCommunicationHeatmap(db, corsHeaders) {
  // Generate data for communication heatmap (day of week, hour of day)
  const heatmapData = await db.prepare(`
    SELECT 
      EXTRACT(DOW FROM created_at) as day_of_week,
      EXTRACT(HOUR FROM created_at) as hour_of_day,
      COUNT(*) as message_count
    FROM texts_brandon
    WHERE created_at >= NOW() - INTERVAL '90 days'
    GROUP BY EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
    ORDER BY day_of_week, hour_of_day
  `).all();
  
  return new Response(JSON.stringify({
    heatmapData: heatmapData.results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}