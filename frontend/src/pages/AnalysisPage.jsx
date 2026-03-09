import { useEffect } from 'react'
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
  } = useSSEAnalysis()

  // Start analysis on mount
  useEffect(() => {
    if (uuid) {
      startAnalysis(uuid)
    }
  }, [uuid, startAnalysis])

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
        e.returnValue = '분석이 진행 중입니다. 페이지를 나가시겠습니까?'
      }
    }

    const handlePopState = (e) => {
      if (!isComplete && !error) {
        window.history.pushState(null, '', window.location.href)
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
      </div>
    </div>
  )
}
