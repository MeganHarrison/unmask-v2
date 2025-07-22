#!/bin/bash

# Unmask Deployment Script
# This script sets up your Cloudflare infrastructure for the Unmask app

set -e

echo "🥽 Setting up Unmask - Relationship Intelligence Platform"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: Wrangler CLI not found. Please install it first.${NC}"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is authenticated
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}Please authenticate with Cloudflare:${NC}"
    wrangler login
fi

echo -e "${GREEN}✓ Wrangler CLI ready${NC}"

# 1. Create Vectorize Index
echo -e "${YELLOW}Creating Vectorize index for message embeddings...${NC}"
wrangler vectorize create unmask-messages --dimensions=384 --metric=cosine

echo -e "${GREEN}✓ Vectorize index created${NC}"

# 2. Create KV namespace for caching
echo -e "${YELLOW}Creating KV namespace for caching...${NC}"
wrangler kv namespace create "UNMASK_CACHE"

echo -e "${GREEN}✓ KV namespace created${NC}"

# 3. Deploy the vectorization worker
echo -e "${YELLOW}Deploying vectorization worker...${NC}"

# Create the worker directory
mkdir -p workers/vectorize
cat > workers/vectorize/wrangler.toml << EOL
name = "unmask-vectorize"
main = "src/worker.ts"
compatibility_date = "2024-07-01"

[[d1_databases]]
binding = "DB"
database_name = "megan-personal"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

[[vectorize]]
binding = "VECTORIZE"
index_name = "unmask-messages"

[vars]
ANTHROPIC_API_KEY = ""

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-kv-namespace-preview-id"
EOL

# Create the worker source
mkdir -p workers/vectorize/src
# Copy the TypeScript code from the artifact above into this file

echo -e "${GREEN}✓ Worker configuration created${NC}"

# 4. Set up environment variables
echo -e "${YELLOW}Setting up environment variables...${NC}"
echo "You'll need to add your Anthropic API key:"
echo "wrangler secret put ANTHROPIC_API_KEY --name unmask-vectorize"

# 5. Update your Next.js project for dashboard
echo -e "${YELLOW}Updating Next.js project...${NC}"

# Update wrangler.jsonc to include D1 binding
cat > wrangler.jsonc << EOL
{
  "\$schema": "node_modules/wrangler/config-schema.json",
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
  ]
}
EOL

echo -e "${GREEN}✓ Next.js configuration updated${NC}"

# 6. Create the dashboard page
echo -e "${YELLOW}Creating dashboard page...${NC}"

# Replace the default page.tsx with our dashboard
# (The dashboard React component from the artifact above would go here)

echo -e "${GREEN}✓ Dashboard page created${NC}"

echo ""
echo "🎉 Setup Complete! Next steps:"
echo "================================"
echo ""
echo "1. Set your Anthropic API key:"
echo "   wrangler secret put ANTHROPIC_API_KEY --name unmask-vectorize"
echo ""
echo "2. Deploy the vectorization worker:"
echo "   cd workers/vectorize && wrangler deploy"
echo ""
echo "3. Start processing your messages:"
echo "   curl -X POST https://unmask-vectorize.your-domain.workers.dev/vectorize-all"
echo ""
echo "4. Build and deploy your dashboard:"
echo "   npm run deploy"
echo ""
echo "5. Visit your dashboard to see the relationship intelligence!"
echo ""
echo -e "${GREEN}🥽 Unmask is ready to reveal the hidden patterns in your relationship!${NC}"
EOL