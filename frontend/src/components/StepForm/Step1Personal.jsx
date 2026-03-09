import { useRef } from 'react'

/**
 * Step 1: 기본정보
 * 이름, 생년월일, 연락처, 이메일, 주소, LinkedIn/포트폴리오 URL, 사진
 */
export default function Step1Personal({ formData, updateFormData, goNext }) {
  const personal = formData.personal
  const fileInputRef = useRef(null)

  const handleChange = (field, value) => {
    updateFormData('personal', { ...personal, [field]: value })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 5MB 이하 이미지만 허용
    if (file.size > 5 * 1024 * 1024) {
      alert('사진은 5MB 이하의 파일만 업로드 가능합니다.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      handleChange('photoData', ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoRemove = () => {
    handleChange('photoData', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">기본정보</h2>
        <p className="text-gray-500 mt-1">
          이력서에 포함될 기본 개인정보를 입력해 주세요.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* 사진 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            증명사진
            <span className="ml-1 text-xs text-gray-400 font-normal">
              (선택 · JPG/PNG · 5MB 이하)
            </span>
          </label>
          <div className="flex items-center gap-4">
            {/* 사진 미리보기 or 빈 박스 */}
            <div
              className="w-24 h-32 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {personal.photoData ? (
                <img
                  src={personal.photoData}
                  alt="증명사진 미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400 text-xs px-2">
                  <div className="text-2xl mb-1">📷</div>
                  <div>클릭하여<br />업로드</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
              >
                사진 선택
              </button>
              {personal.photoData && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="block px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-all"
                >
                  사진 삭제
                </button>
              )}
              <p className="text-xs text-gray-400">
                업로드한 사진은<br />다운로드 이력서에 포함됩니다.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* 이름 */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={personal.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="홍길동"
          />
        </div>

        {/* 생년월일 */}
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            생년월일
          </label>
          <input
            id="birthDate"
            type="date"
            value={personal.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={personal.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="010-1234-5678"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={personal.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="example@email.com"
          />
        </div>

        {/* 주소 */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            주소
          </label>
          <input
            id="address"
            type="text"
            value={personal.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="서울특별시 강남구"
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label
            htmlFor="linkedinUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            LinkedIn URL
          </label>
          <input
            id="linkedinUrl"
            type="url"
            value={personal.linkedinUrl}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        {/* 포트폴리오 URL */}
        <div>
          <label
            htmlFor="portfolioUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            포트폴리오 URL
          </label>
          <input
            id="portfolioUrl"
            type="url"
            value={personal.portfolioUrl}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="https://portfolio.example.com"
          />
        </div>
      </div>

      {/* 병역 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">병역 사항</h3>

        <div>
          <label
            htmlFor="militaryStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            병역 구분
          </label>
          <select
            id="militaryStatus"
            value={personal.militaryStatus || ''}
            onChange={(e) => handleChange('militaryStatus', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="">선택하세요</option>
            <option value="completed">군필</option>
            <option value="serving">복무 중</option>
            <option value="exempted">면제</option>
            <option value="notApplicable">해당 없음</option>
          </select>
        </div>

        {/* 군필 또는 복무 중일 때 상세 정보 */}
        {(personal.militaryStatus === 'completed' || personal.militaryStatus === 'serving') && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="militaryBranch"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  군별
                </label>
                <select
                  id="militaryBranch"
                  value={personal.militaryBranch || ''}
                  onChange={(e) => handleChange('militaryBranch', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">선택하세요</option>
                  <option value="army">육군</option>
                  <option value="navy">해군</option>
                  <option value="airforce">공군</option>
                  <option value="marines">해병대</option>
                  <option value="socialService">사회복무요원</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="militaryRank"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  계급
                </label>
                <input
                  id="militaryRank"
                  type="text"
                  value={personal.militaryRank || ''}
                  onChange={(e) => handleChange('militaryRank', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="병장"
                />
              </div>

              <div>
                <label
                  htmlFor="militaryStartDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  입대일
                </label>
                <input
                  id="militaryStartDate"
                  type="month"
                  value={personal.militaryStartDate || ''}
                  onChange={(e) => handleChange('militaryStartDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="militaryEndDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  전역일
                </label>
                <input
                  id="militaryEndDate"
                  type="month"
                  value={personal.militaryEndDate || ''}
                  onChange={(e) => handleChange('militaryEndDate', e.target.value)}
                  disabled={personal.militaryStatus === 'serving'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                />
                {personal.militaryStatus === 'serving' && (
                  <p className="text-xs text-gray-400 mt-1">복무 중이므로 전역일은 생략됩니다.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* 면제일 때 사유 */}
        {personal.militaryStatus === 'exempted' && (
          <div>
            <label
              htmlFor="militaryExemptionReason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              면제 사유
              <span className="text-gray-400 font-normal ml-1">(선택)</span>
            </label>
            <input
              id="militaryExemptionReason"
              type="text"
              value={personal.militaryExemptionReason || ''}
              onChange={(e) => handleChange('militaryExemptionReason', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="면제 사유를 입력하세요"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
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
