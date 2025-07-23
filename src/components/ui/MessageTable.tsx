import { format } from 'date-fns';
import { AlertCircle, SmilePlus, Frown, Meh } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  date: string;
  time: string;
  date_time: string;
  type: string;
  sender: string;
  message: string;
  attachment: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  conflict_detected: boolean;
  emotional_score: number | null;
  tags_json: string | null;
  relationship_id: number;
}

interface MessageTableProps {
  messages: Message[];
  loading?: boolean;
}

const getSentimentIcon = (score: number | null) => {
  if (score === null) return <Meh className="h-4 w-4 text-gray-400" />;
  if (score >= 0.5) return <SmilePlus className="h-4 w-4 text-green-500" />;
  if (score <= -0.5) return <Frown className="h-4 w-4 text-red-500" />;
  return <Meh className="h-4 w-4 text-yellow-500" />;
};

const getSentimentColor = (score: number | null) => {
  if (score === null) return 'text-gray-600';
  if (score >= 0.5) return 'text-green-600';
  if (score <= -0.5) return 'text-red-600';
  return 'text-yellow-600';
};

export function MessageTable({ messages, loading }: MessageTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <p className="text-gray-500">No messages found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      {format(new Date(message.date_time), 'MMM d, yyyy')}
                    </div>
                    <div className="text-gray-500">
                      {format(new Date(message.date_time), 'h:mm a')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={message.sender === 'You' ? 'default' : 'secondary'}>
                    {message.sender}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-lg truncate">
                    {message.message}
                  </div>
                  {message.attachment && (
                    <Badge variant="outline" className="mt-1">
                      📎 Attachment
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(message.sentiment_score)}
                    <span className={cn(
                      'text-sm',
                      getSentimentColor(message.sentiment_score)
                    )}>
                      {message.sentiment_score !== null 
                        ? message.sentiment_score.toFixed(2)
                        : 'N/A'
                      }
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {message.conflict_detected && (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <AlertCircle className="h-3 w-3" />
                      Conflict
                    </Badge>
                  )}
                  {message.tags_json && (
                    <div className="mt-1">
                      {JSON.parse(message.tags_json).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}