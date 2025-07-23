'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  date: string;
  count: number;
}

interface MessageFrequencyChartProps {
  data: DataPoint[];
  isMonthly?: boolean;
}

export function MessageFrequencyChart({ data, isMonthly = false }: MessageFrequencyChartProps) {
  const formatXAxis = (tickItem: string) => {
    if (isMonthly) {
      const [year, month] = tickItem.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy');
    }
    return format(parseISO(tickItem), 'MMM d');
  };

  const formatTooltipLabel = (value: string) => {
    if (isMonthly) {
      const [year, month] = value.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy');
    }
    return format(parseISO(value), 'EEEE, MMMM d, yyyy');
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          interval={isMonthly ? 0 : 'preserveStartEnd'}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={formatTooltipLabel}
          formatter={(value: number) => [`${value} messages`, 'Count']}
        />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#8884d8" 
          fillOpacity={1} 
          fill="url(#colorMessages)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}