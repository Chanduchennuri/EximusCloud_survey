from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SessionMode(str, Enum):
    GENERIC = "generic"
    DEEP_ANALYSIS = "deep_analysis"


class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)

    study_id: Mapped[int] = mapped_column(
        ForeignKey("studies.id"),
        nullable=False,
    )

    study: Mapped["Study"] = relationship("Study", back_populates="sessions")

    mode: Mapped[SessionMode] = mapped_column(
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        default="active",
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )