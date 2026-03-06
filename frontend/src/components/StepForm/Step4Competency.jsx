/**
 * Step 4: 역량
 * 역량 목록 (동적 추가)
 */
export default function Step4Competency({ formData, updateFormData, goNext, goPrev }) {
  const competency = formData.competency

  const handleChange = (index, field, value) => {
    const updated = competency.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateFormData('competency', updated)
  }

  const addEntry = () => {
    updateFormData('competency', [
      ...competency,
      { name: '', level: '중급', description: '' },
    ])
  }

  const removeEntry = (index) => {
    if (competency.length <= 1) return
    updateFormData(
      'competency',
      competency.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">역량</h2>
        <p className="text-gray-500 mt-1">
          보유한 기술이나 역량을 입력해 주세요.
        </p>
      </div>

      {competency.map((comp, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">역량 {idx + 1}</h3>
            {competency.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label={`역량 ${idx + 1} 삭제`}
              >
                삭제
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                역량명
              </label>
              <input
                type="text"
                value={comp.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="예: React, 프로젝트 관리"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수준
              </label>
              <select
                value={comp.level}
                onChange={(e) => handleChange(idx, 'level', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명 (선택)
            </label>
            <input
              type="text"
              value={comp.description}
              onChange={(e) => handleChange(idx, 'description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="해당 역량에 대한 간단한 설명"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
      >
        + 역량 추가
      </button>

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
