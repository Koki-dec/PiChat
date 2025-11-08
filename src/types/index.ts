// Gemini モデル定義
export type GeminiModel =
  | 'gemini-2.0-flash-exp'
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-flash-latest'
  | 'gemini-1.5-flash-8b-latest'

export type ImagenModel = 'imagen-3.0-generate-001'

export type ModelType = GeminiModel | ImagenModel

// メッセージの役割
export type Role = 'user' | 'assistant' | 'system'

// メッセージコンテンツのタイプ
export type ContentType = 'text' | 'image'

// ファイル添付の型
export interface Attachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'document'
  name: string
  mimeType: string
  data: string // base64 encoded data
  url?: string // for Google Drive files
  size: number
}

// メッセージ定義
export interface Message {
  id: string
  role: Role
  content: string
  contentType: ContentType
  imageUrl?: string
  timestamp: number
  model?: ModelType
  attachments?: Attachment[]
  isStreaming?: boolean
}

// チャット設定
export interface ChatSettings {
  apiKey: string
  selectedModel: ModelType
  temperature: number
  maxTokens: number
  systemPrompt: string
}

// APIリクエスト
export interface GeminiRequest {
  model: ModelType
  prompt: string
  history?: Message[]
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  attachments?: Attachment[]
}

// APIレスポンス
export interface GeminiResponse {
  text?: string
  imageUrl?: string
  error?: string
}
