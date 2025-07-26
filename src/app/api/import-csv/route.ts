import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context

    if (!env?.DB) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 500 })
    }

    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'src/database/aug 9 2024-Table 1.csv')
    let csvContent: string
    
    try {
      csvContent = await fs.readFile(csvPath, 'utf-8')
    } catch (error) {
      // If file system access fails (common in edge runtime), use the data from request
      const body = await request.json() as { csvData?: string }
      if (!body.csvData) {
        return NextResponse.json({
          success: false,
          error: 'CSV data not provided and file not accessible'
        }, { status: 400 })
      }
      csvContent = body.csvData
    }

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "texts-bc" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        date_time TEXT,
        sender TEXT,
        message TEXT,
        type TEXT,
        notes TEXT,
        sentiment TEXT,
        category TEXT,
        tag TEXT,
        conflict_detected BOOLEAN DEFAULT FALSE
      )
    `

    await env.DB.prepare(createTableQuery).run()

    // Insert records
    let insertedCount = 0
    let skippedCount = 0
    const errors: any[] = []

    for (const record of records) {
      try {
        // Skip rows with empty message
        const rec = record as any
        if (!rec.message || rec.message.trim() === '') {
          skippedCount++
          continue
        }

        // Map CSV columns to database columns
        const insertQuery = `
          INSERT INTO "texts-bc" (
            date, date_time, sender, message, type, notes, sentiment
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        await env.DB.prepare(insertQuery)
          .bind(
            rec.date || null,
            rec['date-time'] || null,
            rec.sender || null,
            rec.message || null,
            rec.type || null,
            rec.notes || null,
            rec.sentiment || null
          )
          .run()

        insertedCount++
      } catch (error) {
        errors.push({
          record,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      insertedCount,
      skippedCount,
      errorsCount: errors.length,
      errors: errors.slice(0, 5) // Return first 5 errors if any
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import CSV'
    }, { status: 500 })
  }
}

// GET endpoint to check current data
export async function GET() {
  try {
    const context = await getCloudflareContext()
    const { env } = context

    if (!env?.DB) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 500 })
    }

    // Get table info
    const tableInfoQuery = `
      SELECT COUNT(*) as count FROM "texts-bc"
    `
    
    const sampleQuery = `
      SELECT * FROM "texts-bc" 
      ORDER BY date_time DESC 
      LIMIT 5
    `

    const [countResult, sampleResult] = await Promise.all([
      env.DB.prepare(tableInfoQuery).first(),
      env.DB.prepare(sampleQuery).all()
    ])

    return NextResponse.json({
      success: true,
      totalRecords: (countResult as any)?.count || 0,
      sampleData: sampleResult.results
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data'
    }, { status: 500 })
  }
}