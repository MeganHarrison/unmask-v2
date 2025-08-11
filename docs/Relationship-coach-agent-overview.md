# Unmask AI Relationship Coach - System Overview & Setup Guide

## 🎯 Project Overview

**Unmask** is an AI-powered relationship intelligence platform that transforms text message data into deep insights about relationship patterns, emotional dynamics, and communication styles. Users upload CSV message exports and get personalized coaching from specialized AI agents.

## 🏗️ System Architecture

### **Core Components:**
1. **Master Orchestrator** - Routes user queries to appropriate specialist agents
2. **Memory Agent** - Semantic search, timeline generation, pattern analysis  
3. **Coaching Agent** - Personalized relationship advice with adaptive styles
4. **Data Ingestion Pipeline** - CSV processing with AI sentiment analysis
5. **Next.js Frontend** - React dashboard with chat interface and upload system

### **Tech Stack:**
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Cloudflare Workers (serverless)
- **AI**: OpenAI GPT-4 + text-embedding-3-small
- **Database**: Cloudflare D1 (SQL) + Vectorize (vector search)
- **Storage**: Cloudflare R2 + KV
- **Deployment**: Vercel (frontend) + Cloudflare Workers

## 📊 Data Flow Architecture

```
1. User uploads CSV → 2. Data Ingestion Worker processes → 3. Stores in D1 + Vectorize
                                    ↓
4. User chats → 5. Orchestrator routes → 6. Specialist agents respond
                                    ↓
7. Memory Agent retrieves context → 8. Coaching Agent provides advice
```

## 🗄️ Database Schema

### **Main Tables:**
- **`messages`** - All processed text messages with sentiment scores
- **`users`** - User profiles and relationship metadata  
- **`user_interactions`** - Chat logs with AI agents
- **`relationship_scores`** - Health scores over time
- **`processing_jobs`** - CSV upload job tracking

### **Vector Storage:**
- **Vectorize Index** - Semantic search across all messages
- **Embeddings** - OpenAI embeddings for each message

## 🔧 Required Cloudflare Resources

### **Workers (4 total):**
1. `unmask-orchestrator` - Main routing logic
2. `unmask-memory-agent` - Data retrieval and analysis
3. `unmask-coaching-agent` - Relationship advice generation
4. `unmask-data-ingestion` - CSV processing pipeline

### **Storage Resources:**
- **D1 Database**: `unmask-production` (SQL tables)
- **Vectorize Index**: `unmask-relationship-vectors` (1536 dimensions)
- **KV Namespaces**: 4 namespaces (one per worker)
- **R2 Bucket**: `unmask-file-storage` (file uploads)

## 📁 File Structure

```
project-root/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Main app pages
│   └── api/                     # API routes (proxy to workers)
├── components/                   # React components
│   ├── chat/                    # Chat interface
│   ├── upload/                  # File upload system
│   └── layout/                  # Navigation and layout
├── workers/                     # Cloudflare Workers
│   ├── agents/
│   │   ├── orchestrator/        # Master routing agent
│   │   ├── memory-agent/        # Data retrieval specialist
│   │   └── coaching-agent/      # Relationship coach
│   └── data-ingestion/          # CSV processing worker
├── database/
│   └── schema/                  # SQL schema files
└── lib/                         # Shared utilities and hooks
```

## ⚙️ Environment Setup

### **Required Environment Variables:**
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_D1_DATABASE_ID=...
CLOUDFLARE_VECTORIZE_INDEX_ID=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

### **Wrangler Configuration:**
Each worker needs a `wrangler.toml` with proper resource bindings:
- KV namespace binding
- D1 database binding  
- Vectorize index binding
- R2 bucket binding (for data-ingestion only)

## 🚀 Deployment Process

### **Step 1: Cloudflare Resources**
```bash
# Create all required resources
wrangler kv:namespace create "ORCHESTRATOR_KV"
wrangler d1 create unmask-production
wrangler vectorize create unmask-relationship-vectors --dimensions=1536
wrangler r2 bucket create unmask-file-storage
```

### **Step 2: Database Schema**
```bash
# Apply SQL schema to create tables
wrangler d1 execute unmask-production --file=./database/schema/messages-schema.sql
```

### **Step 3: Deploy Workers**
```bash
# Deploy all 4 workers
cd workers/agents/orchestrator && wrangler deploy
cd ../memory-agent && wrangler deploy  
cd ../coaching-agent && wrangler deploy
cd ../../data-ingestion && wrangler deploy
```

### **Step 4: Frontend Deployment**
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

## 🔄 System Integration Flow

### **Chat Flow:**
1. User sends message via Next.js frontend
2. Frontend calls `/api/chat` → forwards to orchestrator worker
3. Orchestrator classifies intent using OpenAI GPT-4
4. Routes to appropriate specialist (memory/coaching/pattern agent)
5. Specialist retrieves context and generates response
6. Response returned with confidence score and next steps

### **CSV Upload Flow:**
1. User uploads CSV via drag-and-drop interface
2. Frontend calls `/api/upload/messages` → forwards to data-ingestion worker
3. Worker parses CSV, validates data, runs sentiment analysis
4. Stores messages in D1, generates embeddings for Vectorize
5. Calculates relationship health score and insights
6. Frontend polls job status and shows real-time progress

### **Memory Retrieval Flow:**
1. User searches for specific conversations
2. Memory agent generates embedding for search query
3. Performs vector similarity search in Vectorize
4. Enriches results with database context
5. Returns ranked results with relevance scores

## 🧪 Testing Strategy

### **Component Tests:**
- Worker connectivity (ping each worker endpoint)
- Database connection (query test tables)
- OpenAI integration (test embedding + completion)
- Vector search (test similarity queries)

### **Integration Tests:**
- End-to-end chat flow (user message → AI response)
- CSV processing (upload → sentiment analysis → storage)
- Memory search (query → vector search → results)
- Frontend integration (API calls work correctly)

### **Sample Test Data:**
CSV with 25+ realistic relationship messages to test:
- Sentiment analysis accuracy
- Vector embedding generation
- Health score calculation
- Pattern detection

## 🐛 Common Issues & Solutions

### **Worker Deployment:**
- **Issue**: Binding errors → **Fix**: Verify resource IDs in wrangler.toml
- **Issue**: CORS errors → **Fix**: Add proper headers in worker responses

### **Database Issues:**
- **Issue**: Table not found → **Fix**: Run schema SQL file
- **Issue**: Connection failed → **Fix**: Check D1 database ID

### **Vector Search:**
- **Issue**: No results → **Fix**: Verify embeddings are being stored
- **Issue**: Dimension mismatch → **Fix**: Ensure 1536 dimensions for OpenAI

### **Frontend Integration:**
- **Issue**: API calls fail → **Fix**: Update worker URLs in API routes
- **Issue**: Auth errors → **Fix**: Verify session handling

## 🎯 Success Metrics

After successful deployment, you should see:
- ✅ All 4 workers responding to requests
- ✅ CSV uploads processing successfully  
- ✅ Chat interface routing to different agents
- ✅ Memory search returning relevant results
- ✅ Health scores calculating correctly
- ✅ Insights generating from processed data

## 📞 Support Information

**Architecture**: Multi-agent system with specialized AI workers
**Primary Use Case**: Relationship intelligence and coaching
**Key Innovation**: Vector-powered semantic search of relationship history
**Deployment Model**: Serverless workers + static frontend

This system transforms raw message data into actionable relationship intelligence through sophisticated AI analysis and personalized coaching.