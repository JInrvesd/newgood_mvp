# 뉴굿 이력서 가시성 개선 MVP v0.1

구직자의 이력서를 AI로 분석하여 **가시성(Visibility)을 개선**하고, KSA(Knowledge·Skill·Attitude) 역량 정리를 제공하는 웹 서비스입니다.

- 로그인 없음 (UUID 접근키 방식)
- 허위 경험 생성 금지
- 자체 DOCX 템플릿 출력

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React (Vite) + TailwindCSS |
| 백엔드 | FastAPI (Python 3.11+) + SSE 스트리밍 |
| 데이터베이스 | Supabase PostgreSQL |
| 스토리지 | Supabase Storage |
| LLM | OpenRouter API → Claude Sonnet 4 |
| 문서 출력 | python-docx |

---

## 프로젝트 구조

```
newgood_mvp/
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers/          # resumes, analysis, download
│   │   ├── services/         # llm_service, docx_service, parser_service
│   │   ├── models/           # Pydantic 스키마
│   │   └── db/               # Supabase 클라이언트
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # React (Vite) 프론트엔드
│   ├── src/
│   │   ├── components/       # StepForm, Analysis, Upload, Share
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   ├── package.json
│   └── .env.example
├── supabase/
│   └── migrations/
│       └── 001_init.sql      # DB 초기화 SQL
├── package.json              # 루트 (concurrently 동시 기동)
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
# 루트 (concurrently)
cd newgood_mvp
npm install

# 백엔드 Python 패키지
cd backend
pip install -r requirements.txt

# 프론트엔드 Node 패키지
cd ../frontend
npm install
```

---

### 6단계 — 개발 서버 실행

루트 디렉토리에서 한 번에 실행:

```bash
cd newgood_mvp
npm run dev
```

- 백엔드: [http://localhost:8000](http://localhost:8000)
- 프론트엔드: [http://localhost:5173](http://localhost:5173)
- API 문서: [http://localhost:8000/docs](http://localhost:8000/docs)

개별 실행이 필요할 경우:

```bash
# 백엔드만
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 프론트엔드만
cd frontend
npm run dev
```

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
  AI 3단계 분석 (SSE 스트리밍)
    Phase 1: 가시성 점수 (10~15초)
    Phase 2: 섹션별 피드백 + 구조화 (15~25초)
    Phase 3: KSA 역량 정리 (10~20초)
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
| `GET` | `/health` | 서버 상태 확인 |

---

## 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 프론트엔드 코드에 포함시키지 마세요.
- `.env` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.
- 분석은 세션당 최대 5회까지 무료로 제공됩니다.
- UUID 링크를 아는 누구나 이력서를 조회/수정할 수 있으므로 링크 관리에 주의하세요.

---

## 변경 이력

### v0.1.1 — 2026-03-06

- `POST /api/resumes/upload-docx` 라우트 순서 버그 수정 (`405 Method Not Allowed` 해결)
- CORS 허용 오리진에 `localhost:5174` 추가
- 프론트엔드 업로드 URL 오타 수정 (`/upload` → `/upload-docx`)
- 분석 결과 화면 데이터 키 전면 수정 (ScoreBoard, SectionFeedback, KSASummary)
- 이력서 생성 후 UUID 추출 키 수정 (`result.uuid` → `result.id`)
- "직접 수정하기" 클릭 시 기존 이력서 데이터 로드 기능 추가

자세한 내용은 [CHANGELOG.md](./CHANGELOG.md) 참조.

### v0.1.0 — 2026-03-01

최초 릴리즈 (7단계 폼, DOCX 업로드, AI 3단계 분석, DOCX 출력)
