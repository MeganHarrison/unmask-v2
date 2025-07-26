# Unmask: Complete Project Structure & File Checklist

## Tasks
- Remove average and trend from progression chart

1. Remove icon next to sender name
2. Remove conflict column
3. Update relationship progression sidebar:
    - Display related text messages
    - Display related jounrnal entries
    - Display related events
    - Include AI summary and analysis
    - Include chat

## 📁 Project Root Structure

```
unmask/
├── 📋 README.md
├── 📋 package.json
├── 📋 tsconfig.json
├── 📋 tailwind.config.js
├── 📋 next.config.js
├── 📋 .env.local
├── 📋 .gitignore
├── 📋 wrangler.toml                    # Cloudflare Workers config
├── 📋 schema.sql                       # D1 database schema
└── 📋 components.json                  # shadcn/ui config
```

## 🎨 Frontend Structure (Next.js App Router)

### Core App Structure
```
src/app/
├── 📋 layout.tsx                       # Root layout
├── 📋 page.tsx                         # 🏠 Dashboard overview
├── 📋 globals.css                      # Global styles
│
├── messages/
│   ├── 📋 page.tsx                     # 📱 Message table & search
│   ├── import/
│   │   └── 📋 page.tsx                 # 📤 CSV upload interface
│   └── [id]/
│       └── 📋 page.tsx                 # Individual message view
│
├── trajectory/
│   ├── 📋 page.tsx                     # 📈 Main trajectory chart
│   └── [year]/
│       └── [month]/
│           └── 📋 page.tsx             # 🗓️ Monthly deep dive page
│
├── conflicts/
│   ├── 📋 page.tsx                     # ⚔️ Conflict dashboard
│   ├── [id]/
│   │   └── 📋 page.tsx                 # Individual conflict analysis
│   └── detect/
│       └── 📋 page.tsx                 # Conflict detection tools
│
├── journal/
│   ├── 📋 page.tsx                     # 📖 Journal entries list
│   ├── new/
│   │   └── 📋 page.tsx                 # Create new journal entry
│   └── [id]/
│       └── 📋 page.tsx                 # Individual entry view/edit
│
├── events/
│   ├── 📋 page.tsx                     # 🎉 Relationship events list
│   ├── new/
│   │   └── 📋 page.tsx                 # Create new event
│   └── [id]/
│       └── 📋 page.tsx                 # Individual event view/edit
│
├── daily-tracker/
│   └── 📋 page.tsx                     # 📊 Daily metrics input
├── ai-chat/
│   └── 📋 page.tsx                     # 🤖 RAG-powered chat interface
├── insights/
│   └── 📋 page.tsx                     # 🧠 AI-generated insights
├── settings/
│   └── 📋 page.tsx                     # ⚙️ User settings
└── profile/
    └── 📋 page.tsx                     # 👤 User profile management
```

### API Routes (App Router)
```
src/app/api/
├── auth/
│   ├── login/
│   │   └── 📋 route.ts                 # User authentication
│   └── logout/
│       └── 📋 route.ts                 # Session management
│
├── relationships/
│   ├── 📋 route.ts                     # GET/POST relationships
│   └── [id]/
│       └── 📋 route.ts                 # GET/PUT/DELETE specific relationship
│
├── messages/
│   ├── 📋 route.ts                     # GET messages with pagination
│   ├── import-csv/
│   │   └── 📋 route.ts                 # POST CSV file processing
│   ├── conflicts/
│   │   └── 📋 route.ts                 # GET conflict-tagged messages
│   └── search/
│       └── 📋 route.ts                 # GET message search results
│
├── connection-levels/
│   ├── 📋 route.ts                     # GET/POST connection levels
│   └── [id]/
│       └── 📋 route.ts                 # GET/PUT/DELETE specific level
│
├── events/
│   ├── 📋 route.ts                     # GET/POST relationship events
│   └── [id]/
│       └── 📋 route.ts                 # GET/PUT/DELETE specific event
│
├── daily-tracker/
│   ├── 📋 route.ts                     # GET/POST daily entries
│   └── [id]/
│       └── 📋 route.ts                 # GET/PUT/DELETE specific entry
│
├── journal/
│   ├── 📋 route.ts                     # GET/POST journal entries
│   └── [id]/
│       └── 📋 route.ts                 # GET/PUT/DELETE specific entry
│
├── conflicts/
│   ├── 📋 route.ts                     # GET/POST conflicts
│   ├── detect/
│   │   └── 📋 route.ts                 # POST conflict detection
│   └── [id]/
│       └── 📋 route.ts                 # GET/PUT/DELETE specific conflict
│
├── ai/
│   ├── chat/
│   │   └── 📋 route.ts                 # POST AI chat with RAG
│   ├── analyze-patterns/
│   │   └── 📋 route.ts                 # POST pattern analysis
│   ├── generate-insights/
│   │   └── 📋 route.ts                 # POST insight generation
│   └── recommendations/
│       └── 📋 route.ts                 # POST recommendation engine
│
├── vector/
│   ├── search/
│   │   └── 📋 route.ts                 # POST vector similarity search
│   ├── embed-messages/
│   │   └── 📋 route.ts                 # POST message vectorization
│   └── update/
│       └── 📋 route.ts                 # POST vector updates
│
└── insights/
    ├── generate/
    │   └── 📋 route.ts                 # GET/POST insight generation
    ├── weekly/
    │   └── 📋 route.ts                 # GET weekly summaries
    └── monthly/
        └── 📋 route.ts                 # GET monthly analysis
```

## 🧩 Components Structure

### Layout Components
```
src/components/layout/
├── 📋 Layout.tsx                       # Main app layout wrapper
├── 📋 Sidebar.tsx                      # Navigation sidebar
├── 📋 Header.tsx                       # Top navigation bar
├── 📋 Footer.tsx                       # Footer component
├── 📋 MobileNav.tsx                    # Mobile navigation
└── 📋 Breadcrumbs.tsx                  # Navigation breadcrumbs
```

### Chart Components
```
src/components/charts/
├── 📋 TrajectoryChart.tsx              # 📈 Main relationship timeline
├── 📋 SentimentChart.tsx               # 😊 Sentiment trend visualization
├── 📋 ConflictChart.tsx                # ⚔️ Conflict frequency analysis
├── 📋 MessageFrequencyChart.tsx        # 📱 Communication frequency
├── 📋 ConnectionScoreChart.tsx         # ❤️ Connection level trends
├── 📋 DailyTrackerChart.tsx            # 📊 Daily metrics visualization
└── 📋 InsightChart.tsx                 # 🧠 AI insight visualizations
```

### Form Components
```
src/components/forms/
├── 📋 ConnectionLevelForm.tsx          # Monthly connection score input
├── 📋 EventForm.tsx                    # Relationship event creation/edit
├── 📋 JournalForm.tsx                  # Journal entry form
├── 📋 DailyTrackerForm.tsx            # Daily metrics input form
├── 📋 ConflictForm.tsx                 # Manual conflict logging
├── 📋 MessageImportForm.tsx            # CSV upload form
├── 📋 RelationshipForm.tsx             # Relationship setup form
└── 📋 UserProfileForm.tsx              # User profile editing
```

### Data Display Components
```
src/components/ui/
├── 📋 MessageCard.tsx                  # Individual message display
├── 📋 MessageTable.tsx                 # Paginated message table
├── 📋 ConflictCard.tsx                 # Conflict summary card
├── 📋 EventCard.tsx                    # Event display card
├── 📋 JournalCard.tsx                  # Journal entry preview
├── 📋 InsightCard.tsx                  # AI insight display
├── 📋 MetricCard.tsx                   # KPI display cards
├── 📋 DailyTrackerCard.tsx            # Daily metrics display
├── 📋 ConnectionScoreCard.tsx          # Connection level display
└── 📋 RecommendationCard.tsx           # AI recommendation display
```

### Interactive Components
```
src/components/interactive/
├── 📋 ChatInterface.tsx                # AI chat UI
├── 📋 MessageSearch.tsx                # Message search interface
├── 📋 ConflictDetector.tsx            # Real-time conflict detection
├── 📋 InsightGenerator.tsx             # AI insight generation UI
├── 📋 PatternAnalyzer.tsx             # Pattern analysis interface
├── 📋 TimelineNavigator.tsx           # Trajectory timeline navigation
└── 📋 MonthlyDeepDive.tsx             # Monthly analysis interface
```

### Utility Components
```
src/components/shared/
├── 📋 LoadingSpinner.tsx              # Loading states
├── 📋 ErrorBoundary.tsx               # Error handling
├── 📋 ConfirmDialog.tsx               # Confirmation modals
├── 📋 Toast.tsx                       # Notification system
├── 📋 Pagination.tsx                  # Table pagination
├── 📋 DatePicker.tsx                  # Date selection
├── 📋 FileUpload.tsx                  # File upload component
└── 📋 EmptyState.tsx                  # Empty state illustrations
```

## ⚙️ Backend Structure (Cloudflare Workers)

### Worker Scripts
```
workers/
├── 📋 main.ts                         # Main worker entry point
├── 📋 auth.ts                         # Authentication middleware
├── 📋 cors.ts                         # CORS handling
├── 📋 rate-limiting.ts                # Rate limiting middleware
└── 📋 error-handling.ts               # Global error handler
```

### Database Operations
```
workers/database/
├── 📋 connection.ts                   # D1 database connection
├── 📋 migrations.ts                   # Database migrations
├── 📋 seed.ts                         # Sample data seeding
│
├── models/
│   ├── 📋 Relationship.ts             # Relationship model
│   ├── 📋 TextMessage.ts              # Text message model
│   ├── 📋 ConnectionLevel.ts          # Connection level model
│   ├── 📋 RelationshipEvent.ts        # Event model
│   ├── 📋 DailyTracker.ts             # Daily tracker model
│   ├── 📋 JournalEntry.ts             # Journal model
│   ├── 📋 Conflict.ts                 # Conflict model
│   └── 📋 MessageInsight.ts           # Insights cache model
│
└── queries/
    ├── 📋 messages.ts                 # Message-related queries
    ├── 📋 conflicts.ts                # Conflict detection queries
    ├── 📋 insights.ts                 # Insight generation queries
    ├── 📋 trajectory.ts               # Trajectory calculation queries
    └── 📋 analytics.ts                # Analytics queries
```

### AI Integration
```
workers/ai/
├── 📋 claude.ts                       # Claude API integration
├── 📋 vectorize.ts                    # Cloudflare Vectorize operations
├── 📋 embeddings.ts                   # Text embedding generation
├── 📋 sentiment.ts                    # Sentiment analysis
├── 📋 conflict-detection.ts           # AI conflict detection
├── 📋 pattern-analysis.ts             # Communication pattern analysis
├── 📋 insight-generation.ts           # AI insight generation
└── 📋 recommendations.ts              # Recommendation engine
```

### Utilities & Helpers
```
workers/utils/
├── 📋 csv-parser.ts                   # CSV file processing
├── 📋 date-helpers.ts                 # Date manipulation utilities
├── 📋 validation.ts                   # Input validation schemas
├── 📋 encryption.ts                   # Data encryption utilities
├── 📋 response.ts                     # Standardized API responses
└── 📋 logger.ts                       # Logging utilities
```

## 🎨 Styling & Assets

### Styles
```
src/styles/
├── 📋 globals.css                     # Global styles
├── 📋 components.css                  # Component-specific styles
├── 📋 charts.css                      # Chart styling
└── 📋 mobile.css                      # Mobile-specific styles
```

### Assets
```
public/
├── images/
│   ├── 📋 logo.svg                    # App logo
│   ├── 📋 empty-states/               # Empty state illustrations
│   │   ├── 📋 no-messages.svg
│   │   ├── 📋 no-conflicts.svg
│   │   └── 📋 no-events.svg
│   └── 📋 icons/                      # Custom icons
│       ├── 📋 heart.svg
│       ├── 📋 conflict.svg
│       └── 📋 insight.svg
├── 📋 favicon.ico
└── 📋 manifest.json                   # PWA manifest
```

## 🧪 Testing Structure

### Unit Tests
```
tests/
├── components/
│   ├── 📋 TrajectoryChart.test.tsx
│   ├── 📋 MessageTable.test.tsx
│   └── 📋 ConflictCard.test.tsx
├── utils/
│   ├── 📋 csv-parser.test.ts
│   ├── 📋 sentiment.test.ts
│   └── 📋 date-helpers.test.ts
├── api/
│   ├── 📋 messages.test.ts
│   ├── 📋 conflicts.test.ts
│   └── 📋 ai-chat.test.ts
└── 📋 setup.ts                        # Test configuration
```

## 📦 Configuration Files

### Build & Development
```
├── 📋 jest.config.js                  # Testing configuration
├── 📋 .eslintrc.json                  # Linting rules
├── 📋 .prettierrc                     # Code formatting
├── 📋 Dockerfile                      # Container configuration
├── 📋 docker-compose.yml              # Local development setup
└── 📋 .github/workflows/
    ├── 📋 deploy.yml                  # CI/CD pipeline
    └── 📋 test.yml                    # Automated testing
```

## 📊 Development Progress Tracking

### Phase 1: MVP Core (Week 1-4)
**Database & Infrastructure**
- [ ] 📋 schema.sql
- [ ] 📋 wrangler.toml
- [ ] 📋 workers/database/connection.ts
- [ ] 📋 workers/database/migrations.ts

**Text Message Analysis**
- [ ] 📋 app/messages/import/page.tsx
- [ ] 📋 components/forms/MessageImportForm.tsx
- [ ] 📋 workers/utils/csv-parser.ts
- [ ] 📋 app/messages/page.tsx
- [ ] 📋 components/ui/MessageTable.tsx
- [ ] 📋 app/insights/page.tsx

**Basic Trajectory**
- [ ] 📋 app/trajectory/page.tsx
- [ ] 📋 components/charts/TrajectoryChart.tsx
- [ ] 📋 components/forms/ConnectionLevelForm.tsx

**AI Chat Foundation**
- [ ] 📋 app/ai-chat/page.tsx
- [ ] 📋 workers/ai/claude.ts
- [ ] 📋 workers/ai/vectorize.ts

### Phase 2: Enhanced Features (Week 5-7)
**Conflict Intelligence**
- [ ] 📋 workers/ai/conflict-detection.ts
- [ ] 📋 app/conflicts/page.tsx
- [ ] 📋 components/ui/ConflictCard.tsx

**Deep Dive Pages**
- [ ] 📋 app/trajectory/[year]/[month]/page.tsx
- [ ] 📋 components/interactive/MonthlyDeepDive.tsx

**Journal & Events**
- [ ] 📋 app/journal/page.tsx
- [ ] 📋 app/events/page.tsx
- [ ] 📋 components/forms/JournalForm.tsx
- [ ] 📋 components/forms/EventForm.tsx

### Phase 3: Intelligence Layer (Week 8-10)
**Advanced AI**
- [ ] 📋 workers/ai/pattern-analysis.ts
- [ ] 📋 workers/ai/recommendations.ts
- [ ] 📋 components/ui/RecommendationCard.tsx

**Analytics Dashboard**
- [ ] 📋 app/page.tsx (complete dashboard)
- [ ] 📋 components/charts/SentimentChart.tsx
- [ ] 📋 components/charts/ConflictChart.tsx

---

## 🏆 Completion Tracking System

**Syntax**: 
- `📋` = Not Started
- `🔄` = In Progress  
- `✅` = Completed
- `🚫` = Blocked/Issues

**Usage**: Replace 📋 with appropriate emoji as files are completed.

**Total Files**: 147 files across all phases
**MVP Target**: 52 files for basic functionality
**Full Platform**: 147 files for complete feature set