from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import ResumeCreate, ResumeUpdate
from app.db.supabase_client import get_supabase
from app.services.parser_service import parse_docx_to_form_data
from app.services.llm_service import parse_resume_with_llm
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


@router.post("/upload-docx")
async def upload_docx(file: UploadFile = File(...)):
    """DOCX 업로드 → 텍스트 파싱 → form_data 반환"""
    if not (file.filename or "").endswith(".docx"):
        raise HTTPException(status_code=400, detail=".docx 파일만 업로드 가능합니다")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 10MB 이하여야 합니다")

    # 1차: 기본 텍스트 추출 (regex)
    basic_data = parse_docx_to_form_data(contents)

    # 2차: LLM 구조화 파싱 (실패 시 기본 데이터 사용)
    llm_data = await parse_resume_with_llm(basic_data["_raw_text"])
    if llm_data:
        # regex로 추출한 값이 LLM보다 정확할 수 있으므로 빈 값만 덮어쓰기
        personal = llm_data.get("personal", {})
        if not personal.get("phone") and basic_data["personal"].get("phone"):
            personal["phone"] = basic_data["personal"]["phone"]
        if not personal.get("email") and basic_data["personal"].get("email"):
            personal["email"] = basic_data["personal"]["email"]
        if not personal.get("linkedinUrl") and basic_data["personal"].get("linkedinUrl"):
            personal["linkedinUrl"] = basic_data["personal"]["linkedinUrl"]
        llm_data["personal"] = personal
        form_data = llm_data
    else:
        form_data = basic_data

    return {"form_data": form_data, "uuid": None}


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
