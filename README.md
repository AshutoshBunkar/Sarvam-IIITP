# Bhasha Doubt Solver

<p align="center">
  <strong>A multilingual, AI-powered programming tutor that helps students understand problems instead of simply handing them the solution.</strong>
</p>

<p align="center">
  <em>Think. Explain. Debug. Learn.</em>
</p>

---

## Overview

**Bhasha Doubt Solver** is an AI-powered learning platform designed to help students work through programming doubts using the **Socratic method**. Instead of immediately generating a complete solution, Bhasha asks guiding questions, examines the learner's reasoning, and offers progressive hints so students can identify misconceptions and develop their own understanding.

The platform is designed for multilingual learning. Students can interact in **English, Hindi, Marathi, or Hinglish**, while writing code in supported programming languages such as **Python and C++**.

The project uses **Sarvam AI** for its conversational tutoring capability and provides a web interface for authentication, doubt sessions, chat history, and code input.

## Why Bhasha?

Traditional AI coding assistants often jump straight to an answer. That can solve the immediate problem without helping the student understand it.

Bhasha takes a different approach:

- **Guided learning:** asks questions before revealing a solution.
- **Progressive hints:** moves from conceptual questions to analogies and small value traces.
- **Multilingual explanations:** supports English, Hindi, Marathi, and Hinglish.
- **Code-aware discussions:** lets students attach code snippets to their questions.
- **Persistent sessions:** saves conversations and the current tutoring stage.
- **Student-focused design:** encourages the learner to explain, test, and validate their own reasoning.

## Core Features

### Socratic Programming Tutor

Bhasha follows a seven-state tutoring flow:

1. **INTAKE** — receives the student's doubt.
2. **ELICIT_REASONING** — asks the student to explain their approach.
3. **WAITING_FOR_STUDENT** — waits for the student's response.
4. **ANALYZE_ATTEMPT** — evaluates the reasoning and identifies possible misconceptions.
5. **GUIDED_INTERVENTION** — provides progressive hints and guidance.
6. **VALIDATE_UNDERSTANDING** — checks whether the student understands the concept or correction.
7. **COMPLETED** — marks the doubt as resolved.

The state machine controls the tutoring flow and persists the current state with the session.

### Multilingual Learning

Students can choose one of the following interaction languages:

| Language | Explanation style |
|---|---|
| English | Clear, instructional English |
| Hindi | Hindi in Devanagari script |
| Marathi | Marathi in Devanagari script |
| Hinglish | Conversational Hindi-English in Roman script |

Programming keywords and code syntax are preserved rather than translated.

### Code-Aware Doubt Solving

- Submit a doubt with an optional code snippet.
- Use the Monaco-based code editor drawer.
- Switch between Python and C++ in the editor.
- View formatted code blocks with line numbers and copy support.

### Student Accounts and Session History

- Register and log in with email and password.
- Securely hash passwords and issue JWT access tokens.
- Store learner preferences such as explanation language and programming language.
- Create, list, and reopen tutoring sessions.
- Retrieve message history for each session.
- Enforce session ownership on the backend.

### Responsive Tutor Workspace

The Next.js interface includes a three-pane workspace:

- **Sidebar:** session history, new doubt creation, language preferences, and profile access.
- **Chat workspace:** conversation thread, tutor prompts, and doubt input.
- **Context panel:** active session stage and guidance for the learner.

The visual theme uses a jet-black background with pearl text, siren-blue accents, and subtle neon-pink highlights.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Code editor | Monaco Editor via `@monaco-editor/react` |
| Backend | Python, FastAPI, Uvicorn |
| AI integration | Sarvam AI Chat Completions API, `httpx` |
| Validation | Pydantic v2, pydantic-settings |
| Database / ORM | SQLAlchemy 2.x (async) |
| Database drivers | aiosqlite (local development/testing), asyncpg (PostgreSQL) |
| Migrations | Alembic |
| Authentication | JWT (PyJWT), bcrypt |
| Backend tests | pytest, pytest-asyncio, pytest-mock |

## Architecture

The project is organized as a monorepo with independently run frontend and backend applications.

```text
Sarvam-IIITP/
│
├── backend/
│   ├── app/
│   │   ├── agent/              # Socratic orchestrator, prompts, state machine
│   │   ├── api/                # FastAPI routes and dependencies
│   │   ├── core/               # Settings, database, security
│   │   ├── integrations/       # Sarvam AI and voice integration interfaces
│   │   ├── models/             # SQLAlchemy models
│   │   ├── repositories/       # Database access layer
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── services/           # Application business logic
│   ├── migrations/             # Alembic migrations
│   ├── tests/                  # Backend tests
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── app/                    # Next.js routes and layouts
│   ├── components/             # Chat, editor, and layout components
│   ├── hooks/                  # Authentication and session hooks
│   ├── types/                  # TypeScript domain types
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT_STATUS.md
│
├── sarvam_chat.py              # Standalone Sarvam connectivity example
└── .gitignore
```

### Request flow

1. A student submits a question and, optionally, a code snippet through the frontend.
2. The frontend sends the request to the FastAPI backend with the student's JWT.
3. The backend checks authentication and session ownership, then loads recent conversation context.
4. The Socratic orchestrator builds the tutoring prompt and calls Sarvam AI.
5. The response is validated and mapped to a valid tutoring state.
6. The student's message, tutor response, and updated session state are persisted.
7. The API returns the tutor response and state to the frontend.

The Sarvam API key is kept on the backend and must never be exposed through frontend code.

## Getting Started

### Prerequisites

Install the following before running the project:

- **Python 3.10 or newer**
- **Node.js 18 or newer** and npm
- A **Sarvam AI API key**
- Git

For PostgreSQL-based development, also have a PostgreSQL instance available. SQLite can be used for local development and testing.

### 1. Clone the repository

```bash
git clone https://github.com/AshutoshBunkar/Sarvam-IIITP.git
cd Sarvam-IIITP
```

### 2. Configure the backend

Create and activate a virtual environment:

**Windows (PowerShell)**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create your backend environment file by copying the example:

**Windows**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

Edit `backend/.env` and provide your configuration. At minimum, set a real Sarvam API key and a strong secret key:

```env
PROJECT_NAME="Bhasha Doubt Solver"
ENVIRONMENT="development"
DEBUG=true

SECRET_KEY="replace-with-a-random-secret-of-at-least-32-characters"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SQLite for local development:
DATABASE_URL="sqlite+aiosqlite:///./bhasha.db"

# Or use PostgreSQL:
# DATABASE_URL="postgresql+asyncpg://postgres:your-password@localhost:5432/bhasha_db"

CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

SARVAM_API_KEY="your-sarvam-api-key"
SARVAM_CHAT_MODEL="sarvam-105b"
SARVAM_MAX_TOKENS=2000
SARVAM_TEMPERATURE=0.3
SARVAM_API_BASE_URL="https://api.sarvam.ai/v1"
```

> **Security:** Never commit `.env` files, API keys, database credentials, or production secret keys. The repository's `.gitignore` excludes environment files.

### 3. Start the backend

Run from the `backend` directory with the virtual environment activated:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- API base: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

For PostgreSQL, apply the database migrations before running against the database:

```bash
alembic upgrade head
```

### 4. Configure the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
```

Create the frontend environment file:

**Windows**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**

```bash
cp .env.example .env.local
```

The default configuration is:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change this value only when your backend is hosted at a different address.

### 5. Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

Keep both development servers running while using the application.

## API Overview

The backend exposes a versioned REST API under:

```text
http://localhost:8000/api/v1
```

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/health` | No | Check backend and integration health |
| POST | `/auth/register` | No | Register a student |
| POST | `/auth/login` | No | Authenticate and receive a JWT |
| GET | `/auth/me` | Bearer token | Get the authenticated student's profile |
| POST | `/sessions` | Bearer token | Create a tutoring session |
| GET | `/sessions` | Bearer token | List the student's sessions |
| GET | `/sessions/{session_id}` | Bearer token | Get session details |
| GET | `/sessions/{session_id}/messages` | Bearer token | Get session conversation history |
| POST | `/sessions/{session_id}/turns` | Bearer token | Submit a message and receive the next tutoring turn |

For request schemas, response examples, and error formats, see **[API Documentation](docs/API_DOCUMENTATION.md)**. Interactive API documentation is available at `/docs` when the backend is running.

## Running Tests and Checks

### Backend tests

Run from the `backend` directory with the virtual environment activated:

```bash
pytest -v
```

The development audit recorded **13 passing backend tests** covering authentication, session lifecycle and authorization, state transitions, orchestrator parsing, and Sarvam integration resilience. Run the suite locally to verify your current environment.

### Frontend checks

Run from the `frontend` directory:

```bash
npx tsc --noEmit
npm run build
```

The development audit recorded a successful TypeScript check and production build. The frontend currently does not have a separate automated Jest/Vitest test suite.

## Security Notes

- Keep `SARVAM_API_KEY` on the backend only.
- Use a unique, strong `SECRET_KEY` outside local development.
- Use HTTPS and secure deployment secrets in production.
- Do not expose JWTs or credentials in logs, screenshots, or source control.
- Configure `CORS_ORIGINS` for the exact frontend origins you trust.
- Session ownership is checked by the backend; do not rely only on frontend route protection.

## Current Scope and Roadmap

The current documented implementation focuses on text-based Socratic tutoring.

| Area | Status |
|---|---|
| Student registration and login | Implemented |
| JWT authentication and session authorization | Implemented |
| Persistent doubt sessions and message history | Implemented |
| Socratic tutoring state machine | Implemented |
| Sarvam AI chat integration | Implemented |
| English, Hindi, Marathi, and Hinglish instructions | Implemented |
| Python and C++ code input | Implemented |
| Responsive tutoring workspace | Implemented |
| Saaras speech-to-text integration | Interface/stub only; future work |
| Bulbul text-to-speech integration | Interface/stub only; future work |
| Frontend automated test suite | Not yet present |

Potential future directions include voice-based doubt solving, richer learner-progress tracking, concept-level knowledge modelling, and expanded practice workflows.

For a detailed, audited feature list and known limitations, see [Development Status](docs/DEVELOPMENT_STATUS.md). For design decisions and component responsibilities, see [System Architecture](docs/ARCHITECTURE.md).

## Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Development Status and Audit](docs/DEVELOPMENT_STATUS.md)

## Contributing

Contributions, issue reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-change`.
3. Make your changes and add or update tests where applicable.
4. Run the backend and frontend checks.
5. Commit your changes and open a pull request with a clear description.

Please do not include secrets, credentials, local databases, or generated build files in commits.

## Acknowledgements

- **[Sarvam AI](https://www.sarvam.ai/)** — conversational AI capabilities.
- **[IIIT Pune](https://iiitp.ac.in/)** — academic context for the project.
- The open-source communities behind FastAPI, Next.js, React, SQLAlchemy, Tailwind CSS, and Monaco Editor.

## License

No license has been specified in this repository yet. Unless a license is added, the default copyright rules apply and reuse, distribution, and modification are not automatically granted.

---

<p align="center">
  Built to make programming education more accessible, interactive, and understandable.
</p>
