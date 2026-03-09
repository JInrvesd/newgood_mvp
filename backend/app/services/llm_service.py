"""
NewGood Resume Analyzer - LLM Service
======================================
OpenRouter API를 통해 Claude Sonnet 4 모델을 호출하고,
SSE 2단계 스트리밍 분석 결과를 생성하는 서비스 모듈.

Phase 1: 상세 피드백 & 구조화 (15~25초)
Phase 2: KSA 역량 정리 (10~20초)
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
당신은 대기업 인사팀에서 10년 이상 근무한 HR 채용 전문가입니다.
수천 건의 이력서를 검토해 온 경험을 바탕으로, 이력서의 강점은 더욱 돋보이게 하고
약점은 구체적으로 보완할 수 있도록 실질적인 조언을 제공합니다.

## 핵심 역할 — HR 채용 전문가 관점
1. 채용 담당자가 실제로 중요하게 보는 포인트를 기준으로 피드백합니다
2. 이력서의 강점을 파악하여 더 효과적으로 어필할 수 있도록 조언합니다
3. 약점을 솔직하게 지적하되, 반드시 구체적인 보완 방법을 함께 제시합니다
4. 경력 기술서와 자기소개서는 반드시 두괄식으로 작성하도록 안내합니다
5. 대괄호([]) 소제목 형식으로 가독성을 높이도록 제안합니다

## 두괄식 작성 원칙
- 각 단락/항목의 첫 문장에 핵심 메시지(결론)를 배치합니다
- 이후 문장에서 근거, 사례, 세부사항을 보충합니다
- 채용 담당자가 첫 문장만 읽어도 요점을 파악할 수 있어야 합니다

## 대괄호 소제목 형식 (중요 — 반드시 내용을 요약하는 임팩트 있는 제목으로 작성)
- 소제목은 단순 카테고리명(성장과정, 지원동기 등)이 아니라, 해당 내용의 핵심을 함축하는 매력적인 문구여야 합니다
- 채용 담당자가 소제목만 읽어도 내용이 궁금해지도록 작성합니다
- 자기소개서 예시:
  - BAD: [성장과정] → 성의 없는 카테고리 나열
  - GOOD: [땀과 성실함으로 이뤄낸 일본 자전거 일주] → 내용의 핵심이 담긴 제목
  - GOOD: [스타트업에서 배운 '안 되면 되게 하라'의 정신]
  - GOOD: [고객 100명의 목소리로 만든 서비스 개선안]
- 경력 기술서 예시:
  - BAD: [프로젝트 개요] → 누구나 쓸 수 있는 제목
  - GOOD: [월 거래액 50억 결제 시스템 안정화]
  - GOOD: [3개월 만에 MAU 200% 성장시킨 마케팅 전략]
  - GOOD: [레거시 시스템을 클라우드로 전환한 6개월의 여정]
- 소제목은 내용의 흐름에 맞게 자연스럽게 배치하되, 반드시 내용을 읽고 핵심을 담아야 합니다

## Action Verb 가이드 (한국어)
- 리더십: 주도했다, 이끌었다, 총괄했다, 관리했다, 조율했다
- 성과: 달성했다, 개선했다, 향상시켰다, 증가시켰다, 절감했다
- 기획: 설계했다, 기획했다, 수립했다, 제안했다, 도입했다
- 실행: 구현했다, 개발했다, 구축했다, 운영했다, 실행했다
- 분석: 분석했다, 조사했다, 평가했다, 검증했다, 진단했다

## 경력 기술서 KPI 원칙
- 정량적 KPI와 정성적 KPI를 모두 포함하도록 제안합니다
- 정량적 KPI 예: "매출 15% 증가", "처리 시간 30% 단축", "고객 만족도 4.5/5.0 달성"
- 정성적 KPI 예: "팀 간 협업 프로세스 정착", "신규 고객 온보딩 체계 구축", "사내 교육 문화 확산"
- 원본에 정량적 KPI가 없으면 반드시 "정량적 수치가 확인되지 않습니다. 가능하다면 구체적 수치를 추가하세요."라고 명시합니다
- 없는 수치를 절대 만들어내지 않습니다

## 프로젝트 경험 미작성 시 조언 (중요)
- 경력에 프로젝트 경험이 구체적으로 작성되지 않은 경우, 반드시 아래와 같은 조언을 추가합니다:
  - "프로젝트 단위로 경험을 정리하면 채용 담당자가 역량을 구체적으로 파악할 수 있습니다"
  - "각 프로젝트에 정량적 성과(매출 증가율, 비용 절감액, 처리 건수, 사용자 수 등)를 반드시 포함하세요"
  - "정량적 수치가 없는 경력 기술은 채용 심사에서 변별력이 크게 떨어집니다"
  - 정량적 성과를 작성할 수 있도록 유도하는 질문 예시를 제시합니다:
    예: "이 업무로 인해 매출/효율/고객만족도가 얼마나 변했나요?", "담당 프로젝트의 규모(예산/인원/기간)는 어느 정도였나요?"

## 이직 사유 체크 (중요)
- 경력이 2개 이상인 경우, 이직 사유(퇴사 사유)가 이력서에 누락되어 있는지 반드시 확인합니다
- 이직 사유가 없으면 detailed_feedback의 "경력" 섹션에 아래 내용을 포함합니다:
  - "이직 사유가 누락되어 있습니다. 면접에서 반드시 질문받는 항목이므로, 긍정적인 관점에서 이직 사유를 준비하세요."
  - "예: '더 큰 규모의 프로젝트에 도전하기 위해', '전문성을 심화할 수 있는 환경을 찾아'"
  - "이직 사유는 부정적 표현(불만, 갈등)을 피하고, 성장/도전/전문성 관점에서 작성하세요."

## 경력 기간 분석
- 각 경력의 startDate와 endDate(또는 isCurrent)를 확인하여 근무 기간을 계산합니다
- experience_highlights의 period 필드에 "YYYY.MM ~ YYYY.MM (X년 Y개월)" 형식으로 기재합니다
- 재직 중인 경우 "YYYY.MM ~ 현재 (X년 Y개월)" 형식으로 기재합니다
- 총 경력 기간도 summary_statement에 반영합니다

## 구조화 원칙
- 경력 기술: [Action Verb] + [구체적 업무] + [정량적/정성적 성과]
  예: "[핵심 성과] 마케팅 캠페인을 기획하여 전환율을 15% 향상시키고, 부서 간 협업 체계를 정착시켰다"
- 역량: 카테고리별 그룹핑 (기술 스킬 / 소프트 스킬 / 도구)
- 자기소개서: 두괄식 구조 + 대괄호 소제목 (핵심 메시지 → 근거 → 포부)

## 절대 원칙
- 허위 내용 추가 금지: 없는 경력, 프로젝트, 수치를 만들어내지 않습니다
- 표현 방식 개선만 제안합니다 (내용 날조 금지)
- 원본 이력서의 사실 관계를 변경하지 않습니다
- 모든 응답은 한국어로 작성합니다

## 피드백 작성 가이드 — HR 전문가 톤
- "채용 담당자 입장에서..." 로 시작하는 실질적 조언을 포함하세요
- 강점은 "이 부분은 채용 심사에서 좋은 인상을 줄 수 있습니다"처럼 구체적으로 언급하세요
- 약점 피드백 시 절대 금지 표현: "보완이 필요합니다", "강화하세요", "스펙을 키우세요", "역량을 높이세요"
- 약점은 반드시 구체적인 행동 지침과 함께 제시하세요
  - BAD: "경력 기술이 미흡합니다. 보완이 필요합니다."
  - GOOD: "경력 기술에서 '주간 리포트 작성' 같은 업무 나열을 '주간 리포트를 자동화하여 작성 시간을 50% 단축했다'처럼 성과 중심으로 바꾸세요."
- before/after 예시는 반드시 원본 이력서 내용 기반으로 작성하세요

응답은 반드시 아래 JSON 형식으로만 출력하세요. JSON 외 텍스트는 포함하지 마세요:
{
  "structured_resume": {
    "personal": {
      "name": "<이름>",
      "contact": "<연락처>",
      "email": "<이메일>",
      "summary_statement": "<1-2문장 프로필 요약 (총 경력 기간 포함, 원본 기반 개선)>"
    },
    "experience_highlights": [
      {
        "company": "<회사명>",
        "position": "<직위>",
        "period": "<YYYY.MM ~ YYYY.MM (X년 Y개월) 또는 YYYY.MM ~ 현재 (X년 Y개월)>",
        "original_description": "<원본 직무 기술>",
        "improved_description": "<두괄식 + 내용 핵심을 함축한 대괄호 소제목(예: [월 매출 30% 성장을 이끈 캠페인 기획]) + 성과 중심 기술>",
        "action_verbs_used": ["<사용된 Action Verb>"],
        "quantitative_kpi": "<정량적 성과 (있으면 기재, 없으면 '정량적 수치가 확인되지 않습니다. 가능하다면 구체적 수치를 추가하세요.')>",
        "qualitative_kpi": "<정성적 성과 (팀워크, 프로세스 개선, 문화 기여 등)>"
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
      "feedback": "<HR 전문가 관점의 상세 피드백 3-5문장 — 강점은 돋보이게, 약점은 보완 방법과 함께>",
      "improvements": ["<구체적 개선사항>"],
      "before_example": "<개선 전 (원본에서 발췌)>",
      "after_example": "<개선 후 제안 (두괄식 + 내용 핵심을 함축한 대괄호 소제목 적용)>"
    }
  ],
  "cover_letter_feedback": {
    "overall": "<자기소개서 전반 평가 — HR 전문가 관점>",
    "structure": "<두괄식 + 대괄호 소제목 구조 개선 제안>",
    "content": "<내용 개선 제안 — 채용 담당자가 실제로 보는 포인트 기준>",
    "improved_opening": "<개선된 첫 문단 제안 (두괄식 적용, 있을 경우)>"
  }
}

섹션명 목록: 기본정보, 학력, 경력, 역량/스킬, 자격증/어학, 자기소개서
- 경력 섹션에는 반드시 이직 사유 누락 여부를 체크하고, 프로젝트 경험 미작성 시 정량적 성과 작성을 유도하는 조언을 포함하세요.
- cover_letter_feedback는 자기소개서 데이터가 없으면 각 필드를 "자기소개서가 제공되지 않았습니다"로 채우세요."""

PHASE2_SYSTEM_PROMPT = """\
당신은 HR 역량 분석 전문가입니다.
이력서 전체 내용(경력, 학력, 자격증, 스킬, 자기소개서 등)을 종합 분석하여
KSA(Knowledge-Skill-Attitude) 프레임워크에 따라 핵심 역량을 추출하고,
이력서의 강점과 약점을 명확하게 정리합니다.

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

## 추출 소스 우선순위
1. 경력 사항 (가장 중요한 역량 근거)
2. 보유 스킬/역량 직접 기재 내용
3. 자격증/어학 성적
4. 학력 (전공, 관련 과목)
5. 자기소개서 (태도 역량의 주요 근거)
6. 기타 활동 (봉사, 대외활동 등)

## 한 줄 요약 + 강점/약점 분석 (필수)
- K, S, A 각각에 대해 한 줄로 요약합니다
- 이력서 전체의 강점과 약점을 구체적으로 정리합니다
- 강점: 이력서에서 잘 드러나는 역량, 차별화 포인트를 구체적으로 언급
- 약점 작성 원칙 (매우 중요):
  - "보완이 필요합니다", "스펙을 키우세요", "역량을 강화하세요" 같은 추상적·일반적 표현 절대 금지
  - 반드시 HR 전문가 시점에서 구체적인 보완 행동을 제시합니다
  - BAD 예시: "프로젝트 경험이 부족합니다. 보완이 필요합니다." → 아무 도움이 안 되는 조언
  - GOOD 예시: "경력 기술에 프로젝트 단위 성과가 없습니다. 현재 담당 업무에서 '처리 건수 월 평균 XX건', '고객 응대 만족도 X점' 등 측정 가능한 수치를 1~2개 추가하세요."
  - GOOD 예시: "이직 사유가 누락되어 있습니다. 면접에서 반드시 질문받으므로, '더 큰 규모의 프로젝트를 경험하기 위해'처럼 성장 관점의 사유를 자기소개서 또는 경력 기술서에 한 줄 추가하세요."
  - GOOD 예시: "자기소개서에서 지원 직무와의 연결이 약합니다. 첫 문단에 '3년간 OO 업무를 수행하며 쌓은 XX 역량을 바탕으로 귀사의 OO 직무에 기여하겠습니다'와 같이 직무-역량 연결 문장을 넣으세요."
  - 각 약점마다 "~하세요"로 끝나는 구체적 행동 지침이 반드시 포함되어야 합니다

응답은 반드시 아래 JSON 형식으로만 출력하세요. JSON 외 텍스트는 포함하지 마세요:
{
  "knowledge": [
    "<보유 지식/전문성 항목>"
  ],
  "skill": [
    "<보유 기술/능력 항목>"
  ],
  "attitude": [
    "<태도/역량 항목>"
  ],
  "knowledge_summary": "<Knowledge 한 줄 요약 — 이 이력서에서 드러나는 지식 역량의 핵심>",
  "skill_summary": "<Skill 한 줄 요약 — 이 이력서에서 드러나는 기술 역량의 핵심>",
  "attitude_summary": "<Attitude 한 줄 요약 — 이 이력서에서 드러나는 태도 역량의 핵심>",
  "strengths": [
    "<강점1: 구체적으로 무엇이 잘 드러나는지>",
    "<강점2>"
  ],
  "weaknesses": [
    "<약점1: 무엇이 부족한지 + 구체적으로 어떻게 보완하면 되는지 행동 지침까지 포함>",
    "<약점2: 마찬가지로 ~하세요 형태의 구체적 보완 방법 포함>"
  ],
  "summary": "<KSA 역량 종합 요약 2-3문장>"
}

각 배열에는 최소 3개 이상의 항목을 포함하세요.
strengths와 weaknesses는 각각 2~5개 항목을 포함하세요.
이력서 내용이 부족하여 추출할 수 없는 영역이 있다면, 해당 배열에 "이력서에서 관련 정보를 확인할 수 없습니다"를 포함하세요."""

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
    {
      "schoolName": "",
      "major": "",
      "enrollDate": "",
      "graduateDate": "",
      "degree": "",
      "gpa": ""
    }
  ],
  "experience": [
    {
      "companyName": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "description": ""
    }
  ],
  "competency": [
    {
      "name": "",
      "level": "중급",
      "description": ""
    }
  ],
  "others": {
    "certificates": [{ "name": "", "date": "", "issuer": "" }],
    "languages": [{ "language": "", "level": "", "score": "" }],
    "activities": [{ "name": "", "date": "", "description": "" }]
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
    {
        "phase": 1,
        "name": "상세 피드백 & 구조화",
        "estimated_seconds": 25,
        "timeout_seconds": 90,
        "system_prompt": PHASE1_SYSTEM_PROMPT,
    },
    {
        "phase": 2,
        "name": "KSA 역량 분석",
        "estimated_seconds": 20,
        "timeout_seconds": 60,
        "system_prompt": PHASE2_SYSTEM_PROMPT,
    },
]

# ---------------------------------------------------------------------------
# OpenRouter API 호출
# ---------------------------------------------------------------------------


async def call_openrouter(
    system_prompt: str,
    user_content: str,
    timeout_seconds: float = 60.0,
) -> str:
    """
    OpenRouter API 호출 (non-streaming, JSON 응답).

    Args:
        system_prompt: 시스템 프롬프트
        user_content: 사용자 메시지 (이력서 데이터 등)
        timeout_seconds: HTTP 요청 타임아웃 (초)

    Returns:
        LLM 응답 텍스트 (JSON 문자열)

    Raises:
        httpx.HTTPStatusError: API 호출 실패 시
        httpx.TimeoutException: 타임아웃 시
    """
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
    """
    LLM 응답에서 JSON을 안전하게 추출합니다.
    코드블록(```json ... ```) 래핑을 제거하고 파싱합니다.

    1차: 전체 텍스트 직접 파싱
    2차: 코드블록 제거 후 파싱
    3차: 정규식으로 첫 번째 JSON 객체 추출 후 파싱
    """
    # 1차 시도: 원본 텍스트 직접 파싱
    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # 2차 시도: 코드블록 제거 후 파싱
    cleaned = re.sub(r"```json\s*", "", stripped)
    cleaned = re.sub(r"```\s*", "", cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3차 시도: 정규식으로 JSON 객체 추출
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # 모든 시도 실패 시 예외
    raise json.JSONDecodeError(
        "LLM 응답에서 유효한 JSON을 추출할 수 없습니다",
        text,
        0,
    )


# ---------------------------------------------------------------------------
# 분석 결과 DB 저장
# ---------------------------------------------------------------------------


async def save_analysis_result(
    resume_id: str,
    phase_data: dict,
    version: int,
) -> None:
    """
    분석 결과를 Supabase analysis_results 테이블에 저장합니다.
    동일 resume_id + version 조합이 있으면 JSONB merge, 없으면 새로 생성합니다.

    Args:
        resume_id: 이력서 UUID
        phase_data: Phase별 분석 결과 (예: {"phase1": {...}})
        version: 분석 버전 (1~5)
    """
    db = get_supabase()

    try:
        # 동일 resume_id + version 조합 조회
        existing = (
            db.table("analysis_results")
            .select("*")
            .eq("resume_id", resume_id)
            .eq("version", version)
            .limit(1)
            .execute()
        )

        if existing.data:
            # 기존 결과에 JSONB merge
            current_data = existing.data[0].get("result_data", {})
            current_data.update(phase_data)
            (
                db.table("analysis_results")
                .update({"result_data": current_data})
                .eq("id", existing.data[0]["id"])
                .execute()
            )
            print(
                f"[LLM] DB 업데이트 완료: resume={resume_id}, version={version}"
            )
        else:
            # 새 결과 생성
            (
                db.table("analysis_results")
                .insert(
                    {
                        "resume_id": resume_id,
                        "version": version,
                        "result_data": phase_data,
                    }
                )
                .execute()
            )
            print(
                f"[LLM] DB 신규 저장 완료: resume={resume_id}, version={version}"
            )

    except Exception as e:
        print(f"[LLM] DB 저장 실패: resume={resume_id}, error={e}")
        # DB 저장 실패가 분석 흐름을 중단시키지 않도록 예외를 전파하지 않음


# ---------------------------------------------------------------------------
# 2단계 SSE 스트리밍 분석
# ---------------------------------------------------------------------------


async def analyze_resume_stream(
    uuid: str,
    form_data: dict,
) -> AsyncGenerator[dict, None]:
    """
    2단계 SSE 스트리밍 분석을 수행합니다.
    각 단계의 시작(phase_start) / 완료(phase_complete) 이벤트를 yield하고,
    모든 단계 완료 시 analysis_done 이벤트를 yield합니다.

    Args:
        uuid: 이력서 UUID
        form_data: 7단계 폼 데이터 (JSONB)

    Yields:
        SSE 이벤트 dict: {"event": str, "data": dict}
    """
    db = get_supabase()

    # 분석 버전 계산 (기존 분석 횟수 + 1, 최대 5)
    try:
        count_result = (
            db.table("analysis_results")
            .select("id", count="exact")
            .eq("resume_id", uuid)
            .execute()
        )
        version = (count_result.count or 0) + 1
    except Exception:
        version = 1

    if version > 5:
        yield {
            "event": "error",
            "data": {
                "message": "최대 분석 횟수(5회)를 초과했습니다. 유료 전환을 안내드립니다.",
                "phase": 0,
            },
        }
        return

    # resume 상태를 analyzing으로 업데이트
    try:
        db.table("resumes").update({"status": "analyzing"}).eq(
            "id", uuid
        ).execute()
    except Exception as e:
        print(f"[LLM] resume 상태 업데이트 실패: {e}")

    print(
        f"[LLM] === 분석 시작 === resume={uuid}, version={version}, "
        f"time={datetime.now().isoformat()}"
    )

    accumulated_result = {}

    for config in PHASE_CONFIGS:
        phase_num = config["phase"]
        phase_name = config["name"]

        # Phase Start 이벤트
        print(f"[LLM] Phase {phase_num} 시작: {phase_name}")
        yield {
            "event": "phase_start",
            "data": {
                "phase": phase_num,
                "name": phase_name,
                "estimated_seconds": config["estimated_seconds"],
            },
        }

        try:
            # 유저 프롬프트 구성 (Phase별로 다른 컨텍스트 제공)
            form_data_str = json.dumps(form_data, ensure_ascii=False, indent=2)

            if phase_num == 1:
                user_content = (
                    "다음 이력서의 상세 피드백과 구조화된 개선 제안을 제공해주세요.\n"
                    "경력 기술서와 자기소개서는 두괄식 + 대괄호 소제목 형식으로 개선하고,\n"
                    "경력 프로젝트의 KPI는 정량적/정성적 부분을 모두 포함해주세요.\n\n"
                    f"=== 이력서 데이터 ===\n{form_data_str}"
                )
            else:  # phase 2
                user_content = (
                    "다음 이력서에서 KSA(Knowledge-Skill-Attitude) "
                    "역량을 추출하고, K/S/A 각각의 한 줄 요약과 "
                    "이력서의 강점/약점을 정리해주세요.\n\n"
                    f"=== 이력서 데이터 ===\n{form_data_str}"
                )

            # OpenRouter API 호출
            raw_response = await call_openrouter(
                system_prompt=config["system_prompt"],
                user_content=user_content,
                timeout_seconds=config["timeout_seconds"],
            )

            # JSON 파싱
            try:
                parsed = extract_json(raw_response)
            except json.JSONDecodeError as parse_err:
                # JSON 파싱 실패 시 raw text를 fallback으로 반환
                print(
                    f"[LLM] Phase {phase_num} JSON 파싱 실패, "
                    f"raw text fallback: {parse_err}"
                )
                parsed = {
                    "raw_response": raw_response,
                    "parse_error": str(parse_err),
                    "_fallback": True,
                }

            # 누적 결과 업데이트
            phase_key = f"phase{phase_num}"
            accumulated_result[phase_key] = parsed

            # DB 저장 (비동기, 실패해도 분석 계속 진행)
            await save_analysis_result(uuid, {phase_key: parsed}, version)

            # Phase Complete 이벤트
            print(f"[LLM] Phase {phase_num} 완료: {phase_name}")
            yield {
                "event": "phase_complete",
                "data": {
                    "phase": phase_num,
                    "name": phase_name,
                    "data": parsed,
                },
            }

        except httpx.TimeoutException:
            error_msg = (
                f"Phase {phase_num} 분석 시간이 초과되었습니다. "
                "잠시 후 다시 시도해주세요."
            )
            print(f"[LLM] Phase {phase_num} 타임아웃: {error_msg}")
            yield {
                "event": "error",
                "data": {
                    "message": error_msg,
                    "phase": phase_num,
                },
            }
            return

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            if status_code == 429:
                error_msg = (
                    "API 요청 한도를 초과했습니다. "
                    "잠시 후 다시 시도해주세요."
                )
            elif status_code == 401:
                error_msg = "API 인증에 실패했습니다. 관리자에게 문의하세요."
            elif status_code >= 500:
                error_msg = (
                    "AI 서비스에 일시적인 문제가 발생했습니다. "
                    "잠시 후 다시 시도해주세요."
                )
            else:
                error_msg = f"API 호출 실패 (HTTP {status_code})"

            print(
                f"[LLM] Phase {phase_num} HTTP 에러: "
                f"status={status_code}, body={e.response.text[:500]}, msg={error_msg}"
            )
            yield {
                "event": "error",
                "data": {
                    "message": error_msg,
                    "phase": phase_num,
                },
            }
            return

        except Exception as e:
            error_msg = f"분석 중 예상치 못한 오류가 발생했습니다: {str(e)}"
            print(
                f"[LLM] Phase {phase_num} 예외: {error_msg}\n"
                f"{traceback.format_exc()}"
            )
            yield {
                "event": "error",
                "data": {
                    "message": error_msg,
                    "phase": phase_num,
                },
            }
            return

    # 모든 Phase 완료 - resume 상태 업데이트
    try:
        db.table("resumes").update({"status": "analyzed"}).eq(
            "id", uuid
        ).execute()
    except Exception as e:
        print(f"[LLM] resume 최종 상태 업데이트 실패: {e}")

    print(
        f"[LLM] === 분석 완료 === resume={uuid}, version={version}, "
        f"time={datetime.now().isoformat()}"
    )

    # analysis_done 이벤트
    yield {
        "event": "analysis_done",
        "data": {
            "resume_id": uuid,
            "total_phases": 2,
            "saved": True,
            "version": version,
        },
    }


# ---------------------------------------------------------------------------
# DOCX 업로드 시 LLM 구조화 파싱
# ---------------------------------------------------------------------------


async def parse_resume_with_llm(raw_text: str) -> dict:
    """
    이력서 원문 텍스트를 LLM으로 구조화된 form_data로 파싱합니다.

    Args:
        raw_text: DOCX에서 추출한 원문 텍스트

    Returns:
        프론트엔드 form_data 스키마에 맞는 dict.
        LLM 호출 실패 시 빈 구조 반환.
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
