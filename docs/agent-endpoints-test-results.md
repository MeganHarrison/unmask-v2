# Unmask Agent Endpoints Test Results

## Testing Summary
Date: 2025-07-26

### 1. Orchestrator Agent ✅
**URL**: https://unmask-orchestrator-production.megan-d14.workers.dev

#### /classify endpoint (POST)
**Status**: ✅ Working

**Test Request**:
```bash
curl -X POST https://unmask-orchestrator-production.megan-d14.workers.dev/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I'm worried about our communication lately",
    "context": {
      "currentHealthScore": 7,
      "primaryConcerns": ["communication", "distance"]
    },
    "conversationHistory": []
  }'
```

**Response**:
```json
{
  "intent": "PATTERN_ANALYSIS",
  "confidence": 0.2,
  "reasoning": "Detected patterns: lately, worried about",
  "keyPhrases": ["lately", "worried about"],
  "emotionalContext": "neutral",
  "urgency": "low"
}
```

### 2. Memory Agent ✅
**URL**: https://unmask-memory-agent-production.megan-d14.workers.dev

#### Root endpoint (POST)
**Status**: ✅ Working (returns fallback response due to missing dependencies)

**Test Request**:
```bash
curl -X POST https://unmask-memory-agent-production.megan-d14.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "queryType": "search",
    "query": "Remember when we had that big fight last month?",
    "includeContext": true,
    "limit": 5
  }'
```

**Response**:
```json
{
  "agentType": "memory-agent-fallback",
  "results": [],
  "totalCount": 0,
  "insights": ["Unable to process memory request at this time"],
  "confidence": 0.1
}
```

**Expected Query Types**:
- `search` - Semantic search through messages
- `timeline` - Generate relationship timeline
- `patterns` - Analyze communication patterns
- `context` - Retrieve conversation context
- `insights` - Generate AI insights

**Required Fields**:
- `userId` (required)
- `queryType` (required)
- `query` (optional for search)
- `timeframe` (optional)
- `filters` (optional)
- `limit` (optional)
- `includeContext` (optional)

### 3. Coaching Agent ❌
**URL**: https://unmask-coaching-agent-production.megan-d14.workers.dev

#### All endpoints returning 404 with error code 1042
**Status**: ❌ Worker appears to be misconfigured or not deployed properly

**Expected Endpoints** (from code):
- `/health` (GET) - Health check
- `/coach` (POST) - Coaching endpoint (currently returns "under implementation" message)

**Test Attempts**:
- Root endpoint: 404 error
- `/health`: 404 error  
- `/advise`: 404 error (wrong endpoint)

### 4. Data Ingestion Agent ❌
**URL**: https://unmask-data-ingestion-production.megan-d14.workers.dev

#### All endpoints returning 404
**Status**: ❌ Worker appears to be misconfigured or not deployed properly

**Expected Endpoints** (from code):
- `/health` (GET) - Health check
- `/process` (POST) - Process CSV file upload
- `/status/{jobId}` (GET) - Check processing job status

**Test Attempts**:
- Root endpoint: 404 error
- `/ingest`: 404 error (wrong endpoint)

## Recommendations

1. **Working Agents**:
   - Orchestrator: Fully functional for classification
   - Memory Agent: Functional but needs database/KV/vectorize bindings to work properly

2. **Non-Working Agents**:
   - Coaching Agent: Needs redeployment or configuration fix
   - Data Ingestion Agent: Needs redeployment or configuration fix

3. **Next Steps**:
   - Check wrangler.toml configurations for coaching and data ingestion agents
   - Verify routes are properly configured in Cloudflare dashboard
   - Redeploy the non-working agents
   - Add proper error handling for missing dependencies in memory agent

## Test Script

Save this as `test-agents.sh`:

```bash
#!/bin/bash

echo "Testing Unmask Agents..."
echo "========================"

# Test Orchestrator
echo -e "\n1. Testing Orchestrator /classify:"
curl -X POST https://unmask-orchestrator-production.megan-d14.workers.dev/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help with my relationship",
    "context": {
      "currentHealthScore": 7,
      "primaryConcerns": ["communication"]
    },
    "conversationHistory": []
  }' 2>/dev/null | jq .

# Test Memory Agent
echo -e "\n2. Testing Memory Agent:"
curl -X POST https://unmask-memory-agent-production.megan-d14.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "queryType": "search",
    "query": "happy moments",
    "limit": 5
  }' 2>/dev/null | jq .

# Test Coaching Agent Health
echo -e "\n3. Testing Coaching Agent /health:"
curl https://unmask-coaching-agent-production.megan-d14.workers.dev/health 2>/dev/null | jq .

# Test Data Ingestion Health
echo -e "\n4. Testing Data Ingestion /health:"
curl https://unmask-data-ingestion-production.megan-d14.workers.dev/health 2>/dev/null | jq .
```