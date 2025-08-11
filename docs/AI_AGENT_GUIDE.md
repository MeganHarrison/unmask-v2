# AI Agent Creation Guide

## Architecture Overview

Your AI system has three main components:
1. **Data Layer**: D1 (messages) + Vectorize (embeddings)
2. **API Layer**: Next.js API routes running on Cloudflare Workers
3. **AI Layer**: OpenAI for embeddings + chat completions

## Creating a New AI Agent

### Step 1: Define Your Agent's Purpose

Each agent should have a specific role. Examples:
- **Relationship Analyst**: Analyzes communication patterns
- **Conflict Resolver**: Identifies and helps resolve conflicts
- **Memory Assistant**: Recalls specific conversations or events
- **Mood Tracker**: Analyzes emotional patterns over time

### Step 2: Create the API Route

Create a new file in `/src/app/api/agents/[agent-name]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Define your agent's system prompt
const AGENT_PROMPT = `
You are a [AGENT ROLE]. Your expertise includes [SPECIFIC SKILLS].

AVAILABLE DATA:
{context}

YOUR MISSION:
[Specific instructions for this agent]

ANALYSIS FRAMEWORK:
1. [First thing to analyze]
2. [Second thing to analyze]
3. [Third thing to analyze]

RESPONSE GUIDELINES:
- Be specific and reference actual data
- Provide actionable insights
- Use examples from the conversations
`

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any
    
    // Get user query
    const { query, parameters } = await request.json()
    
    // 1. Generate embedding for the query
    const embedding = await generateEmbedding(query, env.OPENAI_API_KEY)
    
    // 2. Search for relevant context
    const matches = await searchVectorize(embedding, env.VECTORIZE_INDEX, parameters)
    
    // 3. Build context from matches
    const contextData = buildContext(matches)
    
    // 4. Generate response with your agent
    const response = await generateAgentResponse(
      AGENT_PROMPT,
      contextData,
      query,
      env.OPENAI_API_KEY
    )
    
    return NextResponse.json({
      success: true,
      response,
      sources: matches
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

### Step 3: Customize Vector Search

Different agents might need different search strategies:

```typescript
async function searchVectorize(embedding, vectorIndex, parameters) {
  const { 
    topK = 10,
    scoreThreshold = 0.7,
    dateRange,
    senderFilter,
    sentimentFilter 
  } = parameters
  
  // Basic search
  const results = await vectorIndex.query(embedding, { 
    topK,
    returnMetadata: true 
  })
  
  // Filter results based on agent needs
  return results.matches
    .filter(match => match.score >= scoreThreshold)
    .filter(match => {
      if (dateRange && match.metadata.date) {
        const messageDate = new Date(match.metadata.date)
        return messageDate >= dateRange.start && messageDate <= dateRange.end
      }
      return true
    })
    .filter(match => {
      if (senderFilter) {
        return match.metadata.sender.includes(senderFilter)
      }
      return true
    })
}
```

### Step 4: Agent-Specific Context Building

```typescript
function buildContext(matches) {
  // Different agents need different context formats
  return matches.map(match => {
    return {
      date: match.metadata.date,
      participants: match.metadata.sender,
      sentiment: match.metadata.sentiment,
      messageCount: match.metadata.messageCount,
      conversation: match.metadata.text,
      score: match.score
    }
  })
}
```

## Example Agents

### 1. Conflict Resolution Agent

```typescript
const CONFLICT_RESOLVER_PROMPT = `
You are a relationship conflict resolution specialist. You analyze conversations to identify conflicts and suggest resolution strategies.

CONVERSATION DATA:
{context}

YOUR ANALYSIS SHOULD INCLUDE:
1. Identify any conflicts or tensions in the conversations
2. Analyze communication patterns during conflicts
3. Identify triggers and escalation points
4. Note resolution attempts and their effectiveness
5. Suggest specific strategies for better conflict resolution

Focus on:
- Defensive vs collaborative language
- Emotional escalation patterns
- Unresolved issues that recur
- Successful de-escalation examples
`
```

### 2. Memory Assistant Agent

```typescript
const MEMORY_ASSISTANT_PROMPT = `
You are a memory assistant that helps recall specific conversations and events.

CONVERSATION DATA:
{context}

YOUR TASK:
- Find and summarize conversations related to the user's query
- Provide exact dates and quotes when possible
- Identify related conversations that might be relevant
- Create a timeline of events if multiple conversations are involved
`
```

### 3. Relationship Growth Tracker

```typescript
const GROWTH_TRACKER_PROMPT = `
You are a relationship growth analyst. You track how relationships evolve over time.

CONVERSATION DATA:
{context}

ANALYZE:
1. Communication frequency changes
2. Emotional depth progression
3. Topic evolution
4. Support patterns
5. Shared experiences and milestones

Provide specific examples showing growth or areas needing attention.
`
```

## Best Practices for Agent Design

### 1. Specific System Prompts
- Define clear roles and expertise
- Provide structured analysis frameworks
- Include specific examples of what to look for

### 2. Targeted Vector Search
- Adjust topK based on agent needs (memory agents need more, analyzers need less)
- Use metadata filters to focus on relevant conversations
- Consider time ranges for trend analysis

### 3. Response Formatting
- Structure responses consistently
- Use headers and bullet points
- Always include specific examples
- Provide actionable recommendations

### 4. Testing Your Agents

Create test queries for each agent:

```typescript
// Test queries for Conflict Resolution Agent
const testQueries = [
  "Show me our recent arguments",
  "How do we typically resolve conflicts?",
  "What triggers our disagreements?"
]

// Test queries for Memory Assistant
const memoryQueries = [
  "When did we discuss vacation plans?",
  "What did Brandon say about the wedding?",
  "Find conversations about moving"
]
```

## Advanced Techniques

### 1. Multi-Stage Analysis
Some agents might need multiple vector searches:

```typescript
// First search: Find conflicts
const conflictMatches = await searchWithQuery("arguments disagreements tension")

// Second search: Find resolutions
const resolutionMatches = await searchWithQuery("sorry apologize resolved better")

// Combine contexts for comprehensive analysis
```

### 2. Custom Embeddings
Create specialized embeddings for different purposes:

```typescript
// Emotional embedding - emphasize sentiment words
const emotionalQuery = `emotions feelings ${query}`

// Factual embedding - emphasize dates, events, plans
const factualQuery = `facts events plans ${query}`
```

### 3. Agent Chaining
Combine multiple agents for complex analysis:

```typescript
// 1. Memory Assistant finds relevant conversations
// 2. Conflict Resolver analyzes them
// 3. Growth Tracker shows progression
```

## Deployment

All agents are automatically deployed to Cloudflare Workers when you run:
```bash
npm run deploy
```

Access your agents at:
```
https://your-domain.workers.dev/api/agents/[agent-name]
```

## Monitoring and Improvement

1. Log queries and responses
2. Track which sources are most useful
3. Refine prompts based on actual usage
4. Adjust vector search parameters for better results

## Next Steps

1. Start with one specialized agent
2. Test with real queries
3. Refine the prompt based on results
4. Add more agents as needed
5. Consider creating a UI for each agent type