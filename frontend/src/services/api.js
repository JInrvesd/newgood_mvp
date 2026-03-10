const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(url, options = {}) {
  // L2: body가 문자열(JSON)일 때만 Content-Type 자동 설정
  const headers = { ...options.headers }
  if (typeof options.body === 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    const message = errorBody?.detail || `HTTP ${res.status}`
    throw new Error(message)
  }

  return res
}

/**
 * POST /api/resumes - 새 이력서 생성
 * @param {Object} formData - 7단계 폼 데이터
 * @returns {{ uuid: string }} 생성된 UUID
 */
export async function createResume(formData) {
  const res = await request('/api/resumes', {
    method: 'POST',
    body: JSON.stringify({ form_data: formData }),
  })
  return res.json()
}

/**
 * GET /api/resumes/:uuid - 이력서 조회
 * @param {string} uuid
 * @returns {Object} resume data
 */
export async function getResume(uuid) {
  const res = await request(`/api/resumes/${uuid}`)
  return res.json()
}

/**
 * PATCH /api/resumes/:uuid - 이력서 수정
 * @param {string} uuid
 * @param {Object} formData - 수정할 폼 데이터
 */
export async function updateResume(uuid, formData) {
  const res = await request(`/api/resumes/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify({ form_data: formData }),
  })
  return res.json()
}

/**
 * GET /api/resumes/:uuid/download - docx 다운로드
 * @param {string} uuid
 * @returns {Blob}
 */
export async function downloadDocx(uuid) {
  const res = await fetch(`${API_BASE}/api/resumes/${uuid}/download`)
  if (!res.ok) throw new Error(`다운로드 실패: HTTP ${res.status}`)
  return res.blob()
}

/**
 * GET /api/resumes/:uuid/result - 분석 결과 조회
 * @param {string} uuid
 * @param {number} version - 분석 버전 (기본 최신)
 */
export async function getAnalysisResult(uuid, version) {
  const url = version
    ? `/api/resumes/${uuid}/result?version=${version}`
    : `/api/resumes/${uuid}/result`
  const res = await request(url)
  return res.json()
}

/**
 * POST /api/ai-edit/career - 경력기술서 AI 개선
 * @param {string} text - 개선할 텍스트
 * @returns {{ text: string }}
 */
export async function aiEditCareer(text) {
  const res = await request('/api/ai-edit/career', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
  return res.json()
}

/**
 * POST /api/ai-edit/cover-letter - 자기소개서 AI 개선
 * @param {string} text - 개선할 텍스트
 * @param {'free'|'structured'} type - 양식 종류
 * @param {string} [field] - structured 항목명 (growth, personality, motivation, aspiration)
 * @returns {{ text: string }}
 */
export async function aiEditCoverLetter(text, type, field = null) {
  const body = { text, type }
  if (field) body.field = field
  const res = await request('/api/ai-edit/cover-letter', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return res.json()
}

/**
 * POST /api/resumes/:uuid/upload - docx 파일 업로드
 * @param {string} uuid
 * @param {File} file
 */
export async function uploadDocx(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/resumes/upload-docx`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.detail || `업로드 실패: HTTP ${res.status}`)
  }

  return res.json()
}
