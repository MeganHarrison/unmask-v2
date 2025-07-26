const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read CSV file
const csvPath = path.join(__dirname, '../database/aug 9 2024-Table 1.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Generate SQL statements
console.log('-- Create table if not exists');
console.log(`CREATE TABLE IF NOT EXISTS "texts-bc" (
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
);`);

console.log('\n-- Insert data');
records.forEach((record, index) => {
  // Skip empty messages
  if (!record.message || record.message.trim() === '') {
    return;
  }

  // Escape single quotes in message
  const message = record.message.replace(/'/g, "''");
  const notes = (record.notes || '').replace(/'/g, "''");
  
  console.log(`INSERT INTO "texts-bc" (date, date_time, sender, message, type, notes, sentiment) VALUES (
  '${record.date || ''}',
  '${record['date-time'] || ''}',
  '${record.sender || ''}',
  '${message}',
  '${record.type || ''}',
  '${notes}',
  '${record.sentiment || ''}'
);`);
});

console.log('\n-- Verify import');
console.log('SELECT COUNT(*) as total FROM "texts-bc";');
console.log('SELECT * FROM "texts-bc" ORDER BY date_time DESC LIMIT 5;');