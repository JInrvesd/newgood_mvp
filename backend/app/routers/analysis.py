from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.db.supabase_client import get_supabase
import json

router = APIRouter(prefix="/api/resumes", tags=["analysis"])


@router.get("/{uuid}/analyze")
async def analyze_resume(uuid: str):
    """SSE 스트리밍으로 2단계 분석 실행"""
    db = get_supabase()

    result = db.table("resumes").select("*").eq("id", uuid).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="이력서를 찾을 수 없습니다")

    resume = result.data
    form_data = resume.get("form_data", {})

    # 분석 횟수 제한 (최대 5회)
    count_result = (
        db.table("analysis_results")
        .select("id", count="exact")
        .eq("resume_id", uuid)
        .execute()
    )
    if count_result.count is not None and count_result.count >= 5:
        raise HTTPException(status_code=429, detail="분석 횟수(5회)를 초과했습니다. 유료 플랜으로 전환해 주세요.")

    # 상태 업데이트
    db.table("resumes").update({"status": "analyzing"}).eq("id", uuid).execute()

    async def event_generator():
        try:
            from app.services.llm_service import analyze_resume_stream
            async for event in analyze_resume_stream(uuid, form_data):
                yield f"event: {event['event']}\ndata: {json.dumps(event['data'], ensure_ascii=False)}\n\n"
        except Exception as e:
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
