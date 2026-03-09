# 뉴굿 이력서 가시성 개선 MVP v0.3F

구직자의 이력서를 AI로 분석하여 **가시성(Visibility)을 개선**하고, KSA(Knowledge·Skill·Attitude) 역량 정리를 제공하는 웹 서비스입니다.

- 로그인 없음 (UUID 접근키 방식)
- 허위 경험 생성 금지
- 자체 DOCX 템플릿 출력

---

## v0.3F 주요 변경사항

### AI 분석 파이프라인 개편 (3단계 → 2단계)
- ~~Phase 1: 가시성 점수~~ → **삭제** (이미 가시성 개선이 목적이므로 불필요)
- **Phase 1: HR 전문가 피드백 & 구조화** — 두괄식 작성, 대괄호 소제목, KPI 분석
- **Phase 2: KSA 역량 분석** — K/S/A 한 줄 요약 + 강점/약점 정리

### AI 개선 지침 강화
- **두괄식(역삼각형) 작성 원칙** 적용
- **대괄호 소제목**: 내용을 함축하는 임팩트 있는 제목 (예: `[땀과 성실함으로 이뤄낸 일본 자전거 일주]`)
- **KPI 분석**: 정량적 + 정성적 성과 분리, 정량 데이터 없으면 명시
- **약점 피드백**: 추상적 표현 금지, HR 전문가 시점의 구체적 행동 가이드 제시

### HR 전문가 피드백
- 섹션별 피드백을 HR 채용 전문가 관점에서 제공
- 프로젝트 경험 미작성 시 정량적 성과 작성 유도
- 이직 사유 누락 자동 체크

### 폼 기능 강화
- **병역 사항** 입력 (기본정보 Step 1에 추가)
- **이직 사유** 필드 추가 (경력 Step 3)
- **경력 기간 자동 계산** (DurationBadge + TotalDuration 컴포넌트)
- **AI 텍스트 편집** (경력 상세 Step 6에서 AI로 성과 문장 개선)

### 기타
- 배포 설정 파일 제거 (로컬 개발 전용)
- ScoreBoard 컴포넌트 삭제
- 프론트엔드/백엔드 전면 2단계 체계로 통일

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React (Vite) + TailwindCSS |
| 백엔드 | FastAPI (Python 3.11+) + SSE 스트리밍 |
| 데이터베이스 | Supabase PostgreSQL |
| 스토리지 | Supabase Storage |
| LLM | OpenRouter API → Claude Sonnet 4 |
| 문서 출력 | python-docx / docx-js |

---

## 프로젝트 구조

```
newgood_mvp/
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers/
│   │   │   ├── resumes.py        # CRUD 엔드포인트
│   │   │   ├── analysis.py       # SSE 2단계 분석
│   │   │   ├── ai_edit.py        # AI 텍스트 편집 (경력/자소서)
│   │   │   └── download.py       # DOCX 다운로드
│   │   ├── services/
│   │   │   ├── llm_service.py    # OpenRouter 2단계 분석
│   │   │   ├── docx_service.py   # DOCX 생성
│   │   │   └── parser_service.py # DOCX → form_data 파싱
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic 스키마
│   │   └── db/
│   │       └── supabase_client.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # React (Vite) 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── StepForm/         # 7단계 폼 (병역, 이직사유, AI편집 포함)
│   │   │   ├── Analysis/         # 분석 결과 (HR피드백, KSA)
│   │   │   ├── Upload/           # DOCX 업로더
│   │   │   └── Share/            # 링크 공유
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── FormPage.jsx
│   │   │   ├── AnalysisPage.jsx
│   │   │   └── ResultPage.jsx
│   │   ├── hooks/
│   │   │   ├── useResumeAccess.js
│   │   │   └── useSSEAnalysis.js # SSE 2단계 연결
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   └── .env.example
├── supabase/
│   └── migrations/
│       └── 001_init.sql
└── README.md
```

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Python 3.11 이상
- Node.js 18 이상
- Supabase 계정 (무료)
- OpenRouter 계정 (API 키 발급)

---

### 1단계 — 저장소 클론

```bash
git clone https://github.com/JInrvesd/newgood_mvp.git
cd newgood_mvp
```

---

### 2단계 — Supabase 설정

1. [https://supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **SQL Editor**에서 `supabase/migrations/001_init.sql` 전체 내용 실행
3. **Settings → API** 에서 아래 값 복사:
   - `Project URL`
   - `anon public` 키
   - `service_role` 키 (백엔드 전용, 절대 프론트에 노출 금지)
4. **Storage** 탭에서 `resume-files` 버킷 생성

---

### 3단계 — 백엔드 환경변수 설정

```bash
cd backend
cp .env.example .env
```

`backend/.env` 파일을 열어 아래 값을 채웁니다:

```dotenv
OPENROUTER_API_KEY=sk-or-v1-xxxx          # OpenRouter에서 발급
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-sonnet-4-20250514

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # 백엔드 전용
SUPABASE_STORAGE_BUCKET=resume-files

SITE_URL=https://newgood.co.kr
FRONTEND_URL=http://localhost:5173

PORT=8000
ENVIRONMENT=development
```

---

### 4단계 — 프론트엔드 환경변수 설정

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` 파일을 열어 아래 값을 채웁니다:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...              # anon 키만 사용
VITE_SITE_URL=https://newgood.co.kr
```

---

### 5단계 — 의존성 설치

```bash
# 백엔드 Python 패키지
cd backend
pip install -r requirements.txt

# 프론트엔드 Node 패키지
cd ../frontend
npm install
```

---

### 6단계 — 개발 서버 실행

```bash
# 백엔드
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 프론트엔드 (별도 터미널)
cd frontend
npm run dev
```

- 백엔드: [http://localhost:8000](http://localhost:8000)
- 프론트엔드: [http://localhost:5173](http://localhost:5173)
- API 문서: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 주요 기능 흐름

```
홈 화면
  └─ 이력서 직접 입력 (7단계 폼)
       또는 DOCX 업로드 → 폼 자동 채우기
            │
            ▼
  UUID 발급 → 링크 공유 가능
            │
            ▼
  AI 2단계 분석 (SSE 스트리밍)
    Phase 1: HR 전문가 피드백 & 구조화 (15~25초)
      - 두괄식 작성 원칙
      - 임팩트 있는 대괄호 소제목
      - 정량/정성 KPI 분석
      - 이직 사유 체크
    Phase 2: KSA 역량 분석 (10~20초)
      - K/S/A 한 줄 요약
      - 강점/약점 + 구체적 보완 방안
            │
            ▼
  결과 확인 → AI 수정 또는 직접 수정 (최대 5회)
            │
            ▼
  DOCX 다운로드
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/resumes` | 이력서 생성, UUID 발급 |
| `GET` | `/api/resumes/{uuid}` | 이력서 조회 |
| `PATCH` | `/api/resumes/{uuid}` | 이력서 수정 |
| `GET` | `/api/resumes/{uuid}/result` | 분석 결과 조회 |
| `GET` | `/api/resumes/{uuid}/download` | DOCX 다운로드 |
| `POST` | `/api/resumes/upload-docx` | DOCX 파일 파싱 |
| `GET` | `/api/resumes/{uuid}/analyze` | SSE 스트리밍 분석 시작 |
| `POST` | `/api/ai-edit/career` | 경력 상세 AI 편집 |
| `POST` | `/api/ai-edit/cover-letter` | 자기소개서 AI 편집 |
| `GET` | `/health` | 서버 상태 확인 |

---

## 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 프론트엔드 코드에 포함시키지 마세요.
- `.env` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.
- 분석은 세션당 최대 5회까지 무료로 제공됩니다.
- UUID 링크를 아는 누구나 이력서를 조회/수정할 수 있으므로 링크 관리에 주의하세요.

---

## 변경 이력

### v0.3F — 2026-03-09

- AI 분석 파이프라인 전면 개편 (3단계 → 2단계)
- 가시성 점수(ScoreBoard) 기능 제거
- HR 채용 전문가 관점 피드백 도입
- 두괄식 작성 + 임팩트 대괄호 소제목 + KPI 분석 지침 추가
- KSA 분석 강화: K/S/A 한 줄 요약 + 강점/약점 정리
- 약점 피드백에 구체적 행동 가이드 의무화 (추상적 표현 금지)
- 병역 사항 입력 필드 추가 (Step 1)
- 이직 사유 필드 추가 (Step 3)
- 경력 기간 자동 계산 기능 추가
- AI 텍스트 편집 기능 추가 (경력 상세 / 자기소개서)
- 배포 설정 파일 제거 (로컬 개발 전용)

### v0.1.2 — 2026-03-06

- LLM 기반 이력서 파싱 및 배포 설정 추가

### v0.1.1 — 2026-03-06

- 라우트 순서 버그 수정, CORS 설정, 데이터 키 매핑 정상화

### v0.1.0 — 2026-03-01

- 최초 릴리즈 (7단계 폼, DOCX 업로드, AI 3단계 분석, DOCX 출력)
