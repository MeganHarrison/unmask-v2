import { z } from 'zod';

// Schema for texts-bc table data (updated to match actual structure)
export const textsBrandonSchema = z.object({
  id: z.number(),
  created_at: z.string().optional(),
  date_time: z.string(),
  type: z.string().nullable().optional(),
  sender: z.string(),
  message: z.string(),
  category: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  relationship_id: z.number().nullable().optional(),
  sentiment: z.string().nullable().optional(),
  sentiment_score: z.number().nullable().optional(),
  conflict_detected: z.boolean().nullable().optional(),
});

export type TextsBrandon = z.infer<typeof textsBrandonSchema>;

// Schema for chart data
export const chartDataSchema = z.object({
  month: z.string(),
  count: z.number(),
});

export type ChartData = z.infer<typeof chartDataSchema>;

// Schema for aggregated data by sender
export const senderStatsSchema = z.object({
  sender: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export type SenderStats = z.infer<typeof senderStatsSchema>;

// Helper function to group messages by month
export function groupByMonth(data: TextsBrandon[]): ChartData[] {
  const result: Record<string, number> = {};
  
  for (const row of data) {
    if (!row.date_time) continue;
    // Extract year-month from date_time
    const month = row.date_time.slice(0, 7);
    result[month] = (result[month] || 0) + 1;
  }
  
  return Object.entries(result)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Helper function to group messages by sender
export function groupBySender(data: TextsBrandon[]): SenderStats[] {
  const total = data.length;
  const senderCounts: Record<string, number> = {};
  
  for (const row of data) {
    const sender = row.sender || 'Unknown';
    senderCounts[sender] = (senderCounts[sender] || 0) + 1;
  }
  
  return Object.entries(senderCounts)
    .map(([sender, count]) => ({
      sender,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// Helper function to group messages by category
export function groupByCategory(data: TextsBrandon[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const row of data) {
    const category = row.category || 'Uncategorized';
    result[category] = (result[category] || 0) + 1;
  }
  
  return result;
}

// Helper function to format date for display
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}