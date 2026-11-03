# Bhasha Doubt Solver — System Architecture (Phase 0 & Phase 1)

## 1. Executive Summary

**Bhasha** is an adaptive, AI-powered programming tutor engineered around the **Socratic method**. Rather than delivering direct answers or generated code snippets, Bhasha guides students through progressive inquiry, encourages them to explain their mental models, and helps them discover their own bugs.

The core guiding principle is:
> **Understand the student's thinking before correcting their understanding.**

---

## 2. Monorepo Structure

```text
bhasha-doubt-solver/
│
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── app/                      # Landing, auth, and tutor workspace routes
│   │   ├── page.tsx              # Landing page
│   │   ├── login/page.tsx        # Student authentication
│   │   ├── register/page.tsx     # Student registration & onboarding
│   │   ├── tutor/page.tsx        # 3-pane interactive Socratic workspace
│   │   ├── globals.css           # Jet-black / siren-blue / neon-pink dark design
│   │   └── layout.tsx            # Global metadata & dark theme provider
│   ├── components/               # Modular UI components
│   │   ├── chat/                 # ChatThread, ChatMessageItem, DoubtInput
│   │   ├── editor/               # Monaco Editor drawer (Python, C++)
│   │   └── layout/               # Navbar, Sidebar, ContextPanel
│   ├── hooks/                    # useAuth, useSession custom React hooks
│   ├── lib/                      # api.ts (HTTP client), utils.ts (styling)
│   ├── types/                    # Domain TypeScript interfaces & state enums
│   ├── .env.example
│   └── package.json
│
├── backend/                      # FastAPI, SQLAlchemy 2.x, Alembic, Sarvam AI SDK
│   ├── app/
│   │   ├── main.py               # Application factory, lifespan, CORS, error handlers
│   │   ├── api/                  # API routers & dependency injection
│   │   │   ├── deps.py           # JWT authentication & session dependency
│   │   │   └── v1/               # Health, Auth, and Sessions endpoints
│   │   ├── agent/                # Socratic Tutoring Engine
│   │   │   ├── orchestrator.py   # Multi-turn dialogue manager & JSON parsing
│   │   │   ├── prompts.py        # System prompt, multilingual guidelines, pedagogy
│   │   │   └── state_machine.py  # Tutoring finite state machine
│   │   ├── integrations/         # External integrations
│   │   │   ├── sarvam/           # Reusable Sarvam AI client (HTTP/SDK)
│   │   │   └── voice/            # Clean interfaces for Saaras STT & Bulbul TTS
│   │   ├── models/               # SQLAlchemy 2.x declarative models
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   ├── repositories/         # Parameterized database operations
│   │   ├── services/             # Domain business logic (Auth, Sessions, Tutor)
│   │   └── core/                 # Config, Database engine, Security (Bcrypt/JWT)
│   ├── migrations/               # Alembic async database migrations
│   ├── tests/                    # Pytest test suite (health, auth, sessions, agent)
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                         # Technical documentation
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── DEVELOPMENT_STATUS.md
│
├── README.md
└── .gitignore
```

---

## 3. Socratic Pedagogical State Machine

Conversations progress through an explicit pedagogical finite state machine:

```text
       ┌──────────────┐
       │    INTAKE    │  (Student presents initial question or problem)
       └──────┬───────┘
              │
              ▼
    ┌──────────────────┐
    │ ELICIT_REASONING │  (Tutor asks student to explain intended logic)
    └─────────┬────────┘
              │
              ▼
   ┌─────────────────────┐
   │ WAITING_FOR_STUDENT │  (Awaiting student reflection / input)
   └──────────┬──────────┘
              │
              ▼
     ┌─────────────────┐
     │ ANALYZE_ATTEMPT │  (Tutor examines logic & identifies misconception)
     └────────┬────────┘
              │
              ▼
   ┌─────────────────────┐
   │ GUIDED_INTERVENTION │  (Progressive hints, analogies, value traces)
   └──────────┬──────────┘
              │
              ▼
  ┌───────────────────────┐
  │ VALIDATE_UNDERSTANDING│  (Student states the fix; tutor verifies)
  └───────────┬───────────┘
              │
              ▼
       ┌─────────────┐
       │  COMPLETED  │  (Concept mastered; doubt resolved)
       └─────────────┘
```

### State Machine Rules
1. **Never reveal solutions prematurely**: Level-1 hints pose questions; Level-2 hints provide analogies; Level-3 traces small sample values.
2. **State Persistence**: The current state is stored on the `sessions` record in the database and updated after each turn.
3. **Structured Validation**: Responses from Sarvam AI are validated against `AgentOutputSchema`. If the model output deviates from strict JSON, the orchestrator applies a fallback parser without interrupting the student's conversation.

---

## 4. Sarvam AI Integration Layer

Bhasha uses Sarvam AI's reasoning model:
- **Model**: `sarvam-105b` / `sarvam-105b-conversations`
- **Endpoint**: `/v1/chat/completions`
- **Features**:
  - Reusable HTTP connection pooling via `httpx.AsyncClient`.
  - Automatic retry with exponential backoff on transient network faults.
  - Decoupled configuration via `SarvamConfig` allowing model switches without modifying core tutoring logic.
  - Zero API key exposure to frontend clients.

### Multilingual Support
Bhasha adapts its explanations to the student's chosen language:
- **English**: Clear, pedagogical standard English.
- **Hindi (हिन्दी)**: Devanagari script with natural technical terms.
- **Marathi (मराठी)**: Devanagari script maintaining correct terminology.
- **Hinglish**: Conversational Roman Hindi-English blend.
- **Exact Code Preservation**: In all languages, programming keywords (`if`, `return`, `def`, `class`) and source code syntax remain untouched.

---

## 5. Database Schema & Extensibility

Implemented on PostgreSQL using async SQLAlchemy 2.0 with `asyncpg` (and fallback `aiosqlite` for tests):

1. **`users`**: `id` (UUID), `email`, `hashed_password` (Bcrypt), `full_name`, `is_active`, `created_at`, `updated_at`.
2. **`learner_profiles`**: `id` (UUID), `user_id` (FK to `users.id`), `preferred_language`, `programming_language`, `experience_level`.
3. **`sessions`**: `id` (UUID), `user_id` (FK to `users.id`), `title`, `programming_language`, `natural_language`, `current_state`, `is_active`, `created_at`, `updated_at`.
4. **`messages`**: `id` (UUID), `session_id` (FK to `sessions.id`), `role`, `content`, `code_snippet`, `agent_state`, `message_metadata` (JSONB), `created_at`.

### Future Schema Expansion (Phase 2+)
The architecture is structured to accommodate future pedagogical extensions without altering the core schema:
- `concepts` & `knowledge_graph`
- `misconception_catalog`
- `diagnoses` & `interventions`
- `learner_concept_state` (Bayesian Knowledge Tracing / Elo)
- `practice_attempts`

---

## 6. Voice Integration Architecture (Prepared for Phase 2)

Abstract interfaces are defined in `app/integrations/voice/`:
- `BaseSpeechToText` → `SaarasSTTStub`
- `BaseTextToSpeech` → `BulbulTTSStub`

No broken or pretend UI microphone buttons are displayed in Phase 1. The application operates entirely through text and Monaco code input.

---

## 7. Frontend Design & Interaction Architecture

- **Visual Direction**: Jet black (`#060709`), pearl text (`#f8fafc`), siren blue accents (`#00a8ff`), subtle neon pink highlights (`#ff2d55`).
- **Code Input**: Monaco Editor (`@monaco-editor/react`) embedded in a collapsible drawer supporting Python and C++.
- **Layout**:
  - **Left Sidebar**: Session history, new doubt creation, language selector, profile.
  - **Center Workspace**: Live conversation thread, Socratic prompt cards, auto-expanding doubt input.
  - **Right Context Drawer**: Active doubt title, current Socratic stage badge, pedagogical advice.

