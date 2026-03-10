import { useState, useRef } from 'react'
import { uploadDocx } from '../../services/api'
import ImageSelectModal from './ImageSelectModal'

/**
 * 드래그앤드롭 + 클릭 업로드 컴포넌트
 * - .docx 파일만 허용
 * - 업로드 후 파싱 중 로딩 표시
 * - 이미지 2개 이상 시 선택 모달 표시
 * - 파싱 완료 시 onComplete 콜백
 */
export default function DocxUploader({ onComplete }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [pendingResult, setPendingResult] = useState(null)
  const [extractedImages, setExtractedImages] = useState([])
  const inputRef = useRef(null)

  const validateFile = (file) => {
    if (!file) return '파일을 선택해 주세요.'

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const isDocx = validTypes.includes(file.type) || file.name.endsWith('.docx')

    if (!isDocx) return '.docx 파일만 업로드 가능합니다.'
    if (file.size > 10 * 1024 * 1024) return '파일 크기는 10MB 이하여야 합니다.'

    return null
  }

  const handleFile = async (file) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setFileName(file.name)
    setIsUploading(true)

    try {
      const result = await uploadDocx(file)
      const images = result.extracted_images || []

      if (images.length >= 2) {
        // 이미지가 2개 이상이면 선택 모달 표시
        setPendingResult(result)
        setExtractedImages(images)
      } else {
        // 이미지 0~1개: 바로 진행
        onComplete(result.form_data, result.uuid)
      }
    } catch (err) {
      setError(err.message || '파일 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelect = (imageDataUrl) => {
    if (!pendingResult) return
    const formData = { ...pendingResult.form_data }
    formData.personal = { ...formData.personal, photoData: imageDataUrl }
    setPendingResult(null)
    setExtractedImages([])
    onComplete(formData, pendingResult.uuid)
  }

  const handleImageSkip = () => {
    if (!pendingResult) return
    const formData = { ...pendingResult.form_data }
    formData.personal = { ...formData.personal, photoData: '' }
    setPendingResult(null)
    setExtractedImages([])
    onComplete(formData, pendingResult.uuid)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!isUploading) inputRef.current?.click()
          }
        }}
        aria-label="DOCX 파일 업로드"
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : isUploading
            ? 'border-gray-300 bg-gray-50 cursor-wait'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div
              className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
              role="status"
            >
              <span className="sr-only">업로드 중</span>
            </div>
            <p className="text-sm text-blue-600 font-medium">
              {fileName} 파싱 중...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="w-8 h-8 text-gray-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="text-blue-600 font-medium">클릭</span>하거나
              파일을 여기에 드래그하세요
            </p>
            <p className="text-xs text-gray-400">.docx 파일만 (최대 10MB)</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* 이미지 선택 모달 */}
      {extractedImages.length >= 2 && (
        <ImageSelectModal
          images={extractedImages}
          onSelect={handleImageSelect}
          onSkip={handleImageSkip}
        />
      )}
    </div>
  )
}
