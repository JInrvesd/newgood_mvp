import { useNavigate, Link } from 'react-router-dom'
import useResumeAccess from '../hooks/useResumeAccess'
import DocxUploader from '../components/Upload/DocxUploader'

export default function HomePage() {
  const navigate = useNavigate()
  const { hasExistingResume, getSavedUuid } = useResumeAccess()
  const existingUuid = hasExistingResume() ? getSavedUuid() : null

  const handleUploadComplete = (formData, uuid) => {
    if (uuid) {
      navigate(`/analysis/${uuid}`)
    } else {
      navigate('/form', { state: { uploadedData: formData } })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">뉴굿</h1>
          <span className="text-sm text-gray-400">NewGood Resume</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl">
              <svg
                className="w-10 h-10 text-blue-600"
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              AI로 이력서 가시성을 높이세요
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              채용 담당자의 눈에 띄는 이력서로 개선합니다.
              <br />
              KSA 역량 정리까지 한 번에.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/form')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              이력서 분석 시작하기
            </button>

            {/* DOCX Upload */}
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-3">
                또는 기존 이력서 파일을 업로드하세요
              </p>
              <DocxUploader onComplete={handleUploadComplete} />
            </div>
          </div>

          {/* Existing Resume Link */}
          {existingUuid && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 mb-2">
                이전에 작성한 이력서가 있습니다
              </p>
              <Link
                to={`/result/${existingUuid}`}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
              >
                이어서 확인하기 &rarr;
              </Link>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="text-2xl mb-2" aria-hidden="true">
                <svg className="w-8 h-8 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">AI 개선 제안</h3>
              <p className="text-sm text-gray-500 mt-1">
                두괄식 구조화 + KPI 분석
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="text-2xl mb-2" aria-hidden="true">
                <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">맞춤 피드백</h3>
              <p className="text-sm text-gray-500 mt-1">
                섹션별 구체적 개선 방안
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="text-2xl mb-2" aria-hidden="true">
                <svg className="w-8 h-8 text-purple-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">KSA 분석</h3>
              <p className="text-sm text-gray-500 mt-1">
                Knowledge, Skill, Attitude 정리
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
          &copy; 2026 뉴굿(NewGood). 로그인 없이 이용 가능합니다.
        </div>
      </footer>
    </div>
  )
}
