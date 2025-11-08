// Google Gemini 公式アイコン
export const GeminiIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4285F4', stopOpacity: 1 }} />
          <stop offset="33%" style={{ stopColor: '#9B72F2', stopOpacity: 1 }} />
          <stop offset="66%" style={{ stopColor: '#D96570', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#F6AD58', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="url(#gemini-gradient)"
      />
    </svg>
  )
}
