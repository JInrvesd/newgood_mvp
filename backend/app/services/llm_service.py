"""
NewGood Resume Analyzer - LLM Service
======================================
OpenRouter API를 통해 Claude Sonnet 4 모델을 호출하고,
SSE 3단계 스트리밍 분석 결과를 생성하는 서비스 모듈.

Phase 1: 가시성 점수 분석 (10~15초)
Phase 2: 상세 피드백 & 구조화 (15~25초)
Phase 3: KSA 역량 정리 (10~20초)
"""

import httpx
import json
import re
import traceback
from datetime import datetime
from typing import AsyncGenerator

from app.config import get_settings
from app.db.supabase_client import get_supabase

settings = get_settings()

# ---------------------------------------------------------------------------
# Phase 프롬프트 설정
# ---------------------------------------------------------------------------

PHASE1_SYSTEM_PROMPT = """\
당신은 10년 경력의 한국 채용 전문가이자 이력서 컨설턴트입니다.
이력서를 채용 담당자 관점에서 분석하여 가시성(Visibility) 점수를 평가합니다.

## 평가 기준

### 기본정보 (배점 15점)
- 이름, 연락처, 이메일 등 필수 정보 포함 여부
- 전문적인 이메일 주소 사용 여부
- 프로필 사진 적절성 (있을 경우)
- LinkedIn/포트폴리오 링크 포함 여부

### 학력 (배점 10점)
- 학교명, 전공, 졸업연도 명확성
- GPA/학점 기재 여부 (신입 지원자의 경우 중요도 높음)
- 관련 수상/활동 포함 여부

### 경력 (배점 30점)
- 회사명, 직위, 근무기간 명확성
- 성과 중심 기술 vs 업무 나열식 기술
- 구체적 수치/KPI 포함 여부 (매출 증가율, 프로젝트 규모 등)
- Action Verb(성과 동사) 활용도
- STAR 기법 적용 여부 (Situation-Task-Action-Result)

### 역량/스킬 (배점 15점)
- 직무 관련 핵심 스킬 명시 여부
- 기술 수준(초급/중급/고급) 표기 여부
- 업계 표준 키워드/기술 용어 사용 여부

### 자격증/어학 (배점 10점)
- 직무 관련 자격증 포함 여부
- 어학 성적 명시 여부
- 자격증/어학 유효기간 관리 여부

### 자기소개서 (배점 20점)
- 지원 동기의 구체성
- 직무 연관성
- 차별화 포인트 존재 여부
- 문장 구조와 가독성
- 적절한 분량 (300~600자 권장)

## 절대 원칙
- 허위 경험이나 사실을 절대 추가하지 않습니다
- 이력서에 있는 내용만을 바탕으로 점수와 피드백을 제공합니다
- 없는 경력이나 스킬을 만들어내지 않습니다
- 모든 응답은 한국어로 작성합니다

## 피드백 작성 가이드
- 구체적이고 실행 가능한 피드백을 제공하세요
- "~하면 좋겠습니다" 대신 "~로 변경하세요"처럼 명확하게 안내하세요
- before/after 예시는 실제 이력서 내용을 바탕으로 작성하세요
- 해당 섹션 내용이 없거나 빈약하면 솔직하게 낮은 점수를 부여하세요

응답은 반드시 아래 JSON 형식으로만 출력하세요. JSON 외 텍스트는 포함하지 마세요:
{
  "total_score": <0-100 정수>,
  "summary": "<전체 이력서에 대한 2-3문장 종합 평가>",
  "section_scores": [
    {
      "section": "<섹션명>",
      "score": <0-100 정수>,
      "weight": <배점 비율 0.0-1.0>,
      "feedback": "<해당 섹션에 대한 구체적 피드백 2-3문장>",
      "improvements": ["<개선사항1>", "<개선사항2>"],
      "before_example": "<개선 전 예시 문장 (이력서에서 발췌, 없으면 빈 문자열)>",
      "after_example": "<개선 후 예시 문장 (위 발췌 기반 개선안, 없으면 빈 문자열)>"
    }
  ]
}

섹션명 목록: 기본정보, 학력, 경력, 역량/스킬, 자격증/어학, 자기소개서
반드시 6개 섹션 모두 포함하세요. 해당 섹션 데이터가 없으면 score를 0으로 하고 "해당 정보가 누락되었습니다"라고 피드백하세요."""

PHASE2_SYSTEM_PROMPT = """\
당신은 경력 10년 이상의 이력서 컨설턴트입니다.
Phase 1에서 산출된 가시성 점수 결과를 바탕으로, 각 섹션별 상세 피드백과
채용 담당자에게 어필할 수 있도록 구조화된 이력서 데이터를 제공합니다.

## 핵심 역할
1. 경력 기술을 성과 중심으로 재구성합니다
2. Action Verb(성과 동사)를 적극 활용합니다
3. 자기소개서의 구조와 설득력을 개선합니다
4. 전체 이력서의 일관성과 전문성을 높입니다

## Action Verb 가이드 (한국어)
- 리더십: 주도했다, 이끌었다, 총괄했다, 관리했다, 조율했다
- 성과: 달성했다, 개선했다, 향상시켰다, 증가시켰다, 절감했다
- 기획: 설계했다, 기획했다, 수립했다, 제안했다, 도입했다
- 실행: 구현했다, 개발했다, 구축했다, 운영했다, 실행했다
- 분석: 분석했다, 조사했다, 평가했다, 검증했다, 진단했다

## 구조화 원칙
- 경력 기술: [Action Verb] + [구체적 업무] + [정량적 성과(있을 경우)]
  예: "마케팅 캠페인을 기획하여 전환율을 15% 향상시켰다"
- 역량: 카테고리별 그룹핑 (기술 스킬 / 소프트 스킬 / 도구)
- 자기소개서: 두괄식 구조 (핵심 메시지 → 근거 → 포부)

## 절대 원칙
- 허위 내용 추가 금지: 없는 경력, 프로젝트, 수치를 만들어내지 않습니다
- 표현 방식 개선만 제안합니다 (내용 날조 금지)
- 구체적인 수치/성과가 원본에 없으면 "구체적 수치 추가 권장"으로만 안내합니다
- 원본 이력서의 사실 관계를 변경하지 않습니다
- 모든 응답은 한국어로 작성합니다

## 피드백 작성 가이드
- Phase 1보다 더 구체적이고 실행 가능한 피드백을 제공하세요
- before/after 예시는 반드시 원본 이력서 내용 기반으로 작성하세요
- 개선 제안은 바로 적용할 수 있을 정도로 구체적으로 작성하세요

응답은 반드시 아래 JSON 형식으로만 출력하세요. JSON 외 텍스트는 포함하지 마세요:
{
  "structured_resume": {
    "personal": {
      "name": "<이름>",
      "contact": "<연락처>",
      "email": "<이메일>",
      "summary_statement": "<1-2문장 프로필 요약 (원본 기반 개선)>"
    },
    "experience_highlights": [
      {
        "company": "<회사명>",
        "position": "<직위>",
        "period": "<근무기간>",
        "original_description": "<원본 직무 기술>",
        "improved_description": "<성과 중심으로 개선된 직무 기술>",
        "action_verbs_used": ["<사용된 Action Verb>"],
        "quantifiable_results": "<정량적 성과 (있으면 기재, 없으면 '수치 추가 권장')>"
      }
    ],
    "skill_categories": {
      "technical": ["<기술 스킬>"],
      "soft": ["<소프트 스킬>"],
      "tools": ["<도구/프레임워크>"]
    }
  },
  "detailed_feedback": [
    {
      "section": "<섹션명>",
      "priority": "<high/medium/low>",
      "feedback": "<상세 피드백 3-5문장>",
      "improvements": ["<구체적 개선사항>"],
      "before_example": "<개선 전 (원본에서 발췌)>",
      "after_example": "<개선 후 제안>"
    }
  ],
  "cover_letter_feedback": {
    "overall": "<자기소개서 전반 평가>",
    "structure": "<구조 개선 제안>",
    "content": "<내용 개선 제안>",
    "improved_opening": "<개선된 첫 문단 제안 (있을 경우)>"
  }
}

섹션명 목록: 기본정보, 학력, 경력, 역량/스킬, 자격증/어학, 자기소개서
cover_letter_feedback는 자기소개서 데이터가 없으면 각 필드를 "자기소개서가 제공되지 않았습니다"로 채우세요."""

PHASE3_SYSTEM_PROMPT = """\
당신은 HR 역량 분석 전문가입니다.
이력서 전체 내용(경력, 학력, 자격증, 스킬, 자기소개서 등)을 종합 분석하여
KSA(Knowledge-Skill-Attitude) 프레임워크에 따라 핵심 역량을 추출합니다.

## KSA 프레임워크 정의

### Knowledge (지식)
직무 수행에 필요한 이론적 지식과 전문성.
- 학문적 배경 (전공, 학위)
- 산업/도메인 전문 지식
- 법규/규정/표준에 대한 이해
- 시장/경쟁 환경에 대한 이해
- 예: "디지털 마케팅 전략 수립 지식", "재무회계 기준 이해", "Python 데이터 분석 이론"

### Skill (기술)
실제 업무에서 발휘할 수 있는 측정 가능한 능력.
- 기술적 스킬 (프로그래밍, 데이터 분석, 디자인 등)
- 도구/소프트웨어 활용 능력
- 언어 능력 (외국어, 커뮤니케이션)
- 자격증으로 증명된 전문 기술
- 예: "React/TypeScript 웹 개발", "Excel 고급 데이터 분석", "영어 비즈니스 커뮤니케이션"

### Attitude (태도)
업무 환경에서 드러나는 행동 특성과 가치관.
- 리더십 / 팔로워십
- 팀워크 / 협업 능력
- 문제 해결 자세
- 자기 개발 의지
- 성과 지향성 / 책임감
- 예: "팀 프로젝트 주도적 참여", "자기 주도적 학습 태도", "성과 목표 달성 집중력"

## 추출 원칙
- 이력서에 명시적으로 기재되었거나 내용에서 강하게 추론 가능한 역량만 추출합니다
- 근거 없는 역량을 추가하지 않습니다
- 각 항목은 3~8단어로 간결하고 명확하게 표현합니다
- Knowledge는 5~10개, Skill은 5~15개, Attitude는 3~8개 범위로 추출합니다
- 직무와의 관련성이 높은 순서대로 나열합니다
- 중복되거나 지나치게 일반적인 항목은 제외합니다

응답은 반드시 아래 JSON 형식으로만 출력하세요. JSON 외 텍스트는 포함하지 마세요:
{
  "knowledge": ["<보유 지식/전문성 항목>"],
  "skill": ["<보유 기술/능력 항목>"],
  "attitude": ["<태도/역량 항목>"],
  "summary": "<KSA 역량 종합 요약 2-3문장>"
}

각 배열에는 최소 3개 이상의 항목을 포함하세요."""

PARSE_SYSTEM_PROMPT = """\
당신은 한국 이력서 파싱 전문가입니다.
주어진 이력서 원문 텍스트를 분석하여 아래 JSON 스키마에 맞게 구조화된 데이터를 추출합니다.

## 추출 규칙
- 원문에 명시된 내용만 추출합니다. 없는 정보는 빈 문자열 또는 빈 배열로 남깁니다.
- 날짜 형식: "YYYY-MM" (예: "2020-03"). 연도만 있으면 "YYYY-01".
- 재직 중이면 endDate를 빈 문자열(""), isCurrent를 true로 설정합니다.
- 역량/스킬 level은 반드시 "초급", "중급", "고급" 중 하나로 설정합니다.
- 자기소개서가 있으면 freeText에 전체 내용을 담고 mode를 "free"로 설정합니다.
- 모든 응답은 JSON 형식으로만 출력합니다. JSON 외 텍스트는 포함하지 마세요.

응답 JSON 스키마:
{
  "personal": {
    "name": "",
    "birthDate": "",
    "phone": "",
    "email": "",
    "address": "",
    "linkedinUrl": "",
    "portfolioUrl": ""
  },
  "education": [
    {"schoolName": "", "major": "", "enrollDate": "", "graduateDate": "", "degree": "", "gpa": ""}
  ],
  "experience": [
    {"companyName": "", "position": "", "startDate": "", "endDate": "", "isCurrent": false, "description": ""}
  ],
  "competency": [
    {"name": "", "level": "중급", "description": ""}
  ],
  "others": {
    "certificates": [{"name": "", "date": "", "issuer": ""}],
    "languages": [{"language": "", "level": "", "score": ""}],
    "activities": [{"name": "", "date": "", "description": ""}]
  },
  "coverLetter": {
    "mode": "structured",
    "freeText": "",
    "growth": "",
    "personality": "",
    "motivation": "",
    "aspiration": ""
  }
}"""


# ---------------------------------------------------------------------------
# Phase 설정 배열
# ---------------------------------------------------------------------------

PHASE_CONFIGS = [
    {"phase": 1, "name": "가시성 점수 분석", "estimated_seconds": 15, "timeout_seconds": 60, "system_prompt": PHASE1_SYSTEM_PROMPT},
    {"phase": 2, "name": "상세 피드백 & 구조화", "estimated_seconds": 25, "timeout_seconds": 90, "system_prompt": PHASE2_SYSTEM_PROMPT},
    {"phase": 3, "name": "KSA 역량 정리", "estimated_seconds": 20, "timeout_seconds": 60, "system_prompt": PHASE3_SYSTEM_PROMPT},
]

# ---------------------------------------------------------------------------
# OpenRouter API 호출
# ---------------------------------------------------------------------------


async def call_openrouter(system_prompt: str, user_content: str, timeout_seconds: float = 60.0) -> str:
    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        response = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": settings.site_url,
                "X-Title": "NewGood Resume Analyzer",
            },
            json={
                "model": settings.openrouter_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.3,
                "max_tokens": 4000,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# ---------------------------------------------------------------------------
# JSON 파싱 유틸리티
# ---------------------------------------------------------------------------


def extract_json(text: str) -> dict:
    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass
    cleaned = re.sub(r"```json\s*", "", stripped)
    cleaned = re.sub(r"```\s*", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise json.JSONDecodeError("LLM 응답에서 유효한 JSON을 추출할 수 없습니다", text, 0)


# ---------------------------------------------------------------------------
# 분석 결과 DB 저장
# ---------------------------------------------------------------------------


async def save_analysis_result(resume_id: str, phase_data: dict, version: int) -> None:
    db = get_supabase()
    try:
        existing = db.table("analysis_results").select("*").eq("resume_id", resume_id).eq("version", version).limit(1).execute()
        if existing.data:
            current_data = existing.data[0].get("result_data", {})
            current_data.update(phase_data)
            db.table("analysis_results").update({"result_data": current_data}).eq("id", existing.data[0]["id"]).execute()
            print(f"[LLM] DB 업데이트 완료: resume={resume_id}, version={version}")
        else:
            db.table("analysis_results").insert({"resume_id": resume_id, "version": version, "result_data": phase_data}).execute()
            print(f"[LLM] DB 신규 저장 완료: resume={resume_id}, version={version}")
    except Exception as e:
        print(f"[LLM] DB 저장 실패: resume={resume_id}, error={e}")


# ---------------------------------------------------------------------------
# 3단계 SSE 스트리밍 분석
# ---------------------------------------------------------------------------


async def analyze_resume_stream(uuid: str, form_data: dict) -> AsyncGenerator[dict, None]:
    db = get_supabase()
    try:
        count_result = db.table("analysis_results").select("id", count="exact").eq("resume_id", uuid).execute()
        version = (count_result.count or 0) + 1
    except Exception:
        version = 1

    if version > 5:
        yield {"event": "error", "data": {"message": "최대 분석 횟수(5회)를 초과했습니다. 유료 전환을 안내드립니다.", "phase": 0}}
        return

    try:
        db.table("resumes").update({"status": "analyzing"}).eq("id", uuid).execute()
    except Exception as e:
        print(f"[LLM] resume 상태 업데이트 실패: {e}")

    print(f"[LLM] === 분석 시작 === resume={uuid}, version={version}, time={datetime.now().isoformat()}")

    accumulated_result = {}
    phase1_result = None

    for config in PHASE_CONFIGS:
        phase_num = config["phase"]
        phase_name = config["name"]

        print(f"[LLM] Phase {phase_num} 시작: {phase_name}")
        yield {"event": "phase_start", "data": {"phase": phase_num, "name": phase_name, "estimated_seconds": config["estimated_seconds"]}}

        try:
            form_data_str = json.dumps(form_data, ensure_ascii=False, indent=2)
            if phase_num == 1:
                user_content = f"다음 이력서 데이터를 분석하여 가시성 점수를 평가해주세요.\n\n=== 이력서 데이터 ===\n{form_data_str}"
            elif phase_num == 2:
                phase1_str = json.dumps(phase1_result, ensure_ascii=False, indent=2)
                user_content = f"다음 이력서의 상세 피드백과 구조화된 데이터를 제공해주세요.\n\n=== 이력서 데이터 ===\n{form_data_str}\n\n=== Phase 1 가시성 점수 분석 결과 ===\n{phase1_str}"
            else:
                user_content = f"다음 이력서에서 KSA(Knowledge-Skill-Attitude) 역량을 추출해주세요.\n\n=== 이력서 데이터 ===\n{form_data_str}"

            raw_response = await call_openrouter(
                system_prompt=config["system_prompt"],
                user_content=user_content,
                timeout_seconds=config["timeout_seconds"],
            )

            try:
                parsed = extract_json(raw_response)
            except json.JSONDecodeError as parse_err:
                print(f"[LLM] Phase {phase_num} JSON 파싱 실패, raw text fallback: {parse_err}")
                parsed = {"raw_response": raw_response, "parse_error": str(parse_err), "_fallback": True}

            if phase_num == 1:
                phase1_result = parsed

            phase_key = f"phase{phase_num}"
            accumulated_result[phase_key] = parsed
            await save_analysis_result(uuid, {phase_key: parsed}, version)

            print(f"[LLM] Phase {phase_num} 완료: {phase_name}")
            yield {"event": "phase_complete", "data": {"phase": phase_num, "name": phase_name, "data": parsed}}

        except httpx.TimeoutException:
            error_msg = f"Phase {phase_num} 분석 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
            print(f"[LLM] Phase {phase_num} 타임아웃: {error_msg}")
            yield {"event": "error", "data": {"message": error_msg, "phase": phase_num}}
            return
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            if status_code == 429:
                error_msg = "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
            elif status_code == 401:
                error_msg = "API 인증에 실패했습니다. 관리자에게 문의하세요."
            elif status_code >= 500:
                error_msg = "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            else:
                error_msg = f"API 호출 실패 (HTTP {status_code})"
            print(f"[LLM] Phase {phase_num} HTTP 에러: status={status_code}, body={e.response.text[:500]}")
            yield {"event": "error", "data": {"message": error_msg, "phase": phase_num}}
            return
        except Exception as e:
            error_msg = f"분석 중 예상치 못한 오류가 발생했습니다: {str(e)}"
            print(f"[LLM] Phase {phase_num} 예외: {error_msg}\n{traceback.format_exc()}")
            yield {"event": "error", "data": {"message": error_msg, "phase": phase_num}}
            return

    try:
        db.table("resumes").update({"status": "analyzed"}).eq("id", uuid).execute()
    except Exception as e:
        print(f"[LLM] resume 최종 상태 업데이트 실패: {e}")

    print(f"[LLM] === 분석 완료 === resume={uuid}, version={version}, time={datetime.now().isoformat()}")
    yield {"event": "analysis_done", "data": {"resume_id": uuid, "total_phases": 3, "saved": True, "version": version}}


# ---------------------------------------------------------------------------
# DOCX 업로드 시 LLM 구조화 파싱
# ---------------------------------------------------------------------------


async def parse_resume_with_llm(raw_text: str):
    """
    이력서 원문 텍스트를 LLM으로 구조화된 form_data로 파싱합니다.
    실패 시 None 반환.
    """
    user_content = (
        "다음 이력서 원문을 분석하여 JSON 스키마에 맞게 구조화해 주세요.\n\n"
        f"=== 이력서 원문 ===\n{raw_text}"
    )
    try:
        raw_response = await call_openrouter(
            system_prompt=PARSE_SYSTEM_PROMPT,
            user_content=user_content,
            timeout_seconds=60.0,
        )
        parsed = extract_json(raw_response)
        parsed["_raw_text"] = raw_text
        return parsed
    except Exception as e:
        print(f"[LLM] 이력서 파싱 실패, 기본 구조 반환: {e}")
        return None
