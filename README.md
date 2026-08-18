# CloudPulse — by Eximus

**Live app:** [eximuscloudpulse.netlify.app](https://eximuscloudpulse.netlify.app)
**API docs:** `https://<your-render-backend-url>/docs`
**Dashboard:** [eximuscloudpulse.netlify.app/dashboard](https://eximuscloudpulse.netlify.app/dashboard)

CloudPulse is an industry research survey exploring how engineering and finance teams handle cloud cost optimization today. It's the first data-gathering step behind **Eximus** — an agentic AI platform in development that aims to unify UI generation, cloud provider selection, deployment, and CI/CD into a single orchestrated workflow, instead of developers stitching together five or six separate free-tier tools by hand.

Respondents can answer in one of two ways:
- **Quick Survey** — 12 structured questions (multiple choice, scales, scenarios, open text)
- **Deep Analysis** — an AI-guided conversation that generates adaptive follow-up questions based on each answer

---

## Table of contents

- [Why this exists](#why-this-exists)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Design approach](#design-approach)
- [Project structure](#project-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Database & migrations](#database--migrations)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Why this exists

Before building Eximus further, the goal is to validate the actual pain points people have around cloud cost management and multi-tool sprawl — rather than assuming. CloudPulse is a working, production-deployed FastAPI + React application built specifically to gather that data, and it doubles as a real-world exercise in building an end-to-end product: schema design, an AI-driven conversational research engine, and a live analytics dashboard.

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend — React + TypeScript + Tailwind (Netlify)"]
        A[Mode Selection] --> B{Choose mode}
        B -->|Quick Survey| C[Generic Form]
        B -->|Deep Analysis| D[AI Chat Interface]
        C --> E[Thank You Card]
        D --> E
        F[Dashboard] --> G[Charts + Respondent Table]
    end

    subgraph API["Backend — FastAPI (Render)"]
        H[Research Router]
        I[Research Service]
        J[Research Repository]
    end

    subgraph AI["AI Layer"]
        K[AI Orchestrator]
        L[Prompt Builder]
        M[Hugging Face — Qwen]
    end

    subgraph DB["PostgreSQL (Render)"]
        N[(studies)]
        O[(questions)]
        P[(research_sessions)]
        Q[(respondent_details)]
        R[(conversation_turns)]
    end

    Client -->|REST / JSON| H
    H --> I --> J --> DB
    I -->|Deep Analysis mode| K --> L --> M
    M -->|next question + should_continue| I
    G -->|fetch analytics| H
```

### Request flow — Deep Analysis mode

```mermaid
sequenceDiagram
    participant U as Respondent
    participant F as Frontend (Chat UI)
    participant S as FastAPI Service
    participant R as Repository / DB
    participant AI as AI Orchestrator (Qwen)

    U->>F: Opens Deep Analysis session
    F->>S: POST /sessions/{id}/deep-analysis/next-question
    S->>R: Fetch respondent + conversation history
    R-->>S: History (empty on first call)
    S->>AI: Build prompt with context
    AI-->>S: { next_question, reason, should_continue }
    S-->>F: Return question
    F->>U: Type out question (typewriter effect)
    U->>F: Sends answer
    F->>S: POST /sessions/{id}/respond
    S->>R: Save ConversationTurn (question_id = null)
    F->>S: POST next-question again
    Note over S,AI: Full history now included → adaptive follow-up
```

### Data model

```mermaid
erDiagram
    STUDY ||--o{ QUESTION : has
    STUDY ||--o{ RESEARCH_SESSION : has
    RESEARCH_SESSION ||--|| RESPONDENT_DETAILS : has
    RESEARCH_SESSION ||--o{ CONVERSATION_TURN : has
    QUESTION ||--o{ CONVERSATION_TURN : "answered in (nullable)"

    STUDY {
        int id
        string name
    }
    QUESTION {
        int id
        int study_id
        string question_text
        string question_type
        string category
        json options
        bool required
        bool allow_other
        float weight
        string analysis_dimension
        int display_order
    }
    RESEARCH_SESSION {
        int id
        int study_id
        enum mode
        string status
        datetime started_at
        datetime completed_at
    }
    RESPONDENT_DETAILS {
        int id
        int session_id
        string name
        string email
        string company
        string role
        string company_size
    }
    CONVERSATION_TURN {
        int id
        int session_id
        int question_id "nullable — null for AI-generated"
        string question_text
        string user_answer
        datetime created_at
    }
```

> `conversation_turns.question_id` is nullable and set to `null` for Deep Analysis turns — a single table cleanly holds both fixed-question answers and AI-generated Q&A pairs, which is what makes analytics able to query both modes together.

---

## Tech stack

**Backend**
- FastAPI + Uvicorn
- PostgreSQL + SQLAlchemy (ORM) + Alembic (migrations)
- Pydantic Settings for config
- Hugging Face Inference API (Qwen) for the Deep Analysis question generator

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Recharts (dashboard visualizations)
- lucide-react (icons)

**Infrastructure**
- Backend hosted on **Render** (web service + managed Postgres)
- Frontend hosted on **Netlify**
- Version control on GitHub (monorepo — `backend/` + `interface/`)

---

## Design approach

- **Single conversation table, two producers.** Rather than separate tables for fixed-question answers and AI-generated answers, both write into `conversation_turns`. This means Deep Analysis mode automatically "sees" any fixed questions a respondent already answered (and vice versa) if a study ever supports switching modes mid-session — no extra joins needed.
- **Question metadata drives the UI, not hardcoded frontend logic.** Each `Question` row carries its own `question_type`, `options`, `required`, and `allow_other` — the frontend has one generic renderer that adapts per type (radio, checkbox, scale, scenario, open text) rather than one-off components per question.
- **Deep Analysis has a hard safety cap** (`MAX_DEEP_ANALYSIS_TURNS`) independent of the AI's own judgment, so a session can never run indefinitely or rack up unbounded API cost even if the model doesn't naturally converge on `should_continue: false`.
- **Analytics aggregate at read-time, not write-time.** There's no separate "results" table — the `/analytics/*` endpoints compute summaries and per-question breakdowns directly from `conversation_turns` on each request, keeping a single source of truth.

---

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── ai/                 # orchestrator, prompt builder, Hugging Face client
│   │   ├── core/                # config, database session
│   │   ├── models/              # SQLAlchemy models
│   │   └── research/            # router, service, repository, schemas
│   ├── alembic/versions/        # migrations
│   ├── scripts/
│   │   └── seed_questions.py    # seeds the 12 study questions
│   ├── main.py
│   └── requirements.txt
│
└── interface/                   # React frontend
    ├── public/
    │   └── _redirects            # Netlify SPA routing
    ├── src/
    │   ├── api/                  # fetch wrappers to the backend
    │   ├── components/           # Navbar, Footer, ThankYouCard, TypewriterText…
    │   ├── pages/                 # ModeSelection, GenericForm, DeepAnalysisChat, Dashboard
    │   └── types/                 # shared TypeScript interfaces
    └── package.json
```

---

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt

# create backend/.env — see Environment variables below

alembic upgrade head
python -m scripts.seed_questions

python -m uvicorn main:app --reload
```

API will be live at `http://127.0.0.1:8000`, docs at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd interface
npm install

# create interface/.env — see Environment variables below

npm run dev
```

App will be live at `http://localhost:5173`.

---

## Environment variables

**`backend/.env`**
```
PROJECT_NAME=Eximus
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg://user:password@localhost/cloudpulse_db
HUGGINGFACE_API_KEY=your_key_here
HUGGINGFACE_MODEL=Qwen/Qwen3-8B
```

**`interface/.env`**
```
VITE_API_BASE=http://localhost:8000/api/v1/research
```

> Note the `postgresql+psycopg://` scheme (not plain `postgresql://`) — this project uses **psycopg3**, and SQLAlchemy needs the driver specified explicitly in the URL.

---

## Database & migrations

Schema is managed with Alembic. To apply migrations:

```bash
alembic upgrade head
```

To create a new migration after changing a model:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

To seed the 12 core study questions (safe to re-run — replaces existing rows for the study):

```bash
python -m scripts.seed_questions
```

---

## Deployment

**Backend — Render**
- Web service, root directory `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Managed PostgreSQL instance, connected via `DATABASE_URL` (internal URL, `+psycopg` scheme)
- Migrations and question seeding run manually from a local machine pointed at the external DB URL (Render's Shell tool requires a paid plan)

**Frontend — Netlify**
- Base directory: `interface`
- Build command: `npm run build`
- Publish directory: `dist`
- `public/_redirects` handles client-side routing (`/* /index.html 200`) so direct navigation to routes like `/dashboard` doesn't 404
- `VITE_API_BASE` set to the live Render backend URL

**CORS**
The backend's `allow_origins` list must include the live Netlify domain, in addition to `http://localhost:5173` for local dev — updated in `main.py` whenever the frontend domain changes.

---

## Roadmap

- [ ] Authentication on the `/dashboard` route (currently open)
- [ ] Mode-switching mid-session (generic ↔ deep analysis)
- [ ] Seed the fixed question topics into the Deep Analysis AI prompt as coverage guidance
- [ ] Minimum/maximum turn guidance in the AI prompt for more consistent interview length
- [ ] Per-respondent drill-down view (individual Q&A transcript) from the dashboard table
- [ ] Export respondent data as CSV

---

## Author

**Chennuri Chandrasekhar (Austin)**
[LinkedIn](https://www.linkedin.com/in/chandrasekhar-chennuri-austin) · [GitHub](https://github.com/Chanduchennuri) · [WhatsApp](https://wa.me/919032098602)
