# 뉴굿 이력서 MVP v0.31 — 처음부터 설치 가이드

> 이 문서는 새 컴퓨터에 이 프로젝트를 처음 세팅하는 분을 위한 **단계별 안내서**입니다.
> Windows / macOS / Linux 모두 지원합니다.

---

## 목차

1. [필수 프로그램 설치](#1-필수-프로그램-설치)
2. [프로젝트 가져오기 (Git Clone)](#2-프로젝트-가져오기)
3. [외부 서비스 계정 준비](#3-외부-서비스-계정-준비)
4. [백엔드 세팅](#4-백엔드-세팅)
5. [프론트엔드 세팅](#5-프론트엔드-세팅)
6. [데이터베이스 세팅 (Supabase)](#6-데이터베이스-세팅)
7. [실행하기](#7-실행하기)
8. [정상 작동 확인](#8-정상-작동-확인)
9. [자주 발생하는 문제 해결](#9-자주-발생하는-문제-해결)
10. [배포 참고사항](#10-배포-참고사항)

---

## 1. 필수 프로그램 설치

아래 4가지를 순서대로 설치하세요.

### 1-1. Git (버전 관리)

코드를 다운로드하고 버전을 관리하는 도구입니다.

| OS | 설치 방법 |
|----|----------|
| Windows | https://git-scm.com/download/win 에서 다운로드 → 설치 (기본 옵션 그대로 Next) |
| macOS | 터미널에서 `xcode-select --install` 실행 |
| Linux | `sudo apt install git` (Ubuntu/Debian) 또는 `sudo dnf install git` (Fedora) |

설치 확인:
```bash
git --version
# 예: git version 2.43.0
```

### 1-2. Python 3.11 이상 (백엔드 언어)

백엔드 서버가 Python으로 작성되어 있습니다.

| OS | 설치 방법 |
|----|----------|
| Windows | https://www.python.org/downloads/ 에서 최신 버전 다운로드. **설치 시 "Add Python to PATH" 체크박스를 반드시 체크하세요!** |
| macOS | `brew install python@3.12` (Homebrew가 없다면 https://brew.sh 에서 먼저 설치) |
| Linux | `sudo apt install python3 python3-pip python3-venv` |

설치 확인:
```bash
python --version
# 예: Python 3.12.3

# Windows에서 python이 안 되면 python3로 시도:
python3 --version
```

> **중요**: Python 3.11 미만이면 일부 기능이 작동하지 않습니다.

### 1-3. Node.js 18 이상 (프론트엔드 빌드)

프론트엔드(React)를 빌드하고 실행하는 데 필요합니다.

| OS | 설치 방법 |
|----|----------|
| 모든 OS | https://nodejs.org 에서 **LTS 버전** 다운로드 → 설치 |

설치 확인:
```bash
node --version
# 예: v20.11.0

npm --version
# 예: 10.2.4
```

### 1-4. 코드 에디터 (선택사항이지만 강력 추천)

코드를 보고 수정하기 위해 에디터가 필요합니다.

- **VS Code** (무료, 가장 추천): https://code.visualstudio.com/
- 설치 후 왼쪽 확장(Extensions) 탭에서 아래 확장 설치 추천:
  - `Python` (Microsoft)
  - `ES7+ React/Redux/React-Native snippets`
  - `Tailwind CSS IntelliSense`

---

## 2. 프로젝트 가져오기

### 2-1. Git Clone

터미널(명령 프롬프트, PowerShell, 또는 macOS Terminal)을 열고:

```bash
# 원하는 폴더로 이동 (예: 바탕화면)
cd ~/Desktop

# 프로젝트 다운로드 (아래 URL은 실제 저장소 URL로 교체하세요)
git clone <저장소-URL> newgood-resume
cd newgood-resume
```

### 2-2. USB나 파일로 받은 경우

1. 압축 파일(.zip)을 원하는 위치에 풀기
2. 터미널에서 해당 폴더로 이동:
```bash
cd /path/to/newgood-resume
```

### 2-3. 폴더 구조 확인

아래와 같은 구조가 보여야 합니다:
```
newgood-resume/
├── backend/          ← Python 백엔드
├── frontend/         ← React 프론트엔드
├── homepage/         ← 정적 랜딩 페이지
├── supabase/         ← DB 마이그레이션 SQL
├── CLAUDE.md
├── SETUP_GUIDE.md    ← 이 파일
└── .gitignore
```

---

## 3. 외부 서비스 계정 준비

이 프로젝트는 3개의 외부 서비스를 사용합니다. **모두 무료 플랜으로 시작 가능합니다.**

### 3-1. Supabase (데이터베이스)

이력서 데이터와 분석 결과를 저장합니다.

1. https://supabase.com 접속 → **Start your project** 클릭
2. GitHub 계정으로 로그인
3. **New Project** 클릭
4. 프로젝트 정보 입력:
   - **Name**: `newgood-resume` (원하는 이름)
   - **Database Password**: 안전한 비밀번호 입력 → **반드시 메모해 두세요**
   - **Region**: `Northeast Asia (Tokyo)` 선택 (한국에서 가장 빠름)
5. **Create new project** 클릭 → 2~3분 대기

**API 키 확인** (나중에 .env 파일에 넣을 값):
1. 좌측 메뉴에서 톱니바퀴 **Settings** 클릭
2. **API** 탭 클릭
3. 다음 3개를 메모:
   - **Project URL** → `SUPABASE_URL` 에 사용
   - **anon (public)** key → `SUPABASE_ANON_KEY` 에 사용
   - **service_role (secret)** key → `SUPABASE_SERVICE_ROLE_KEY` 에 사용

> **주의**: `service_role` 키는 절대 프론트엔드 코드나 공개 저장소에 노출하면 안 됩니다!

### 3-2. OpenRouter (AI/LLM API)

이력서를 분석하는 AI 기능에 사용됩니다.

1. https://openrouter.ai 접속 → **Sign Up** 클릭
2. Google 또는 이메일로 가입
3. 로그인 후 좌측 메뉴에서 **Keys** 클릭
4. **Create Key** 클릭 → 키 이름 입력 (예: `newgood-dev`)
5. 생성된 키를 복사 → `OPENROUTER_API_KEY` 에 사용

**크레딧 충전** (AI 호출에 비용 발생):
1. 좌측 메뉴 **Credits** 클릭
2. 최소 $5~10 충전 추천 (이력서 1건 분석에 약 $0.02~0.05)

### 3-3. GitHub (선택 — 코드 백업/협업용)

코드를 온라인에 백업하고 다른 컴퓨터에서 접근하려면:

1. https://github.com 에서 계정 생성
2. **New Repository** 생성
3. 터미널에서:
```bash
git remote add origin https://github.com/내계정/저장소이름.git
git push -u origin main
```

---

## 4. 백엔드 세팅

### 4-1. 가상환경 생성

Python 가상환경은 이 프로젝트 전용 패키지 공간입니다. (다른 프로젝트와 충돌 방지)

```bash
# 프로젝트 루트에서:
cd backend

# 가상환경 생성
python -m venv venv
```

> Windows에서 `python`이 안 되면 `python3 -m venv venv`로 시도하세요.

### 4-2. 가상환경 활성화

**매번 백엔드 작업할 때마다** 이 명령을 실행해야 합니다:

```bash
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Windows (명령 프롬프트/CMD):
.\venv\Scripts\activate.bat

# Windows (Git Bash):
source venv/Scripts/activate

# macOS / Linux:
source venv/bin/activate
```

활성화되면 터미널에 `(venv)` 표시가 나타납니다:
```
(venv) C:\...\backend>
```

> **PowerShell에서 오류가 나는 경우**: PowerShell을 관리자 권한으로 열고 `Set-ExecutionPolicy RemoteSigned` 실행 후 다시 시도.

### 4-3. 패키지 설치

```bash
# 가상환경이 활성화된 상태에서:
pip install -r requirements.txt
```

설치 확인:
```bash
pip list | grep fastapi
# 예: fastapi  0.115.0
```

### 4-4. 환경변수 파일 생성

```bash
# backend 폴더 안에 .env 파일 생성:
cp .env.example .env
```

> Windows CMD에서 `cp`가 안 되면 `copy .env.example .env` 사용.

`.env` 파일을 에디터로 열고 **실제 값으로 교체**:

```dotenv
# ── OpenRouter LLM API ──────────────────────────────────────────
# 3-2 단계에서 받은 키
OPENROUTER_API_KEY=sk-or-v1-여기에실제키붙여넣기
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-sonnet-4-20250514

# ── Supabase ─────────────────────────────────────────────────────
# 3-1 단계에서 받은 값들
SUPABASE_URL=https://여기에프로젝트URL.supabase.co
SUPABASE_ANON_KEY=eyJ여기에anon키...
SUPABASE_SERVICE_ROLE_KEY=eyJ여기에service_role키...
SUPABASE_STORAGE_BUCKET=resume-files

# ── 사이트 / CORS 설정 ────────────────────────────────────────────
SITE_URL=https://newgood.co.kr
FRONTEND_URL=http://localhost:5173
FRONTEND_PROD_URL=https://newgood-mvp.vercel.app

# ── 서버 설정 ─────────────────────────────────────────────────────
PORT=8000
ENVIRONMENT=development
```

> **절대로 `.env` 파일을 Git에 커밋하지 마세요!** (.gitignore에 이미 등록되어 있습니다)

---

## 5. 프론트엔드 세팅

### 5-1. 패키지 설치

```bash
# 프로젝트 루트로 돌아가서:
cd ../frontend

# npm으로 패키지 설치
npm install
```

약 1~2분 소요됩니다. `node_modules` 폴더가 생기면 성공입니다.

### 5-2. 환경변수 파일 생성

```bash
# frontend 폴더 안에 .env 파일 생성:
```

에디터로 `frontend/.env` 파일을 새로 만들고 아래 내용 작성:

```dotenv
# 로컬 개발 시 — 백엔드 주소
VITE_API_BASE_URL=http://localhost:8000

# Supabase (프론트엔드용 — ANON KEY만!)
VITE_SUPABASE_URL=https://여기에프로젝트URL.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ여기에anon키...

# 사이트 URL
VITE_SITE_URL=https://newgood.co.kr
```

> `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`는 백엔드 `.env`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY`와 같은 값입니다.

---

## 6. 데이터베이스 세팅

Supabase에 테이블을 만들어야 합니다.

### 6-1. SQL 실행

1. https://supabase.com/dashboard 접속 → 프로젝트 선택
2. 좌측 메뉴에서 **SQL Editor** 클릭 (</> 아이콘)
3. **New Query** 클릭

**첫 번째 쿼리** — 테이블 생성 (`supabase/migrations/001_init.sql`의 내용):

```sql
-- ── resumes 테이블 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    form_data   JSONB       NOT NULL DEFAULT '{}',
    status      TEXT        NOT NULL DEFAULT 'draft',
    photo_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── analysis_results 테이블 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_results (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id   UUID        NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version     INTEGER     NOT NULL DEFAULT 1,
    result_data JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 인덱스 ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resumes_status        ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_analysis_resume_id    ON analysis_results(resume_id);
CREATE INDEX IF NOT EXISTS idx_analysis_version      ON analysis_results(resume_id, version DESC);

-- ── updated_at 자동 갱신 트리거 ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resumes_updated_at ON resumes;
CREATE TRIGGER resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS 비활성화 (MVP: UUID 아는 누구나 접근) ─────────────────────
ALTER TABLE resumes          DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results DISABLE ROW LEVEL SECURITY;
```

4. **Run** 버튼 클릭 → `Success` 메시지 확인

**두 번째 쿼리** — 유니크 제약 추가 (`supabase/migrations/002_add_unique_constraint.sql`):

```sql
ALTER TABLE analysis_results
ADD CONSTRAINT uq_analysis_resume_version UNIQUE (resume_id, version);
```

5. **Run** 클릭 → `Success` 확인

### 6-2. 테이블 확인

좌측 메뉴 **Table Editor** 클릭하면 두 개의 테이블이 보여야 합니다:
- `resumes`
- `analysis_results`

---

## 7. 실행하기

**터미널 2개**를 열어야 합니다. (하나는 백엔드, 하나는 프론트엔드)

### 터미널 1 — 백엔드 실행

```bash
cd backend

# 가상환경 활성화 (4-2 참조)
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# 서버 시작
uvicorn app.main:app --reload --port 8000
```

아래와 같은 메시지가 나오면 성공:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

### 터미널 2 — 프론트엔드 실행

```bash
cd frontend

# 개발 서버 시작
npm run dev
```

아래와 같은 메시지가 나오면 성공:
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 브라우저에서 접속

웹 브라우저(Chrome 추천)에서 열기:
- **프론트엔드**: http://localhost:5173
- **백엔드 API 문서**: http://localhost:8000/docs (Swagger UI — API 테스트용)
- **헬스 체크**: http://localhost:8000/health

---

## 8. 정상 작동 확인

아래 순서로 테스트하세요:

### 8-1. 백엔드 헬스 체크

브라우저에서 http://localhost:8000/health 접속:
```json
{"status": "ok", "version": "0.1.0"}
```
이 메시지가 보이면 백엔드가 정상입니다.

### 8-2. 프론트엔드 화면

http://localhost:5173 접속:
- "AI로 이력서 가시성을 높이세요" 제목이 보여야 합니다
- "이력서 분석 시작하기" 버튼이 보여야 합니다

### 8-3. 전체 플로우 테스트

1. "이력서 분석 시작하기" 클릭
2. 7단계 폼에 테스트 데이터 입력 (이름, 연락처 등)
3. 마지막 단계에서 제출
4. 분석 로딩 화면이 나오고, 2단계 분석이 진행되면 성공

---

## 9. 자주 발생하는 문제 해결

### "python을 찾을 수 없습니다"

- **Windows**: Python 설치 시 "Add Python to PATH"를 체크하지 않은 경우
  - Python을 재설치하면서 체크하거나
  - `python3` 또는 `py` 명령으로 시도
- **macOS/Linux**: `python3` 명령을 사용하세요

### "pip: command not found"

```bash
# python -m pip으로 대체:
python -m pip install -r requirements.txt
```

### PowerShell에서 가상환경 활성화 오류

```
이 시스템에서 스크립트를 실행할 수 없으므로...
```

해결:
```powershell
# PowerShell을 관리자 권한으로 열고:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "npm: command not found"

Node.js가 설치되지 않았거나 PATH에 없습니다.
- Node.js를 https://nodejs.org 에서 다시 설치하세요
- 설치 후 터미널을 **새로 열어야** 합니다

### 백엔드 시작 시 "ModuleNotFoundError"

```bash
# 가상환경이 활성화되어 있는지 확인 (터미널에 (venv)가 보이는지)
# 안 보이면 다시 활성화:
source venv/bin/activate  # 또는 Windows: .\venv\Scripts\activate

# 패키지 재설치:
pip install -r requirements.txt
```

### "CORS error" / "Network error" (프론트엔드에서 API 호출 실패)

- 백엔드 서버(터미널 1)가 실행 중인지 확인
- `frontend/.env`의 `VITE_API_BASE_URL`이 `http://localhost:8000`인지 확인
- 프론트엔드 서버 재시작: `Ctrl+C` 후 `npm run dev`

### "Invalid API Key" (OpenRouter 에러)

- `backend/.env`의 `OPENROUTER_API_KEY`가 올바른지 확인
- OpenRouter 대시보드에서 키가 활성 상태인지 확인
- 크레딧 잔액이 있는지 확인

### Supabase 연결 실패

- `backend/.env`의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 확인
- Supabase 대시보드에서 프로젝트가 활성 상태인지 확인
- 무료 플랜은 7일간 미사용 시 자동 일시정지됩니다 → 대시보드에서 **Resume** 클릭

### 포트 충돌 ("address already in use")

다른 프로그램이 이미 해당 포트를 사용 중입니다:

```bash
# 8000번 포트를 사용 중인 프로세스 찾기:
# Windows:
netstat -ano | findstr :8000
# macOS/Linux:
lsof -i :8000

# 다른 포트로 실행:
uvicorn app.main:app --reload --port 8001
# → frontend/.env에서 VITE_API_BASE_URL도 http://localhost:8001로 변경
```

---

## 10. 배포 참고사항

로컬에서 개발이 완료되면 실제 인터넷에 배포할 수 있습니다.

### 프론트엔드 → Vercel

1. https://vercel.com 에서 GitHub 연동
2. 프로젝트 import → Root Directory를 `frontend`로 설정
3. Environment Variables에 `VITE_API_BASE_URL` (배포된 백엔드 URL) 추가

### 백엔드 → Railway

1. https://railway.app 에서 GitHub 연동
2. 프로젝트 import → Root Directory를 `backend`로 설정
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables에 `.env`의 모든 값 추가
   - `ENVIRONMENT=production`으로 변경
   - `FRONTEND_PROD_URL`을 Vercel 배포 URL로 설정

### 프론트엔드 빌드 (수동 배포 시)

```bash
cd frontend
npm run build
# → frontend/dist/ 폴더에 빌드 결과물 생성
```

---

## 빠른 참조 카드

| 작업 | 명령어 |
|------|--------|
| 백엔드 가상환경 활성화 (Windows) | `cd backend && .\venv\Scripts\Activate.ps1` |
| 백엔드 가상환경 활성화 (macOS/Linux) | `cd backend && source venv/bin/activate` |
| 백엔드 서버 시작 | `uvicorn app.main:app --reload --port 8000` |
| 프론트엔드 서버 시작 | `cd frontend && npm run dev` |
| 프론트엔드 빌드 | `cd frontend && npm run build` |
| Python 패키지 추가 설치 | `pip install 패키지명 && pip freeze > requirements.txt` |
| npm 패키지 추가 설치 | `cd frontend && npm install 패키지명` |
| 서버 중지 | `Ctrl + C` |
| API 문서 확인 | 브라우저에서 http://localhost:8000/docs |

---

## 환경변수 체크리스트

세팅이 완료되면 아래 항목이 모두 채워져 있어야 합니다:

### `backend/.env`
- [ ] `OPENROUTER_API_KEY` — `sk-or-v1-`로 시작하는 키
- [ ] `SUPABASE_URL` — `https://xxx.supabase.co` 형식
- [ ] `SUPABASE_ANON_KEY` — `eyJ`로 시작하는 긴 문자열
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — `eyJ`로 시작하는 긴 문자열

### `frontend/.env`
- [ ] `VITE_API_BASE_URL` — `http://localhost:8000`
- [ ] `VITE_SUPABASE_URL` — backend/.env의 SUPABASE_URL과 동일
- [ ] `VITE_SUPABASE_ANON_KEY` — backend/.env의 SUPABASE_ANON_KEY와 동일

### Supabase 대시보드
- [ ] `resumes` 테이블 생성됨
- [ ] `analysis_results` 테이블 생성됨
- [ ] UNIQUE 제약 (`uq_analysis_resume_version`) 적용됨
