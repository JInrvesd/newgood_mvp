import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useSSEAnalysis from '../hooks/useSSEAnalysis'
import AnalysisLoading from '../components/Analysis/AnalysisLoading'

export default function AnalysisPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const {
    phases,
    currentPhase,
    isComplete,
    error,
    startAnalysis,
    cancelAnalysis,
  } = useSSEAnalysis()
  const [backBlocked, setBackBlocked] = useState(false)

  // H7: Start analysis on mount + cleanup on unmount
  useEffect(() => {
    if (uuid) {
      startAnalysis(uuid)
    }
    return () => cancelAnalysis()
  }, [uuid, startAnalysis, cancelAnalysis])

  // Navigate to result when complete
  useEffect(() => {
    if (isComplete && uuid) {
      const timer = setTimeout(() => {
        navigate(`/result/${uuid}`, { replace: true })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, uuid, navigate])

  // Prevent back navigation during analysis
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isComplete && !error) {
        e.preventDefault()
        // L4: 빈 문자열 사용 (브라우저 표준)
        e.returnValue = ''
      }
    }

    // M6: 뒤로가기 시 토스트 안내
    const handlePopState = () => {
      if (!isComplete && !error) {
        window.history.pushState(null, '', window.location.href)
        setBackBlocked(true)
        setTimeout(() => setBackBlocked(false), 2500)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isComplete, error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <AnalysisLoading
          phases={phases}
          currentPhase={currentPhase}
          isComplete={isComplete}
          error={error}
          onRetry={() => startAnalysis(uuid)}
        />

        {/* M6: 뒤로가기 차단 안내 토스트 */}
        {backBlocked && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm animate-pulse">
            분석이 진행 중입니다. 완료될 때까지 기다려 주세요.
          </div>
        )}
      </div>
    </div>
  )
}
