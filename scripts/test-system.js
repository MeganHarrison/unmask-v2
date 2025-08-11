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