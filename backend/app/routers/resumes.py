from fastapi import APIRouter, HTTPException, UploadFile, File, Path, Query
from app.models.schemas import ResumeCreate, ResumeUpdate
from app.db.supabase_client import get_supabase
from app.services.parser_service import parse_docx_to_form_data
from app.services.llm_service import parse_resume_with_llm
from typing import Optional
import uuid as uuid_lib

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

UUID_PATTERN = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB


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

    # C2: 파일 크기를 청크 단위로 읽으며 제한 (메모리 고갈 방지)
    chunks = []
    total_size = 0
    while True:
        chunk = await file.read(8192)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="파일 크기는 10MB 이하여야 합니다")
        chunks.append(chunk)
    contents = b"".join(chunks)

    # 1차: 기본 텍스트 추출 (regex)
    basic_data = parse_docx_to_form_data(contents)
    extracted_images = basic_data.pop("_extracted_images", [])

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
        # 이미지가 1개면 자동 설정, 2개 이상이면 프론트에서 선택
        if len(extracted_images) == 1:
            personal["photoData"] = extracted_images[0]
        llm_data["personal"] = personal
        form_data = llm_data
    else:
        # 이미지가 2개 이상이면 자동 설정된 첫번째 이미지 제거 (프론트에서 선택)
        if len(extracted_images) > 1:
            basic_data["personal"]["photoData"] = ""
        form_data = basic_data

    # H1: 내부 필드를 응답에서 제거
    form_data.pop("_raw_text", None)

    return {"form_data": form_data, "uuid": None, "extracted_images": extracted_images}


@router.get("/{uuid}")
async def get_resume(uuid: str = Path(..., pattern=UUID_PATTERN)):
    """이력서 조회"""
    db = get_supabase()
    result = db.table("resumes").select("*").eq("id", uuid).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    return result.data


@router.patch("/{uuid}")
async def update_resume(uuid: str = Path(..., pattern=UUID_PATTERN), payload: ResumeUpdate = ...):
    """이력서 수정"""
    db = get_supabase()

    data = {"form_data": payload.form_data}
    result = db.table("resumes").update(data).eq("id", uuid).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    return result.data[0]


@router.get("/{uuid}/result")
async def get_analysis_result(
    uuid: str = Path(..., pattern=UUID_PATTERN),
    version: Optional[int] = Query(None, ge=1, le=5),
):
    """분석 결과 조회 (version 미지정 시 최신)"""
    db = get_supabase()

    resume = db.table("resumes").select("*").eq("id", uuid).single().execute()
    if not resume.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    query = db.table("analysis_results").select("*").eq("resume_id", uuid)
    if version is not None:
        # M1: version 파라미터 지원
        query = query.eq("version", version)
    else:
        query = query.order("version", desc=True)
    query = query.limit(1)
    analysis = query.execute()

    return {
        "resume": resume.data,
        "analysis": analysis.data[0] if analysis.data else None,
    }
