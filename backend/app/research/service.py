import json

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.research_session import SessionMode
from app.models.study import Study
from app.research.repository import ResearchRepository
from app.research.schemas import (
    AnswerSubmit,
    QuestionResponse,
    ResearchSessionCreate,
)

from app.ai.orchestrator import ai_orchestrator
from app.ai.schemas import (
    AIResearchContext,
    ConversationContext,
)
from app.models.respondent import RespondentDetails


class ResearchService:

    MAX_DEEP_ANALYSIS_TURNS = 12

    def __init__(self) -> None:
        self.repository = ResearchRepository()

    def create_session(
        self,
        db: Session,
        data: ResearchSessionCreate,
    ):
        study = db.scalar(
            select(Study).where(Study.id == data.study_id)
        )

        if study is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study not found",
            )

        return self.repository.create_session(
            db=db,
            data=data,
        )

    def get_next_question(
        self,
        db: Session,
        session_id: int,
    ) -> QuestionResponse:

        session = self.repository.get_session(
            db=db,
            session_id=session_id,
        )

        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research session not found",
            )

        if session.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Research session is not active",
            )

        questions = self.repository.get_questions_for_study(
            db=db,
            study_id=session.study_id,
        )

        answered_question_ids = (
            self.repository.get_answered_question_ids(
                db=db,
                session_id=session_id,
            )
        )

        for question in questions:
            if question.id not in answered_question_ids:
                return QuestionResponse.model_validate(question)

        self.repository.complete_session(
            db=db,
            session=session,
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research session completed",
        )

    def submit_answer(
        self,
        db: Session,
        session_id: int,
        data: AnswerSubmit,
    ):

        session = self.repository.get_session(
            db=db,
            session_id=session_id,
        )

        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research session not found",
            )

        if session.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Research session is not active",
            )

        answer_value = (
            json.dumps(data.answer)
            if isinstance(data.answer, list)
            else data.answer
        )

        if session.mode == SessionMode.DEEP_ANALYSIS:
            if not data.question_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="question_text is required for deep analysis sessions",
                )

            return self.repository.create_conversation_turn(
                db=db,
                session_id=session_id,
                question_id=None,
                question_text=data.question_text,
                user_answer=answer_value,
            )

        # GENERIC flow (unchanged behavior)
        if not data.question_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="question_id is required for generic sessions",
            )

        question = self.repository.get_question(
            db=db,
            question_id=data.question_id,
        )

        if question is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found",
            )

        if question.study_id != session.study_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question does not belong to this study",
            )

        return self.repository.create_conversation_turn(
            db=db,
            session_id=session_id,
            question_id=question.id,
            question_text=question.question_text,
            user_answer=answer_value,
        )

    def get_deep_analysis_question(
        self,
        db: Session,
        session_id: int,
    ):

        session = self.repository.get_session(
            db=db,
            session_id=session_id,
        )

        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research session not found",
            )

        if session.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Research session is not active",
            )

        if session.mode != SessionMode.DEEP_ANALYSIS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Research session is not configured for deep analysis",
            )

        respondent = db.scalar(
            select(RespondentDetails).where(
                RespondentDetails.session_id == session_id
            )
        )

        conversation = self.repository.get_conversation_history(
            db=db,
            session_id=session_id,
        )

        # Safety cap: force completion if we've hit the max turn count,
        # regardless of what the AI says.
        if len(conversation) >= self.MAX_DEEP_ANALYSIS_TURNS:
            self.repository.complete_session(
                db=db,
                session=session,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Research session completed",
            )

        context = AIResearchContext(
            study=session.study.name,
            respondent={
                "name": respondent.name if respondent else None,
                "email": respondent.email if respondent else None,
                "company": respondent.company if respondent else None,
                "role": respondent.role if respondent else None,
                "company_size": respondent.company_size if respondent else None,
            },
            conversation=[
                ConversationContext(
                    question=turn.question_text,
                    answer=turn.user_answer,
                )
                for turn in conversation
            ],
        )

        ai_response = ai_orchestrator.generate_next_question(
            context=context,
        )

        if not ai_response.should_continue:
            self.repository.complete_session(
                db=db,
                session=session,
            )

        return ai_response