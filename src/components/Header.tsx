import { Settings, X } from 'lucide-react'
import type { ModelType } from '../types'

interface HeaderProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
  onSettingsClick: () => void
}

const MODELS: { value: ModelType; label: string }[] = [
  { value: 'gemini-2.0-flash-exp', label: '2.0 Flash' },
  { value: 'gemini-1.5-pro-latest', label: '1.5 Pro' },
  { value: 'gemini-1.5-flash-latest', label: '1.5 Flash' },
  { value: 'gemini-1.5-flash-8b-latest', label: '1.5 Flash-8B' },
  { value: 'imagen-3.0-generate-001', label: 'Imagen 3' },
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
    <header className="h-[60px] bg-surface border-b border-surface-border flex items-center justify-between px-6">
      {/* 左側：ロゴとモデル選択 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-semibold text-sm">G</span>
          </div>
          <h1 className="text-text-primary font-semibold text-lg">Gemini Chat</h1>
        </div>

        {/* モデル選択 */}
        <div className="flex gap-2">
          {MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => onModelChange(model.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedModel === model.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-border'
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
          className="p-2 hover:bg-surface-secondary rounded transition-colors"
          title="設定"
        >
          <Settings className="w-5 h-5 text-text-secondary" />
        </button>
        <button
          onClick={handleQuit}
          className="p-2 hover:bg-red-50 rounded transition-colors"
          title="終了"
        >
          <X className="w-5 h-5 text-text-secondary hover:text-red-600" />
        </button>
      </div>
    </header>
  )
}
