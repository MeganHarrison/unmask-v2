#!/bin/bash

# Script to populate Vectorize index with all conversations

ENDPOINT="https://next-starter-template.megan-d14.workers.dev/api/vectorize/populate"
BATCH_SIZE=1000
OFFSET=2000  # Starting from 2000 since we already did 0 and 1000
TOTAL_MESSAGES=35196
TOTAL_CONVERSATIONS=0

echo "Starting vectorization process..."
echo "Total messages to process: $TOTAL_MESSAGES"
echo "Batch size: $BATCH_SIZE"
echo ""

while [ $OFFSET -lt $TOTAL_MESSAGES ]; do
  echo "Processing batch at offset: $OFFSET"
  
  # Make the API call
  RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"batchSize\": $BATCH_SIZE, \"offset\": $OFFSET}")
  
  # Extract values from response
  SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | grep -o '[^:]*$')
  CONVERSATIONS=$(echo $RESPONSE | grep -o '"conversations":[^,}]*' | grep -o '[0-9]*$')
  HAS_MORE=$(echo $RESPONSE | grep -o '"hasMore":[^,}]*' | grep -o '[^:]*$')
  
  if [ "$SUCCESS" = "true" ]; then
    TOTAL_CONVERSATIONS=$((TOTAL_CONVERSATIONS + CONVERSATIONS))
    echo "✓ Successfully processed $CONVERSATIONS conversations"
    echo "  Total conversations so far: $TOTAL_CONVERSATIONS"
    
    if [ "$HAS_MORE" = "false" ]; then
      echo ""
      echo "✅ Vectorization complete!"
      echo "Total conversations vectorized: $TOTAL_CONVERSATIONS"
      break
    fi
    
    # Move to next batch
    OFFSET=$((OFFSET + BATCH_SIZE))
    
    # Small delay to avoid rate limiting
    echo "  Waiting 2 seconds before next batch..."
    sleep 2
  else
    echo "❌ Error processing batch at offset $OFFSET"
    echo "Response: $RESPONSE"
    exit 1
  fi
  
  echo ""
done

echo ""
echo "🎉 All messages have been vectorized into conversation chunks!"