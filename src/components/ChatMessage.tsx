import { User, Bot, Image as ImageIcon } from 'lucide-react'
import type { Message } from '../types'

interface ChatMessageProps {
  message: Message
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 p-3 ${
        isUser ? 'bg-transparent' : 'bg-gray-800/50'
      } hover:bg-gray-800/70 transition-colors`}
    >
      {/* アバター */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-purple-500 to-pink-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* メッセージコンテンツ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-300">
            {isUser ? 'You' : 'Gemini'}
          </span>
          {message.model && (
            <span className="text-xs text-gray-500">
              {message.model}
            </span>
          )}
          <span className="text-xs text-gray-600">
            {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* テキストコンテンツ */}
        {message.contentType === 'text' && (
          <div className="text-sm text-gray-200 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}

        {/* 画像コンテンツ */}
        {message.contentType === 'image' && message.imageUrl && (
          <div className="mt-2">
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 mb-2">
              <ImageIcon className="w-4 h-4" />
              <span>Generated Image</span>
            </div>
            <img
              src={message.imageUrl}
              alt="Generated"
              className="max-w-md max-h-64 rounded-lg border border-gray-700"
            />
            {message.content && (
              <p className="text-xs text-gray-500 mt-2">Prompt: {message.content}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
