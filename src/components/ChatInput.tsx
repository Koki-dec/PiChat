import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
import type { ModelType } from '../types'

interface ChatInputProps {
  onSendMessage: (message: string, isImageGeneration: boolean) => void
  isLoading: boolean
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
  onNewChat: () => void
  onClearHistory: () => void
  onOpenSettings: () => void
}

const MODELS: { value: ModelType; label: string; number: number }[] = [
  { value: 'gemini-2.5-pro', label: '2.5 Pro', number: 1 },
  { value: 'gemini-flash-latest', label: 'Flash', number: 2 },
  { value: 'gemini-flash-lite-latest', label: 'Flash Lite', number: 3 },
  { value: 'gemini-2.5-flash-image', label: 'Image', number: 4 },
]

interface SlashCommand {
  command: string
  description: string
  category: string
  usage?: string
}

const SLASH_COMMANDS: SlashCommand[] = [
  // 会話管理
  { command: '/new', description: '新しいチャットを作成', category: '会話管理' },
  { command: '/clear', description: '現在の会話をクリア', category: '会話管理' },
  
  // モデル選択
  { command: '/model', description: 'モデル選択UIを表示', category: 'モデル', usage: '/model または /model [1-4]' },
  
  // 設定
  { command: '/settings', description: '設定パネルを開く', category: '設定' },
  
  // 便利機能
  { command: '/help', description: 'コマンド一覧を表示', category: 'ヘルプ' },
  
  // プロンプト
  { command: '/image', description: '画像を生成', category: 'プロンプト', usage: '/image [プロンプト]' },
  { command: '/code', description: 'コード生成モード', category: 'プロンプト', usage: '/code [説明]' },
  { command: '/translate', description: '翻訳モード', category: 'プロンプト', usage: '/translate [テキスト]' },
  { command: '/summarize', description: '要約モード', category: 'プロンプト', usage: '/summarize [テキスト]' },
]

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  selectedModel,
  onModelChange,
  onNewChat,
  onClearHistory,
  onOpenSettings,
}) => {
  const [message, setMessage] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false)
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isImageModel = selectedModel === 'gemini-2.5-flash-image'

  const handleCommand = (cmd: string): boolean => {
    const trimmed = cmd.trim()
    
    // /model コマンド
    if (trimmed === '/model') {
      setShowModelSelector(true)
      return true
    }
    const modelMatch = trimmed.match(/^\/model\s+(\d)$/)
    if (modelMatch) {
      const modelNumber = parseInt(modelMatch[1])
      const model = MODELS.find(m => m.number === modelNumber)
      if (model) {
        onModelChange(model.value)
        return true
      }
    }
    
    // /new コマンド
    if (trimmed === '/new') {
      onNewChat()
      return true
    }
    
    // /clear コマンド
    if (trimmed === '/clear') {
      if (confirm('現在の会話をクリアしますか？')) {
        onClearHistory()
      }
      return true
    }
    
    // /settings コマンド
    if (trimmed === '/settings') {
      onOpenSettings()
      return true
    }
    
    // /help コマンド
    if (trimmed === '/help') {
      const helpText = SLASH_COMMANDS.map(cmd => 
        `${cmd.command} - ${cmd.description}${cmd.usage ? `\n  使い方: ${cmd.usage}` : ''}`
      ).join('\n\n')
      alert(`利用可能なコマンド:\n\n${helpText}`)
      return true
    }
    
    // /image コマンド
    const imageMatch = trimmed.match(/^\/image\s+(.+)$/)
    if (imageMatch) {
      const prompt = imageMatch[1]
      onModelChange('gemini-2.5-flash-image')
      setTimeout(() => {
        onSendMessage(prompt, true)
      }, 100)
      return true
    }
    
    // /code コマンド
    const codeMatch = trimmed.match(/^\/code\s+(.+)$/)
    if (codeMatch) {
      const description = codeMatch[1]
      onSendMessage(`以下の要件に基づいてコードを生成してください：\n\n${description}`, false)
      return true
    }
    
    // /translate コマンド
    const translateMatch = trimmed.match(/^\/translate\s+(.+)$/)
    if (translateMatch) {
      const text = translateMatch[1]
      onSendMessage(`以下のテキストを日本語に翻訳してください：\n\n${text}`, false)
      return true
    }
    
    // /summarize コマンド
    const summarizeMatch = trimmed.match(/^\/summarize\s+(.+)$/)
    if (summarizeMatch) {
      const text = summarizeMatch[1]
      onSendMessage(`以下のテキストを要約してください：\n\n${text}`, false)
      return true
    }
    
    return false
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (message.trim() && !isLoading) {
      // コマンド処理
      if (message.startsWith('/')) {
        const handled = handleCommand(message)
        if (handled) {
          setMessage('')
          setShowCommandSuggestions(false)
          requestAnimationFrame(() => {
            textareaRef.current?.focus()
          })
          return
        }
      }
      
      onSendMessage(message.trim(), isImageModel)
      setMessage('')
      setShowCommandSuggestions(false)
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

  // テキストエリアの高さ自動調整とコマンド候補表示
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`
    }
    
    // スラッシュコマンド候補の表示
    if (message.startsWith('/')) {
      const query = message.slice(1).toLowerCase()
      const filtered = SLASH_COMMANDS.filter(cmd => 
        cmd.command.slice(1).toLowerCase().startsWith(query) ||
        cmd.description.toLowerCase().includes(query)
      )
      setFilteredCommands(filtered)
      setShowCommandSuggestions(filtered.length > 0 && message !== '/')
    } else {
      setShowCommandSuggestions(false)
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
      {/* コマンド候補UI */}
      {showCommandSuggestions && filteredCommands.length > 0 && (
        <div className="mb-3 p-2 bg-surface-secondary border border-surface-border rounded-lg max-h-60 overflow-y-auto">
          <div className="text-xs font-medium text-text-tertiary mb-2 px-2">コマンド候補:</div>
          <div className="space-y-1">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.command}
                onClick={() => {
                  setMessage(cmd.command + ' ')
                  setShowCommandSuggestions(false)
                  textareaRef.current?.focus()
                }}
                className="w-full text-left p-2 rounded hover:bg-surface-border transition-colors"
              >
                <div className="text-sm font-medium text-primary">{cmd.command}</div>
                <div className="text-xs text-text-secondary">{cmd.description}</div>
                {cmd.usage && (
                  <div className="text-xs text-text-tertiary mt-1">{cmd.usage}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* モデル選択UI */}
      {showModelSelector && (
        <div className="mb-3 p-3 bg-surface-secondary border border-surface-border rounded-lg">
          <div className="text-sm font-medium text-text-primary mb-2">モデルを選択:</div>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.map((model) => (
              <button
                key={model.value}
                onClick={() => {
                  onModelChange(model.value)
                  setShowModelSelector(false)
                }}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  selectedModel === model.value
                    ? 'bg-primary text-white'
                    : 'bg-surface hover:bg-surface-border text-text-primary'
                }`}
              >
                {model.number}. {model.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModelSelector(false)}
            className="mt-2 text-xs text-text-tertiary hover:text-text-secondary"
          >
            キャンセル
          </button>
        </div>
      )}
      
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
            className="w-full bg-surface-secondary text-text-primary border border-surface-border rounded-lg px-4 py-3 resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
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
