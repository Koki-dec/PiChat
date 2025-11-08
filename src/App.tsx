import { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { SettingsPanel } from './components/SettingsPanel'
import { geminiService } from './services/gemini'
import type { Message, ChatSettings, ModelType } from './types'

const STORAGE_KEYS = {
  MESSAGES: 'gemini-chat-messages',
  SETTINGS: 'gemini-chat-settings',
}

const DEFAULT_SETTINGS: ChatSettings = {
  apiKey: '',
  selectedModel: 'gemini-2.0-flash-exp',
  temperature: 1.0,
  maxTokens: 8192,
  systemPrompt: '',
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // LocalStorageから設定とメッセージを読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings(parsed)

          // APIキーが保存されていればGeminiServiceに設定
          if (parsed.apiKey) {
            geminiService.setApiKey(parsed.apiKey)
          }
        }

        const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES)
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages))
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error)
      }
    }

    loadSettings()
  }, [])

  // メッセージが変更されたらLocalStorageに保存
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
    }
  }, [messages])

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string, isImageGeneration: boolean) => {
    if (!geminiService.isConfigured()) {
      alert('APIキーが設定されていません。設定パネルから設定してください。')
      setIsSettingsOpen(true)
      return
    }

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      contentType: isImageGeneration ? 'image' : 'text',
      timestamp: Date.now(),
      model: settings.selectedModel,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      if (isImageGeneration) {
        // 画像生成
        const response = await geminiService.generateImage(content)

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text || content,
          contentType: response.imageUrl ? 'image' : 'text',
          imageUrl: response.imageUrl,
          timestamp: Date.now(),
          model: settings.selectedModel,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        // テキスト生成
        const response = await geminiService.generateText({
          model: settings.selectedModel as any,
          prompt: content,
          history: messages,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
        })

        if (response.error) {
          throw new Error(response.error)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text || 'エラーが発生しました。',
          contentType: 'text',
          timestamp: Date.now(),
          model: settings.selectedModel,
        }

        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
        contentType: 'text',
        timestamp: Date.now(),
        model: settings.selectedModel,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = (newSettings: ChatSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings))

    // APIキーを更新
    if (newSettings.apiKey) {
      geminiService.setApiKey(newSettings.apiKey)
    }
  }

  const handleClearHistory = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEYS.MESSAGES)
  }

  const handleModelChange = (model: ModelType) => {
    setSettings((prev) => ({ ...prev, selectedModel: model }))
  }

  return (
    <div className="h-screen w-screen bg-gemini-dark flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <Header
        selectedModel={settings.selectedModel}
        onModelChange={handleModelChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* チャットエリア */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🤖</div>
              <h2 className="text-2xl font-semibold text-gray-300">
                Gemini Chat へようこそ
              </h2>
              <p className="text-gray-500 max-w-md">
                メッセージを入力して会話を始めましょう。
                <br />
                モデルを選択してテキスト生成や画像生成を利用できます。
              </p>
              {!geminiService.isConfigured() && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  APIキーを設定
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedModel={settings.selectedModel}
      />

      {/* 設定パネル */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onClearHistory={handleClearHistory}
      />
    </div>
  )
}

export default App
