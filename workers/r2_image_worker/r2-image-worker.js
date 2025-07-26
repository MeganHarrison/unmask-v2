// Cloudflare Worker for R2 image handling
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const eventId = formData.get('eventId');
      
      if (!file) {
        return new Response('No file provided', { status: 400 });
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `${eventId}_${Date.now()}.${fileExtension}`;
      const thumbnailName = `thumb_${fileName}`;

      // Upload original to R2
      await env.EVENT_IMAGES.put(`originals/${fileName}`, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // Create thumbnail (using Cloudflare Images API)
      const originalUrl = `https://images.your-domain.com/originals/${fileName}`;
      const thumbnailUrl = `https://images.your-domain.com/cdn-cgi/image/width=200,height=200,fit=cover/${originalUrl}`;

      // Update your database via Supabase
      const supabaseResponse = await fetch('https://your-project.supabase.co/rest/v1/relationship_events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'apikey': env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          image_url: originalUrl,
          image_thumbnail_url: thumbnailUrl,
        }),
      });

      return new Response(JSON.stringify({
        success: true,
        imageUrl: originalUrl,
        thumbnailUrl: thumbnailUrl,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};