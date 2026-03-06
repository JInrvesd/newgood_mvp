/**
 * Step 7: 자기소개서
 * 자유 양식(단일 textarea) / 기존 양식(4개 섹션) 중 선택
 */
export default function Step7CoverLetter({
  formData,
  updateFormData,
  goPrev,
  onSubmit,
  isSubmitting,
}) {
  const coverLetter = formData.coverLetter
  const mode = coverLetter.mode || 'structured'

  const handleChange = (field, value) => {
    updateFormData('coverLetter', { ...coverLetter, [field]: value })
  }

  const handleModeChange = (newMode) => {
    updateFormData('coverLetter', { ...coverLetter, mode: newMode })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  const structuredFields = [
    {
      key: 'growth',
      label: '성장과정',
      placeholder:
        '성장 배경과 가치관 형성에 영향을 준 경험을 작성해 주세요.',
      maxLength: 2000,
    },
    {
      key: 'personality',
      label: '성격 / 장단점',
      placeholder:
        '본인의 성격적 강점과 약점, 이를 극복하기 위한 노력을 작성해 주세요.',
      maxLength: 2000,
    },
    {
      key: 'motivation',
      label: '지원동기',
      placeholder:
        '해당 직무/회사에 지원하게 된 동기와 본인이 적합한 이유를 작성해 주세요.',
      maxLength: 2000,
    },
    {
      key: 'aspiration',
      label: '입사 후 포부',
      placeholder:
        '입사 후 달성하고 싶은 목표와 기여 방안을 작성해 주세요.',
      maxLength: 2000,
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">자기소개서</h2>
        <p className="text-gray-500 mt-1">
          각 항목은 선택사항입니다. 작성하시면 AI 분석에 반영됩니다.
        </p>
      </div>

      {/* 양식 선택 탭 */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => handleModeChange('structured')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === 'structured'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          기존 양식
          <span className="block text-xs font-normal opacity-75 mt-0.5">
            성장과정 · 성격 · 지원동기 · 포부
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('free')}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${
            mode === 'free'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          자유 양식
          <span className="block text-xs font-normal opacity-75 mt-0.5">
            형식 없이 자유롭게 작성
          </span>
        </button>
      </div>

      {/* 자유 양식 */}
      {mode === 'free' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            자기소개서
          </label>
          <textarea
            rows={16}
            value={coverLetter.freeText || ''}
            onChange={(e) => handleChange('freeText', e.target.value)}
            maxLength={8000}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
            placeholder="자기소개서를 자유롭게 작성해 주세요. 형식에 구애받지 않고 작성하셔도 됩니다."
          />
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs ${
                (coverLetter.freeText || '').length > 7200
                  ? 'text-red-500 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {(coverLetter.freeText || '').length} / 8000자
            </span>
          </div>
        </div>
      )}

      {/* 기존 양식 (섹션별) */}
      {mode === 'structured' &&
        structuredFields.map(({ key, label, placeholder, maxLength }) => {
          const value = coverLetter[key] || ''
          const count = value.length
          const isNearLimit = count > maxLength * 0.9

          return (
            <div key={key} className="bg-white rounded-xl shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <textarea
                rows={6}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                maxLength={maxLength}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                placeholder={placeholder}
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    isNearLimit ? 'text-red-500 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {count} / {maxLength}자
                </span>
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
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span
                className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                role="status"
              >
                <span className="sr-only">저장 중</span>
              </span>
              저장 중...
            </>
          ) : (
            '분석 시작하기'
          )}
        </button>
      </div>
    </form>
  )
}
