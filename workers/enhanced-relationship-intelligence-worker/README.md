# Enhanced Relationship Intelligence Worker

This Cloudflare Worker provides contextual relationship intelligence by analyzing text messages with awareness of physical presence, daily context, and relationship patterns.

## Setup Instructions

### 1. Run Database Migration

First, ensure the contextual tables are created in the megan-personal database:

```bash
# From the project root
./scripts/migrate-contextual-tables.sh
```

This creates the following tables:
- `daily_context` - Tracks daily relationship states (together/apart)
- `contextual_messages` - Links messages to daily context with AI analysis
- `relationship_events` - Logs significant relationship moments
- `connection_metrics` - AI-calculated daily health scores
- `pattern_recognition` - Detected recurring patterns
- `transition_tracking` - Connection/disconnection patterns

### 2. Set OpenAI API Key

The worker requires an OpenAI API key for sentiment analysis:

```bash
cd workers/enhanced-relationship-intelligence-worker
npx wrangler secret put OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

### 3. Deploy the Worker

```bash
npx wrangler deploy
```

## API Endpoints

### Daily Context Management
- `POST /api/daily-context` - Log daily relationship state
- `GET /api/daily-context?date=YYYY-MM-DD` - Get context for a specific date

### Message Processing
- `POST /api/messages/process` - Process messages with contextual awareness

### Event Logging
- `POST /api/events` - Log relationship events (conflicts, breakthroughs, etc.)

### Analysis
- `POST /api/analyze` - Perform contextual analysis
- `POST /api/patterns/detect` - Detect relationship patterns
- `GET /api/dashboard` - Get relationship health dashboard data

## How It Works

1. **Context-Aware Analysis**: The worker understands that low message count when together indicates healthy physical presence, not declining connection.

2. **Multi-Dimensional Scoring**: Calculates relationship health based on:
   - Physical presence patterns
   - Message sentiment and frequency
   - Response times
   - Significant events
   - Energy levels and external stressors

3. **Pattern Recognition**: Identifies recurring patterns like:
   - Reconnection behaviors after time apart
   - Conflict triggers and resolution patterns
   - Communication style changes based on context

## Integration with Main App

The worker uses the same database (`megan-personal`) as the main Next.js application, ensuring data consistency. The `texts-bc` table is the source of text messages, which get enhanced with contextual analysis.

## Example Usage

### Log Daily Context
```javascript
await fetch('https://your-worker.workers.dev/api/daily-context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-03-15',
    physical_status: 'together',
    relationship_satisfaction: 9,
    personal_energy: 7,
    external_stressors: ['work deadline'],
    notes: 'Great day despite work stress'
  })
});
```

### Process Messages with Context
```javascript
await fetch('https://your-worker.workers.dev/api/messages/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      {
        date: '2024-03-15',
        timestamp: '2024-03-15T10:30:00Z',
        sender: 'user',
        content: 'Missing you today'
      }
    ]
  })
});
```

## Database Schema

The worker extends the existing `texts-bc` table with contextual analysis stored in separate tables. See `migrations/001_create_contextual_tables.sql` for the complete schema.