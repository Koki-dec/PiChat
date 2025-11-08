import { Settings, X } from 'lucide-react'
import type { ModelType } from '../types'

interface HeaderProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
  onSettingsClick: () => void
}

const MODELS: { value: ModelType; label: string; color: string }[] = [
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', color: 'bg-purple-600' },
  { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', color: 'bg-blue-600' },
  { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', color: 'bg-green-600' },
  { value: 'gemini-1.5-flash-8b-latest', label: 'Gemini 1.5 Flash-8B', color: 'bg-teal-600' },
  { value: 'imagen-3.0-generate-001', label: 'Imagen 3', color: 'bg-pink-600' },
]

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onModelChange,
  onSettingsClick,
}) => {
  const handleQuit = () => {
    window.electron?.quit()
  }

  return (
    <header className="h-[60px] bg-gradient-to-r from-gemini-dark to-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
      {/* 左側：ロゴとモデル選択 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <h1 className="text-white font-semibold text-lg">Gemini Chat</h1>
        </div>

        {/* モデル選択 */}
        <div className="flex gap-2">
          {MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => onModelChange(model.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedModel === model.value
                  ? `${model.color} text-white shadow-lg scale-105`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
      </div>

      {/* 右側：操作ボタン */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSettingsClick}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="設定"
        >
          <Settings className="w-5 h-5 text-gray-300" />
        </button>
        <button
          onClick={handleQuit}
          className="p-2 hover:bg-red-600 rounded-lg transition-colors"
          title="終了"
        >
          <X className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </header>
  )
}
