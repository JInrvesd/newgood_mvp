import { useState, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const INITIAL_PHASES = [
  { id: 1, name: '가시성 점수 분석', status: 'pending', data: null },
  { id: 2, name: '상세 피드백 & 구조화', status: 'pending', data: null },
  { id: 3, name: 'KSA 역량 정리', status: 'pending', data: null },
]

/**
 * SSE 기반 분석 진행 관리 훅
 * - EventSource로 /api/resumes/{uuid}/analyze 연결
 * - phase_start, phase_complete, analysis_done, error 이벤트 처리
 */
export default function useSSEAnalysis() {
  const [phases, setPhases] = useState(INITIAL_PHASES)
  const [currentPhase, setCurrentPhase] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState(null)
  const [resultData, setResultData] = useState(null)
  const eventSourceRef = useRef(null)

  const startAnalysis = useCallback((uuid) => {
    // Reset state
    setPhases(INITIAL_PHASES)
    setCurrentPhase(null)
    setIsComplete(false)
    setError(null)
    setResultData(null)

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const url = `${API_BASE}/api/resumes/${uuid}/analyze`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener('phase_start', (e) => {
      try {
        const data = JSON.parse(e.data)
        const phaseId = data.phase

        setCurrentPhase(phaseId)
        setPhases((prev) =>
          prev.map((p) =>
            p.id === phaseId ? { ...p, status: 'loading' } : p
          )
        )
      } catch (err) {
        console.error('phase_start parse error:', err)
      }
    })

    es.addEventListener('phase_complete', (e) => {
      try {
        const data = JSON.parse(e.data)
        const phaseId = data.phase

        setPhases((prev) =>
          prev.map((p) =>
            p.id === phaseId
              ? { ...p, status: 'done', data: data.data || null }
              : p
          )
        )
      } catch (err) {
        console.error('phase_complete parse error:', err)
      }
    })

    es.addEventListener('analysis_done', (e) => {
      try {
        const data = JSON.parse(e.data)
        setResultData(data)
        setIsComplete(true)
      } catch {
        setIsComplete(true)
      }
      es.close()
      eventSourceRef.current = null
    })

    es.addEventListener('error', (e) => {
      try {
        if (e.data) {
          const data = JSON.parse(e.data)
          setError(data.message || '분석 중 오류가 발생했습니다.')
        } else {
          setError('서버 연결이 끊어졌습니다. 다시 시도해 주세요.')
        }
      } catch {
        setError('분석 중 오류가 발생했습니다.')
      }
      es.close()
      eventSourceRef.current = null
    })

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return
      setError('서버 연결이 끊어졌습니다. 다시 시도해 주세요.')
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  const cancelAnalysis = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  return {
    phases,
    currentPhase,
    isComplete,
    error,
    resultData,
    startAnalysis,
    cancelAnalysis,
  }
}
