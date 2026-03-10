import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalysisResult } from '../services/api'
import SectionFeedback from '../components/Analysis/SectionFeedback'
import KSASummary from '../components/Analysis/KSASummary'
import ActionButtons from '../components/Analysis/ActionButtons'
import LinkCopyCard from '../components/Share/LinkCopyCard'

export default function ResultPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uuid) return

    const fetchResult = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAnalysisResult(uuid)
        setResult(data)
      } catch (err) {
        setError(err.message || '결과를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [uuid])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" role="status">
            <span className="sr-only">로딩 중</span>
          </div>
          <p className="text-gray-600">결과를 불러오고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            결과를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Extract result data with safe fallbacks
  const analysisData = result?.analysis?.result_data || {}
  const feedback = analysisData.phase1 || {}
  const ksa = analysisData.phase2 || {}
  const version = result?.analysis?.version || 1

  // H10: cover_letter_feedback & structured_resume 추출
  const coverLetterFeedback = feedback.cover_letter_feedback || null
  const structuredResume = feedback.structured_resume || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            &larr; 홈으로
          </button>
          <h1 className="text-lg font-bold text-blue-600">뉴굿</h1>
          <span className="text-sm text-gray-400">
            분석 v{version}
          </span>
        </div>
      </header>

      {/* Result Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* H10: 프로필 요약 (structured_resume) */}
        {structuredResume?.personal?.summary_statement && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">AI 프로필 요약</h2>
            <p className="text-gray-700 leading-relaxed">
              {structuredResume.personal.summary_statement}
            </p>
            {structuredResume.skill_categories && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(structuredResume.skill_categories.technical || []).map((s, i) => (
                  <span key={`t-${i}`} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}</span>
                ))}
                {(structuredResume.skill_categories.tools || []).map((s, i) => (
                  <span key={`tool-${i}`} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{s}</span>
                ))}
                {(structuredResume.skill_categories.soft || []).map((s, i) => (
                  <span key={`s-${i}`} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <SectionFeedback feedback={feedback} />

        {/* H10: 자기소개서 피드백 */}
        {coverLetterFeedback && coverLetterFeedback.overall !== '자기소개서가 제공되지 않았습니다' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">자기소개서 피드백</h2>
            {coverLetterFeedback.overall && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">전반 평가</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{coverLetterFeedback.overall}</p>
              </div>
            )}
            {coverLetterFeedback.structure && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">구조 개선</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{coverLetterFeedback.structure}</p>
              </div>
            )}
            {coverLetterFeedback.content && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">내용 개선</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{coverLetterFeedback.content}</p>
              </div>
            )}
            {coverLetterFeedback.improved_opening && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-700 mb-1">개선된 첫 문단 제안</h3>
                <p className="text-sm text-blue-800 leading-relaxed">{coverLetterFeedback.improved_opening}</p>
              </div>
            )}
          </div>
        )}

        {/* KSA */}
        <KSASummary ksa={ksa} />

        {/* Share Link */}
        <LinkCopyCard uuid={uuid} />

        {/* Actions */}
        <ActionButtons uuid={uuid} version={version} />
      </main>
    </div>
  )
}
