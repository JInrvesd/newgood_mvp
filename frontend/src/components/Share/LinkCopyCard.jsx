import { useState } from 'react'

/**
 * 공유 링크 카드 컴포넌트
 * - UUID 기반 URL 표시
 * - 복사 버튼 + 토스트 알림
 * - 안내 문구
 */
export default function LinkCopyCard({ uuid }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/result/${uuid}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3">공유 링크</h3>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 truncate select-all">
          {shareUrl}
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          aria-label="공유 링크 복사"
        >
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>

      {/* Toast notification */}
      {copied && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 transition-opacity duration-300">
          클립보드에 복사되었습니다.
        </div>
      )}

      {/* Warning notice */}
      <p className="mt-3 text-xs text-gray-400 flex items-start gap-1">
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        이 링크를 아는 누구나 이력서를 조회하고 수정할 수 있습니다. 신뢰할 수 있는 분에게만 공유해 주세요.
      </p>
    </div>
  )
}
