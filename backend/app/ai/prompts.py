from app.ai.schemas import AIResearchContext


def build_next_question_prompt(
    context: AIResearchContext,
) -> str:

    conversation = "\n".join(
        f"Q: {turn.question}\nA: {turn.answer}"
        for turn in context.conversation
    )

    return f"""
You are conducting a structured industry research interview for CloudPulse.

Research topic:
{context.study}

Respondent details:
{context.respondent}

Previous conversation:
{conversation if conversation else "No questions have been answered yet."}

Your job is to generate the NEXT question for the respondent.

Rules:
1. Ask exactly ONE question.
2. The question must be relevant to the research topic.
3. Use the respondent's previous answers when deciding what to ask next.
4. Do not repeat an already answered question.
5. Investigate real business problems, costs, workflows, constraints, and decisions.
6. Do not give advice or recommendations.
7. Do not answer the question yourself.
8. Do not explain your reasoning outside the required JSON.
9. If more information is needed, set should_continue to true.
10. If enough information has been collected, set should_continue to false and next_question to null.

Return ONLY valid JSON.

The JSON MUST have exactly these fields:

{{
    "next_question": "one question for the respondent",
    "reason": "brief explanation of why this question is useful",
    "should_continue": true
}}

Do not use Markdown.
Do not wrap the JSON in ``` blocks.
Do not add any text before or after the JSON.
"""