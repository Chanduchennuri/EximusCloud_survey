1.Establishing first boundary
 HTTP Request 
      Fastapi
         app/main.py


## Later

app/
├── api/
├── core/
├── models/
├── schemas/
├── services/
├── repositories/
├── ai/
├── workers/
└── main.py


##

1. First, clarify the two clients

We have:

                    CloudPulse Backend
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Research Frontend             Dashboard
        PUBLIC USER                 RESEARCHER
             │                           │
             │                           │
      No account needed             Authentication
             │                           │
             └─────────────┬─────────────┘
                           ▼
                      PostgreSQL
Research frontend

We don't need user authentication initially.

A respondent can:

Start research
     ↓
Receive session ID/token
     ↓
Chat / answer questions
     ↓
Submit
Dashboard

Authentication will be required here.

But we don't need to implement dashboard auth now.

That's a separate module later.

2. What does our backend actually need for the respondent?

You said:

"we just create endpoints for chatbot and display questions"

Almost.

The backend needs to do more than simply return questions.

It needs to maintain the state of the research conversation.

For example:

Question 1
     ↓
User answer
     ↓
AI analyzes answer
     ↓
Determine whether follow-up is needed
     ↓
Question 2 / Follow-up
     ↓
User answer
     ↓
...

Therefore our core backend is:

Research Session
       │
       ▼
Conversation
       │
       ▼
AI Orchestrator
       │
       ├── Question selection
       ├── Context management
       ├── Follow-up decision
       ├── Response extraction
       └── AI analysis
       │
       ▼
Persistence
3. Modular architecture

I would now structure the backend around domain modules, not technical convenience.

Eventually:

backend/
│
└── app/
    │
    ├── main.py
    │
    ├── core/
    │   ├── config.py
    │   ├── database.py
    │   └── security.py
    │
    ├── research/
    │   ├── router.py
    │   ├── service.py
    │   ├── repository.py
    │   ├── models.py
    │   └── schemas.py
    │
    ├── conversation/
    │   ├── service.py
    │   ├── repository.py
    │   ├── models.py
    │   └── schemas.py
    │
    ├── ai/
    │   ├── orchestrator.py
    │   ├── model_client.py
    │   ├── prompt_builder.py
    │   ├── parser.py
    │   └── schemas.py
    │
    ├── analytics/
    │   ├── router.py
    │   ├── service.py
    │   └── repository.py
    │
    └── auth/
        ├── router.py
        ├── service.py
        └── ...

That's much better for this project than:

main.py
models.py
routes.py
utils.py

where everything eventually becomes tangled.

4. Let's design the core models first

Before writing Hugging Face code, we need to know:

What information does the AI orchestrator need to operate?

I think our initial domain model should be:

Study
 │
 ├── Question
 │
 └── ResearchSession
        │
        ├── ConversationMessage
        │
        └── Response
                │
                └── AIAnalysis

Let's understand each one.

Study

A study represents a research campaign.

For example:

Study
-------------------------
id
name
description
status
created_at
updated_at

Example:

Cloud Cost & Deployment Research

Why do we need this?

Because we don't want the backend permanently hard-coded to:

CloudPulse survey.

Later you could create:

Study 1 → Cloud Cost Research
Study 2 → Developer Productivity
Study 3 → AI Infrastructure

Same platform.

5. Question

A question belongs to a study.

Question
-------------------------
id
study_id
text
type
order
is_required
allows_ai_followup

For example:

Question 1
"Which cloud providers does your organization use?"

We don't have to decide the actual questions yet.

We're designing the model that will support them.

6. ResearchSession

This is probably our most important entity.

When someone opens the research application:

POST /research/sessions

we create:

ResearchSession
-------------------------
id
study_id
status
started_at
completed_at

Conceptually:

User
 │
 ▼
ResearchSession
 │
 ├── Question 1
 ├── Question 2
 ├── Question 3
 └── ...

The respondent doesn't need an account.

The session represents their participation.

7. ConversationMessage

This preserves the actual conversation.

ConversationMessage
-------------------------
id
session_id
role
content
created_at

role could be:

SYSTEM
ASSISTANT
USER

Example:

ASSISTANT:
Which cloud providers do you use?


USER:
AWS and Azure.

This is important for AI because the orchestrator needs conversation context.

8. Response

Now the subtle distinction.

A ConversationMessage is conversational.

A Response represents an answer to a research question.

Response
-------------------------
id
session_id
question_id
answer_text
created_at

Example:

Question:
"Which cloud providers do you use?"


Response:
"AWS and Azure"

So:

ConversationMessage
        ↓
Conversation history


Response
        ↓
Research dataset

This separation is very valuable.

9. AIAnalysis

The AI should never modify:

answer_text

Instead:

Response
    │
    ▼
AIAnalysis

Potential model:

AIAnalysis
-------------------------
id
response_id
category
severity
topics
confidence
model_name
created_at

Example:

{
  "category": "cost_estimation",
  "severity": "high",
  "topics": [
    "pricing_complexity",
    "forecasting"
  ],
  "confidence": 0.87
}

This is derived data.

If we later change models, we can re-run the analysis.

10. Now the AI Orchestrator makes sense

The orchestrator sits above these models.

                 AI ORCHESTRATOR
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
 Conversation      Question          Response
   Context          State           Analysis
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                  AI Model

Its responsibility is not to directly talk to PostgreSQL.

Instead:

AI Orchestrator
      │
      ├── Conversation context
      ├── Current question
      ├── Research rules
      │
      ▼
 Model Client
      │
      ▼
 Hugging Face

And then:

Hugging Face
     ↓
Parser
     ↓
Structured AI result
     ↓
Orchestrator
     ↓
Service
     ↓
Repository
     ↓
PostgreSQL

That's proper modularity.

11. Hugging Face vs PostgreSQL — what first?

PostgreSQL first.

Not because Hugging Face is less important.

Because the AI orchestrator needs a persistent domain model.

We need to know:

What is a session?
What is a message?
What is a question?
What is a response?
What is AI analysis?

before we make the AI operate on them.

So our order should be:

                 DOMAIN FIRST
                      │
                      ▼
              Database Models
                      │
                      ▼
              Repository Layer
                      │
                      ▼
               Service Layer
                      │
                      ▼
               API Contracts
                      │
                      ▼
             AI Orchestrator
                      │
                      ▼
              Hugging Face
12. But configuration comes before PostgreSQL

There is one small infrastructure dependency.

We need:

.env
   ↓
config.py
   ↓
database.py
   ↓
PostgreSQL

So the immediate implementation sequence should be:

Task 3A — Configuration
core/config.py
Task 3B — Database infrastructure
core/database.py
Task 3C — Domain models
research/models.py
conversation/models.py
ai/models.py
Task 3D — Migrations
Alembic
Task 3E — Repositories
session_repository
message_repository
response_repository
Task 3F — Services
research_service
conversation_service
Task 3G — AI abstraction
AIOrchestrator
ModelClient
Task 3H — Hugging Face

Only now connect the actual model.

13. One more important architectural decision

Let's not create separate chatbot and question systems.

The chatbot is simply the presentation/orchestration mechanism for a research session.

So:

❌ Chatbot
   Question system
   Survey system
   AI system

Instead:

Research Domain
      │
      ▼
Research Session
      │
      ▼
Conversation
      │
      ▼
AI Orchestrator

This keeps the architecture clean.