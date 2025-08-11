#!/bin/bash

# Script to migrate contextual intelligence tables to megan-personal database

echo "🚀 Migrating Contextual Intelligence Tables to megan-personal database..."

# Set database ID
DB_ID="f450193b-9536-4ada-8271-2a8cd917069e"

# Run the migration
echo "📊 Creating contextual tables..."
npx wrangler d1 execute megan-personal --file=./workers/enhanced-relationship-intelligence-worker/migrations/001_create_contextual_tables.sql --remote

# Verify tables were created
echo "✅ Verifying migration..."
npx wrangler d1 execute megan-personal --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('daily_context', 'contextual_messages', 'relationship_events', 'connection_metrics', 'pattern_recognition', 'transition_tracking');" --remote

echo "✨ Migration complete! Your contextual intelligence tables are now in the megan-personal database."
echo ""
echo "Next steps:"
echo "1. Deploy the worker: cd workers/enhanced-relationship-intelligence-worker && npx wrangler deploy"
echo "2. Set the OPENAI_API_KEY secret: npx wrangler secret put OPENAI_API_KEY"
echo "3. Test the worker endpoints"