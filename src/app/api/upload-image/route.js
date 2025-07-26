// app/api/upload-image/route.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const generateFileName = (originalName, eventId) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  
  return `events/${eventId}/${timestamp}_${sanitizedName}`;
};

const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
};

const uploadToR2 = async (buffer, fileName, mimeType) => {
  try {
    // Upload to R2 using REST API
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET_NAME}/objects/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_R2_TOKEN}`,
          'Content-Type': mimeType,
        },
        body: buffer,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`R2 upload failed: ${uploadResponse.statusText}`);
    }

    // Return the public URL
    const imageUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/${fileName}`;
    const thumbnailUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/cdn-cgi/image/width=300,height=300,fit=cover/${fileName}`;

    return { imageUrl, thumbnailUrl };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw error;
  }
};

const updateEventWithImage = async (eventId, imageUrl, thumbnailUrl) => {
  const { data, error } = await supabase
    .from('relationship_events')
    .update({
      photo: imageUrl, // Using 'photo' field based on the events/create page
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select();

  if (error) {
    console.error('Database update error:', error);
    throw new Error(`Failed to update database: ${error.message}`);
  }

  return data[0];
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const eventId = formData.get('eventId');

    if (!file) {
      return Response.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!eventId) {
      return Response.json(
        { success: false, message: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Validate file
    validateFile(file);

    // Generate filename
    const fileName = generateFileName(file.name, eventId);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const { imageUrl, thumbnailUrl } = await uploadToR2(buffer, fileName, file.type);

    // Update database if not a temporary event
    let updatedEvent = null;
    if (!eventId.startsWith('temp_')) {
      updatedEvent = await updateEventWithImage(eventId, imageUrl, thumbnailUrl);
    }

    return Response.json({
      success: true,
      imageUrl,
      thumbnailUrl,
      fileName,
      eventId,
      updatedEvent,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return Response.json(
      {
        success: false,
        message: error.message || 'Upload failed',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}