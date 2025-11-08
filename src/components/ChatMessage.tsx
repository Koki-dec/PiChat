import { User, Image as ImageIcon } from 'lucide-react'
import type { Message } from '../types'
import { MarkdownContent } from './MarkdownContent'
import { GeminiIcon } from './GeminiIcon'

interface ChatMessageProps {
  message: Message
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-4 p-6 border-b border-surface-border ${
        isUser ? 'bg-surface-secondary' : 'bg-surface'
      }`}
    >
      {/* アバター */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-text-primary'
            : 'bg-white border-2 border-surface-border'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <GeminiIcon className="w-6 h-6" />
        )}
      </div>

      {/* メッセージコンテンツ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-text-primary">
            {isUser ? 'You' : 'Gemini'}
          </span>
          {message.model && (
            <span className="text-xs text-text-tertiary">
              {message.model}
            </span>
          )}
          <span className="text-xs text-text-tertiary">
            {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* テキストコンテンツ */}
        {message.contentType === 'text' && (
          <div className="text-sm text-text-primary leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <>
                <MarkdownContent content={message.content} />
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                )}
              </>
            )}
          </div>
        )}

        {/* 画像コンテンツ */}
        {message.contentType === 'image' && message.imageUrl && (
          <div className="mt-2">
            <div className="inline-flex items-center gap-2 text-xs text-text-tertiary mb-2">
              <ImageIcon className="w-4 h-4" />
              <span>Generated Image</span>
            </div>
            <img
              src={message.imageUrl}
              alt="Generated"
              className="max-w-md max-h-64 rounded border border-surface-border"
            />
            {message.content && (
              <p className="text-xs text-text-tertiary mt-2">Prompt: {message.content}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
