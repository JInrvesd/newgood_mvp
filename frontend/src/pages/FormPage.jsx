import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import useResumeAccess from '../hooks/useResumeAccess'
import { createResume, getResume } from '../services/api'
import StepProgress from '../components/StepForm/StepProgress'
import Step1Personal from '../components/StepForm/Step1Personal'
import Step2Education from '../components/StepForm/Step2Education'
import Step3Experience from '../components/StepForm/Step3Experience'
import Step4Competency from '../components/StepForm/Step4Competency'
import Step5Others from '../components/StepForm/Step5Others'
import Step6CareerDetail from '../components/StepForm/Step6CareerDetail'
import Step7CoverLetter from '../components/StepForm/Step7CoverLetter'

const STEPS = [
  '기본정보',
  '학력',
  '경력',
  '역량',
  '기타',
  '경력상세',
  '자기소개서',
]

const STORAGE_KEY = 'newgood_form_draft'

function getInitialFormData() {
  return {
    personal: {
      name: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      linkedinUrl: '',
      portfolioUrl: '',
      photoData: '',
    },
    education: [
      {
        schoolName: '',
        major: '',
        enrollDate: '',
        graduateDate: '',
        degree: '',
        gpa: '',
      },
    ],
    experience: [
      {
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        leaveReason: '',
      },
    ],
    competency: [
      {
        name: '',
        level: '중급',
        description: '',
      },
    ],
    others: {
      certificates: [{ name: '', date: '', issuer: '' }],
      languages: [{ language: '', level: '', score: '' }],
      activities: [{ name: '', date: '', description: '' }],
    },
    careerDetails: [],
    coverLetter: {
      mode: 'structured',
      freeText: '',
      growth: '',
      personality: '',
      motivation: '',
      aspiration: '',
    },
  }
}

export default function FormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { saveUuid } = useResumeAccess()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const editUuid = searchParams.get('uuid')

  // Initialize form data from localStorage draft, uploaded data, or fresh
  const [formData, setFormData] = useState(() => {
    // Check if uploaded data was passed via navigation state
    if (location.state?.uploadedData) {
      return { ...getInitialFormData(), ...location.state.uploadedData }
    }

    // Check localStorage draft (only if not editing existing resume)
    if (!editUuid) {
      try {
        const draft = localStorage.getItem(STORAGE_KEY)
        if (draft) return JSON.parse(draft)
      } catch {
        // ignore parse errors
      }
    }

    return getInitialFormData()
  })

  // Load existing resume data when editing
  useEffect(() => {
    if (!editUuid) return
    getResume(editUuid)
      .then((data) => {
        if (data?.form_data) {
          setFormData((prev) => ({ ...prev, ...data.form_data }))
        }
      })
      .catch(() => {})
  }, [editUuid])

  // M5: 디바운스된 localStorage 자동 저장 (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      } catch {
        // ignore storage errors (e.g. QuotaExceededError)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formData])

  // H8: careerDetails를 experience 엔트리와 companyName 기반으로 동기화
  useEffect(() => {
    setFormData((prev) => {
      const newDetails = prev.experience.map((exp) => {
        // companyName으로 기존 careerDetail 매칭
        const existing = prev.careerDetails.find(
          (d) => d.companyName && d.companyName === exp.companyName
        ) || {}
        return {
          companyName: exp.companyName,
          achievements: existing.achievements || '',
          skills: existing.skills || [],
          projectName: existing.projectName || '',
        }
      })
      return { ...prev, careerDetails: newDetails }
    })
  }, [formData.experience.length])

  const updateFormData = useCallback((section, data) => {
    setFormData((prev) => ({ ...prev, [section]: data }))
  }, [])

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 7))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await createResume(formData)
      const uuid = result.id

      // Save UUID and clear draft
      saveUuid(uuid)
      localStorage.removeItem(STORAGE_KEY)

      navigate(`/analysis/${uuid}`)
    } catch (err) {
      setSubmitError(err.message || '이력서 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    const props = { formData, updateFormData, goNext, goPrev }

    switch (currentStep) {
      case 1:
        return <Step1Personal {...props} />
      case 2:
        return <Step2Education {...props} />
      case 3:
        return <Step3Experience {...props} />
      case 4:
        return <Step4Competency {...props} />
      case 5:
        return <Step5Others {...props} />
      case 6:
        return <Step6CareerDetail {...props} />
      case 7:
        return (
          <Step7CoverLetter
            {...props}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              &larr; 홈으로
            </button>
            <h1 className="text-lg font-bold text-blue-600">뉴굿</h1>
            <span className="text-sm text-gray-400">
              {currentStep} / 7
            </span>
          </div>
          <StepProgress
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {submitError && (
          <div
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
            role="alert"
          >
            {submitError}
            <button
              onClick={() => setSubmitError(null)}
              className="ml-2 underline"
            >
              닫기
            </button>
          </div>
        )}

        {renderStep()}
      </main>
    </div>
  )
}
