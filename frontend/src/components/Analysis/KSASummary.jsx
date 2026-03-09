/**
 * KSA 역량 정리 컴포넌트
 * Knowledge / Skill / Attitude 3열 카드
 * 각 항목 태그 형태로 표시 + 한 줄 요약 + 강점/약점 분석
 */
export default function KSASummary({ ksa }) {
  const knowledge = ksa.knowledge || []
  const skills = ksa.skill || []
  const attitude = ksa.attitude || []
  const strengths = ksa.strengths || []
  const weaknesses = ksa.weaknesses || []

  const hasData =
    knowledge.length > 0 || skills.length > 0 || attitude.length > 0

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          KSA 역량 분석
        </h2>
        <p className="text-gray-500">아직 KSA 분석 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">KSA 역량 분석</h2>

      {/* KSA Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KSACard
          title="Knowledge"
          subtitle="지식"
          items={knowledge}
          summary={ksa.knowledge_summary}
          color="blue"
        />
        <KSACard
          title="Skill"
          subtitle="기술"
          items={skills}
          summary={ksa.skill_summary}
          color="green"
        />
        <KSACard
          title="Attitude"
          subtitle="태도"
          items={attitude}
          summary={ksa.attitude_summary}
          color="purple"
        />
      </div>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="border border-green-200 rounded-xl overflow-hidden">
            <div className="bg-green-600 px-4 py-3">
              <h3 className="text-white font-bold">강점</h3>
              <span className="text-white/70 text-sm">이력서에서 잘 드러나는 부분</span>
            </div>
            <div className="bg-green-50 p-4">
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                      <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">항목 없음</p>
              )}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="border border-orange-200 rounded-xl overflow-hidden">
            <div className="bg-orange-500 px-4 py-3">
              <h3 className="text-white font-bold">약점</h3>
              <span className="text-white/70 text-sm">보완이 필요한 부분</span>
            </div>
            <div className="bg-orange-50 p-4">
              {weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                      <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">항목 없음</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overall Summary */}
      {ksa.summary && (
        <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-4">
          {ksa.summary}
        </p>
      )}
    </div>
  )
}

function KSACard({ title, subtitle, items, summary, color }) {
  const colorMap = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      tag: 'bg-blue-100 text-blue-700',
      header: 'bg-blue-600',
      summaryText: 'text-blue-700',
    },
    green: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      tag: 'bg-green-100 text-green-700',
      header: 'bg-green-600',
      summaryText: 'text-green-700',
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      tag: 'bg-purple-100 text-purple-700',
      header: 'bg-purple-600',
      summaryText: 'text-purple-700',
    },
  }

  const c = colorMap[color]

  return (
    <div className={`border ${c.border} rounded-xl overflow-hidden`}>
      <div className={`${c.header} px-4 py-3`}>
        <h3 className="text-white font-bold">{title}</h3>
        <span className="text-white/70 text-sm">{subtitle}</span>
      </div>
      <div className={`${c.bg} p-4 space-y-3`}>
        {/* One-line summary */}
        {summary && (
          <p className={`text-sm font-medium ${c.summaryText} border-b border-current/10 pb-2`}>
            {summary}
          </p>
        )}
        {/* Tags */}
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => (
              <span
                key={idx}
                className={`${c.tag} px-3 py-1 rounded-full text-sm font-medium`}
              >
                {typeof item === 'string' ? item : item.name || item.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">항목 없음</p>
        )}
      </div>
    </div>
  )
}
