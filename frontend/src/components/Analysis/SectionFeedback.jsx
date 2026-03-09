import { useState } from 'react'

/**
 * 섹션별 피드백 아코디언 UI
 * - 각 섹션: 아이콘 + 제목 + 우선순위 + 피드백 내용
 * - 개선 전/후 비교 예시 (있을 경우)
 */
export default function SectionFeedback({ feedback }) {
  const sections = feedback.detailed_feedback || []

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">HR 전문가 피드백</h2>
        <p className="text-gray-500">아직 피드백 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">HR 전문가 피드백</h2>
      <p className="text-sm text-gray-500 mb-6">채용 담당자 관점에서 강점은 돋보이게, 약점은 보완 방법과 함께 안내합니다.</p>
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <AccordionItem key={idx} section={section} />
        ))}
      </div>
    </div>
  )
}

function AccordionItem({ section }) {
  const [isOpen, setIsOpen] = useState(false)

  const getPriorityStyle = (priority) => {
    if (priority === 'high') return 'text-red-600 bg-red-50'
    if (priority === 'medium') return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getPriorityLabel = (priority) => {
    if (priority === 'high') return '높음'
    if (priority === 'medium') return '보통'
    return '낮음'
  }

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {/* Section Icon */}
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <span className="font-medium text-gray-900 text-left">
            {section.section}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {section.priority && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${getPriorityStyle(
                section.priority
              )}`}
            >
              우선순위: {getPriorityLabel(section.priority)}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Feedback Content */}
          {section.feedback && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {section.feedback}
            </p>
          )}

          {/* Improvement Items */}
          {section.improvements && section.improvements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">
                개선 제안
              </h4>
              <ul className="space-y-1">
                {section.improvements.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">
                      &bull;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Before/After Comparison */}
          {section.before_example && section.after_example && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-red-600 block mb-1">
                  개선 전
                </span>
                <p className="text-sm text-gray-700">{section.before_example}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <span className="text-xs font-semibold text-green-600 block mb-1">
                  개선 후
                </span>
                <p className="text-sm text-gray-700">{section.after_example}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
