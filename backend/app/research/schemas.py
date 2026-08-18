
from app.models.research_session import SessionMode
from pydantic import BaseModel, EmailStr


class RespondentDetailsCreate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    company: str | None = None
    role: str | None = None
    company_size: str | None = None


class ResearchSessionCreate(BaseModel):
    study_id: int
    mode: SessionMode
    respondent: RespondentDetailsCreate


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    display_order: int
    question_type: str
    options: list[str] | None = None
    required: bool
    allow_other: bool

    model_config = {
        "from_attributes": True
    }

class AnswerSubmit(BaseModel):
    question_id: int | None = None
    question_text: str | None = None
    answer: str | list[str]