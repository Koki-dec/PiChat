import geminiIcon from '../assets/gemini.jpg'

// Google Gemini 公式アイコン
export const GeminiIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <img
      src={geminiIcon}
      alt="Gemini"
      className={className}
    />
  )
}
