#!/bin/bash

# 🥽 Unmask - Conversation Intelligence Setup
# This script sets up your complete relationship analysis infrastructure

set -e

echo "🥽 UNMASK - Relationship Intelligence Platform Setup"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Please install it first:${NC}"
    echo "npm install -g wrangler"
    exit 1
fi

if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please authenticate with Cloudflare:${NC}"
    wrangler login
fi

echo -e "${GREEN}✅ Prerequisites check complete${NC}"
echo ""

# Step 1: Create Vectorize Index
echo -e "${PURPLE}🧠 Setting up vector intelligence system...${NC}"

# Check if vectorize index exists
if ! wrangler vectorize list | grep -q "unmask-conversations"; then
    echo -e "${CYAN}Creating vectorize index for conversation embeddings...${NC}"
    wrangler vectorize create unmask-conversations --dimensions=1024 --metric=cosine
    echo -e "${GREEN}✅ Vector index created${NC}"
else
    echo -e "${YELLOW}ℹ️  Vectorize index already exists${NC}"
fi

# Step 2: Create Worker directories and files
echo -e "${PURPLE}📁 Setting up worker infrastructure...${NC}"

mkdir -p workers/vectorize/src

# Create wrangler.toml for the vectorization worker
cat > workers/vectorize/wrangler.toml << 'EOL'
name = "unmask-vectorize"
main = "src/worker.ts"
compatibility_date = "2024-07-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "megan-personal"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

[[vectorize]]
binding = "VECTORIZE"
index_name = "unmask-conversations"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-kv-namespace-id"

[vars]
# Environment variables (non-secret)
BATCH_SIZE = "50"
MAX_CHUNK_SIZE = "12"

# Secrets (set separately)
# OPENAI_API_KEY = set via wrangler secret
EOL

# Copy the worker code (you'll need to paste the TypeScript code from the artifact)
cat > workers/vectorize/src/worker.ts << 'EOL'
// Paste the complete TypeScript code from the vectorization worker artifact here
// This is a placeholder - you'll need to copy the actual code
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    return new Response('Unmask Vectorization Worker - Please replace with actual code from artifact');
  }
};
EOL

echo -e "${YELLOW}⚠️  IMPORTANT: Copy the vectorization worker code from the artifact into workers/vectorize/src/worker.ts${NC}"
echo ""

# Step 3: Update Next.js project configuration
echo -e "${PURPLE}⚙️  Updating Next.js project configuration...${NC}"

# Update wrangler.jsonc to include all required bindings
cat > wrangler.jsonc << 'EOL'
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "unmask-dashboard", 
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true,
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "megan-personal", 
      "database_id": "f450193b-9536-4ada-8271-2a8cd917069e"
    }
  ],
  "vectorize": [
    {
      "binding": "VECTORIZE",
      "index_name": "unmask-conversations"
    }
  ]
}
EOL

echo -e "${GREEN}✅ Project configuration updated${NC}"

# Step 4: Create the API routes
echo -e "${PURPLE}🌐 Setting up API routes...${NC}"

mkdir -p src/app/api/conversation-insights
mkdir -p src/app/api/dashboard-data

echo -e "${YELLOW}📝 API route files created - copy the API code from artifacts${NC}"

# Step 5: Replace the main page with dashboard
echo -e "${PURPLE}🎨 Setting up dashboard interface...${NC}"

# Backup original page
if [ -f "src/app/page.tsx" ]; then
    cp src/app/page.tsx src/app/page.tsx.backup
    echo -e "${CYAN}📦 Original page.tsx backed up${NC}"
fi

echo -e "${YELLOW}🎨 Copy the dashboard React component code into src/app/page.tsx${NC}"
echo ""

# Step 6: Display next steps
echo -e "${GREEN}🎉 SETUP COMPLETE! Next steps:${NC}"
echo -e "${CYAN}================================${NC}"
echo ""
echo -e "${YELLOW}1. Set your OpenAI API key:${NC}"
echo "   cd workers/vectorize"
echo "   wrangler secret put OPENAI_API_KEY"
echo ""
echo -e "${YELLOW}2. Copy the worker code:${NC}"
echo "   - Copy the vectorization worker TypeScript code into:"
echo "     workers/vectorize/src/worker.ts"
echo ""
echo -e "${YELLOW}3. Copy the API routes:${NC}"
echo "   - Copy conversation-insights API code into:"
echo "     src/app/api/conversation-insights/route.ts"
echo "   - Copy dashboard-data API code into:"
echo "     src/app/api/dashboard-data/route.ts"
echo ""
echo -e "${YELLOW}4. Copy the dashboard component:${NC}"
echo "   - Replace src/app/page.tsx with the dashboard React component"
echo ""
echo -e "${YELLOW}5. Deploy the vectorization worker:${NC}"
echo "   cd workers/vectorize"
echo "   wrangler deploy"
echo ""
echo -e "${YELLOW}6. Deploy your dashboard:${NC}"
echo "   npm run deploy"
echo ""
echo -e "${YELLOW}7. Start the conversation analysis:${NC}"
echo "   curl -X POST https://unmask-vectorize.your-domain.workers.dev/vectorize-conversations"
echo ""
echo -e "${GREEN}🧠 Your relationship intelligence system is ready!${NC}"
echo ""
echo -e "${PURPLE}📊 What this will give you:${NC}"
echo "• Emotional journey mapping over time"
echo "• Communication pattern recognition"
echo "• Conflict resolution analysis"
echo "• Intimacy level tracking"
echo "• Relationship arc visualization"
echo "• Conversation context intelligence"
echo "• Predictive relationship insights"
echo ""
echo -e "${CYAN}💡 The system will analyze your 27,689 messages and create${NC}"
echo -e "${CYAN}   intelligent conversation chunks with OpenAI GPT-4 insights!${NC}"
EOL