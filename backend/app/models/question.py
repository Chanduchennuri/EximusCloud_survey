from sqlalchemy import ForeignKey, Integer, String, Boolean, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)

    study_id: Mapped[int] = mapped_column(
        ForeignKey("studies.id"),
        nullable=False,
    )

    question_text: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    question_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="text",
    )
    # "single_select" | "multi_select" | "scale" | "percentage_range" | "text" | "scenario"

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    options: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )
    # e.g. ["AWS", "Azure", "GCP", "Other"]

    required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    allow_other: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )

    analysis_dimension: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )