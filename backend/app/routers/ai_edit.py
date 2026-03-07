"""
AI 텍스트 편집 라우터
경력기술서 및 자기소개서를 OpenRouter LLM으로 개선합니다.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional
from app.services.llm_service import call_openrouter

router = APIRouter(prefix="/api/ai-edit", tags=["ai-edit"])

# ---------------------------------------------------------------------------
# 시스템 프롬프트
# ---------------------------------------------------------------------------

_CAREER_SYSTEM = """\
당신은 경력 기술서 전문 컨설턴트입니다.
주어진 경력 기술 내용을 아래 원칙에 따라 개선하세요.

## 개선 원칙
1. 맞춤법/오타/띄어쓰기를 교정합니다
2. 업무 나열 대신 구체적 성과와 기여를 강조합니다
3. 적극적 동사(주도했다, 구현했다, 달성했다 등)를 활용합니다
4. 불필요한 반복이나 장황한 표현을 제거합니다
5. 원본의 사실 관계를 절대 변경하거나 없는 내용을 추가하지 않습니다

## 응답 형식
개선된 텍스트만 출력하세요. 설명이나 부가 정보는 포함하지 마세요."""

_COVER_FREE_SYSTEM = """\
당신은 자기소개서 전문 컨설턴트입니다.
주어진 자유 형식 자기소개서를 아래 원칙에 따라 개선하세요.

## 개선 원칙
1. 내용의 흐름에 따라 적절한 소제목을 추가합니다 (예: [성장과정] [지원동기] [입사 후 포부])
2. 각 단락은 두괄식으로 핵심 메시지를 첫 문장에 배치합니다
3. 맞춤법/오타/띄어쓰기를 교정합니다
4. 채용 담당자가 한눈에 파악할 수 있도록 구조와 가독성을 개선합니다
5. 원본의 사실과 내용을 변경하거나 없는 내용을 추가하지 않습니다

## 응답 형식
개선된 텍스트만 출력하세요. 설명이나 부가 정보는 포함하지 마세요."""

_COVER_STRUCTURED_SYSTEM = """\
당신은 자기소개서 전문 컨설턴트입니다.
주어진 자기소개서 항목을 아래 원칙에 따라 개선하세요.

## 개선 원칙
1. 두괄식으로 핵심 메시지를 첫 문장에 배치합니다
2. 맞춤법/오타/띄어쓰기를 교정합니다
3. 모호한 표현을 구체적으로 바꿉니다 (원본에 없는 내용 추가 금지)
4. 채용 담당자가 읽기 쉬운 구조로 개선합니다
5. 원본의 사실 관계를 절대 변경하지 않습니다

## 응답 형식
개선된 텍스트만 출력하세요. 설명이나 부가 정보는 포함하지 마세요."""

# ---------------------------------------------------------------------------
# 요청/응답 스키마
# ---------------------------------------------------------------------------


class CareerEditRequest(BaseModel):
    text: str


class CoverLetterEditRequest(BaseModel):
    text: str
    type: Literal["free", "structured"]
    field: Optional[str] = None  # structured일 때 항목명 (growth, personality, motivation, aspiration)


class EditResponse(BaseModel):
    text: str


# ---------------------------------------------------------------------------
# 엔드포인트
# ---------------------------------------------------------------------------


@router.post("/career", response_model=EditResponse)
async def ai_edit_career(payload: CareerEditRequest):
    """경력기술서 주요 성과 AI 개선"""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="텍스트가 비어 있습니다")

    user_content = f"다음 경력 기술 내용을 개선해 주세요:\n\n{payload.text}"

    try:
        result = await call_openrouter(
            system_prompt=_CAREER_SYSTEM,
            user_content=user_content,
            timeout_seconds=30.0,
        )
        return EditResponse(text=result.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 편집 실패: {str(e)}")


@router.post("/cover-letter", response_model=EditResponse)
async def ai_edit_cover_letter(payload: CoverLetterEditRequest):
    """자기소개서 AI 개선"""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="텍스트가 비어 있습니다")

    if payload.type == "free":
        system_prompt = _COVER_FREE_SYSTEM
        user_content = f"다음 자기소개서를 소제목과 두괄식 구조로 개선해 주세요:\n\n{payload.text}"
    else:
        field_labels = {
            "growth": "성장과정",
            "personality": "성격/장단점",
            "motivation": "지원동기",
            "aspiration": "입사 후 포부",
        }
        label = field_labels.get(payload.field or "", "자기소개서 항목")
        system_prompt = _COVER_STRUCTURED_SYSTEM
        user_content = f"다음 [{label}] 항목을 두괄식으로 개선해 주세요:\n\n{payload.text}"

    try:
        result = await call_openrouter(
            system_prompt=system_prompt,
            user_content=user_content,
            timeout_seconds=30.0,
        )
        return EditResponse(text=result.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 편집 실패: {str(e)}")
