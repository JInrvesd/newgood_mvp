from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import StreamingResponse
from app.db.supabase_client import get_supabase
import json

router = APIRouter(prefix="/api/resumes", tags=["analysis"])

UUID_PATTERN = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"


@router.get("/{uuid}/analyze")
async def analyze_resume(uuid: str = Path(..., pattern=UUID_PATTERN)):
    """SSE 스트리밍으로 2단계 분석 실행"""
    db = get_supabase()

    result = db.table("resumes").select("*").eq("id", uuid).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    resume = result.data
    form_data = resume.get("form_data", {})

    # H6: 분석 횟수 제한은 llm_service의 generator 내부에서만 체크 (원자적으로)
    # C3: 중복 상태 업데이트 제거 — llm_service에서만 관리

    async def event_generator():
        try:
            from app.services.llm_service import analyze_resume_stream
            async for event in analyze_resume_stream(uuid, form_data):
                yield f"event: {event['event']}\ndata: {json.dumps(event['data'], ensure_ascii=False)}\n\n"
        except Exception as e:
            # C3: 스트림 중단 시 상태 복구
            try:
                db.table("resumes").update({"status": "draft"}).eq("id", uuid).execute()
            except Exception:
                pass
            yield f"event: error\ndata: {json.dumps({'message': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
