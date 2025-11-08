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
      // Gemini 2.5 Flash Image を使用して画像生成
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        return {
          text: `画像生成機能でエラーが発生しました。\n\nプロンプト: "${prompt}"\n\nエラー: ${JSON.stringify(errorData)}`,
          error: 'Image generation failed'
        }
      }

      const data = await response.json()

      // レスポンスから画像データを抽出
      if (data.candidates && data.candidates[0]?.content?.parts) {
        const imagePart = data.candidates[0].content.parts.find((part: any) => part.inlineData)
        if (imagePart?.inlineData?.data) {
          const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
          return { imageUrl, text: prompt }
        }
      }

      return {
        text: `画像生成に失敗しました。\n\nプロンプト: "${prompt}"`,
        error: 'No image data in response'
      }
    } catch (error) {
      console.error('Image generation error:', error)
      return {
        text: `画像生成中にエラーが発生しました。\n\nプロンプト: "${prompt}"\n\nエラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
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

  // ストリーミング対応
  async *generateTextStream(request: GeminiRequest): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      yield 'Error: API key not configured'
      return
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
        // チャット形式でストリーミング
        const chat = model.startChat({
          history,
          generationConfig: {
            temperature: request.temperature ?? 1.0,
            maxOutputTokens: request.maxTokens ?? 8192,
          }
        })

        const result = await chat.sendMessageStream(request.prompt)

        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          yield chunkText
        }
      } else {
        // 単発生成でストリーミング
        const result = await model.generateContentStream(request.prompt)

        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          yield chunkText
        }
      }
    } catch (error) {
      console.error('Gemini streaming error:', error)
      yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// シングルトンインスタンス
export const geminiService = new GeminiService()
