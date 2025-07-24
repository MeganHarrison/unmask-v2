#!/bin/bash

echo "🚀 Deploying All Unmask Workers..."

echo "📊 Deploying API Worker..."
cd unmask-api && npx wrangler deploy && cd ..

echo "🔍 Deploying Vectorize Worker..."
cd vectorize && npx wrangler deploy && cd ..

echo "✅ All workers deployed successfully!"