/**
 * Step 3: 경력
 * 경력 목록 (동적 추가/삭제)
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
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
      >
        + 경력 추가
      </button>

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
