/**
 * Step 1: 기본정보
 * 이름, 생년월일, 연락처, 이메일, 주소, LinkedIn/포트폴리오 URL
 */
export default function Step1Personal({ formData, updateFormData, goNext }) {
  const personal = formData.personal

  const handleChange = (field, value) => {
    updateFormData('personal', { ...personal, [field]: value })
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
