from pydantic import BaseModel


class ConversationContext(BaseModel):
    question: str
    answer: str


class AIResearchContext(BaseModel):
    study: str
    respondent: dict
    conversation: list[ConversationContext]


class AINextQuestion(BaseModel):
    next_question: str | None
    reason: str
    should_continue: bool