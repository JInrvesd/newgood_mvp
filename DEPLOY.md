# 배포 가이드 (Railway + Vercel)

## 아키텍처

```
브라우저 → Vercel (frontend/)  ←→  Railway (backend/)  ←→  Supabase
```

---

## 1. Railway 백엔드 설정

### 환경변수 (Railway 대시보드 → Variables)

| 변수명 | 값 |
|--------|-----|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` |
| `OPENROUTER_MODEL` | `anthropic/claude-sonnet-4-20250514` |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |
| `SUPABASE_STORAGE_BUCKET` | `resume-files` |
| `SITE_URL` | `https://newgood.co.kr` |
| `FRONTEND_URL` | `http://localhost:5173` (로컬용, 그대로 유지) |
| `FRONTEND_PROD_URL` | `https://newgood-mvp.vercel.app` ✅ **반드시 설정** |
| `ENVIRONMENT` | `production` |

> `Procfile`이 있으므로 별도 빌드 설정 불필요.
> Railway가 자동으로 `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` 실행.

### Railway 루트 디렉토리 설정
Railway 대시보드 → Settings → **Root Directory** : `backend`

---

## 2. Vercel 프론트엔드 설정

### Vercel 프로젝트 설정
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 환경변수 (Vercel 대시보드 → Settings → Environment Variables)

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://newgoodmvp-production.up.railway.app` ✅ **반드시 설정** | Production |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | All |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | All |
| `VITE_SITE_URL` | `https://newgood.co.kr` | All |

> ⚠️ `VITE_API_BASE_URL`을 설정하지 않으면 브라우저가 `localhost:8000`을 호출해 연결 실패.

---

## 3. CORS 동작 방식

`backend/app/main.py`는 다음 출처를 허용합니다:

```
- FRONTEND_URL      (Railway 환경변수 → 로컬 개발용)
- FRONTEND_PROD_URL (Railway 환경변수 → https://newgood-mvp.vercel.app)
- SITE_URL          (https://newgood.co.kr)
- localhost:5173/5174/3000
```

Railway에 `FRONTEND_PROD_URL=https://newgood-mvp.vercel.app`을 설정하면
Vercel → Railway CORS 요청이 정상 허용됩니다.

---

## 4. 로컬 개발

```bash
# 백엔드
cd backend
uvicorn app.main:app --reload --port 8000

# 프론트엔드
cd frontend
npm run dev   # VITE_API_BASE_URL=http://localhost:8000 (frontend/.env)
```

---

## 5. SSE (분석 스트리밍) 확인

Railway는 SSE를 기본 지원합니다.
`analysis.py`의 `StreamingResponse`에 아래 헤더가 이미 설정되어 있습니다:

```python
headers={
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
    "Connection": "keep-alive",
}
```

Railway 프록시에서 버퍼링 문제가 발생하면 Railway 대시보드에서
**HTTP/2** 설정을 확인하세요.
