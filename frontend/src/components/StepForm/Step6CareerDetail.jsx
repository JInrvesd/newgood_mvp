import { useState } from 'react'

/**
 * Step 6: 경력 상세
 * Step3 경력 각각에 대해: 주요 성과, 사용 기술(태그 입력), 프로젝트명
 */
export default function Step6CareerDetail({ formData, updateFormData, goNext, goPrev }) {
  const experience = formData.experience
  const careerDetails = formData.careerDetails
  const [skillInput, setSkillInput] = useState({})

  const handleChange = (index, field, value) => {
    const updated = careerDetails.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateFormData('careerDetails', updated)
  }

  const addSkillTag = (index) => {
    const tag = (skillInput[index] || '').trim()
    if (!tag) return

    const current = careerDetails[index]?.skills || []
    if (current.includes(tag)) return

    handleChange(index, 'skills', [...current, tag])
    setSkillInput((prev) => ({ ...prev, [index]: '' }))
  }

  const removeSkillTag = (careerIdx, skillIdx) => {
    const current = careerDetails[careerIdx]?.skills || []
    handleChange(
      careerIdx,
      'skills',
      current.filter((_, i) => i !== skillIdx)
    )
  }

  const handleSkillKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkillTag(index)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goNext()
  }

  // If no experience entries, show a message
  if (experience.length === 0 || (experience.length === 1 && !experience[0].companyName)) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">경력 상세</h2>
          <p className="text-gray-500 mt-1">
            입력된 경력이 없습니다. 이전 단계에서 경력을 추가하거나 이 단계를 건너뛸 수 있습니다.
          </p>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
          >
            &larr; 이전
          </button>
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            다음 단계 &rarr;
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">경력 상세</h2>
        <p className="text-gray-500 mt-1">
          각 경력의 상세 성과와 사용 기술을 입력해 주세요.
        </p>
      </div>

      {experience.map((exp, idx) => {
        const detail = careerDetails[idx] || {}
        if (!exp.companyName) return null

        return (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-semibold text-gray-900">
                {exp.companyName}
              </h3>
              <p className="text-sm text-gray-500">
                {exp.position}
                {exp.startDate && ` | ${exp.startDate}`}
                {exp.endDate && ` ~ ${exp.endDate}`}
                {exp.isCurrent && ' ~ 현재'}
              </p>
            </div>

            {/* 프로젝트명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트명
              </label>
              <input
                type="text"
                value={detail.projectName || ''}
                onChange={(e) => handleChange(idx, 'projectName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="주요 프로젝트 이름"
              />
            </div>

            {/* 주요 성과 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주요 성과
              </label>
              <textarea
                rows={4}
                value={detail.achievements || ''}
                onChange={(e) => handleChange(idx, 'achievements', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                placeholder="구체적인 성과를 작성해 주세요. (예: 매출 20% 증가, 시스템 응답시간 50% 개선)"
              />
            </div>

            {/* 사용 기술 (태그) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용 기술
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(detail.skills || []).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillTag(idx, sIdx)}
                      className="text-blue-400 hover:text-blue-700 ml-1"
                      aria-label={`${skill} 삭제`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput[idx] || ''}
                  onChange={(e) =>
                    setSkillInput((prev) => ({ ...prev, [idx]: e.target.value }))
                  }
                  onKeyDown={(e) => handleSkillKeyDown(e, idx)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="기술명 입력 후 Enter"
                />
                <button
                  type="button"
                  onClick={() => addSkillTag(idx)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )
      })}

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
