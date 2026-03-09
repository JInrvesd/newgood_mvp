from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Personal Info ──────────────────────────────────────────────
class PersonalInfo(BaseModel):
    name: str = ""
    birth_date: Optional[str] = None
    phone: str = ""
    email: str = ""
    address: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None


# ── Education ──────────────────────────────────────────────────
class EducationItem(BaseModel):
    school: str = ""
    major: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    degree: Optional[str] = None
    gpa: Optional[str] = None


# ── Experience ─────────────────────────────────────────────────
class ExperienceItem(BaseModel):
    company: str = ""
    position: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: Optional[str] = None
    skills_used: Optional[List[str]] = []
    project_name: Optional[str] = None


# ── Competency ─────────────────────────────────────────────────
class CompetencyItem(BaseModel):
    name: str = ""
    level: Optional[str] = None  # 초급/중급/고급
    description: Optional[str] = None


# ── Others ─────────────────────────────────────────────────────
class CertificateItem(BaseModel):
    name: str = ""
    date: Optional[str] = None
    issuer: Optional[str] = None


class LanguageItem(BaseModel):
    language: str = ""
    level: Optional[str] = None
    score: Optional[str] = None


class ActivityItem(BaseModel):
    title: str = ""
    date: Optional[str] = None
    description: Optional[str] = None


class OthersInfo(BaseModel):
    certificates: List[CertificateItem] = []
    languages: List[LanguageItem] = []
    activities: List[ActivityItem] = []


# ── Cover Letter ───────────────────────────────────────────────
class CoverLetter(BaseModel):
    mode: Optional[str] = "structured"  # "structured" | "free"
    free_text: Optional[str] = None     # 자유 양식 전문
    growth: Optional[str] = None
    personality: Optional[str] = None
    motivation: Optional[str] = None
    aspiration: Optional[str] = None


# ── Form Data (전체) ───────────────────────────────────────────
class FormData(BaseModel):
    personal: PersonalInfo = PersonalInfo()
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    competency: List[CompetencyItem] = []
    others: OthersInfo = OthersInfo()
    cover_letter: CoverLetter = CoverLetter()


# ── Resume CRUD ────────────────────────────────────────────────
# form_data는 JSONB로 저장되므로 프론트엔드 camelCase를 그대로 보존
class ResumeCreate(BaseModel):
    form_data: dict


class ResumeUpdate(BaseModel):
    form_data: dict


class ResumeResponse(BaseModel):
    id: str
    form_data: dict
    status: str
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ── Analysis Result ────────────────────────────────────────────
class SectionFeedback(BaseModel):
    section: str
    priority: Optional[str] = None
    feedback: str
    improvements: Optional[List[str]] = []
    before_example: Optional[str] = None
    after_example: Optional[str] = None


class Phase1Result(BaseModel):
    structured_resume: dict
    detailed_feedback: List[SectionFeedback]
    cover_letter_feedback: Optional[dict] = None


class Phase2Result(BaseModel):
    knowledge: List[str]
    skill: List[str]
    attitude: List[str]
    knowledge_summary: Optional[str] = None
    skill_summary: Optional[str] = None
    attitude_summary: Optional[str] = None
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    summary: Optional[str] = None
