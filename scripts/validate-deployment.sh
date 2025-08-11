// scripts/validate-deployment.sh - Bash script for quick validation
#!/bin/bash

echo "🚀 Validating Unmask Deployment"
echo "=================================="

# Check if required tools are installed
command -v wrangler >/dev/null 2>&1 || { echo "❌ Wrangler CLI not installed"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }

echo "✅ Tools check passed"

# Check Cloudflare resources
echo "📡 Checking Cloudflare resources..."

# List KV namespaces
echo "KV Namespaces:"
wrangler kv:namespace list

# List D1 databases  
echo "D1 Databases:"
wrangler d1 list

# List Vectorize indexes
echo "Vectorize Indexes:"
wrangler vectorize list

# List R2 buckets
echo "R2 Buckets:"
wrangler r2 bucket list

echo "✅ Cloudflare resources check complete"

# Test worker deployment
echo "🔄 Testing worker deployments..."

# Check if workers are deployed
workers=("unmask-orchestrator" "unmask-memory-agent" "unmask-coaching-agent" "unmask-data-ingestion")

for worker in "${workers[@]}"; do
  if wrangler list | grep -q $worker; then
    echo "✅ $worker deployed"
  else
    echo "❌ $worker not found"
  fi
done

echo "=================================="
echo "Run 'npm run test:system' for full integration test"