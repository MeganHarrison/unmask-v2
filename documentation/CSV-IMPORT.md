# CSV Import to Cloudflare D1 Database

This feature allows you to upload CSV files and import their data into the `texts-bc` table in your Cloudflare D1 database.

## Features

- Upload CSV files through a web interface
- Automatically parse CSV headers and data
- Create the table if it doesn't exist (with all columns as TEXT type)
- Batch insert for better performance
- Error handling and progress feedback

## Setup Instructions

### 1. Local Development

The CSV import page is available at `/csv-import`. In local development, it will parse the CSV but won't actually insert into D1 (since D1 is only available in Cloudflare Workers environment).

### 2. Deploy the Worker

To actually import data into your D1 database, you need to deploy the Cloudflare Worker:

```bash
# Install wrangler if you haven't already
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy

# The deployment will give you a URL like:
# https://csv-import-worker.<your-subdomain>.workers.dev
```

### 3. Configure the Environment Variable

Add the worker URL to your `.env.local` file:

```
NEXT_PUBLIC_CSV_WORKER_URL=https://csv-import-worker.<your-subdomain>.workers.dev
```

### 4. Database Configuration

The worker is configured to use:
- Database Name: `megan-personal`
- Database ID: `f450193b-9536-4ada-8271-2a8cd917069e`
- Table Name: `texts-bc`

## Usage

1. Navigate to `/csv-import` in your application
2. Select a CSV file using the file picker
3. Click "Import CSV to Database"
4. The system will:
   - Parse the CSV file
   - Create the `texts-bc` table if it doesn't exist
   - Insert all rows from the CSV into the table

## CSV Format

- The first row should contain column headers
- All data will be stored as TEXT type
- The system handles quoted values and commas within quotes
- Empty values will be stored as empty strings

Example CSV:
```csv
name,email,phone
"John Doe","john@example.com","555-0123"
"Jane Smith","jane@example.com","555-0124"
```

## Troubleshooting

1. **"Failed to process CSV file"**: Check that your CSV is properly formatted
2. **CORS errors**: Make sure the worker URL is correct in your environment variables
3. **Database errors**: Verify that the database ID is correct and the worker has access to it

## Security Notes

- The worker accepts uploads from any origin (CORS is set to `*`)
- For production, you should:
  - Add authentication
  - Restrict CORS to your domain
  - Add file size limits
  - Validate CSV content before insertion



  .toml
  .pages.toml
  app.toml

  name = "megan-admin-dashboard"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

# D1 Database binding for Pages
[[d1_databases]]
binding = "DB"
database_name = "megan-personal"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

name = "unmask-tagger"
main = "src/index.js"
compatibility_date = "2024-01-15"

[[d1_databases]]
binding = "DB"
database_name = "texts-bc"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

# Environment variables
[vars]
CSV_WORKER_URL = "https://csv-import-worker.megan-d14.workers.dev"
ENVIRONMENT = "production"

name = "megan-admin-dashboard"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

# D1 Database binding for Pages
[[d1_databases]]
binding = "DB"
database_name = "megan-personal"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

name = "unmask-tagger"
main = "src/index.js"
compatibility_date = "2024-01-15"

[[d1_databases]]
binding = "DB"
database_name = "texts-bc"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

# Environment variables
[vars]
CSV_WORKER_URL = "https://csv-import-worker.megan-d14.workers.dev"
ENVIRONMENT = "production"

name = "megan-admin-dashboard"
compatibility_date = "2024-01-01"

# Pages specific configuration
[build]
command = "npm run pages:build"


# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "megan-personal"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

# Environment variables
[vars]
CSV_WORKER_URL = "https://csv-import-worker.megan-d14.workers.dev"

# Deployment configuration
[deployment]
exclude = ["node_modules", ".git", ".next/cache"]

name = "megan-admin-dashboard"
main = ".vercel/output/static/_worker.js/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Account and routing
account_id = "d1416265449d2a0bae41c45c791270ec"
workers_dev = true

# Build configuration
[build]
command = "npm run pages:build"

# Assets
[site]
bucket = ".vercel/output/static"


# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "megan-personal"
database_id = "f450193b-9536-4ada-8271-2a8cd917069e"

# Environment variables
[vars]
CSV_WORKER_URL = "https://csv-import-worker.megan-d14.workers.dev"
NEXT_PUBLIC_CSV_WORKER_URL = "https://csv-import-worker.megan-d14.workers.dev"

# Node.js compatibility
[env.production]
compatibility_flags = ["nodejs_compat"]