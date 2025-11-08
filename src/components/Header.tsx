import { Settings, X, Menu } from 'lucide-react'
import type { ModelType } from '../types'

interface HeaderProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
  onSettingsClick: () => void
  onMenuClick: () => void
}

const MODELS: { value: ModelType; label: string }[] = [
  { value: 'gemini-2.5-pro', label: '2.5 Pro' },
  { value: 'gemini-2.5-flash-latest', label: 'Flash' },
  { value: 'gemini-flash-lite-latest', label: 'Flash Lite' },
  { value: 'gemini-2.5-flash-image', label: 'Image' },
]

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onModelChange,
  onSettingsClick,
  onMenuClick,
}) => {
  const handleQuit = () => {
    window.electron?.quit()
  }

  return (
    <header className="h-[60px] bg-surface border-b border-surface-border flex items-center justify-between px-6">
      {/* 左側：メニューボタン、ロゴとモデル選択 */}
      <div className="flex items-center gap-6">
        {/* メニューボタン */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          title="会話一覧"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>
        
        <div className="flex items-center gap-3">
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
