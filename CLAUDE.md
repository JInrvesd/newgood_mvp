# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

**뉴굿 이력서 가시성 개선 MVP 0.1v**
구직자의 이력서(DOCX)를 AI로 분석하여 가시성(Visibility)을 개선하고, KSA(Knowledge·Skill·Attitude) 역량 정리를 제공하는 웹 서비스.

- **핵심 원칙**: 로그인 없음(UUID 접근키), 허위 경험 생성 금지, 자체 docx 템플릿 출력
- **사이트**: https://newgood.co.kr
- **PRD 버전**: v3.2

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 홈페이지 | 정적 HTML/CSS/JS (Phase 1) → React 통합 (Phase 2) |
| Frontend | React (Vite) + TailwindCSS |
| Backend | FastAPI (Python 3.11+) + SSE 스트리밍 |
| Database | Supabase PostgreSQL (2개 테이블 + JSONB) |
| Storage | Supabase Storage |
| LLM | OpenRouter API → `anthropic/claude-sonnet-4-20250514` |
| 파싱 | python-docx / pandoc |
| 출력 | docx-js (Node.js) |
| 배포 | Vercel (FE + 홈페이지) + Railway or Fly.io (BE) |

---

## 개발 명령어

### 백엔드 (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 프론트엔드 (React + Vite)
```bash
cd frontend
npm install
npm run dev          # 개발 서버 (포트 5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

### docx-js 출력 스크립트
```bash
cd backend
npm install          # package.json 있을 경우
node scripts/generate_resume.js <data.json> <output.docx>
```

### Supabase 마이그레이션
```bash
supabase db push
# 또는 Supabase 대시보드에서 supabase/migrations/001_init.sql 직접 실행
```

---

## 아키텍처

### 전체 흐름

```
홈페이지 (homepage/) ──→ 서비스 진입 ──→ React App (frontend/)
                                               │
                                    docx 업로드 또는 직접 입력
                                               │
                                    7단계 폼 → Supabase JSONB 저장
                                               │
                                    UUID 발급 + 링크 공유 UI
                                               │
                              FastAPI SSE /api/resumes/{uuid}/analyze
                                               │
                            ┌──────────────────────────────────────┐
                            │ Phase 1: 가시성 점수 (10~15초)       │
                            │ Phase 2: 피드백+구조화+자소서 (15~25초)│
                            │ Phase 3: KSA 역량 정리 (10~20초)     │
                            └──────────────────────────────────────┘
                                               │
                                    AI 수정 또는 직접 수정 (최대 5회)
                                               │
                                    자체 docx 템플릿 출력 (docx-js)
```

### DB 구조 (2개 테이블 + JSONB)

- **`resumes`**: UUID(PK) + `form_data` JSONB (7단계 폼 전체) + status + photo_url
- **`analysis_results`**: resume_id(FK) + version(1~5) + `result_data` JSONB (점수+피드백+KSA)

`form_data` JSONB 키: `personal`, `education[]`, `experience[]` (3단계+6단계 통합), `competency[]`, `others`, `cover_letter`

### LLM 3단계 SSE 스트리밍

SSE 이벤트 타입: `phase_start` → `phase_complete` (3회) → `analysis_done` / `error`

---

## 프로젝트 파일 구조

```
newgood-resume-mvp/
├── .env                          # 루트 공통 (gitignore)
├── .env.example
├── CLAUDE.md
├── docker-compose.yml
│
├── homepage/                     # ⭐ 진입 페이지 (정적 HTML, 최소 구성)
│   ├── index.html                # 버튼 하나 → /app/ 진입
│   ├── style.css                 # 최소 스타일
│   └── main.js                   # localStorage UUID 확인 → "이어서 작성" 링크 노출
│
├── frontend/                     # React (Vite) 서비스 앱
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env                      # VITE_ prefix 환경변수
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── StepForm/
│       │   │   ├── StepProgress.jsx
│       │   │   ├── Step1Personal.jsx
│       │   │   ├── Step2Education.jsx
│       │   │   ├── Step3Experience.jsx
│       │   │   ├── Step4Competency.jsx
│       │   │   ├── Step5Others.jsx
│       │   │   ├── Step6CareerDetail.jsx
│       │   │   └── Step7CoverLetter.jsx
│       │   ├── Analysis/
│       │   │   ├── AnalysisLoading.jsx   # SSE 3단계 로딩 UX
│       │   │   ├── ScoreBoard.jsx
│       │   │   ├── SectionFeedback.jsx
│       │   │   ├── KSASummary.jsx
│       │   │   └── ActionButtons.jsx
│       │   ├── Upload/
│       │   │   └── DocxUploader.jsx
│       │   ├── Share/
│       │   │   ├── LinkCopyCard.jsx
│       │   │   └── ShareBanner.jsx
│       │   └── common/
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── FormPage.jsx
│       │   ├── AnalysisPage.jsx
│       │   └── ResultPage.jsx
│       ├── hooks/
│       │   ├── useResumeAccess.js    # UUID localStorage + URL
│       │   └── useSSEAnalysis.js     # SSE 연결 관리
│       └── services/
│           ├── api.js
│           └── analysis.js           # SSE EventSource 래퍼
│
├── backend/                      # FastAPI
│   ├── .env                      # 백엔드 전용 환경변수
│   ├── .env.example
│   ├── requirements.txt
│   ├── package.json              # docx-js 의존성
│   ├── app/
│   │   ├── main.py               # FastAPI 앱 + CORS 설정
│   │   ├── config.py             # .env 로딩 (pydantic BaseSettings)
│   │   ├── routers/
│   │   │   ├── resumes.py        # CRUD 엔드포인트
│   │   │   ├── analysis.py       # SSE 스트리밍 엔드포인트
│   │   │   └── download.py       # docx 다운로드
│   │   ├── services/
│   │   │   ├── parser_service.py  # docx → form_data JSON
│   │   │   ├── llm_service.py     # OpenRouter 3단계 분석
│   │   │   └── docx_service.py    # Node.js subprocess → docx 생성
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic 스키마 (form_data 검증)
│   │   └── db/
│   │       └── supabase_client.py
│   └── scripts/
│       └── generate_resume.js     # docx-js 출력 스크립트
│
├── supabase/
│   └── migrations/
│       └── 001_init.sql           # 2개 테이블 + 인덱스 + RLS + 트리거
│
└── vercel.json                    # Vercel 라우팅 설정
```

---

## .env 파일 (환경변수 전체)

### `backend/.env`

```dotenv
# ── OpenRouter LLM API ──────────────────────────────────────────
# 발급: https://openrouter.ai → API Keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-sonnet-4-20250514

# ── Supabase ─────────────────────────────────────────────────────
# 발급: Supabase 프로젝트 → Settings → API
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ⚠️ SERVICE_ROLE_KEY는 백엔드 전용. 절대 프론트에 노출 금지.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Supabase Storage ──────────────────────────────────────────────
# Supabase Storage에서 생성할 버킷 이름
SUPABASE_STORAGE_BUCKET=resume-files

# ── 사이트 설정 ───────────────────────────────────────────────────
SITE_URL=https://newgood.co.kr
# 로컬 개발 시 프론트 URL (CORS 허용 대상)
FRONTEND_URL=http://localhost:5173

# ── 서버 설정 ─────────────────────────────────────────────────────
PORT=8000
ENVIRONMENT=development   # development | production

# ── docx 파싱 (pandoc 사용 시) ────────────────────────────────────
# pandoc 설치 경로 (시스템 PATH에 있으면 생략 가능)
# PANDOC_PATH=/usr/bin/pandoc
```

### `frontend/.env`

```dotenv
# ── API 연결 ──────────────────────────────────────────────────────
# 로컬: http://localhost:8000  |  프로덕션: https://api.newgood.co.kr
VITE_API_BASE_URL=http://localhost:8000

# ── Supabase (프론트용 — ANON KEY만 허용) ─────────────────────────
# 발급: Supabase 프로젝트 → Settings → API
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── 사이트 설정 ───────────────────────────────────────────────────
VITE_SITE_URL=https://newgood.co.kr
```

---

## 뉴굿 홈페이지 (homepage/) 구조

### `homepage/index.html` — 단순 진입 페이지

소개 없이 바로 서비스로 연결하는 최소 구성.

```
┌─────────────────────────────────────────────┐
│  로고                                        │
├─────────────────────────────────────────────┤
│  한 줄 문구 + [이력서 분석 시작하기] 버튼    │
│  → 클릭 시 /app/ 로 이동                     │
├─────────────────────────────────────────────┤
│  (이전에 작성한 이력서가 있으면 링크 복원)   │
│  localStorage에 UUID 있을 때만 노출          │
└─────────────────────────────────────────────┘
```

### Vercel 라우팅 (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/app/(.*)", "destination": "/frontend/dist/index.html" },
    { "source": "/app", "destination": "/frontend/dist/index.html" }
  ],
  "routes": [
    { "src": "/assets/(.*)", "dest": "/frontend/dist/assets/$1" }
  ]
}
```

- `/` → `homepage/index.html` (랜딩)
- `/app` → React SPA (서비스 앱)
- `/app/resume/{uuid}` → React Router가 처리

---

## 개발 우선순위 (MVP Phase)

| Phase | 기간 | 주요 작업 |
|-------|------|----------|
| Phase 1 | Week 1-2 | Supabase 테이블 생성, FastAPI 기본 구조, docx 파싱, 7단계 폼 UI, UUID 발급 |
| Phase 2 | Week 2-3 | OpenRouter API 연동, SSE 3단계 분석, 분석 로딩 UX, 결과 화면 |
| Phase 3 | Week 3-4 | AI/직접 수정, 재분석 루프, docx-js 출력, 사진 처리, 홈페이지 HTML 배포 |

---

## 주요 제약사항

- **재분석 최대 5회/세션** — 초과 시 유료 전환 안내
- **허위 경험 생성 금지** — LLM 프롬프트에 명시적으로 포함
- **SERVICE_ROLE_KEY** 절대 프론트엔드 번들에 포함 금지
- **SSE 연결 시** nginx 배포 환경이라면 `X-Accel-Buffering: no` 헤더 필수
- **UUID 공유 링크** — 링크를 아는 누구나 조회/수정 가능하다는 안내 필수
- **docx-js** — Node.js 런타임이 백엔드 서버에 설치되어 있어야 함
