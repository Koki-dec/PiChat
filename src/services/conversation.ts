import { Conversation, Message } from '../types'

export class ConversationService {
  private conversations: Conversation[] = []
  private currentConversationId: string | null = null
  private readonly STORAGE_KEY = 'gemini-conversations'

  constructor() {
    this.loadConversations()
  }

  // 会話を読み込み
  private loadConversations(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.conversations = JSON.parse(stored)
        // 最新の会話をカレントに設定
        if (this.conversations.length > 0) {
          const latest = this.conversations.sort((a, b) => b.updatedAt - a.updatedAt)[0]
          this.currentConversationId = latest.id
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      this.conversations = []
    }
  }

  // 会話を保存
  private saveConversations(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.conversations))
    } catch (error) {
      console.error('Failed to save conversations:', error)
    }
  }

  // 新規会話を作成
  createConversation(settings: any): Conversation {
    const conversation: Conversation = {
      id: Date.now().toString(),
      title: '新しいチャット',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings
    }

    this.conversations.unshift(conversation)
    this.currentConversationId = conversation.id
    this.saveConversations()
    
    return conversation
  }

  // 現在の会話を取得
  getCurrentConversation(): Conversation | null {
    if (!this.currentConversationId) return null
    return this.conversations.find(c => c.id === this.currentConversationId) || null
  }

  // 会話を切り替え
  switchConversation(conversationId: string): Conversation | null {
    const conversation = this.conversations.find(c => c.id === conversationId)
    if (conversation) {
      this.currentConversationId = conversationId
      this.saveConversations()
      return conversation
    }
    return null
  }

  // メッセージを追加
  addMessage(message: Message): void {
    const conversation = this.getCurrentConversation()
    if (!conversation) return

    conversation.messages.push(message)
    conversation.updatedAt = Date.now()

    // 最初のユーザーメッセージでタイトルを更新
    if (conversation.messages.length === 1 && message.role === 'user') {
      conversation.title = this.generateTitle(message.content)
    }

    this.saveConversations()
  }

  // メッセージを更新（ストリーミング用）
  updateMessage(messageId: string, updates: Partial<Message>): void {
    const conversation = this.getCurrentConversation()
    if (!conversation) return

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = { 
        ...conversation.messages[messageIndex], 
        ...updates 
      }
      conversation.updatedAt = Date.now()
      this.saveConversations()
    }
  }

  // 会話を削除
  deleteConversation(conversationId: string): void {
    this.conversations = this.conversations.filter(c => c.id !== conversationId)
    
    // 削除された会話がカレントだった場合、最新の会話をカレントに設定
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = this.conversations.length > 0 
        ? this.conversations.sort((a, b) => b.updatedAt - a.updatedAt)[0].id
        : null
    }
    
    this.saveConversations()
  }

  // 全会話を取得
  getAllConversations(): Conversation[] {
    return [...this.conversations].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  // 会話をクリア
  clearCurrentConversation(): void {
    const conversation = this.getCurrentConversation()
    if (!conversation) return

    conversation.messages = []
    conversation.updatedAt = Date.now()
    this.saveConversations()
  }

  // タイトルを生成
  private generateTitle(content: string): string {
    const trimmed = content.trim()
    if (trimmed.length <= 30) return trimmed
    
    // 最初の30文字 + ...
    return trimmed.substring(0, 30) + '...'
  }

  // 会話をエクスポート
  exportConversation(conversationId: string): string {
    const conversation = this.conversations.find(c => c.id === conversationId)
    if (!conversation) return ''
    
    return JSON.stringify(conversation, null, 2)
  }

  // 会話をインポート
  importConversation(conversationData: string): Conversation | null {
    try {
      const conversation: Conversation = JSON.parse(conversationData)
      
      // IDを新しく生成して重複を避ける
      conversation.id = Date.now().toString()
      conversation.createdAt = Date.now()
      conversation.updatedAt = Date.now()
      
      this.conversations.unshift(conversation)
      this.currentConversationId = conversation.id
      this.saveConversations()
      
      return conversation
    } catch (error) {
      console.error('Failed to import conversation:', error)
      return null
    }
  }
}

export const conversationService = new ConversationService()
