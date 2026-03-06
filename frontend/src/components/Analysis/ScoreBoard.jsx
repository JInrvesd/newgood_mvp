/**
 * 가시성 점수 표시 컴포넌트
 * - 원형 점수 게이지 (0~100)
 * - 점수별 색상: 0-39 빨강, 40-69 노랑, 70-100 초록
 * - 섹션별 점수 바 차트
 */
export default function ScoreBoard({ score }) {
  const totalScore = score.total_score ?? 0
  const sections = score.section_scores || []

  const getScoreColor = (value) => {
    if (value >= 70) return { text: 'text-green-600', bg: 'bg-green-500', ring: 'stroke-green-500' }
    if (value >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-500', ring: 'stroke-yellow-500' }
    return { text: 'text-red-600', bg: 'bg-red-500', ring: 'stroke-red-500' }
  }

  const colors = getScoreColor(totalScore)

  // SVG circle gauge
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (totalScore / 100) * circumference

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">가시성 점수</h2>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Circular Gauge */}
        <div className="relative flex-shrink-0">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="transform -rotate-90"
            role="img"
            aria-label={`가시성 점수: ${totalScore}점`}
          >
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Score circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              className={colors.ring}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colors.text}`}>
              {totalScore}
            </span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
        </div>

        {/* Section Scores */}
        {sections.length > 0 && (
          <div className="flex-1 w-full space-y-3">
            {sections.map((section, idx) => {
              const sectionColors = getScoreColor(section.score ?? 0)
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">
                      {section.section}
                    </span>
                    <span className={`font-semibold ${sectionColors.text}`}>
                      {section.score ?? 0}점
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`${sectionColors.bg} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${section.score ?? 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Score Description */}
      {score.summary && (
        <p className="mt-6 text-gray-600 text-sm bg-gray-50 rounded-lg p-4">
          {score.summary}
        </p>
      )}
    </div>
  )
}
