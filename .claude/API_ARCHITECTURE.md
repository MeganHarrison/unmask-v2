# Unmask: API Architecture Guide

## Overview

Unmask uses a hybrid API architecture that leverages both Next.js API routes and Cloudflare Workers for optimal performance and scalability.

## Architecture Decision

### Primary API Layer: Cloudflare Workers
- **All data operations** go through Cloudflare Workers
- Direct access to D1 database, Vectorize, and AI services
- Better performance with edge computing
- Consistent with your deployment on Cloudflare Pages

### Next.js API Routes: Minimal Usage
- Only for frontend-specific needs (e.g., file uploads, form handling)
- Acts as a proxy to Cloudflare Workers when needed
- Handles authentication tokens and session management

## API Structure

### 1. Cloudflare Workers (Primary)
All main API endpoints are implemented as Cloudflare Workers:

```
workers/api/
├── relationships.ts       # Relationship CRUD operations
├── messages.ts           # Message operations & search
├── insights.ts           # AI-generated insights
├── conflicts.ts          # Conflict detection & analysis
├── journal.ts            # Journal entries
├── events.ts             # Relationship events
├── daily-tracker.ts      # Daily metrics
├── connection-levels.ts  # Monthly connection scores
├── ai-chat.ts           # RAG-powered chat
└── vector-search.ts     # Vector similarity search
```

### 2. Next.js API Routes (Secondary)
Minimal API routes in Next.js for frontend-specific needs:

```
src/app/api/
├── upload/
│   └── csv/route.ts     # Handle CSV file uploads
├── export/
│   └── route.ts         # Export data functionality
└── auth/
    └── session/route.ts # Session management
```

## Implementation Pattern

### Cloudflare Worker Example
```typescript
// workers/api/messages.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Env {
  DB: D1Database
  VECTORIZE: VectorizeIndex
  AI: Ai
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/messages', async (c) => {
  const { relationship_id, page = 1, limit = 50 } = c.req.query()
  
  const messages = await c.env.DB.prepare(
    'SELECT * FROM "texts-bc" WHERE relationship_id = ? ORDER BY date DESC LIMIT ? OFFSET ?'
  ).bind(relationship_id, limit, (page - 1) * limit).all()
  
  return c.json({ messages: messages.results })
})

app.post('/messages/analyze', async (c) => {
  const { message_ids } = await c.req.json()
  
  // Use AI for sentiment analysis
  const analysis = await c.env.AI.run('@cf/huggingface/distilbert-sst-2-int8', {
    messages: message_ids
  })
  
  return c.json({ analysis })
})

export default app
```

### Next.js Route Example (Proxy Pattern)
```typescript
// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Forward request to Cloudflare Worker
  const response = await fetch(`${WORKER_URL}/messages?${searchParams}`, {
    headers: {
      'Authorization': request.headers.get('Authorization') || ''
    }
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Handle file upload locally, then send to Worker
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    // Process file upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    const text = await file.text()
    
    // Send processed data to Worker
    const response = await fetch(`${WORKER_URL}/messages/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({ csv_content: text })
    })
    
    return NextResponse.json(await response.json())
  }
  
  // Forward other requests directly
  const response = await fetch(`${WORKER_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || ''
    },
    body: JSON.stringify(body)
  })
  
  return NextResponse.json(await response.json())
}
```

## Frontend Integration

### Using SWR for Data Fetching
```typescript
// src/hooks/useMessages.ts
import useSWR from 'swr'

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useMessages(relationshipId: number, page: number = 1) {
  const { data, error, isLoading } = useSWR(
    `${WORKER_URL}/messages?relationship_id=${relationshipId}&page=${page}`,
    fetcher
  )
  
  return {
    messages: data?.messages,
    isLoading,
    isError: error
  }
}
```

### Direct Worker Calls for Mutations
```typescript
// src/app/messages/import/page.tsx
async function handleImport(file: File) {
  const text = await file.text()
  
  const response = await fetch(`${WORKER_URL}/messages/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ 
      csv_content: text,
      relationship_id: currentRelationshipId
    })
  })
  
  if (!response.ok) {
    throw new Error('Import failed')
  }
  
  return response.json()
}
```

## Benefits of This Architecture

1. **Performance**: Edge computing with Cloudflare Workers
2. **Scalability**: Workers auto-scale globally
3. **Cost-effective**: Pay per request, no idle costs
4. **Direct database access**: No extra hops for data
5. **AI Integration**: Native access to Workers AI
6. **Vector Search**: Direct Vectorize integration

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_WORKER_URL=https://unmask-api.YOUR_SUBDOMAIN.workers.dev
CLOUDFLARE_WORKER_URL=https://unmask-api.YOUR_SUBDOMAIN.workers.dev

# wrangler.toml (for Workers)
[vars]
ENVIRONMENT = "production"
```

## Deployment

1. **Deploy Workers First**
   ```bash
   cd workers
   wrangler deploy
   ```

2. **Deploy Next.js to Cloudflare Pages**
   ```bash
   npm run deploy
   ```

## Summary

- **Use Cloudflare Workers** for all data operations
- **Use Next.js API routes** only for file handling and frontend-specific needs
- **Frontend calls Workers directly** for best performance
- **Authentication** handled via Bearer tokens passed to Workers

This architecture provides the best performance while maintaining clean separation of concerns.