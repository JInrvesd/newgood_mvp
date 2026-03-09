import { useState } from 'react'
import { aiEditCoverLetter } from '../../services/api'

/**
 * Step 7: 자기소개서
 * 자유 양식(단일 textarea) / 기존 양식(4개 섹션) 중 선택
 * 각 섹션에 'AI로 수정하기' 버튼 포함
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

  const [aiLoading, setAiLoading] = useState({})
  const [aiError, setAiError] = useState({})
  const [aiOriginal, setAiOriginal] = useState({})

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

  const handleAiEdit = async (field, text) => {
    if (!text.trim()) return
    setAiLoading((prev) => ({ ...prev, [field]: true }))
    setAiError((prev) => ({ ...prev, [field]: null }))

    try {
      const result = await aiEditCoverLetter(
        text,
        mode === 'free' ? 'free' : 'structured',
        mode === 'structured' ? field : null
      )
      setAiOriginal((prev) => ({ ...prev, [field]: text }))
      handleChange(field, result.text)
    } catch (e) {
      setAiError((prev) => ({ ...prev, [field]: 'AI 편집에 실패했습니다. 다시 시도해 주세요.' }))
    } finally {
      setAiLoading((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleUndo = (field, originalValue) => {
    handleChange(field, originalValue)
    setAiOriginal((prev) => ({ ...prev, [field]: null }))
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              자기소개서
            </label>
            <div className="flex items-center gap-2">
              {aiOriginal['freeText'] && (
                <button
                  type="button"
                  onClick={() => handleUndo('freeText', aiOriginal['freeText'])}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  되돌리기
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAiEdit('freeText', coverLetter.freeText || '')}
                disabled={aiLoading['freeText'] || !(coverLetter.freeText || '').trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 text-blue-700 text-xs font-medium rounded-lg transition-all border border-blue-200 disabled:border-gray-200"
              >
                {aiLoading['freeText'] ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full inline-block" />
                    AI 수정 중...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    AI로 수정하기
                  </>
                )}
              </button>
            </div>
          </div>
          <textarea
            rows={16}
            value={coverLetter.freeText || ''}
            onChange={(e) => handleChange('freeText', e.target.value)}
            maxLength={8000}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
            placeholder="자기소개서를 자유롭게 작성해 주세요. 형식에 구애받지 않고 작성하셔도 됩니다."
          />
          {aiError['freeText'] && (
            <p className="text-xs text-red-500 mt-1">{aiError['freeText']}</p>
          )}
          {aiOriginal['freeText'] && (
            <p className="text-xs text-green-600 mt-1">
              ✓ AI가 소제목과 두괄식 구조로 수정했습니다. 내용을 확인하고 수정하세요.
            </p>
          )}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  {aiOriginal[key] && (
                    <button
                      type="button"
                      onClick={() => handleUndo(key, aiOriginal[key])}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      되돌리기
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAiEdit(key, value)}
                    disabled={aiLoading[key] || !value.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 text-blue-700 text-xs font-medium rounded-lg transition-all border border-blue-200 disabled:border-gray-200"
                  >
                    {aiLoading[key] ? (
                      <>
                        <span className="animate-spin w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full inline-block" />
                        AI 수정 중...
                      </>
                    ) : (
                      <>
                        <span>✦</span>
                        AI로 수정하기
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                maxLength={maxLength}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                placeholder={placeholder}
              />
              {aiError[key] && (
                <p className="text-xs text-red-500 mt-1">{aiError[key]}</p>
              )}
              {aiOriginal[key] && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ AI가 두괄식으로 수정했습니다. 내용을 확인하고 수정하세요.
                </p>
              )}
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
