import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GeminiRequest, GeminiResponse, Message } from '../types'

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private apiKey: string = ''

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey)
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.genAI
  }

  async generateText(request: GeminiRequest): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return { error: 'API key not configured' }
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: request.model as string,
        generationConfig: {
          temperature: request.temperature ?? 1.0,
          maxOutputTokens: request.maxTokens ?? 8192,
        }
      })

      // チャット履歴を構築
      const history = this.buildHistory(request.history || [])

      if (history.length > 0) {
        // チャット形式
        const chat = model.startChat({
          history,
          generationConfig: {
            temperature: request.temperature ?? 1.0,
            maxOutputTokens: request.maxTokens ?? 8192,
          }
        })

        const result = await chat.sendMessage(request.prompt)
        const response = await result.response
        const text = response.text()

        return { text }
      } else {
        // 単発生成
        const result = await model.generateContent(request.prompt)
        const response = await result.response
        const text = response.text()

        return { text }
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async generateImage(prompt: string): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return { error: 'API key not configured' }
    }

    try {
      // Imagen 3を使用して画像生成
      // 注意: Imagen APIは別のエンドポイントを使用する場合があります
      // ここでは仮実装として、テキスト生成APIを使用しています
      // 実際の実装では、Vertex AI や専用の画像生成APIを使用する必要があります

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
            }
          })
        }
      )

      if (!response.ok) {
        // 画像生成が利用できない場合の代替処理
        return {
          text: `画像生成機能は現在利用できません。\n\nリクエストされたプロンプト: "${prompt}"\n\nNote: Imagen 3 APIを使用するには、Google Cloud VertexAIのセットアップが必要です。`,
          error: 'Image generation not available with current API setup'
        }
      }

      const data = await response.json()

      if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        const imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
        return { imageUrl }
      }

      return { error: 'Failed to generate image' }
    } catch (error) {
      console.error('Image generation error:', error)
      return {
        text: `画像生成中にエラーが発生しました。\n\nNote: Imagen 3を使用するには追加のセットアップが必要です。現在はテキスト生成モデル（Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash, 1.5 Flash-8B）のみ利用可能です。`,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private buildHistory(messages: Message[]) {
    // システムメッセージを除外し、最新のN件のみを使用
    const recentMessages = messages
      .filter(msg => msg.role !== 'system' && msg.contentType === 'text')
      .slice(-20) // 最新20件のメッセージのみ

    return recentMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  }

  // ストリーミング対応（オプション）
  async *generateTextStream(request: GeminiRequest): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      yield 'Error: API key not configured'
      return
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: request.model as string
      })

      const result = await model.generateContentStream(request.prompt)

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        yield chunkText
      }
    } catch (error) {
      console.error('Gemini streaming error:', error)
      yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// シングルトンインスタンス
export const geminiService = new GeminiService()
