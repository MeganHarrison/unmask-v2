// components/chat/MessageBubble.tsx
import React from 'react';
import { User, Bot, CheckCircle, AlertCircle } from 'lucide-react';
import { ChatMessage } from './ChatInterface';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agentIcon = getAgentIcon(message.agentType);
  const confidenceColor = getConfidenceColor(message.confidence);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 ml-2' : 'bg-gray-100 mr-2'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            agentIcon
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Agent Metadata */}
          {!isUser && message.metadata && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {/* Next Steps */}
              {message.metadata.nextSteps && message.metadata.nextSteps.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Next Steps
                  </h4>
                  <ul className="space-y-1">
                    {message.metadata.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Insights */}
              {message.metadata.relatedInsights && message.metadata.relatedInsights.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Related Insights
                  </h4>
                  <ul className="space-y-1">
                    {message.metadata.relatedInsights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Timestamp and Confidence */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {!isUser && message.confidence && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
                <span>{Math.round(message.confidence * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAgentIcon(agentType?: string) {
  const iconClass = "w-4 h-4 text-gray-600";
  
  switch (agentType) {
    case 'coaching-agent':
      return <Heart className={iconClass} />;
    case 'pattern-agent':
      return <TrendingUp className={iconClass} />;
    case 'conflict-agent':
      return <AlertCircle className={iconClass} />;
    case 'emotional-agent':
      return <Heart className={iconClass} />;
    case 'memory-agent':
      return <Brain className={iconClass} />;
    default:
      return <Bot className={iconClass} />;
  }
}

function getConfidenceColor(confidence?: number): string {
  if (!confidence) return 'bg-gray-400';
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
}