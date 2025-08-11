# Unmask Deployment & Testing Guide

## 🚀 Phase 1: Environment Setup

### 1. Cloudflare Setup
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create your account resources
wrangler kv:namespace create "ORCHESTRATOR_KV" --preview false
wrangler kv:namespace create "MEMORY_KV" --preview false  
wrangler kv:namespace create "COACHING_KV" --preview false
wrangler kv:namespace create "INGESTION_KV" --preview false

# Create D1 database
wrangler d1 create unmask-production

# Create Vectorize index
wrangler vectorize create unmask-relationship-vectors --dimensions=1536 --metric=cosine

# Create R2 bucket
wrangler r2 bucket create unmask-file-storage
```

### 2. Environment Variables Setup

Create `.env.local` in your Next.js root:
```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_D1_DATABASE_ID=your_d1_database_id
CLOUDFLARE_VECTORIZE_INDEX_ID=your_vectorize_index_id
CLOUDFLARE_R2_BUCKET_NAME=unmask-file-storage

# NextAuth (for user authentication)
NEXTAUTH_SECRET=your_secure_random_string_here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_connection_string
```

### 3. Update Wrangler.toml Files

For each worker, update the wrangler.toml with your actual resource IDs:

**workers/agents/orchestrator/wrangler.toml:**
```toml
name = "unmask-orchestrator"
main = "index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.kv_namespaces]]
binding = "ORCHESTRATOR_KV"
id = "YOUR_ACTUAL_KV_NAMESPACE_ID"

[[env.production.d1_databases]]
binding = "USER_CONTEXT_D1"
database_name = "unmask-production"
database_id = "YOUR_ACTUAL_D1_DATABASE_ID"
```

Repeat for all workers with their respective namespace IDs.

## 🗄️ Phase 2: Database Setup

### 1. Initialize D1 Schema
```bash
# Navigate to your project root
cd your-project-directory

# Apply the database schema
wrangler d1 execute unmask-production --file=./database/schema/messages-schema.sql
```

### 2. Create Test User Data
```sql
-- Insert test user (run via wrangler d1 execute)
INSERT INTO users (id, email, relationship_start_date, partner_name, communication_style)
VALUES ('test-user-123', 'test@example.com', '2023-01-01', 'Partner Name', 'direct');
```

## 📦 Phase 3: Worker Deployment

### 1. Deploy All Workers
```bash
# Deploy orchestrator
cd workers/agents/orchestrator
wrangler deploy

# Deploy memory agent
cd ../memory-agent
wrangler deploy

# Deploy coaching agent  
cd ../coaching-agent
wrangler deploy

# Deploy data ingestion
cd ../../data-ingestion
wrangler deploy
```

### 2. Test Worker Endpoints
```bash
# Test orchestrator
curl -X POST https://unmask-orchestrator.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","message":"How is our relationship doing?","conversationHistory":[]}'

# Test memory agent
curl -X POST https://unmask-memory-agent.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","queryType":"insights"}'
```

## 🖥️ Phase 4: Frontend Deployment

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Update API Endpoints
In your frontend code, update all worker URLs to match your deployed workers:
- `https://unmask-orchestrator.your-subdomain.workers.dev`
- `https://unmask-memory-agent.your-subdomain.workers.dev`
- etc.

### 3. Test Local Development
```bash
npm run dev
```

Navigate to `http://localhost:3000` and test:
- ✅ Dashboard loads
- ✅ Chat interface works
- ✅ Upload page displays

### 4. Deploy to Vercel/Netlify
```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod
```

## 🧪 Phase 5: End-to-End Testing

### Test Scenario 1: Chat Flow
1. Go to `/dashboard/chat`
2. Send message: "Help me understand our communication patterns"
3. Verify:
   - ✅ Message appears in chat
   - ✅ AI responds with agent indicator
   - ✅ Response includes confidence score
   - ✅ Next steps are provided

### Test Scenario 2: CSV Upload
1. Create a test CSV file with format:
```csv
date,sender,message
2024-01-01 10:00:00,You,"Good morning babe!"
2024-01-01 10:05:00,Partner,"Morning love! How did you sleep?"
2024-01-01 10:06:00,You,"Great! Ready for our coffee date?"
```

2. Go to `/dashboard/upload`
3. Upload the CSV file
4. Verify:
   - ✅ File validates successfully
   - ✅ Processing starts with progress tracking
   - ✅ All steps complete successfully
   - ✅ Results show insights and health score

### Test Scenario 3: Memory Search
1. After CSV upload, go to chat
2. Send message: "Find conversations about coffee"
3. Verify:
   - ✅ Memory agent retrieves relevant messages
   - ✅ Results include context and relevance scores
   - ✅ Insights are generated

## 🐛 Debugging Common Issues

### Worker Deployment Issues
```bash
# Check worker logs
wrangler tail unmask-orchestrator

# Test worker locally
wrangler dev
```

### Database Connection Issues
```bash
# Test D1 connection
wrangler d1 execute unmask-production --command="SELECT * FROM users LIMIT 1;"

# Check table structure
wrangler d1 execute unmask-production --command="PRAGMA table_info(messages);"
```

### Vector Search Issues
```bash
# Check vectorize index
wrangler vectorize get-index unmask-relationship-vectors

# Test vector insertion
wrangler vectorize insert unmask-relationship-vectors --file=test-vectors.json
```

### API Integration Issues
1. Check CORS settings in workers
2. Verify all environment variables are set
3. Check browser network tab for failed requests
4. Review worker logs for errors

## 📊 Success Metrics

After deployment, you should see:

**Dashboard Metrics:**
- ✅ Health score calculation working
- ✅ Message count displays
- ✅ Recent insights populate
- ✅ Timeline shows relationship events

**Chat Functionality:**
- ✅ Agent routing works (different icons for different agents)
- ✅ Confidence scores display
- ✅ Next steps appear
- ✅ Context is maintained across messages

**Data Processing:**
- ✅ CSV files parse correctly
- ✅ Sentiment analysis generates scores
- ✅ Vector embeddings are created
- ✅ Search returns relevant results

## 🎯 Next Testing Steps

Once basic deployment works:

1. **Test with Real Data**: Use actual message exports
2. **Stress Test**: Upload large CSV files (1000+ messages)
3. **User Journey**: Complete end-to-end user experience
4. **Performance**: Check response times and reliability
5. **Edge Cases**: Test malformed data, edge cases

## 📞 Need Help?

Common deployment questions:
- **Worker not responding**: Check wrangler.toml bindings
- **Database errors**: Verify D1 schema is applied
- **Vector search failing**: Confirm Vectorize index exists
- **Frontend errors**: Check environment variables
- **CORS issues**: Add proper headers in workers

Remember: Start simple, test each component, then build complexity!
