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
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* パネル */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-surface border-l border-surface-border z-50 shadow-xl overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-surface border-b border-surface-border p-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-5 space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
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
                className="w-full bg-surface-secondary text-text-primary border border-surface-border rounded-lg px-3 py-2.5 pr-20 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                {showApiKey ? '非表示' : '表示'}
              </button>
            </div>
            <p className="text-xs text-text-tertiary">
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studioで取得
              </a>
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
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
              className="w-full accent-primary"
            />
            <p className="text-xs text-text-tertiary">
              低いほど確定的、高いほど創造的
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
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
              className="w-full accent-primary"
            />
            <p className="text-xs text-text-tertiary">
              生成される最大トークン数
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
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
              className="w-full bg-surface-secondary text-text-primary border border-surface-border rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm h-24 resize-none transition-colors"
            />
            <p className="text-xs text-text-tertiary">
              AIの応答スタイルや役割を定義
            </p>
          </div>

          {/* アクション */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <button
              onClick={handleSave}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
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
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              履歴を削除
            </button>
          </div>

          {/* 情報 */}
          <div className="pt-4 border-t border-surface-border space-y-2">
            <p className="text-xs text-text-tertiary">
              Display: 1920×515 optimized
            </p>
            <p className="text-xs text-text-tertiary">
              Version: 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
