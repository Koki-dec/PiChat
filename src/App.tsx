import { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { SettingsPanel } from './components/SettingsPanel'
import { ConversationSidebar } from './components/ConversationSidebar'
import { geminiService } from './services/gemini'
import { conversationService } from './services/conversation'
import type { Message, ChatSettings, ModelType, Conversation } from './types'

const STORAGE_KEYS = {
  MESSAGES: 'gemini-chat-messages',
  SETTINGS: 'gemini-chat-settings',
}

const DEFAULT_SETTINGS: ChatSettings = {
  apiKey: '',
  selectedModel: 'gemini-flash-latest',
  temperature: 1.0,
  maxTokens: 8192,
  systemPrompt: '',
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 初期化と会話読み込み
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

        // 現在の会話を読み込み
        const current = conversationService.getCurrentConversation()
        if (current) {
          setCurrentConversation(current)
          setMessages(current.messages)
        } else {
          // 会話がない場合は新規作成
          const newConversation = conversationService.createConversation(settings)
          setCurrentConversation(newConversation)
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error)
      }
    }

    loadSettings()
  }, [])

  // メッセージが変更されたら会話サービスに保存
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      // conversationServiceを使って正しく保存
      conversationService.saveConversation({
        ...currentConversation,
        messages: messages,
        updatedAt: Date.now()
      })
    }
  }, [messages, currentConversation])

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

    // メッセージを追加（useEffectで自動保存される）
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      if (isImageGeneration) {
        // 画像生成（ストリーミングなし）
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

        // メッセージを追加（useEffectで自動保存される）
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        // テキスト生成（ストリーミング対応）
        const assistantMessageId = (Date.now() + 1).toString()

        // 空のアシスタントメッセージを作成
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          contentType: 'text',
          timestamp: Date.now(),
          model: settings.selectedModel,
          isStreaming: true,
        }

        // メッセージを追加（useEffectで自動保存される）
        setMessages((prev) => [...prev, assistantMessage])

        // ストリーミングで応答を取得
        let fullText = ''
        const stream = geminiService.generateTextStream({
          model: settings.selectedModel as any,
          prompt: content,
          history: messages,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
        })

        for await (const chunk of stream) {
          fullText += chunk

          // メッセージを更新
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullText }
                : msg
            )
          )
        }

        // ストリーミング完了
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        )
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

      // メッセージを追加（useEffectで自動保存される）
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
    conversationService.clearCurrentConversation()
    setMessages([])
  }

  const handleModelChange = (model: ModelType) => {
    setSettings((prev) => ({ ...prev, selectedModel: model }))
  }

  const handleNewChat = () => {
    const newConversation = conversationService.createConversation(settings)
    setCurrentConversation(newConversation)
    setMessages([])
  }

  const handleSelectConversation = (conversation: Conversation) => {
    conversationService.switchConversation(conversation.id)
    setCurrentConversation(conversation)
    setMessages(conversation.messages)
  }

  return (
    <div className="h-screen w-screen bg-surface flex overflow-hidden">
      {/* サイドバー */}
      <ConversationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onConversationSelect={handleSelectConversation}
        currentConversationId={currentConversation?.id || null}
        onNewChat={handleNewChat}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <Header
          selectedModel={settings.selectedModel}
          onModelChange={handleModelChange}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

      {/* チャットエリア */}
      <div className="flex-1 overflow-y-auto bg-surface">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-text-primary">
                Gemini Chat
              </h2>
              <p className="text-text-secondary max-w-md text-sm">
                メッセージを入力して会話を始めましょう。
                <br />
                上部のモデルを選択してテキスト生成や画像生成を利用できます。
              </p>
              {!geminiService.isConfigured() && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
                >
                  API Keyを設定
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
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
    </div>
  )
}

export default App
