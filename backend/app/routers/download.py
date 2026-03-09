from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.db.supabase_client import get_supabase
from app.services.docx_service import generate_docx

router = APIRouter(prefix="/api/resumes", tags=["download"])


@router.get("/{uuid}/download")
async def download_docx(uuid: str):
    """분석 결과 기반 DOCX 다운로드"""
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

    form_data = resume.data.get("form_data", {})
    result_data = analysis.data[0].get("result_data", {}) if analysis.data else {}

    docx_bytes = await generate_docx(form_data, result_data)

    if not docx_bytes:
        raise HTTPException(status_code=501, detail="DOCX 생성 기능을 준비 중입니다")

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=resume_{uuid[:8]}.docx"},
    )
