import { useState, useEffect } from 'react'

const ROTATING_MESSAGES = [
  '이력서의 핵심 역량을 파악하고 있어요...',
  '채용 담당자 관점에서 검토 중이에요...',
  '두괄식 구조로 개선안을 작성하고 있어요...',
  '경력 기술서의 KPI를 분석하고 있어요...',
  'KSA 역량을 분류하고 있어요...',
  '강점과 약점을 정리하고 있어요...',
]

/**
 * 분석 로딩 UX - 핵심 컴포넌트
 * 2단계 진행 상황 표시 + 로딩 애니메이션 + 재미있는 메시지 로테이션
 */
export default function AnalysisLoading({
  phases,
  currentPhase,
  isComplete,
  error,
  onRetry,
}) {
  const [messageIdx, setMessageIdx] = useState(0)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  // Rotate messages every 3 seconds
  useEffect(() => {
    if (isComplete || error) return
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % ROTATING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isComplete, error])

  // Update elapsed time
  useEffect(() => {
    if (isComplete || error) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, isComplete, error])

  const completedCount = phases.filter((p) => p.status === 'done').length
  const progressPercent = (completedCount / phases.length) * 100

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          분석 중 오류가 발생했습니다
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
        >
          다시 시도하기
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        {!isComplete ? (
          <>
            {/* Spinner */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full" />
              <div className="absolute w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              이력서를 분석하고 있습니다
            </h3>
            <p className="text-gray-500 mt-2 transition-opacity duration-500">
              {ROTATING_MESSAGES[messageIdx]}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              분석이 완료되었습니다!
            </h3>
            <p className="text-gray-500 mt-2">
              결과 페이지로 이동합니다...
            </p>
          </>
        )}
      </div>

      {/* Phase Steps */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <PhaseItem key={phase.id} phase={phase} />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>진행률</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-gray-400 space-y-1">
        <p>예상 소요시간: 약 40~60초</p>
        {elapsed > 0 && <p>경과 시간: {elapsed}초</p>}
      </div>
    </div>
  )
}

function PhaseItem({ phase }) {
  return (
    <div className="flex items-center gap-4">
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {phase.status === 'pending' && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">
              {phase.id}
            </span>
          </div>
        )}
        {phase.status === 'loading' && (
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-blue-100 pulse-ring" />
            <div className="relative w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {phase.id}
              </span>
            </div>
          </div>
        )}
        {phase.status === 'done' && (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Phase Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            phase.status === 'done'
              ? 'text-green-700'
              : phase.status === 'loading'
              ? 'text-blue-700'
              : 'text-gray-400'
          }`}
        >
          {phase.name}
        </p>
      </div>

      {/* Status Label */}
      <div className="flex-shrink-0">
        {phase.status === 'pending' && (
          <span className="text-sm text-gray-400">대기 중</span>
        )}
        {phase.status === 'loading' && (
          <span className="text-sm text-blue-600 loading-dots">분석 중</span>
        )}
        {phase.status === 'done' && (
          <span className="text-sm text-green-600 font-medium">완료</span>
        )}
      </div>
    </div>
  )
}
