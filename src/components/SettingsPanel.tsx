import { useState, useEffect } from 'react'
import { X, Save, Key, Trash2 } from 'lucide-react'
import type { ChatSettings } from '../types'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: ChatSettings
  onSave: (settings: ChatSettings) => void
  onClearHistory: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onClearHistory,
}) => {
  const [localSettings, setLocalSettings] = useState(settings)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* パネル */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-gray-900 border-l border-gray-700 z-50 shadow-2xl overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Key className="w-4 h-4" />
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localSettings.apiKey}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, apiKey: e.target.value })
                }
                placeholder="AIzaSy..."
                className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 pr-20 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
              >
                {showApiKey ? '非表示' : '表示'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google AI Studioで取得
              </a>
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Temperature: {localSettings.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              低いほど確定的、高いほど創造的
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Max Tokens: {localSettings.maxTokens}
            </label>
            <input
              type="range"
              min="512"
              max="8192"
              step="512"
              value={localSettings.maxTokens}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  maxTokens: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              生成される最大トークン数
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              System Prompt (オプション)
            </label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemPrompt: e.target.value,
                })
              }
              placeholder="AIの振る舞いを指定..."
              className="w-full bg-gray-800 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none"
            />
            <p className="text-xs text-gray-500">
              AIの応答スタイルや役割を定義
            </p>
          </div>

          {/* アクション */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>

            <button
              onClick={() => {
                if (confirm('チャット履歴を削除しますか？')) {
                  onClearHistory()
                  onClose()
                }
              }}
              className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              履歴を削除
            </button>
          </div>

          {/* 情報 */}
          <div className="pt-4 border-t border-gray-700 space-y-2">
            <p className="text-xs text-gray-500">
              Display: 1920×515 optimized
            </p>
            <p className="text-xs text-gray-500">
              Version: 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
