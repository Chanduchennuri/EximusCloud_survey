from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.research.schemas import (
    AnswerSubmit,
    QuestionResponse,
    ResearchSessionCreate,
)
from app.research.service import ResearchService
from app.ai.schemas import AINextQuestion

router = APIRouter(
    prefix="/research",
    tags=["Research"],
)

service = ResearchService()


@router.post(
    "/sessions",
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    data: ResearchSessionCreate,
    db: Session = Depends(get_db),
):
    return service.create_session(
        db=db,
        data=data,
    )

@router.get(
    "/sessions/{session_id}/next-question",
    response_model=QuestionResponse,
)
def get_next_question(
    session_id: int,
    db: Session = Depends(get_db),
):
    return service.get_next_question(
        db=db,
        session_id=session_id,
    )   

@router.post(
    "/sessions/{session_id}/respond",
)
def submit_answer(
    session_id: int,
    data: AnswerSubmit,
    db: Session = Depends(get_db),
):
    return service.submit_answer(
        db=db,
        session_id=session_id,
        data=data,
    )

@router.post(
    "/sessions/{session_id}/deep-analysis/next-question",
    response_model=AINextQuestion,
)
def get_deep_analysis_question(
    session_id: int,
    db: Session = Depends(get_db),
):
    return service.get_deep_analysis_question(
        db=db,
        session_id=session_id,
    )

@router.get(
    "/studies/{study_id}/analytics/summary",
)
def get_analytics_summary(
    study_id: int,
    db: Session = Depends(get_db),
):
    return service.get_analytics_summary(db=db, study_id=study_id)


@router.get(
    "/studies/{study_id}/analytics/questions",
)
def get_analytics_by_question(
    study_id: int,
    db: Session = Depends(get_db),
):
    return service.get_analytics_by_question(db=db, study_id=study_id)

@router.get(
    "/studies/{study_id}/respondents",
)
def get_respondents(
    study_id: int,
    db: Session = Depends(get_db),
):
    return service.get_respondents(db=db, study_id=study_id)