from app.ai.prompts import build_next_question_prompt
from app.ai.providers.huggingface import HuggingFaceProvider
from app.ai.schemas import AIResearchContext, AINextQuestion


class AIOrchestrator:

    def __init__(
        self,
        provider: HuggingFaceProvider,
    ) -> None:
        self.provider = provider

    def generate_next_question(
        self,
        context: AIResearchContext,
    ) -> AINextQuestion:

        prompt = build_next_question_prompt(
            context=context,
        )

        return self.provider.generate_next_question(
            prompt=prompt,
        )


ai_orchestrator = AIOrchestrator(
    provider=HuggingFaceProvider()
)