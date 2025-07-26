import { Bot, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: Array<{
    text: string
    score: number
    metadata?: any
  }>
}

export function ChatMessage({ role, content, timestamp, sources }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isUser = role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div
        className={`max-w-[70%] ${
          isUser 
            ? "bg-purple-600 text-white rounded-2xl rounded-tr-sm" 
            : "bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm"
        } p-4`}
      >
        <p className={`text-sm ${isUser ? "text-white" : "text-gray-800"} whitespace-pre-wrap`}>
          {content}
        </p>
        
        {/* Show sources for assistant messages */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Based on:</p>
            <div className="space-y-1">
              {sources.slice(0, 3).map((source, idx) => (
                <div key={idx} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                  <p className="line-clamp-2">{source.text}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Relevance: {(source.score * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className={`text-xs mt-2 ${
          isUser ? "text-purple-200" : "text-gray-400"
        }`}>
          {formatTime(timestamp)}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  )
}