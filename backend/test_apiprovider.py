from app.ai.providers.huggingface import HuggingFaceProvider
from app.ai.prompts import build_next_question_prompt
from app.ai.schemas import (
    AIResearchContext,
    ConversationContext,
)


context = AIResearchContext(
    study="Cloud pricing and optimization challenges",
    respondent={
        "company": "Example Startup",
        "role": "CTO",
        "company_size": "11-50",
    },
    conversation=[
        ConversationContext(
            question="Which cloud platforms are you currently using?",
            answer="AWS and Azure",
        ),
        ConversationContext(
            question="Which cloud services or technologies are you using?",
            answer="EC2, S3, RDS and Azure Blob Storage",
        ),
    ],
)


prompt = build_next_question_prompt(context)

print("\n--- PROMPT ---")
print(prompt)
print("--- END PROMPT ---\n")


provider = HuggingFaceProvider()

result = provider.generate_next_question(
    prompt=prompt,
)

print(result)