import { useState } from 'react'

/**
 * 이미지 선택 모달
 * DOCX에서 이미지가 2개 이상 추출되었을 때 대표 사진을 선택하는 UI
 */
export default function ImageSelectModal({ images, onSelect, onSkip }) {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(images[selectedIndex])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            대표 사진 선택
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            이력서에서 {images.length}개의 이미지가 발견되었습니다.
            <br />
            대표 증명사진으로 사용할 이미지를 선택해 주세요.
          </p>
        </div>

        {/* Image Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                  selectedIndex === idx
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`추출된 이미지 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedIndex === idx && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 text-center">
                  이미지 {idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onSkip}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
          >
            사진 없이 진행
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIndex === null}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  )
}
