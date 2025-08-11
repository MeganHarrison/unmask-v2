#!/bin/bash

echo "🧪 Testing All Unmask Agents..."
echo "================================"

# Orchestrator
echo -e "\n🎯 Testing Orchestrator Agent..."
curl -X POST https://unmask-orchestrator-production.megan-d14.workers.dev/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help with my relationship",
    "context": {"currentHealthScore": 7, "primaryConcerns": ["communication"]},
    "conversationHistory": []
  }' 2>/dev/null | jq .

# Memory Agent
echo -e "\n🧠 Testing Memory Agent..."
curl -X POST https://unmask-memory-agent-production.megan-d14.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "queryType": "conversation_history"
  }' 2>/dev/null | jq .

# Coaching Agent
echo -e "\n💬 Testing Coaching Agent..."
echo "Health check:"
curl https://unmask-coaching-production.megan-d14.workers.dev/health 2>/dev/null | jq .
echo "Coach endpoint:"
curl -X POST https://unmask-coaching-production.megan-d14.workers.dev/coach \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How can I improve communication?",
    "context": {"relationshipLength": "2 years"}
  }' 2>/dev/null | jq .

# Data Ingestion
echo -e "\n📥 Testing Data Ingestion Agent..."
curl https://unmask-data-ingestion-production.megan-d14.workers.dev/health 2>/dev/null | jq .

echo -e "\n✅ All tests complete!"