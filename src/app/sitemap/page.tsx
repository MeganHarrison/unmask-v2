import Link from 'next/link';

export default function SitemapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Unmask V1 Sitemap</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">🏠 Root Pages</h2>
          <ul className="space-y-2 ml-4">
            <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">🔐 Authentication</h2>
          <ul className="space-y-2 ml-4">
            <li><Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link></li>
            <li><Link href="/auth/sign-up" className="text-blue-600 hover:underline">Sign Up</Link></li>
            <li><Link href="/auth/sign-up-success" className="text-blue-600 hover:underline">Sign Up Success</Link></li>
            <li><Link href="/auth/forgot-password" className="text-blue-600 hover:underline">Forgot Password</Link></li>
            <li><Link href="/auth/update-password" className="text-blue-600 hover:underline">Update Password</Link></li>
            <li><Link href="/auth/error" className="text-blue-600 hover:underline">Auth Error</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">💬 Chat & Messaging</h2>
          <ul className="space-y-2 ml-4">
            <li><Link href="/chat" className="text-blue-600 hover:underline">Chat</Link></li>
            <li><Link href="/chat2" className="text-blue-600 hover:underline">Chat 2</Link></li>
            <li><Link href="/chris-messages" className="text-blue-600 hover:underline">Chris Messages</Link></li>
            <li><Link href="/messages-fixed" className="text-blue-600 hover:underline">Messages Fixed</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">📊 Dashboard & Core Features</h2>
          <ul className="space-y-2 ml-4">
            <li><Link href="/dashboard2" className="text-blue-600 hover:underline">Dashboard 2</Link></li>
            <li><Link href="/home2" className="text-blue-600 hover:underline">Home 2</Link></li>
            <li><Link href="/timeline" className="text-blue-600 hover:underline">Timeline</Link></li>
            <li><Link href="/events" className="text-blue-600 hover:underline">Events</Link></li>
            <li><Link href="/upload" className="text-blue-600 hover:underline">Upload</Link></li>
            <li><Link href="/protected" className="text-blue-600 hover:underline">Protected</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">🎨 Special Pages</h2>
          <ul className="space-y-2 ml-4">
            <li><Link href="/marquee" className="text-blue-600 hover:underline">Marquee (No Sidebar)</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">🧪 Development</h2>
          <ul className="space-y-2 ml-4">
            <li><Link href="/test" className="text-blue-600 hover:underline">Test Page</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">🔌 API Endpoints</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">Note: These are API endpoints, not pages. They handle data operations.</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">AI & Chat</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/chat</code> - Chat endpoint</li>
                  <li><code>/api/ai/analyze-messages</code> - Message analysis</li>
                  <li><code>/api/chat/rag</code> - RAG chat</li>
                  <li><code>/api/chat/autorag</code> - Auto RAG chat</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data Management</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/messages</code> - Messages CRUD</li>
                  <li><code>/api/conversations</code> - Conversations</li>
                  <li><code>/api/upload/status/[jobId]</code> - Upload status</li>
                  <li><code>/api/import-csv</code> - CSV import</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Insights & Analytics</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/insights/generate</code> - Generate insights</li>
                  <li><code>/api/agents/insights/health-score</code> - Health score</li>
                  <li><code>/api/agents/insights/patterns</code> - Pattern analysis</li>
                  <li><code>/api/agents/insights/timeline</code> - Timeline insights</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Memory & Search</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/memory/query</code> - Memory queries</li>
                  <li><code>/api/agents/memory-search</code> - Memory search</li>
                  <li><code>/api/vectorize/check</code> - Vector check</li>
                  <li><code>/api/vectorize/populate</code> - Vector populate</li>
                  <li><code>/api/vectorize/test</code> - Vector test</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Relationships</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/relationship-events</code> - Relationship events</li>
                  <li><code>/api/relationship-tracker</code> - Relationship tracking</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Text Processing</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/texts-bc</code> - BC texts</li>
                  <li><code>/api/texts-brandon</code> - Brandon texts</li>
                  <li><code>/api/texts-bs</code> - BS texts</li>
                  <li><code>/api/texts-hyperdrive</code> - Hyperdrive texts</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Other</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>/api/health</code> - Health check</li>
                  <li><code>/api/migrate</code> - Database migration</li>
                  <li><code>/api/create-events-table</code> - Create events table</li>
                  <li><code>/api/seed-conversation-chunks</code> - Seed conversation chunks</li>
                  <li><code>/api/seed-more-data</code> - Seed more data</li>
                  <li><code>/api/agents/orchestrator</code> - Agent orchestrator</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}