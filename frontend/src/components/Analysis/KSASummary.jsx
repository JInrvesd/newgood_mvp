/**
 * KSA 역량 정리 컴포넌트
 * Knowledge / Skill / Attitude 3열 카드
 * 각 항목 태그 형태로 표시
 */
export default function KSASummary({ ksa }) {
  const knowledge = ksa.knowledge || []
  const skills = ksa.skills || []
  const attitude = ksa.attitude || []

  const hasData =
    knowledge.length > 0 || skills.length > 0 || attitude.length > 0

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          KSA 역량 정리
        </h2>
        <p className="text-gray-500">아직 KSA 분석 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">KSA 역량 정리</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Knowledge */}
        <KSACard
          title="Knowledge"
          subtitle="지식"
          items={knowledge}
          color="blue"
        />

        {/* Skill */}
        <KSACard
          title="Skill"
          subtitle="기술"
          items={skills}
          color="green"
        />

        {/* Attitude */}
        <KSACard
          title="Attitude"
          subtitle="태도"
          items={attitude}
          color="purple"
        />
      </div>
    </div>
  )
}

function KSACard({ title, subtitle, items, color }) {
  const colorMap = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      tag: 'bg-blue-100 text-blue-700',
      header: 'bg-blue-600',
    },
    green: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-700',
      tag: 'bg-green-100 text-green-700',
      header: 'bg-green-600',
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      tag: 'bg-purple-100 text-purple-700',
      header: 'bg-purple-600',
    },
  }

  const c = colorMap[color]

  return (
    <div className={`border ${c.border} rounded-xl overflow-hidden`}>
      <div className={`${c.header} px-4 py-3`}>
        <h3 className="text-white font-bold">{title}</h3>
        <span className="text-white/70 text-sm">{subtitle}</span>
      </div>
      <div className={`${c.bg} p-4`}>
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
