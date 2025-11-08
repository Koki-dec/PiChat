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
      // REST APIを直接使用（Google Search機能付き）
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${this.apiKey}`

      // チャット履歴を構築
      const history = this.buildHistory(request.history || [])
      const contents = [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: request.prompt }] }
      ]

      const requestBody = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? 1.0,
          maxOutputTokens: request.maxTokens ?? 8192,
        },
        tools: [
          {
            google_search: {}
          }
        ]
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          error: errorData.error?.message || 'API request failed'
        }
      }

      const data = await response.json()

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { text: data.candidates[0].content.parts[0].text }
      }

      return { error: 'No response from API' }
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
    console.log('generateTextStream called with:', request.model)

    if (!this.isConfigured()) {
      console.error('API key not configured')
      yield 'Error: API key not configured'
      return
    }

    try {
      // REST APIを直接使用してストリーミング生成（Google Search機能付き）
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:streamGenerateContent?key=${this.apiKey}`
      console.log('Fetching URL:', url.replace(this.apiKey, 'HIDDEN'))

      // チャット履歴を構築
      const history = this.buildHistory(request.history || [])
      const contents = [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: request.prompt }] }
      ]

      const requestBody = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? 1.0,
          maxOutputTokens: request.maxTokens ?? 8192,
        },
        tools: [
          {
            google_search: {}
          }
        ]
      }

      console.log('Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const error = await response.text()
        console.error('API error response:', error)
        yield `Error: ${error}`
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        console.error('No response body')
        yield 'Error: No response body'
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('Stream done, total chunks:', chunkCount)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === '[' || line.trim() === ']') continue

          try {
            // Remove trailing comma if present
            const jsonLine = line.trim().replace(/,$/, '')
            const data = JSON.parse(jsonLine)
            console.log('Parsed data:', data)

            // パーツを全て処理（Google Searchレスポンス対応）
            if (data.candidates?.[0]?.content?.parts) {
              for (const part of data.candidates[0].content.parts) {
                if (part.text) {
                  chunkCount++
                  console.log('Yielding text:', part.text)
                  yield part.text
                }
              }
            }
          } catch (e) {
            console.error('JSON parse error:', e, 'Line:', line)
            // Skip invalid JSON lines
            continue
          }
        }
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      yield `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    }
  }
}

// シングルトンインスタンス
export const geminiService = new GeminiService()
