import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadDocx } from '../../services/api'

/**
 * 결과 하단 액션 버튼
 * - AI로 개선하기
 * - 직접 수정하기
 * - DOCX 다운로드
 * - 공유 링크 복사
 */
export default function ActionButtons({ uuid, version }) {
  const navigate = useNavigate()
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await downloadDocx(uuid)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume_${uuid.slice(0, 8)}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('다운로드에 실패했습니다: ' + err.message)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/result/${uuid}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAIImprove = () => {
    navigate(`/analysis/${uuid}?action=improve&version=${version}`)
  }

  const handleManualEdit = () => {
    navigate(`/form?uuid=${uuid}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">다음 단계</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* AI Improve */}
        <button
          onClick={handleAIImprove}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          AI로 개선하기
        </button>

        {/* Manual Edit */}
        <button
          onClick={handleManualEdit}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          직접 수정하기
        </button>

        {/* Download DOCX */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-all"
        >
          {isDownloading ? (
            <>
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              다운로드 중...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              DOCX 다운로드
            </>
          )}
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          {copied ? '복사됨!' : '공유 링크 복사'}
        </button>
      </div>

      {/* Version info */}
      {version && version < 5 && (
        <p className="mt-4 text-center text-sm text-gray-400">
          재분석 {version}/5회 사용 (최대 5회까지 가능)
        </p>
      )}
      {version && version >= 5 && (
        <p className="mt-4 text-center text-sm text-yellow-600">
          무료 재분석 횟수를 모두 사용했습니다.
        </p>
      )}
    </div>
  )
}
