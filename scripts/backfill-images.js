// Script to connect your existing R2 images to database records
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Manual mapping of your uploaded images to events
const imageMapping = [
  {
    eventId: 1,
    imageName: 'vacation_beach_2023.jpg', // Your actual filename in R2
    description: 'Beach vacation'
  },
  {
    eventId: 2,
    imageName: 'anniversary_dinner.jpg',
    description: 'Anniversary dinner'
  },
  // Add all your manually uploaded images here
];

const backfillImages = async () => {
  const R2_BASE_URL = 'https://your-bucket-name.r2.dev'; // Your actual R2 domain
  
  for (const mapping of imageMapping) {
    const imageUrl = `${R2_BASE_URL}/${mapping.imageName}`;
    const thumbnailUrl = `${R2_BASE_URL}/thumbs/${mapping.imageName}`; // If you have thumbnails
    
    try {
      const { data, error } = await supabase
        .from('relationship_events')
        .update({
          image_url: imageUrl,
          image_thumbnail_url: thumbnailUrl || imageUrl, // Use same if no thumbnail
          image_alt_text: mapping.description
        })
        .eq('id', mapping.eventId);
        
      if (error) {
        console.error(`Failed to update event ${mapping.eventId}:`, error);
      } else {
        console.log(`✅ Updated event ${mapping.eventId} with image ${mapping.imageName}`);
      }
    } catch (err) {
      console.error(`Error processing event ${mapping.eventId}:`, err);
    }
  }
  
  console.log('🎉 Backfill complete!');
};

// Run the backfill
backfillImages();