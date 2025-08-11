# Unmask AI Relationship Coach - Complete File Structure

## Frontend (Next.js App)

### `/app` Directory
```
app/
├── layout.tsx                     # Root layout with providers
├── page.tsx                       # Landing page
├── globals.css                    # Global styles
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── register/
│       └── page.tsx              # Registration page
├── dashboard/
│   ├── page.tsx                  # Main dashboard
│   ├── layout.tsx                # Dashboard layout
│   ├── chat/
│   │   └── page.tsx              # Chat interface with AI coach
│   ├── upload/
│   │   └── page.tsx              # Data upload interface
│   ├── insights/
│   │   └── page.tsx              # Relationship insights & analytics
│   └── timeline/
│       └── page.tsx              # Relationship timeline view
└── api/
    ├── auth/
    │   └── route.ts              # Authentication endpoints
    ├── upload/
    │   ├── messages/
    │   │   └── route.ts          # Message CSV upload
    │   ├── audio/
    │   │   └── route.ts          # Audio file upload
    │   └── journal/
    │       └── route.ts          # Journal entry upload
    ├── chat/
    │   └── route.ts              # Chat with AI coach
    ├── insights/
    │   ├── patterns/
    │   │   └── route.ts          # Pattern analysis
    │   ├── timeline/
    │   │   └── route.ts          # Relationship timeline
    │   └── health-score/
    │       └── route.ts          # Relationship health metrics
    └── agents/
        ├── orchestrator/
        │   └── route.ts          # Master orchestrator
        ├── analyze/
        │   └── route.ts          # Analysis agent
        └── coaching/
            └── route.ts          # Coaching agent
```

### `/components` Directory
```
components/
├── ui/                           # Shadcn/ui components
├── layout/
│   ├── Header.tsx               # App header
│   ├── Sidebar.tsx              # Dashboard sidebar
│   └── Footer.tsx               # App footer
├── chat/
│   ├── ChatInterface.tsx        # Main chat component
│   ├── MessageBubble.tsx        # Individual message
│   ├── TypingIndicator.tsx      # AI typing animation
│   └── ChatInput.tsx            # Message input field
├── upload/
│   ├── FileUploader.tsx         # Drag & drop file upload
│   ├── CSVPreview.tsx           # Preview CSV data
│   ├── AudioUploader.tsx        # Audio file upload
│   └── ProgressTracker.tsx      # Upload progress
├── insights/
│   ├── RelationshipTimeline.tsx # Interactive timeline
│   ├── PatternChart.tsx         # Communication patterns
│   ├── SentimentGraph.tsx       # Sentiment over time
│   ├── HealthScore.tsx          # Relationship health display
│   └── ConflictAnalysis.tsx     # Conflict pattern analysis
└── common/
    ├── LoadingSpinner.tsx       # Loading states
    ├── ErrorBoundary.tsx        # Error handling
    └── Tooltip.tsx              # Info tooltips
```

### `/lib` Directory
```
lib/
├── auth.ts                      # Authentication utilities
├── db.ts                        # Database connection
├── utils.ts                     # General utilities
├── validations.ts               # Zod schemas
├── agents/
│   ├── types.ts                 # Agent type definitions
│   ├── orchestrator.ts          # Master orchestrator logic
│   ├── memory.ts                # Context retrieval
│   └── coaching.ts              # Coaching prompts
├── data-processing/
│   ├── csv-parser.ts            # CSV message parsing
│   ├── audio-transcription.ts   # Audio to text
│   ├── text-chunking.ts         # Intelligent text chunking
│   └── vector-embeddings.ts     # Vector generation
└── analytics/
    ├── sentiment-analysis.ts    # Sentiment scoring
    ├── pattern-detection.ts     # Pattern identification
    └── relationship-scoring.ts  # Health score calculation
```

## Cloudflare Workers

### `/workers` Directory
```
workers/
├── data-ingestion/
│   ├── index.ts                 # Main ingestion worker
│   ├── message-processor.ts     # Process text messages
│   ├── audio-processor.ts       # Process audio files
│   └── journal-processor.ts     # Process journal entries
├── agents/
│   ├── orchestrator/
│   │   ├── index.ts             # Master orchestrator
│   │   └── intent-classifier.ts # Classify user intent
│   ├── memory-agent/
│   │   ├── index.ts             # Context retrieval
│   │   └── vector-search.ts     # Semantic search
│   ├── pattern-agent/
│   │   ├── index.ts             # Pattern analysis
│   │   ├── trend-detector.ts    # Trend identification
│   │   └── cycle-finder.ts      # Relationship cycles
│   ├── conflict-agent/
│   │   ├── index.ts             # Conflict analysis
│   │   ├── escalation-detector.ts # Conflict escalation
│   │   └── resolution-tracker.ts # Resolution patterns
│   ├── emotional-agent/
│   │   ├── index.ts             # Emotional intelligence
│   │   ├── sentiment-tracker.ts # Sentiment analysis
│   │   └── attachment-analyzer.ts # Attachment styles
│   └── coaching-agent/
│       ├── index.ts             # Main coaching logic
│       ├── advice-generator.ts  # Personalized advice
│       └── intervention-suggester.ts # Action recommendations
├── analytics/
│   ├── relationship-health/
│   │   ├── index.ts             # Health score calculation
│   │   └── trend-analysis.ts    # Health trends
│   └── pattern-analysis/
│       ├── index.ts             # Pattern analysis worker
│       └── communication-patterns.ts # Communication analysis
└── shared/
    ├── types.ts                 # Shared TypeScript types
    ├── prompts.ts               # AI prompts library
    ├── utils.ts                 # Utility functions
    └── constants.ts             # System constants
```

### Worker Configuration Files
```
workers/
├── wrangler.toml               # Cloudflare Worker config
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

## Database Schema

### `/database` Directory
```
database/
├── schema/
│   ├── d1-schema.sql           # Cloudflare D1 schema
│   └── vectorize-config.json   # Vectorize configuration
├── migrations/
│   ├── 001_initial_schema.sql  # Initial database setup
│   ├── 002_add_conflicts.sql   # Conflict tracking
│   └── 003_add_insights.sql    # Insights storage
└── seeds/
    └── sample-data.sql         # Sample data for testing
```

## Configuration & Environment

### Root Directory Files
```
├── .env.local                  # Local environment variables
├── .env.example                # Environment template
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── README.md                   # Project documentation
└── claude.md                   # Project brief (current document)
```

## Key Environment Variables Needed

```bash
# Anthropic API
ANTHROPIC_API_KEY=

# OpenAI API (backup)
OPENAI_API_KEY=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_D1_DATABASE_ID=
CLOUDFLARE_VECTORIZE_INDEX_ID=
CLOUDFLARE_R2_BUCKET_NAME=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Database
DATABASE_URL=

# Feature Flags
ENABLE_AUDIO_PROCESSING=true
ENABLE_ADVANCED_ANALYTICS=true
```

## Deployment Configuration

### Vercel Deployment
```
vercel.json                     # Vercel deployment config
```

### Cloudflare Deployment
```
workers/deploy.sh               # Worker deployment script
workers/.env.production         # Production worker env vars
```

## Testing Structure

### `/tests` Directory
```
tests/
├── __tests__/
│   ├── components/             # Component tests
│   ├── api/                    # API route tests
│   └── agents/                 # Agent logic tests
├── __mocks__/
│   ├── data/                   # Mock data files
│   └── apis/                   # API mocks
└── setup/
    ├── jest.config.js          # Jest configuration
    └── test-utils.tsx          # Testing utilities
```

## Documentation

### `/docs` Directory
```
docs/
├── api/
│   ├── endpoints.md            # API documentation
│   └── agents.md               # Agent documentation
├── deployment/
│   ├── setup.md                # Setup instructions
│   └── production.md           # Production deployment
└── development/
    ├── getting-started.md      # Dev setup guide
    └── contributing.md         # Contribution guidelines
```