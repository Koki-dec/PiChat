import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, ImagePlus } from 'lucide-react'
import type { ModelType } from '../types'

interface ChatInputProps {
  onSendMessage: (message: string, isImageGeneration: boolean) => void
  isLoading: boolean
  selectedModel: ModelType
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  selectedModel,
}) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isImageModel = selectedModel === 'imagen-3.0-generate-001'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), isImageModel)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 60)}px`
    }
  }, [message])

  return (
    <div className="h-[60px] bg-gemini-dark border-t border-gray-700 px-4 flex items-center">
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-3">
        {/* モデル表示 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isImageModel ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-pink-600/20 border border-pink-600/50 rounded-md">
              <ImagePlus className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-pink-300 font-medium">Image</span>
            </div>
          ) : (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* 入力欄 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isImageModel
                ? '画像生成のプロンプトを入力...'
                : 'メッセージを入力... (Shift+Enterで改行)'
            }
            disabled={isLoading}
            className="w-full bg-gray-800 text-gray-200 rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            rows={1}
            style={{ maxHeight: '60px' }}
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </form>
    </div>
  )
}
