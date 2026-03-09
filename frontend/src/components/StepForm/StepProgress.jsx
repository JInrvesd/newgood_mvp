/**
 * 7단계 진행 바 컴포넌트
 * - 현재 단계 강조, 완료 단계 체크 표시
 */
export default function StepProgress({ steps, currentStep, onStepClick }) {
  return (
    <nav aria-label="폼 진행 단계">
      <ol className="flex items-center w-full">
        {steps.map((stepName, idx) => {
          const stepNum = idx + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep
          const isPending = stepNum > currentStep

          return (
            <li
              key={stepNum}
              className={`flex items-center ${
                idx < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onStepClick(stepNum)}
                className="flex flex-col items-center group relative"
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${stepNum}단계: ${stepName}${
                  isCompleted ? ' (완료)' : isCurrent ? ' (진행 중)' : ''
                }`}
              >
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>

                {/* Label - hidden on mobile, shown on sm+ */}
                <span
                  className={`hidden sm:block text-xs mt-1 whitespace-nowrap ${
                    isCurrent
                      ? 'text-blue-600 font-semibold'
                      : isCompleted
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {stepName}
                </span>
              </button>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
