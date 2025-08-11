# Next.js Framework Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

<!-- dash-content-start -->

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It's deployed on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

This template uses [OpenNext](https://opennext.js.org/) via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which works by taking the Next.js build output and transforming it, so that it can run in Cloudflare Workers.

<!-- dash-content-end -->

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

A live public deployment of this template is available at [https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev)

## Getting Started

First, run:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploying To Production

| Command                           | Action                                       |
| :-------------------------------- | :------------------------------------------- |
| `npm run build`                   | Build your production site                   |
| `npm run preview`                 | Preview your build locally, before deploying |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare    |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## API Routes Documentation

This application includes several API routes for handling text messages and AI agents:

### Text Messages APIs

#### `/api/texts-bs` (D1 Database - Currently Active)
- **GET**: Fetches text messages from the `texts_bs` table in D1 database
  - Query parameters:
    - `page` (number): Page number for pagination (default: 1)
    - `limit` (number): Number of messages per page (default: 50)
    - `start_date` (ISO string): Filter messages from this date
    - `end_date` (ISO string): Filter messages until this date
  - Returns messages sorted by date in ascending order (oldest first)
- **PATCH**: Updates a specific field for a message
  - Body: `{ id: number, field: string, value: string }`
  - Allowed fields: `sentiment`, `category`, `tag`

#### `/api/texts-bc` (Hyperdrive - Legacy)
- **GET**: Fetches text messages from the `texts-bc` table using Hyperdrive
  - Same query parameters as `/api/texts-bs`
  - Returns messages sorted by date in descending order (newest first)
  - This route is preserved for backward compatibility but not currently used

### AI Agent APIs

#### `/api/chat/rag`
- **POST**: Main RAG chat endpoint for relationship intelligence
  - Body: `{ message: string, conversationHistory: ChatMessage[] }`
  - Uses Cloudflare Vectorize for semantic search
  - Returns AI-generated insights based on conversation history

#### `/api/agents/memory-search`
- **POST**: Specialized agent for searching specific conversations
  - Body: `{ query: string, searchMode?: 'semantic' | 'keyword' }`
  - Returns precise matches with exact quotes and dates

#### `/api/agents/pattern-analysis`
- **POST**: Analyzes communication patterns in relationships
  - Body: `{ timeframe?: string, focus?: string }`
  - Returns insights about recurring patterns and trends

#### `/api/agents/conflict-resolution`
- **POST**: Provides guidance for resolving relationship conflicts
  - Body: `{ situation: string, context?: string }`
  - Returns constructive advice and communication strategies

#### `/api/agents/relationship-coach`
- **POST**: Offers personalized relationship coaching
  - Body: `{ goal: string, currentSituation?: string }`
  - Returns actionable advice and exercises

### Vectorize Management APIs

#### `/api/vectorize/populate`
- **POST**: Populates the vector index with conversation chunks
  - No body required
  - Chunks messages by 30-minute conversation gaps
  - Creates embeddings using OpenAI's text-embedding-3-small model

#### `/api/vectorize/check`
- **GET**: Checks the status of the vector index
  - Returns index statistics and metadata

### Configuration

The application uses the following Cloudflare services:
- **D1 Database**: SQLite edge database for storing text messages
  - Database ID: `f450193b-9536-4ada-8271-2a8cd917069e`
  - Binding: `DB`
- **Vectorize**: Vector database for semantic search
  - Index: `relationship-insights-1536`
  - Binding: `VECTORIZE_INDEX`
- **Hyperdrive**: PostgreSQL connection pooling (legacy)
  - Binding: `HYPERDRIVE`

Environment variables required:
- `OPENAI_API_KEY`: For embeddings and chat completions
