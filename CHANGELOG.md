# Changelog

## [v0.1.1] - 2026-03-06

### 버그 수정

#### 백엔드
- **`backend/app/routers/resumes.py`**: `POST /upload-docx` 라우트를 `GET /{uuid}` 앞으로 이동
  - 기존: FastAPI가 `upload-docx`를 `{uuid}` 패턴으로 먼저 매칭 → `405 Method Not Allowed`
  - 수정: 고정 경로를 동적 경로보다 앞에 등록하여 정상 동작
- **`backend/app/main.py`**: CORS 허용 오리진에 `http://localhost:5174` 추가
  - Vite 개발 서버가 5173 포트 대신 5174로 뜰 경우에도 CORS 통과

#### 프론트엔드
- **`frontend/src/services/api.js`**: `uploadDocx` 함수의 URL 오타 수정
  - `/api/resumes/upload` → `/api/resumes/upload-docx`
- **`frontend/src/hooks/useSSEAnalysis.js`**: `phase_complete` 이벤트 데이터 키 수정
  - `data.result` → `data.data` (백엔드 SSE 응답 구조와 일치)
- **`frontend/src/pages/FormPage.jsx`**: 이력서 생성 후 UUID 추출 키 수정
  - `result.uuid` → `result.id` (Supabase 반환 필드명과 일치)
  - `uuid` 쿼리 파라미터로 기존 이력서 불러오기 기능 추가 ("직접 수정하기" 동작)
- **`frontend/src/pages/ResultPage.jsx`**: 분석 결과 데이터 추출 경로 전면 수정
  - `result?.result_data` → `result?.analysis?.result_data`
  - `score/feedback/ksa` → `phase1/phase2/phase3` (DB 저장 구조와 일치)
- **`frontend/src/components/Analysis/ScoreBoard.jsx`**: LLM 응답 키 매핑 수정
  - `score.total` → `score.total_score`
  - `score.sections` → `score.section_scores`
  - `section.name` → `section.section`
  - `score.description` → `score.summary`
- **`frontend/src/components/Analysis/SectionFeedback.jsx`**: LLM 응답 키 매핑 수정
  - `feedback.sections` → `feedback.detailed_feedback`
  - `section.name` → `section.section`
  - `section.content` → `section.feedback`
  - `section.before` / `section.after` → `section.before_example` / `section.after_example`
- **`frontend/src/components/Analysis/KSASummary.jsx`**: LLM 응답 키 수정
  - `ksa.skills` → `ksa.skill` (LLM Phase 3 응답 필드명 단수형과 일치)

---

## [v0.1.0] - 2026-03-01

### 최초 릴리즈

- 7단계 이력서 입력 폼 (기본정보 / 학력 / 경력 / 역량 / 기타 / 경력상세 / 자기소개서)
- DOCX 파일 업로드 → 텍스트 파싱 → 폼 자동 채우기
- UUID 기반 이력서 접근 (로그인 불필요)
- OpenRouter API (Claude Sonnet 4) 기반 SSE 3단계 분석
  - Phase 1: 가시성 점수 (0~100)
  - Phase 2: 섹션별 피드백 + 구조화
  - Phase 3: KSA 역량 정리
- Supabase PostgreSQL 저장 (JSONB)
- python-docx 기반 이력서 DOCX 출력
- 공유 링크 (UUID URL)
- 재분석 최대 5회 제한
