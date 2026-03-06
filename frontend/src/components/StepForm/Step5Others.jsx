/**
 * Step 5: 기타사항
 * 자격증, 어학능력, 수상/활동 목록 (각각 동적 추가)
 */
export default function Step5Others({ formData, updateFormData, goNext, goPrev }) {
  const others = formData.others

  const updateOthers = (field, data) => {
    updateFormData('others', { ...others, [field]: data })
  }

  // Certificate handlers
  const handleCertChange = (index, field, value) => {
    const updated = others.certificates.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateOthers('certificates', updated)
  }

  const addCertificate = () => {
    updateOthers('certificates', [
      ...others.certificates,
      { name: '', date: '', issuer: '' },
    ])
  }

  const removeCertificate = (index) => {
    if (others.certificates.length <= 1) return
    updateOthers(
      'certificates',
      others.certificates.filter((_, i) => i !== index)
    )
  }

  // Language handlers
  const handleLangChange = (index, field, value) => {
    const updated = others.languages.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateOthers('languages', updated)
  }

  const addLanguage = () => {
    updateOthers('languages', [
      ...others.languages,
      { language: '', level: '', score: '' },
    ])
  }

  const removeLanguage = (index) => {
    if (others.languages.length <= 1) return
    updateOthers(
      'languages',
      others.languages.filter((_, i) => i !== index)
    )
  }

  // Activity handlers
  const handleActivityChange = (index, field, value) => {
    const updated = others.activities.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateOthers('activities', updated)
  }

  const addActivity = () => {
    updateOthers('activities', [
      ...others.activities,
      { name: '', date: '', description: '' },
    ])
  }

  const removeActivity = (index) => {
    if (others.activities.length <= 1) return
    updateOthers(
      'activities',
      others.activities.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">기타사항</h2>
        <p className="text-gray-500 mt-1">
          자격증, 어학, 수상/활동 내역을 입력해 주세요.
        </p>
      </div>

      {/* Certificates */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">자격증</h3>
        {others.certificates.map((cert, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                자격증 {idx + 1}
              </span>
              {others.certificates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCertificate(idx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={cert.name}
                onChange={(e) => handleCertChange(idx, 'name', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="자격증명"
              />
              <input
                type="text"
                value={cert.date}
                onChange={(e) => handleCertChange(idx, 'date', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="취득일 (2024.01)"
              />
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => handleCertChange(idx, 'issuer', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="발급기관"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCertificate}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm"
        >
          + 자격증 추가
        </button>
      </section>

      {/* Languages */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">어학능력</h3>
        {others.languages.map((lang, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                어학 {idx + 1}
              </span>
              {others.languages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLanguage(idx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={lang.language}
                onChange={(e) => handleLangChange(idx, 'language', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="언어 (영어)"
              />
              <input
                type="text"
                value={lang.level}
                onChange={(e) => handleLangChange(idx, 'level', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="수준 (상/중/하)"
              />
              <input
                type="text"
                value={lang.score}
                onChange={(e) => handleLangChange(idx, 'score', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="점수 (TOEIC 900)"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addLanguage}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm"
        >
          + 어학능력 추가
        </button>
      </section>

      {/* Activities */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">수상 / 활동</h3>
        {others.activities.map((act, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                활동 {idx + 1}
              </span>
              {others.activities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeActivity(idx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={act.name}
                onChange={(e) => handleActivityChange(idx, 'name', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="활동/수상명"
              />
              <input
                type="text"
                value={act.date}
                onChange={(e) => handleActivityChange(idx, 'date', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="날짜 (2024.01)"
              />
            </div>
            <textarea
              rows={2}
              value={act.description}
              onChange={(e) => handleActivityChange(idx, 'description', e.target.value)}
              className="w-full mt-3 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
              placeholder="활동 설명"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addActivity}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm"
        >
          + 수상/활동 추가
        </button>
      </section>

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
