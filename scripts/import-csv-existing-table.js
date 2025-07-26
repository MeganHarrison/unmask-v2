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

console.log('-- Insert data into existing texts-bc table');
records.forEach((record, index) => {
  // Skip empty messages
  if (!record.message || record.message.trim() === '') {
    return;
  }

  // Escape single quotes in message
  const message = record.message.replace(/'/g, "''");
  
  // Map sender to match table structure
  const sender = record.sender === 'Incoming' ? 'Brandon' : 'Megan';
  
  console.log(`INSERT INTO "texts-bc" (date, date_time, sender, message, type, sentiment) VALUES (
  '${record.date || ''}',
  '${record['date-time'] || ''}',
  '${sender}',
  '${message}',
  '${record.type || 'text'}',
  '${record.sentiment || 'neutral'}'
);`);
});

console.log('\n-- Verify import');
console.log('SELECT COUNT(*) as total FROM "texts-bc";');
console.log('SELECT * FROM "texts-bc" ORDER BY date_time DESC LIMIT 5;');