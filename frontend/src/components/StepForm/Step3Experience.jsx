/**
 * Step 3: 경력
 * 경력 목록 (동적 추가/삭제) + 근무 기간 자동 계산 + 이직 사유
 */
export default function Step3Experience({ formData, updateFormData, goNext, goPrev }) {
  const experience = formData.experience

  const handleChange = (index, field, value) => {
    const updated = experience.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateFormData('experience', updated)
  }

  const addEntry = () => {
    updateFormData('experience', [
      ...experience,
      {
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        leaveReason: '',
      },
    ])
  }

  const removeEntry = (index) => {
    if (experience.length <= 1) return
    updateFormData(
      'experience',
      experience.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">경력</h2>
        <p className="text-gray-500 mt-1">
          최근 경력부터 입력해 주세요. 경력이 없으면 건너뛰셔도 됩니다.
        </p>
      </div>

      {experience.map((exp, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">경력 {idx + 1}</h3>
            {experience.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label={`경력 ${idx + 1} 삭제`}
              >
                삭제
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사명
              </label>
              <input
                type="text"
                value={exp.companyName}
                onChange={(e) => handleChange(idx, 'companyName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="OO회사"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직책
              </label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => handleChange(idx, 'position', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="프론트엔드 개발자"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입사년월
              </label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleChange(idx, 'startDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                퇴사년월
              </label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleChange(idx, 'endDate', e.target.value)}
                disabled={exp.isCurrent}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={exp.isCurrent}
                  onChange={(e) => handleChange(idx, 'isCurrent', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                현재 재직 중
              </label>
            </div>
          </div>

          {/* 근무 기간 자동 계산 */}
          <DurationBadge startDate={exp.startDate} endDate={exp.endDate} isCurrent={exp.isCurrent} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당업무
            </label>
            <textarea
              rows={4}
              value={exp.description}
              onChange={(e) => handleChange(idx, 'description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
              placeholder="주요 담당 업무를 작성해 주세요."
            />
          </div>

          {/* 이직 사유 (재직 중이 아닌 경우) */}
          {!exp.isCurrent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이직/퇴사 사유
                <span className="text-gray-400 font-normal ml-1">(선택)</span>
              </label>
              <input
                type="text"
                value={exp.leaveReason || ''}
                onChange={(e) => handleChange(idx, 'leaveReason', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="예: 더 큰 규모의 프로젝트에 도전하기 위해, 전문성 심화를 위해"
              />
              <p className="text-xs text-gray-400 mt-1">
                면접에서 자주 묻는 질문입니다. 긍정적인 관점(성장, 도전, 전문성)에서 작성하세요.
              </p>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
      >
        + 경력 추가
      </button>

      {/* Total Career Duration */}
      <TotalDuration experience={experience} />

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={goPrev}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
        >
          &larr; 이전
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
        >
          다음 단계 &rarr;
        </button>
      </div>
    </form>
  )
}

/**
 * 근무 기간 자동 계산 뱃지
 */
function calcDuration(startDate, endDate, isCurrent) {
  if (!startDate) return null

  const start = new Date(startDate + '-01')
  const end = isCurrent ? new Date() : endDate ? new Date(endDate + '-01') : null

  if (!end || end < start) return null

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (months < 0) return null

  const years = Math.floor(months / 12)
  const remainMonths = months % 12

  if (years === 0 && remainMonths === 0) return '1개월 미만'
  if (years === 0) return `${remainMonths}개월`
  if (remainMonths === 0) return `${years}년`
  return `${years}년 ${remainMonths}개월`
}

function DurationBadge({ startDate, endDate, isCurrent }) {
  const duration = calcDuration(startDate, endDate, isCurrent)
  if (!duration) return null

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        근무 기간: {duration}
      </span>
    </div>
  )
}

/**
 * 총 경력 기간 표시
 */
function TotalDuration({ experience }) {
  const validExps = experience.filter((exp) => exp.companyName && exp.startDate)
  if (validExps.length === 0) return null

  let totalMonths = 0
  for (const exp of validExps) {
    const start = new Date(exp.startDate + '-01')
    const end = exp.isCurrent ? new Date() : exp.endDate ? new Date(exp.endDate + '-01') : null
    if (!end || end < start) continue

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    if (months > 0) totalMonths += months
  }

  if (totalMonths === 0) return null

  const years = Math.floor(totalMonths / 12)
  const remainMonths = totalMonths % 12
  let label = ''
  if (years === 0) label = `${remainMonths}개월`
  else if (remainMonths === 0) label = `${years}년`
  else label = `${years}년 ${remainMonths}개월`

  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <span className="text-sm text-gray-500">총 경력 기간: </span>
      <span className="text-lg font-bold text-blue-600">{label}</span>
    </div>
  )
}
