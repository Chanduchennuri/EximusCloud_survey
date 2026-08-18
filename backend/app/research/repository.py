from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.conversation import ConversationTurn
from app.models.question import Question
from app.models.research_session import ResearchSession
from sqlalchemy import func
from app.models.respondent import RespondentDetails
from app.models.research_session import SessionMode

class ResearchRepository:

    def create_session(
        self,
        db: Session,
        data,
    ):
        session = ResearchSession(
            study_id=data.study_id,
            mode=data.mode,
        )

        db.add(session)
        db.flush()

        respondent = data.respondent

        respondent_details = RespondentDetails(
            session_id=session.id,
            name=respondent.name,
            email=respondent.email,
            company=respondent.company,
            role=respondent.role,
            company_size=respondent.company_size,
        )

        db.add(respondent_details)
        db.commit()
        db.refresh(session)

        return session

    def get_session(
        self,
        db: Session,
        session_id: int,
    ) -> ResearchSession | None:

        return db.scalar(
            select(ResearchSession)
            .where(ResearchSession.id == session_id)
        )

    def get_questions_for_study(
        self,
        db: Session,
        study_id: int,
    ) -> list[Question]:

        result = db.scalars(
            select(Question)
            .where(Question.study_id == study_id)
            .order_by(Question.display_order)
        )

        return list(result)

    def get_answered_question_ids(
        self,
        db: Session,
        session_id: int,
    ) -> set[int]:

        result = db.scalars(
            select(ConversationTurn.question_id)
            .where(
                ConversationTurn.session_id == session_id,
                ConversationTurn.question_id.is_not(None),
            )
        )

        return set(result)

    def get_question(
        self,
        db: Session,
        question_id: int,
    ) -> Question | None:

        return db.scalar(
            select(Question)
            .where(Question.id == question_id)
        )

    def create_conversation_turn(
        self,
        db: Session,
        session_id: int,
        question_id: int,
        question_text: str,
        user_answer: str,
    ) -> ConversationTurn:

        turn = ConversationTurn(
            session_id=session_id,
            question_id=question_id,
            question_text=question_text,
            user_answer=user_answer,
        )

        db.add(turn)
        db.commit()
        db.refresh(turn)

        return turn

    def complete_session(
        self,
        db: Session,
        session: ResearchSession,
    ):
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)

        return session

    def get_conversation_history(
        self,
        db: Session,
        session_id: int,
    ) -> list[ConversationTurn]:

        result = db.scalars(
            select(ConversationTurn)
            .where(
                ConversationTurn.session_id == session_id
            )  
            .order_by(ConversationTurn.created_at)
        )  

        return list(result)

    

    def get_analytics_summary(self, db: Session, study_id: int) -> dict:
        total = db.scalar(
            select(func.count(ResearchSession.id)).where(
            ResearchSession.study_id == study_id
        )
    )
        completed = db.scalar(
            select(func.count(ResearchSession.id)).where(
                ResearchSession.study_id == study_id,
                ResearchSession.status == "completed",
            )
        )
        generic = db.scalar(
            select(func.count(ResearchSession.id)).where(
                ResearchSession.study_id == study_id,
                ResearchSession.mode == SessionMode.GENERIC,
            )
        )
        deep_analysis = db.scalar(
             select(func.count(ResearchSession.id)).where(
                 ResearchSession.study_id == study_id,
                 ResearchSession.mode == SessionMode.DEEP_ANALYSIS,
            )
        )
        return {
            "total_sessions": total or 0,
            "completed_sessions": completed or 0,
            "in_progress_sessions": (total or 0) - (completed or 0),
            "generic_sessions": generic or 0,
            "deep_analysis_sessions": deep_analysis or 0,
        }


    def get_all_conversation_turns_for_study(
        self, db: Session, study_id: int
    ) -> list[ConversationTurn]:
        return list(
            db.scalars(
                select(ConversationTurn)
                .join(ResearchSession, ConversationTurn.session_id == ResearchSession.id)
                .where(ResearchSession.study_id == study_id)
            )
        )    
    def get_respondents_for_study(self, db: Session, study_id: int) -> list[dict]:
        sessions = db.scalars(
        select(ResearchSession)
        .where(ResearchSession.study_id == study_id)
        .order_by(ResearchSession.started_at.desc())
    ).all()

        results = []
        for session in sessions:
            respondent = db.scalar(
                select(RespondentDetails).where(
                    RespondentDetails.session_id == session.id
                )
            )
            answer_count = db.scalar(
                select(func.count(ConversationTurn.id)).where(
                    ConversationTurn.session_id == session.id
                )
            )
            results.append({
                "session_id": session.id,
                "mode": session.mode,
                "status": session.status,
                "started_at": session.started_at,
                "completed_at": session.completed_at,
                "answer_count": answer_count or 0,
                "name": respondent.name if respondent else None,
                "email": respondent.email if respondent else None,
                "company": respondent.company if respondent else None,
                "role": respondent.role if respondent else None,
                "company_size": respondent.company_size if respondent else None,
            })

        return results