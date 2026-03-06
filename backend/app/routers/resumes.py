from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import ResumeCreate, ResumeUpdate
from app.db.supabase_client import get_supabase
from app.services.parser_service import parse_docx_to_form_data
import uuid as uuid_lib

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.post("", status_code=201)
async def create_resume(payload: ResumeCreate):
    """이력서 생성 + UUID 발급"""
    db = get_supabase()
    resume_id = str(uuid_lib.uuid4())

    data = {
        "id": resume_id,
        "form_data": payload.form_data,
        "status": "draft",
    }

    result = db.table("resumes").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="이력서 저장에 실패했습니다")

    return result.data[0]


@router.get("/{uuid}")
async def get_resume(uuid: str):
    """이력서 조회"""
    db = get_supabase()
    result = db.table("resumes").select("*").eq("id", uuid).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    return result.data


@router.patch("/{uuid}")
async def update_resume(uuid: str, payload: ResumeUpdate):
    """이력서 수정"""
    db = get_supabase()

    data = {"form_data": payload.form_data}
    result = db.table("resumes").update(data).eq("id", uuid).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    return result.data[0]


@router.post("/upload-docx")
async def upload_docx(file: UploadFile = File(...)):
    """DOCX 업로드 → 텍스트 파싱 → form_data 반환"""
    if not (file.filename or "").endswith(".docx"):
        raise HTTPException(status_code=400, detail=".docx 파일만 업로드 가능합니다")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 10MB 이하여야 합니다")

    form_data = parse_docx_to_form_data(contents)

    return {"form_data": form_data, "uuid": None}


@router.get("/{uuid}/result")
async def get_analysis_result(uuid: str):
    """최신 분석 결과 조회"""
    db = get_supabase()

    resume = db.table("resumes").select("*").eq("id", uuid).single().execute()
    if not resume.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    analysis = (
        db.table("analysis_results")
        .select("*")
        .eq("resume_id", uuid)
        .order("version", desc=True)
        .limit(1)
        .execute()
    )

    return {
        "resume": resume.data,
        "analysis": analysis.data[0] if analysis.data else None,
    }
