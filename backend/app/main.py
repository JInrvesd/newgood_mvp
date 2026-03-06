from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import resumes, analysis, download

settings = get_settings()

app = FastAPI(
    title="뉴굿 이력서 API",
    description="AI 이력서 가시성 개선 서비스",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        settings.site_url,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(resumes.router)
app.include_router(analysis.router)
app.include_router(download.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
