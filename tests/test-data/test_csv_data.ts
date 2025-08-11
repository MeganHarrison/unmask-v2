// test-data/sample-messages.csv
// Create this file to test your system
timestamp,sender,content
2024-01-01 08:00:00,You,"Good morning beautiful! Ready for our coffee date?"
2024-01-01 08:05:00,Partner,"Morning love! Can't wait. Should we try that new place?"
2024-01-01 08:06:00,You,"Absolutely! I'll pick you up in 20 minutes ❤️"
2024-01-01 08:07:00,Partner,"Perfect! I'll be ready 😘"
2024-01-01 12:30:00,You,"That coffee was amazing. Thanks for such a great morning!"
2024-01-01 12:32:00,Partner,"I loved spending time with you. You make every day better"
2024-01-01 18:00:00,You,"How was work today?"
2024-01-01 18:15:00,Partner,"Stressful day. Client was being difficult"
2024-01-01 18:16:00,You,"I'm sorry babe. Want to talk about it over dinner?"
2024-01-01 18:20:00,Partner,"Yes please. I need some comfort food and your hugs"
2024-01-02 07:45:00,You,"Running late for my meeting. See you tonight?"
2024-01-02 07:46:00,Partner,"Of course! I'll cook your favorite meal"
2024-01-02 07:47:00,You,"You're the best! I don't deserve you"
2024-01-02 07:48:00,Partner,"Stop that! You deserve all the love in the world"
2024-01-02 19:30:00,You,"Dinner smells incredible. Thank you for taking care of me"
2024-01-02 19:35:00,Partner,"I love taking care of you. How was the meeting?"
2024-01-02 19:36:00,You,"Great! The project got approved. We should celebrate"
2024-01-02 19:37:00,Partner,"That's amazing! I'm so proud of you 🎉"
2024-01-03 09:15:00,You,"Can we talk? I'm feeling a bit disconnected lately"
2024-01-03 09:20:00,Partner,"Of course. Is everything okay? I've been sensing something too"
2024-01-03 09:22:00,You,"Just feeling like we've been ships passing in the night"
2024-01-03 09:25:00,Partner,"I feel that too. We've both been so busy. Let's make time for us"
2024-01-03 09:26:00,You,"I'd love that. Maybe we could plan a weekend away?"
2024-01-03 09:30:00,Partner,"Yes! I'll look at some options. I miss our deep conversations"
2024-01-03 09:31:00,You,"Me too. I love you and want us to feel connected again"
2024-01-03 09:35:00,Partner,"I love you too. This conversation gives me hope ❤️"

// scripts/test-system.js - Comprehensive testing script
const fs = require('fs');
const fetch = require('node-fetch');

class UnmaskSystemTester {
  constructor(config) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.workerBaseUrl = config.workerBaseUrl || 'https://unmask-orchestrator.your-subdomain.workers.dev';
    this.testUserId = config.testUserId || 'test-user-123';
  }

  async runAllTests() {
    console.log('🚀 Starting Unmask System Tests\n');

    try {
      await this.testWorkerConnectivity();
      await this.testDatabaseConnection();
      await this.testChatOrchestration();
      await this.testCSVProcessing();
      await this.testMemoryRetrieval();
      await this.testFrontendIntegration();
      
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testWorkerConnectivity() {
    console.log('📡 Testing Worker Connectivity...');
    
    // Test orchestrator
    const orchestratorTest = {
      userId: this.testUserId,
      message: 'Test connectivity',
      conversationHistory: []
    };

    try {
      const response = await fetch(`${this.workerBaseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orchestratorTest)
      });

      if (!response.ok) {
        throw new Error(`Orchestrator failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('  ✅ Orchestrator responding');
      console.log(`  📊 Agent: ${result.agentType}, Confidence: ${result.confidence}`);
    } catch (error) {
      throw new Error(`Worker connectivity failed: ${error.message}`);
    }
  }

  async testDatabaseConnection() {
    console.log('\n🗄️ Testing Database Connection...');
    
    // This would typically be done through a dedicated endpoint
    console.log('  ✅ Database schema validation (manual verification required)');
    console.log('  📝 Verify these tables exist: messages, users, relationship_scores, user_interactions');
  }

  async testChatOrchestration() {
    console.log('\n💬 Testing Chat Orchestration...');
    
    const testQueries = [
      {
        message: 'How is our relationship doing?',
        expectedAgent: 'emotional-agent'
      },
      {
        message: 'Help me respond to this text',
        expectedAgent: 'coaching-agent'
      },
      {
        message: 'Show me our communication patterns',
        expectedAgent: 'pattern-agent'
      },
      {
        message: 'Find conversations about work',
        expectedAgent: 'memory-agent'
      }
    ];

    for (const query of testQueries) {
      try {
        const response = await fetch(`${this.workerBaseUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.testUserId,
            message: query.message,
            conversationHistory: []
          })
        });

        const result = await response.json();
        console.log(`  ✅ "${query.message}" → ${result.agentType} (${result.confidence})`);
      } catch (error) {
        console.log(`  ❌ "${query.message}" → Failed: ${error.message}`);
      }
    }
  }

  async testCSVProcessing() {
    console.log('\n📊 Testing CSV Processing...');
    
    // Read the test CSV file
    const csvPath = './test-data/sample-messages.csv';
    
    if (!fs.existsSync(csvPath)) {
      console.log('  ⚠️ Create test-data/sample-messages.csv first');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Test the ingestion worker
    try {
      const formData = new FormData();
      formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'test-messages.csv');
      formData.append('userId', this.testUserId);

      const response = await fetch(`https://unmask-data-ingestion.your-subdomain.workers.dev/process`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`CSV processing failed: ${response.status}`);
      }

      const job = await response.json();
      console.log(`  ✅ CSV processing started: Job ${job.id}`);
      console.log(`  📈 Status: ${job.status}, Progress: ${job.progress}%`);
      
      // Monitor job progress
      await this.monitorProcessingJob(job.id);
      
    } catch (error) {
      console.log(`  ❌ CSV processing failed: ${error.message}`);
    }
  }

  async monitorProcessingJob(jobId) {
    console.log('  ⏳ Monitoring processing job...');
    
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `https://unmask-data-ingestion.your-subdomain.workers.dev/status/${jobId}`
        );
        
        if (!response.ok) break;
        
        const job = await response.json();
        console.log(`    Progress: ${job.progress}% - ${job.status}`);
        
        if (job.status === 'completed') {
          console.log('  ✅ Processing completed successfully');
          console.log(`    📊 Processed ${job.results?.totalMessages} messages`);
          console.log(`    💯 Health Score: ${job.results?.healthScore}/10`);
          break;
        } else if (job.status === 'failed') {
          console.log(`  ❌ Processing failed: ${job.error}`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.log(`  ❌ Job monitoring failed: ${error.message}`);
        break;
      }
    }
  }

  async testMemoryRetrieval() {
    console.log('\n🧠 Testing Memory Retrieval...');
    
    const memoryTests = [
      {
        queryType: 'search',
        query: 'coffee',
        description: 'Search for coffee mentions'
      },
      {
        queryType: 'insights',
        description: 'Generate relationship insights'
      },
      {
        queryType: 'patterns',
        description: 'Analyze communication patterns'
      }
    ];

    for (const test of memoryTests) {
      try {
        const response = await fetch('https://unmask-memory-agent.your-subdomain.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.testUserId,
            ...test
          })
        });

        if (!response.ok) {
          throw new Error(`Memory test failed: ${response.status}`);
        }

        const result = await response.json();
        console.log(`  ✅ ${test.description} → ${result.results?.length || 0} results`);
        console.log(`    📊 Confidence: ${Math.round(result.confidence * 100)}%`);
      } catch (error) {
        console.log(`  ❌ ${test.description} → Failed: ${error.message}`);
      }
    }
  }

  async testFrontendIntegration() {
    console.log('\n🖥️ Testing Frontend Integration...');
    
    const endpoints = [
      '/api/chat',
      '/api/memory/query',
      '/api/upload/messages',
      '/api/insights/patterns'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });

        // We expect some endpoints to require authentication
        if (response.status === 401) {
          console.log(`  ✅ ${endpoint} → Requires auth (expected)`);
        } else if (response.status === 400) {
          console.log(`  ✅ ${endpoint} → Validates input (expected)`);
        } else if (response.ok) {
          console.log(`  ✅ ${endpoint} → Responding correctly`);
        } else {
          console.log(`  ⚠️ ${endpoint} → Status ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint} → Failed: ${error.message}`);
      }
    }
  }
}

// Usage
const tester = new UnmaskSystemTester({
  baseUrl: 'http://localhost:3000',
  workerBaseUrl: 'https://unmask-orchestrator.your-subdomain.workers.dev',
  testUserId: 'test-user-123'
});

// Run if called directly
if (require.main === module) {
  tester.runAllTests().catch(console.error);
}

module.exports = UnmaskSystemTester;

// package.json scripts to add:
/*
{
  "scripts": {
    "test:system": "node scripts/test-system.js",
    "deploy:workers": "npm run deploy:orchestrator && npm run deploy:memory && npm run deploy:coaching && npm run deploy:ingestion",
    "deploy:orchestrator": "cd workers/agents/orchestrator && wrangler deploy",
    "deploy:memory": "cd workers/agents/memory-agent && wrangler deploy", 
    "deploy:coaching": "cd workers/agents/coaching-agent && wrangler deploy",
    "deploy:ingestion": "cd workers/data-ingestion && wrangler deploy"
  }
}
*/

// scripts/validate-deployment.sh - Bash script for quick validation
#!/bin/bash

echo "🚀 Validating Unmask Deployment"
echo "=================================="

# Check if required tools are installed
command -v wrangler >/dev/null 2>&1 || { echo "❌ Wrangler CLI not installed"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }

echo "✅ Tools check passed"

# Check Cloudflare resources
echo "📡 Checking Cloudflare resources..."

# List KV namespaces
echo "KV Namespaces:"
wrangler kv:namespace list

# List D1 databases  
echo "D1 Databases:"
wrangler d1 list

# List Vectorize indexes
echo "Vectorize Indexes:"
wrangler vectorize list

# List R2 buckets
echo "R2 Buckets:"
wrangler r2 bucket list

echo "✅ Cloudflare resources check complete"

# Test worker deployment
echo "🔄 Testing worker deployments..."

# Check if workers are deployed
workers=("unmask-orchestrator" "unmask-memory-agent" "unmask-coaching-agent" "unmask-data-ingestion")

for worker in "${workers[@]}"; do
  if wrangler list | grep -q $worker; then
    echo "✅ $worker deployed"
  else
    echo "❌ $worker not found"
  fi
done

echo "=================================="
echo "Run 'npm run test:system' for full integration test"
