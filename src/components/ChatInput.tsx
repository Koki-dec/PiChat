import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
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

  const isImageModel = selectedModel === 'gemini-2.5-flash-image'

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), isImageModel)
      setMessage('')
      // 送信後すぐにフォーカスを戻す（遅延なし）
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // テキストエリアの高さ自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`
    }
  }, [message])

  // 初回マウント時にフォーカス
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // グローバルキーボードイベントでフォーカスを維持
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 既にフォーカスがある場合は何もしない
      if (document.activeElement === textareaRef.current) {
        return
      }

      // IME使用中は何もしない（日本語入力を妨げない）
      if (e.isComposing) {
        return
      }
      
      // Alt, Ctrl, Cmd, Tab, Escは完全に無視（IMEやシステムに任せる）
      if (e.altKey || e.ctrlKey || e.metaKey || e.key === 'Tab' || e.key === 'Escape') {
        return
      }
      
      // 入力可能な文字キーの場合、フォーカスを移動
      const isInputKey = e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Space'
      
      if (isInputKey) {
        // すぐにフォーカス
        textareaRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [])

  // クリックイベントでもフォーカスを戻す
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // ボタンやリンクでなければフォーカスを戻す
      if (!target.closest('button') && !target.closest('a') && !target.closest('input')) {
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 0)
      }
    }

    window.addEventListener('click', handleGlobalClick)

    return () => {
      window.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  return (
    <div className="border-t border-surface-border bg-surface px-6 py-4">
      <form onSubmit={handleSubmit} className="w-full flex items-end gap-3">
        {/* モデル表示 */}
        {isImageModel && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-light/10 border border-primary-light rounded text-xs text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">Image</span>
          </div>
        )}

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
            className="w-full bg-surface-secondary text-text-primary border border-surface-border rounded-lg px-4 py-3 resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            rows={1}
            style={{ maxHeight: '80px' }}
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 w-11 h-11 bg-primary hover:bg-primary-dark disabled:bg-surface-border disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mb-0.5"
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
