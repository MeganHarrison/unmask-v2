#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'

async function importCSV() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'src/database/aug 9 2024-Table 1.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')

    // Make API request to import endpoint
    const response = await fetch('https://next-starter-template.megan-d14.workers.dev/api/import-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csvData: csvContent
      })
    })

    const result = await response.json() as any
    
    if (result.success) {
      console.log('✅ CSV Import Successful!')
      console.log(`📊 Total records: ${result.totalRecords}`)
      console.log(`✅ Inserted: ${result.insertedCount}`)
      console.log(`⏭️  Skipped: ${result.skippedCount}`)
      console.log(`❌ Errors: ${result.errorsCount}`)
      
      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ First few errors:')
        result.errors.forEach((err: any, idx: number) => {
          console.log(`${idx + 1}. ${err.error}`)
        })
      }
    } else {
      console.error('❌ Import failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the import
importCSV()