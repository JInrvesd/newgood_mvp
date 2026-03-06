/**
 * Step 2: 학력
 * 학력 목록 (동적 추가/삭제)
 */
export default function Step2Education({ formData, updateFormData, goNext, goPrev }) {
  const education = formData.education

  const handleChange = (index, field, value) => {
    const updated = education.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateFormData('education', updated)
  }

  const addEntry = () => {
    updateFormData('education', [
      ...education,
      {
        schoolName: '',
        major: '',
        enrollDate: '',
        graduateDate: '',
        degree: '',
        gpa: '',
      },
    ])
  }

  const removeEntry = (index) => {
    if (education.length <= 1) return
    updateFormData(
      'education',
      education.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">학력</h2>
        <p className="text-gray-500 mt-1">
          최종 학력부터 입력해 주세요.
        </p>
      </div>

      {education.map((edu, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">학력 {idx + 1}</h3>
            {education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label={`학력 ${idx + 1} 삭제`}
              >
                삭제
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학교명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={edu.schoolName}
                onChange={(e) => handleChange(idx, 'schoolName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="OO대학교"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전공
              </label>
              <input
                type="text"
                value={edu.major}
                onChange={(e) => handleChange(idx, 'major', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="컴퓨터공학"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입학년월
              </label>
              <input
                type="month"
                value={edu.enrollDate}
                onChange={(e) => handleChange(idx, 'enrollDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                졸업년월
              </label>
              <input
                type="month"
                value={edu.graduateDate}
                onChange={(e) => handleChange(idx, 'graduateDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학위
              </label>
              <select
                value={edu.degree}
                onChange={(e) => handleChange(idx, 'degree', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">선택</option>
                <option value="고등학교">고등학교</option>
                <option value="전문학사">전문학사</option>
                <option value="학사">학사</option>
                <option value="석사">석사</option>
                <option value="박사">박사</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학점 (선택)
              </label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => handleChange(idx, 'gpa', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="3.5 / 4.5"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
      >
        + 학력 추가
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
