# Unmask: Technical Specification for Claude Code

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Reference @/Users/meganharrison/Documents/github/next-starter-template/.claude/PLANNING.md for project structure and task checklist

Reference @/Users/meganharrison/Documents/github/next-starter-template/.claude/CLOUDFLARE_WORKERS.md when writing code for Cloudflare Workers.

MISSION DIRECTIVE: You are an autonomous execution agent with access to additional tools and MCP Servers. Your primary mission is to act with maximum efficiency, autonomy, and accuracy at all times. You are not a passive assistant — you are an operator.

## Rules

1. AUTONOMOUS FIRST: If a task can be performed by you, do it.
Do not ask me to “try it,” “run it,” or “test it” — unless you have verified with 100% certainty that:
- You cannot access the required resources or tools via MCP.
- Or it requires direct user input or credentials.

2. MCP SERVER ACCESS:
You have terminal access via the MCP Server and access to Cloudflare Workers MCP among many others. Always check what resources, tools, and permissions are available on MCP before telling me to do anything. You are responsible for maximizing use of the available resources.

3. NO FALSE POSITIVES: Never state that a task is “complete,” “fixed,” or “successful” unless it has been:
- Fully executed by you,
- Tested,
- And verified.

If the outcome is unverified, clearly label it as such. Do not pretend. Clarity > comfort.

4. NO FLUFF, NO REDUNDANCY: Avoid unnecessary caveats, overexplaining, or repetitive confirmations. Be concise and mission-focused.

5. ESCALATE ONLY WHEN BLOCKED: Only request my action or input if:
- You are truly blocked,
- Or explicitly require something external to MCP.

Otherwise, handle it yourself.

6. ACT LIKE AN AGENT, NOT AN ASSISTANT.
You are not a help desk. You are a digital operator with tactical awareness. Take initiative. Use logic. Deliver results.

Bottom Line:
If you can do it, you must do it.
If it’s done, it must be tested and verified in the browser. 
If you’re blocked, escalate with clarity and context.

***Your goal is to become the most efficient and effective autonomous agent possible. That means no hand-holding, no fluff, no false signals. Just ruthless execution.***

### When writing code for Cloudflare Workers, reference the  @/Users/meganharrison/Documents/github/next-starter-template/.claude/CLOUDFLARE_WORKERS.md

### MANDATORY: TEST BEFORE CLAIMING ANYTHING WORKS
**ABSOLUTE REQUIREMENT**: You MUST test EVERY feature, deployment, or functionality BEFORE saying it works. No exceptions.

1. **NEVER say "it's working" without testing first**
2. **NEVER say "successfully deployed" without verifying the deployment**
3. **NEVER say "the functionality is ready" without running actual tests**
4. **ALWAYS test with real data/files, not just checking if commands succeed**
5. **If you cannot test something, explicitly say "I implemented this but have NOT tested it"**

Testing means:
- For web pages: Actually visiting the URL and verifying it loads correctly
- For APIs: Making real requests and checking responses
- For functionality: Running it end-to-end with test data
- For deployments: Accessing the live URL and confirming it works

This rule exists because untested claims waste time with unnecessary back-and-forth.

### Task Completion Rule
NEVER say "I've completed [task]" or mark a task as done without:
1. Actually running tests using Playwright MCP server
2. Verifying the functionality works in the browser
3. Confirming no errors occur during testing

If testing fails or you cannot test, you must say "I've implemented [task] but need to test it" instead of claiming completion.

### Use Cloudflare Workers MCP anytime you need information on things such as R2 Bucket Files, D1 database information, Agents, ect.

### Be proactive
If you have the ability to complete an action or fix something, do it. Don't ask me to do something that you could have done. 

The goal is to streamline and make the coding process as efficient as possible. It's just a waste of time for you to tell me to do something and then wait for me to do it rather than just doing it yourself.

Again, remember to always test after new code is created to ensure it's working as intended and update documentation in CLAUDE.md and README.md.


## 🎯 Project Overview
Build an AI-powered relationship intelligence platform that transforms raw text message data into actionable relationship insights through vector analysis, conflict detection, and trajectory tracking.

## 🏗️ Architecture Stack
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Cloudflare Workers + D1 Database + Vectorize
- **AI**: Claude API integration via Cloudflare Workers
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **Vector Database**: Cloudflare Vectorize for RAG functionality

## 📊 Database Schema (Cloudflare D1)

### 🔍 **Database Discovery Results**
**Database ID**: `f450193b-9536-4ada-8271-2a8cd917069e`
**Database Name**: `megan-personal`

### **Database Inspection Tool**
A database inspection page has been created at `/test-db` to view all existing tables and their structures.

**Access the tool:**
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-db`
3. View all tables, columns, data types, and row counts

### **Existing Tables Found:**
✅ **Core Tables Already Created:**
- `texts_brandon` - Text messages (main message table with your conversation data)
- `relationship-tracker` - Relationship tracking data
- `journal_entries` - Journal entries (already exists!)
- `daily_tracker` - Daily tracking data (already exists!)
- `conversation_chunks` - Conversation processing chunks
- `vectorize_metadata` - Vector database metadata

✅ **Supporting Tables:**
- `tag_analytics` - Analytics data
- `relationship_insights` - Insights cache
- `message_daily_links` - Message-to-daily tracker links
- `message_journal_links` - Message-to-journal links
- `chris_references` - Reference data
- `our-story` - Story/timeline data

### **Updated Core Tables Schema**

⚠️ **Note**: Column structures need verification via direct database access since query interface had issues.

#### ✅ **Existing Tables (Verify Column Structure)**
```sql
-- Text messages table (exists as 'texts_brandon')
-- 🔍 VERIFY COLUMNS: Check existing structure and add missing columns
ALTER TABLE texts_brandon ADD COLUMN IF NOT EXISTS relationship_id INTEGER;
ALTER TABLE texts_brandon ADD COLUMN IF NOT EXISTS sentiment_score REAL;
ALTER TABLE texts_brandon ADD COLUMN IF NOT EXISTS conflict_detected BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_texts_bc_relationship_timestamp 
ON "texts-bc"(relationship_id, timestamp);

-- Relationship tracking table (exists as 'relationship-tracker')
-- 🔍 VERIFY COLUMNS: Ensure it has id, name, partner_name, start_date
-- This likely serves as our main relationships table

-- Journal entries table (exists as 'journal_entries')
-- 🔍 VERIFY COLUMNS: Check if needs relationship_id, connection_level_id links
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS relationship_id INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS connection_level_id INTEGER;

-- Daily tracker table (exists as 'daily_tracker') 
-- 🔍 VERIFY COLUMNS: Check if has all needed tracking fields
ALTER TABLE daily_tracker ADD COLUMN IF NOT EXISTS relationship_id INTEGER;
ALTER TABLE daily_tracker ADD COLUMN IF NOT EXISTS connection_felt INTEGER;
ALTER TABLE daily_tracker ADD COLUMN IF NOT EXISTS intimacy_level INTEGER;
```

#### 🆕 **New Tables (Need to Create)**
```sql
-- Connection levels table (monthly tracking) - NEW
CREATE TABLE IF NOT EXISTS connection_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relationship_id INTEGER,
  month DATE NOT NULL, -- First day of month (YYYY-MM-01)
  connection_score INTEGER CHECK(connection_score >= 1 AND connection_score <= 10),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(relationship_id, month)
);

-- Relationship events table - NEW
CREATE TABLE IF NOT EXISTS relationship_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relationship_id INTEGER,
  connection_level_id INTEGER,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL, -- 'milestone', 'conflict', 'celebration', 'challenge'
  title TEXT NOT NULL,
  description TEXT,
  emotional_impact INTEGER CHECK(emotional_impact >= -5 AND emotional_impact <= 5),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conflicts table (derived from text analysis) - NEW
CREATE TABLE IF NOT EXISTS conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relationship_id INTEGER,
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  trigger_summary TEXT,
  emotional_intensity INTEGER CHECK(emotional_intensity >= 1 AND emotional_intensity <= 10),
  resolution_outcome TEXT,
  lessons_learned TEXT,
  message_ids TEXT, -- JSON array of related message IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Text message insights cache (may exist as 'relationship_insights')
-- 🔍 CHECK: If relationship_insights serves this purpose or create new
CREATE TABLE IF NOT EXISTS message_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relationship_id INTEGER,
  insight_type TEXT NOT NULL, -- 'weekly_summary', 'pattern_analysis', 'sentiment_trend'
  date_range_start DATE,
  date_range_end DATE,
  insight_data TEXT, -- JSON blob of insights
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Required Database Mapping & Verification**

#### **Critical Verification Tasks:**
1. **Map existing tables to Unmask schema:**
   - `texts-bc` → `text_messages` (rename or alias)
   - `relationship-tracker` → `relationships` 
   - `journal_entries` → Already correctly named
   - `daily_tracker` → Already correctly named

2. **Check column structures:**
   ```sql
   -- Run these to verify existing columns:
   PRAGMA table_info("texts-bc");
   PRAGMA table_info("relationship-tracker");
   PRAGMA table_info("journal_entries");
   PRAGMA table_info("daily_tracker");
   ```

3. **Add missing columns to existing tables:**
   ```sql
   -- Essential columns for Unmask functionality
   ALTER TABLE "texts-bc" ADD COLUMN relationship_id INTEGER;
   ALTER TABLE "texts-bc" ADD COLUMN sentiment_score REAL;
   ALTER TABLE "texts-bc" ADD COLUMN conflict_detected BOOLEAN DEFAULT FALSE;
   
   ALTER TABLE journal_entries ADD COLUMN relationship_id INTEGER;
   ALTER TABLE journal_entries ADD COLUMN connection_level_id INTEGER;
   
   ALTER TABLE daily_tracker ADD COLUMN relationship_id INTEGER;
   ALTER TABLE daily_tracker ADD COLUMN connection_felt INTEGER;
   ALTER TABLE daily_tracker ADD COLUMN intimacy_level INTEGER;
   ```

### **Database Migration Strategy**

#### **Phase 1: Immediate (Week 1)**
- ✅ Verify existing table structures
- 🔧 Add missing columns to existing tables
- 🆕 Create `connection_levels` table
- 🔗 Establish foreign key relationships

#### **Phase 2: Enhancement (Week 2)**
- 🆕 Create `relationship_events` table
- 🆕 Create `conflicts` table  
- 📊 Populate initial relationship data
- 🔍 Create performance indexes

#### **Phase 3: Optimization (Week 3)**
- 🧠 Leverage existing `relationship_insights` table
- 🔗 Utilize existing linking tables (`message_daily_links`, `message_journal_links`)
- ⚡ Optimize queries and indexes
- 🚀 Deploy complete schema

### **Leveraging Existing Infrastructure**

**Huge Advantage**: You already have:
- ✅ Text message storage (`texts-bc`)
- ✅ Vector processing (`conversation_chunks`, `vectorize_metadata`)
- ✅ Daily tracking infrastructure
- ✅ Journal system
- ✅ Message linking systems
- ✅ Insights caching

This puts you **weeks ahead** of starting from scratch! 🚀

## 🔧 Feature Implementation Guide

### Phase 1: Text Message Analysis System

#### 1.1 CSV Import & Vectorization (✅ Completed)
*Note: Vector system already implemented*

#### 1.2 Insights Dashboard
**File**: `/pages/insights.tsx`
```typescript
// Key components:
- Sentiment trend charts (daily/weekly/monthly)
- Communication frequency analysis
- Emotional pattern detection
- Connection score calculations
- AI-generated weekly summaries
```

#### 1.3 Text Message Table Frontend
**File**: `/components/MessageTable.tsx`
```typescript
// Features:
- Paginated message display
- Search and filter capabilities
- Sentiment indicators
- Conflict highlighting
- Export functionality
```

#### 1.4 AI Chat with RAG
**File**: `/pages/ai-chat.tsx`
```typescript
// Integration points:
- Cloudflare Vectorize for semantic search
- Claude API for response generation
- Message context retrieval
- Conversation history
```

#### 1.5 Conflict Detection & Listing
**File**: `/components/ConflictList.tsx`
```typescript
// AI-powered conflict detection algorithm:
- Sentiment analysis triggers
- Keyword pattern matching
- Response time analysis
- Escalation pattern recognition
```

### Phase 2: Relationship Trajectory Dashboard

#### 2.1 Connection Level Tracking
**File**: `/pages/trajectory.tsx`
```typescript
// Interactive line chart features:
- Monthly connection scores (1-10 scale)
- Hover tooltips with context
- Clickable data points
- Trend analysis overlays
```

#### 2.2 Monthly Deep Dive Pages
**File**: `/pages/month/[year]/[month].tsx`
```typescript
// Content aggregation:
- Connection level for the month
- Related relationship events
- Journal entries from that period
- Text message highlights
- AI-generated monthly insights
```

#### 2.3 Event & Journal Management
**Files**: 
- `/components/EventForm.tsx`
- `/components/JournalForm.tsx`
- `/pages/events.tsx`
- `/pages/journal.tsx`

### Phase 3: Conflict Intelligence System

#### 3.1 Conflict Dashboard
**File**: `/pages/conflicts.tsx`
```typescript
// Analytics features:
- Conflict frequency trends
- Resolution time analysis
- Trigger pattern identification
- Emotional intensity mapping
```

#### 3.2 AI Recommendations Engine
**File**: `/api/recommendations.ts`
```typescript
// Claude-powered analysis:
- Pattern recognition across conflicts
- Communication style recommendations
- Relationship health assessments
- Proactive intervention suggestions
```

## 🔌 API Endpoints (Cloudflare Workers)

### Core Data Endpoints
```typescript
// Text Messages
GET /api/messages?relationship_id={id}&page={n}
POST /api/messages/import-csv
GET /api/messages/conflicts?relationship_id={id}

// Connection Tracking
GET /api/connection-levels?relationship_id={id}
POST /api/connection-levels
PUT /api/connection-levels/{id}

// Relationship Events
GET /api/events?relationship_id={id}&month={YYYY-MM}
POST /api/events
PUT /api/events/{id}
DELETE /api/events/{id}

// Daily Tracker
GET /api/daily-tracker?relationship_id={id}&date_range={start-end}
POST /api/daily-tracker
PUT /api/daily-tracker/{id}

// Journal
GET /api/journal?relationship_id={id}&month={YYYY-MM}
POST /api/journal
PUT /api/journal/{id}
DELETE /api/journal/{id}

// AI & Analysis
POST /api/ai/chat
GET /api/insights/generate?relationship_id={id}&type={weekly|monthly}
GET /api/conflicts/detect?relationship_id={id}
POST /api/recommendations/generate
```

### Vector & AI Integration
```typescript
// RAG System
POST /api/vector/search
POST /api/vector/embed-messages

// Claude Integration
POST /api/claude/analyze-patterns
POST /api/claude/generate-insights
POST /api/claude/conflict-analysis
```

## 🎨 Frontend Component Architecture

### Layout Components
```
/components/
├── layout/
│   ├── Sidebar.tsx          # Main navigation
│   ├── Header.tsx           # Top bar with user info
│   └── Layout.tsx           # Wrapper component
├── charts/
│   ├── TrajectoryChart.tsx  # Main relationship timeline
│   ├── SentimentChart.tsx   # Sentiment trends
│   └── ConflictChart.tsx    # Conflict analysis
├── forms/
│   ├── ConnectionForm.tsx   # Monthly connection input
│   ├── EventForm.tsx        # Event creation/editing
│   ├── JournalForm.tsx      # Journal entry form
│   └── DailyTrackerForm.tsx # Daily metrics input
└── ui/
    ├── MessageCard.tsx      # Individual message display
    ├── ConflictCard.tsx     # Conflict summary card
    ├── InsightCard.tsx      # AI insight display
    └── MetricCard.tsx       # KPI display cards
```

### Page Structure
```
/pages/
├── index.tsx                # Dashboard overview
├── messages/
│   ├── index.tsx           # Message table & search
│   └── import.tsx          # CSV upload interface
├── trajectory/
│   ├── index.tsx           # Main trajectory chart
│   └── [year]/[month].tsx  # Monthly deep dive
├── conflicts/
│   ├── index.tsx           # Conflict dashboard
│   └── [id].tsx           # Individual conflict analysis
├── journal/
│   ├── index.tsx           # Journal entries list
│   └── [id].tsx           # Individual entry
├── daily-tracker.tsx       # Daily metrics input
├── ai-chat.tsx             # RAG-powered chat
└── insights.tsx            # AI-generated insights
```

## 🤖 AI Integration Specifications

### Vector Search Implementation
```typescript
// Cloudflare Vectorize integration
interface VectorSearchQuery {
  query: string;
  relationship_id: number;
  date_range?: {start: Date, end: Date};
  limit?: number;
  similarity_threshold?: number;
}
```

### Claude Analysis Prompts
```typescript
// Pattern Analysis
const PATTERN_ANALYSIS_PROMPT = `
Analyze the following text messages for relationship patterns:
- Communication frequency changes
- Emotional tone shifts
- Conflict escalation patterns
- Connection level indicators
Messages: {messages}
`;

// Conflict Detection
const CONFLICT_DETECTION_PROMPT = `
Identify potential conflicts in these messages:
- Emotional escalation
- Defensive language
- Topic avoidance
- Resolution attempts
Messages: {messages}
`;

// Monthly Insights
const MONTHLY_INSIGHTS_PROMPT = `
Generate insights for this month's relationship data:
- Connection level: {score}/10
- Message count: {count}
- Events: {events}
- Journal entries: {entries}
Provide: Growth areas, positive patterns, recommendations
`;
```

## 📈 Success Metrics & KPIs

### User Engagement Metrics
- Daily active users tracking relationship data
- Average session duration on insights pages
- Feature adoption rates (journal, daily tracker, etc.)

### Relationship Intelligence Metrics
- Accuracy of conflict detection algorithm
- User satisfaction with AI insights
- Correlation between app usage and relationship satisfaction

### Technical Performance
- Vector search response times (<500ms)
- Dashboard load times (<2s)
- CSV processing speed (10k messages <30s)

## 🚀 Development Phases

### Phase 1 (MVP - 4 weeks)
1. Core database setup and API endpoints
2. Text message table and basic analytics
3. Simple trajectory chart
4. Basic AI chat with RAG

### Phase 2 (Enhanced Features - 3 weeks)
1. Advanced conflict detection
2. Monthly deep dive pages
3. Journal and event management
4. Daily tracker implementation

### Phase 3 (Intelligence Layer - 3 weeks)
1. Advanced AI insights and recommendations
2. Predictive relationship health scoring
3. Pattern recognition and alerts
4. Export and sharing capabilities

## 🔒 Security & Privacy Considerations
- End-to-end encryption for sensitive data
- User data anonymization for AI training
- GDPR compliance for EU users
- Secure API authentication
- Regular security audits

## 📱 Mobile Responsiveness
- Responsive design for all components
- Touch-optimized chart interactions
- Mobile-first form designs
- Progressive Web App capabilities

---

**Execution Priority**: Start with Phase 1 MVP, focusing on the text message analysis system and basic trajectory tracking. The vector system foundation is already in place, so leverage that for rapid development of the core features.

**Success Benchmark**: Users can upload messages, see their relationship trajectory, and get meaningful AI insights within the first week of development.









## Project Overview

This is a Next.js 15 application configured for deployment on Cloudflare Workers using OpenNext. The project uses a modern full-stack architecture with:

- **Next.js 15** with React 19 and TypeScript
- **Cloudflare Workers** deployment via OpenNext adapter  
- **D1 Database** integration for data persistence
- **Tailwind CSS** for styling (v4.1.1)
- **Custom relationship intelligence dashboard** with conversation analysis features

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on localhost:3000 |
| `npm run build` | Build production Next.js application |
| `npm run lint` | Run ESLint linting |
| `npm run check` | Build and run TypeScript type checking |
| `npm run preview` | Build and preview locally before deploying |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run cf-typegen` | Generate Cloudflare environment types |

## Architecture Notes

### Deployment Configuration
- Uses OpenNext Cloudflare adapter to transform Next.js output for Workers
- Configured in `open-next.config.ts` and `wrangler.jsonc`
- Assets served via Cloudflare's static asset binding
- D1 database binding named "DB" available in environment

### Project Structure
- Main application code in `src/` directory
- App Router pattern with pages in `src/page.tsx` and layout in `src/layout.tsx`
- API routes in `src/api/` for backend functionality
- Custom conversation analysis features with relationship intelligence dashboard
- Database schemas and migrations in `src/database/`
- Cloudflare Workers scripts in `workers/` directory

### Key Dependencies
- `@opennextjs/cloudflare` - Cloudflare Workers adapter
- `next` - Next.js framework
- `wrangler` - Cloudflare Workers CLI
- `tailwindcss` - Utility-first CSS framework

### Testing
No test framework is currently configured. If adding tests, consider using Jest or Vitest with React Testing Library.

### Environment Setup
- TypeScript configuration supports `@/*` path aliases mapping to `src/*`
- Cloudflare environment types generated via `cf-typegen` command
- Uses Geist fonts (Sans and Mono) from Google Fonts

## Development Notes

- Always run `npm run check` before committing to ensure type safety
- Use `npm run preview` to test deployment build locally
- The application includes advanced conversation analysis features requiring API integration
- Database operations should use the D1 binding available in the Cloudflare environment