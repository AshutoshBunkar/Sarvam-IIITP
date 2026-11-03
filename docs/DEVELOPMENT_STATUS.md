# Bhasha Doubt Solver — Development Status (Phase 1 Audit)

> **Audit Date**: 2026-11-03  
> **Auditor**: Automated Phase 1 Implementation Audit  
> **Codebase State**: Post-audit fixes applied. All tests passing.

---

## 1. Implemented & Verified Features

### 1.1 Backend (FastAPI)

| Feature | Status | Evidence |
|---|---|---|
| FastAPI application with lifespan events | ✅ Verified | `app/main.py` — async startup creates DB schema, shutdown disposes engine |
| CORS middleware configured | ✅ Verified | Origins: `localhost:3000`, `127.0.0.1:3000` |
| Custom exception handlers (404, 401, 403, 422, 502, 400) | ✅ Verified | Six handlers registered in `app/main.py` lines 58–103 |
| Pydantic Settings with `.env` loading | ✅ Verified | `app/core/config.py` — `SettingsConfigDict(env_file=".env")` |
| API versioning under `/api/v1/` prefix | ✅ Verified | `app/api/v1/router.py` |

### 1.2 API Endpoints (9 total)

| Endpoint | Method | Auth | Status | Test Coverage |
|---|---|---|---|---|
| `/api/v1/health` | GET | None | ✅ Verified | `test_health.py` |
| `/api/v1/auth/register` | POST | None | ✅ Verified | `test_auth.py` |
| `/api/v1/auth/login` | POST | None | ✅ Verified | `test_auth.py` |
| `/api/v1/auth/me` | GET | Bearer | ✅ Verified | `test_auth.py` |
| `/api/v1/sessions` | POST | Bearer | ✅ Verified | `test_sessions.py` |
| `/api/v1/sessions` | GET | Bearer | ✅ Verified | `test_sessions.py` |
| `/api/v1/sessions/{id}` | GET | Bearer | ✅ Verified | `test_sessions.py` |
| `/api/v1/sessions/{id}/messages` | GET | Bearer | ✅ Verified | `test_sessions.py` |
| `/api/v1/sessions/{id}/turns` | POST | Bearer | ✅ Verified | `test_sessions.py` |

### 1.3 Database & Models

| Component | Status | Notes |
|---|---|---|
| SQLAlchemy 2.x async with `DeclarativeBase` | ✅ Verified | `app/core/database.py` |
| SQLite via `aiosqlite` (dev/test) | ✅ Verified | PostgreSQL via `asyncpg` supported for production |
| `users` table | ✅ Verified | UUID PK, email (unique+indexed), hashed_password, full_name, is_active, timestamps |
| `learner_profiles` table | ✅ Verified | FK to users (unique, cascade delete), preferred_language, programming_language, experience_level |
| `sessions` table | ✅ Verified | FK to users (cascade delete), title, programming_language, natural_language, current_state, is_active, timestamps |
| `messages` table | ✅ Verified | FK to sessions (cascade delete), role, content, code_snippet, agent_state, message_metadata (JSON), created_at |
| Composite indexes | ✅ Verified | `ix_messages_session_created`, `ix_sessions_user_created` |
| `UUIDMixin` / `TimestampMixin` | ✅ Verified | `app/models/base.py` — auto-generated UUID PKs, `created_at`/`updated_at` with timezone |
| Alembic migration `001_initial_schema` | ✅ Verified | Matches model definitions; stamped at head on existing DB |
| ORM relationships with `selectinload` | ✅ Verified | User→Profile (1:1), User→Sessions (1:N), Session→Messages (1:N ordered by created_at) |

### 1.4 Authentication & Authorization

| Feature | Status | Notes |
|---|---|---|
| Bcrypt password hashing | ✅ Verified | `app/core/security.py` — `bcrypt.hashpw`/`checkpw` |
| JWT creation with configurable expiry | ✅ Verified | PyJWT with HS256, configurable `ACCESS_TOKEN_EXPIRE_MINUTES` (default 24h) |
| JWT decode with signature verification | ✅ Verified | `decode_access_token()` validates algorithm and secret |
| `HTTPBearer` dependency injection | ✅ Verified | `app/api/deps.py` — extracts and validates JWT from `Authorization: Bearer` header |
| Session ownership enforcement | ✅ Verified | `session_service.py` and `tutor_service.py` both check `session.user_id != user_id` → 403 |
| Duplicate email rejection | ✅ Verified | Returns 422 on duplicate registration |
| Inactive user rejection | ✅ Verified | Login and `/me` both check `is_active` |

### 1.5 Sarvam AI Integration

| Feature | Status | Notes |
|---|---|---|
| Direct HTTP client (not SDK) | ✅ Verified | `app/integrations/sarvam/client.py` — `httpx.AsyncClient` to `api.sarvam.ai/v1/chat/completions` |
| API key from env (never exposed to frontend) | ✅ Verified | `SARVAM_API_KEY` read from `.env`, sent via `api-subscription-key` + `Authorization` headers |
| Configurable model, max_tokens, temperature | ✅ Verified | `SarvamConfig` dataclass from settings |
| Retry with backoff (2 retries, 1s × attempt) | ✅ Verified | Skips retry on 401/403 |
| Auth error detection (401/403 → no retry) | ✅ Verified | Raises `ExternalServiceException` immediately |
| No fabricated AI responses | ✅ Verified | All assistant messages come from live Sarvam API calls; tests mock the client properly |
| **Reasoning model `content: null` handling** | ✅ Fixed | Sarvam's `sarvam-105b` is a reasoning model that may return `content: null` when `max_tokens` is exhausted by thinking tokens. `ChatMessage.content` is now `Optional[str]`, and `SarvamChatResponse.content` falls back to `reasoning_content` |
| Truncation warning logging | ✅ Added | Logs warning when `finish_reason=length` with null content |

### 1.6 Socratic Agent Engine

| Feature | Status | Notes |
|---|---|---|
| 7-state finite state machine | ✅ Verified | INTAKE → ELICIT_REASONING → WAITING_FOR_STUDENT → ANALYZE_ATTEMPT → GUIDED_INTERVENTION → VALIDATE_UNDERSTANDING → COMPLETED |
| Valid transition map with fallback | ✅ Verified | `TutoringStateMachine.TRANSITIONS` + `validate_or_fallback()` for invalid LLM suggestions |
| Multi-turn context (last 10 messages) | ✅ Verified | `orchestrator.py` line 94: `history[-10:]` |
| System prompt with Socratic pedagogy | ✅ Verified | 11 mandatory pedagogical principles, progressive hint levels, state directives |
| Structured JSON output parsing | ✅ Verified | Handles clean JSON, markdown-fenced JSON, and free-form fallback |
| State persistence on session record | ✅ Verified | `session.current_state` updated after each turn |
| Code snippet inclusion in context | ✅ Verified | Both history messages and current turn attach code in fenced blocks |
| Multilingual system prompt directives | ✅ Verified | English, Hindi (Devanagari), Marathi (Devanagari), Hinglish (Roman) |

### 1.7 Frontend (Next.js 14)

| Feature | Status | Notes |
|---|---|---|
| App Router with 4 routes | ✅ Verified | `/` (landing), `/login`, `/register`, `/tutor` |
| JWT auth flow (localStorage) | ✅ Verified | `useAuth` hook — login stores token, register auto-logs-in, logout clears and redirects |
| Protected route redirection | ✅ Verified | `useAuth(true)` redirects to `/login` if no token |
| Registration with language/programming preferences | ✅ Verified | `register/page.tsx` — full name, email, password, preferred language, coding language |
| 3-pane tutor workspace | ✅ Verified | Left sidebar, center chat, right context drawer |
| Session history sidebar | ✅ Verified | `Sidebar.tsx` — lists sessions sorted by updated_at, shows title/state |
| New session creation | ✅ Verified | Creates session via API, auto-creates on first message if none exists |
| Language selector in sidebar | ✅ Verified | 4-language grid: English, Hindi, Marathi, Hinglish |
| Monaco Editor drawer | ✅ Verified | `CodeEditorDrawer.tsx` — `@monaco-editor/react`, Python/C++ toggle, line count, clear/close |
| Chat thread with auto-scroll | ✅ Verified | `ChatThread.tsx` — `useRef` + `scrollIntoView({ behavior: "smooth" })` |
| Message bubbles with role styling | ✅ Verified | `ChatMessageItem.tsx` — distinct avatars, state badges, code blocks with copy button |
| Loading state (thinking animation) | ✅ Verified | Pulsing avatar + "Bhasha is reflecting on your reasoning..." |
| Error banner | ✅ Verified | Red notification bar in tutor workspace |
| Empty state with pedagogical prompt | ✅ Verified | "I will not simply hand you the solution" + First Principles / Multilingual cards |
| Context panel with stage explanations | ✅ Verified | `ContextPanel.tsx` — per-state name, description, and student tips |
| State badge in navbar | ✅ Verified | `Navbar.tsx` — color-coded per-state badges |
| Responsive mobile layout | ✅ Verified | Sidebar toggle on mobile, responsive grid |
| Dark theme (jet black design) | ✅ Verified | `#060709` base, `siren` and `neon-pink` accent colors, `pearl` text |
| TypeScript strict mode | ✅ Verified | `npx tsc --noEmit` — 0 errors |
| Production build | ✅ Verified | `npm run build` — all 7 pages compiled successfully |

---

## 2. Issues Found & Fixed During Audit

### 2.1 Critical Fixes

| # | Issue | Root Cause | Fix Applied |
|---|---|---|---|
| 1 | **Empty core files** — `database.py`, `security.py`, `models/base.py` were 0 bytes | Files not populated during initial setup | Implemented `Base`, `engine`, `get_db()`, `UUIDMixin`, `TimestampMixin`, `hash_password`, `verify_password`, `create_access_token`, `decode_access_token` |
| 2 | **Missing `email-validator`** — `pydantic.EmailStr` import failed | Not in `requirements.txt` | Installed via `uv pip install`, added to `requirements.txt` |
| 3 | **`conftest.py` import collision** — `from app.main import app` shadowed the `app` module | Variable name `app` collided with module `app` | Renamed import to `fastapi_app` |
| 4 | **Sarvam `content: null` crash** — `SarvamChatResponse` validation error on every API call where thinking tokens exhausted the budget | `sarvam-105b` is a reasoning model; responses include `reasoning_content` tokens that consume `max_tokens`, sometimes returning `content: null` | Made `ChatMessage.content` optional (default `""`), added `reasoning_content` field, updated `SarvamChatResponse.content` property to fall back to `reasoning_content`, added truncation warning log |
| 5 | **Outbound payload included `reasoning_content: null`** — unnecessary field sent to Sarvam API | `model_dump()` serialized all fields | Changed to `model_dump(exclude_none=True, exclude={"reasoning_content"})` |

### 2.2 Architectural Improvements

| # | Issue | Resolution |
|---|---|---|
| A | **Agent state semantics** | Verified: `agent_state` on session represents the *current* state after each turn. `WAITING_FOR_STUDENT` is used when the agent has asked a question. No change needed — semantics are already correct. |
| B | **Session completion ≠ mastery** | Verified: `session_completed=true` in the agent output does NOT set `session.is_active=False`. The `is_active` field remains `True` even for completed sessions. A student can continue interacting with a completed session (state machine allows COMPLETED → INTAKE / ELICIT_REASONING). No change needed. |
| C | **Language identifier standardization** | Added `LANGUAGE_ALIASES` map in `app/agent/prompts.py` accepting both human-readable labels (`English`, `Hindi`, `Marathi`, `Hinglish`) and BCP-47 locale codes (`en-IN`, `hi-IN`, `mr-IN`, `hinglish`). Added `field_validator` on `TurnRequest` and `SessionCreate` schemas to reject invalid language values. Backward compatible — existing data using `English`/`Hindi` still works. |
| D | **API documentation accuracy** | Verified: all documented request/response examples match actual Pydantic schemas. One undocumented endpoint found: `GET /api/v1/sessions/{session_id}` (exists in code but not in API docs). Noted below. |

---

## 3. Test Results

### 3.1 Backend Tests (`pytest`)

```
tests/test_agent_state_machine.py::test_valid_state_transitions         PASSED
tests/test_agent_state_machine.py::test_invalid_transition_fallback     PASSED
tests/test_agent_state_machine.py::test_orchestrator_json_parsing_clean PASSED
tests/test_agent_state_machine.py::test_orchestrator_json_with_markdown_fence PASSED
tests/test_agent_state_machine.py::test_orchestrator_malformed_json_fallback  PASSED
tests/test_auth.py::test_user_registration_and_login                    PASSED
tests/test_health.py::test_health_check                                 PASSED
tests/test_sessions.py::test_session_lifecycle_and_authorization        PASSED
======================== 8 passed, 1 warning in 1.75s =========================
```

**Coverage**: Registration, login, JWT auth, duplicate rejection, invalid password, `/me` endpoint, session CRUD, Socratic turn processing (mocked Sarvam), message persistence, cross-user authorization (403), state machine transitions, JSON parsing (clean, fenced, malformed).

### 3.2 Database Migration

```
alembic current → 001_initial_schema (head)
```

Tables created via lifespan `create_all`; Alembic stamped at head. Migration script matches ORM model definitions.

### 3.3 Frontend

```
TypeScript:  npx tsc --noEmit → 0 errors
Build:       npm run build    → ✓ Compiled successfully, 7/7 pages generated
```

### 3.4 Live Sarvam API Verification

```
Model: sarvam-105b             → 200 OK, content returned ✓
Model: sarvam-105b-conversations → 200 OK, content returned ✓
API key authentication           → Working ✓
```

---

## 4. Outstanding Issues

### 4.1 Documentation Gap

- `GET /api/v1/sessions/{session_id}` endpoint exists in code but is not documented in `API_DOCUMENTATION.md`.

### 4.2 Sarvam Reasoning Model Behavior

- The `sarvam-105b` model is a reasoning model that allocates thinking tokens from the `max_tokens` budget. With `max_tokens=2000` (current config), this works reliably. With very low values (e.g., 50), the model exhausts the budget on reasoning and returns `content: null`. The fix handles this gracefully, but if token limits are reduced in the future, responses may degrade to empty content with a warning log.

### 4.3 Alembic + SQLite Auto-Create Conflict

- The application uses `Base.metadata.create_all()` in the lifespan for SQLite development. Running `alembic upgrade head` on a database where tables already exist via `create_all` will fail with "table already exists". Workaround: use `alembic stamp head` to mark existing schemas as migrated. For PostgreSQL production, use Alembic migrations exclusively.

### 4.4 Voice Integration (Phase 2)

- `SaarasSTTStub` and `BulbulTTSStub` are abstract stubs that raise `NotImplementedError`. No UI microphone buttons exist. This is by design for Phase 1.

### 4.5 No Frontend Test Suite

- The frontend has no automated test suite (no Jest/Vitest configuration). Testing was limited to TypeScript type checking and production build validation.

---

## 5. Environment Configuration

### Backend (`backend/.env`)

```env
PROJECT_NAME="Bhasha Doubt Solver"
ENVIRONMENT="development"
DEBUG=true

SECRET_KEY="<your-secret-key-min-32-chars>"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DATABASE_URL="sqlite+aiosqlite:///./bhasha.db"
# For PostgreSQL: DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/bhasha_db"

CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

SARVAM_API_KEY="<your-sarvam-api-key>"
SARVAM_CHAT_MODEL="sarvam-105b"
SARVAM_MAX_TOKENS=2000
SARVAM_TEMPERATURE=0.3
SARVAM_API_BASE_URL="https://api.sarvam.ai/v1"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Required Dependencies

```
Python:  3.10+
Node.js: 18+
```

---

## 6. Commands to Run the Application

### Install & Setup

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Run Development Servers

```bash
# Terminal 1 — Backend (port 8000)
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

### Run Tests

```bash
# Backend tests
cd backend
.venv\Scripts\python.exe -m pytest -v

# Frontend checks
cd frontend
npx tsc --noEmit
npm run build
```

### Access Points

| Service | URL |
|---|---|
| Frontend UI | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/v1/health |

---

## 7. Files Modified During Audit

| File | Change |
|---|---|
| `backend/app/core/database.py` | Created — async engine, `Base`, `AsyncSessionLocal`, `get_db()` |
| `backend/app/core/security.py` | Created — bcrypt hashing, JWT create/decode |
| `backend/app/models/base.py` | Created — `UUIDMixin`, `TimestampMixin` |
| `backend/app/integrations/sarvam/schemas.py` | Fixed — `ChatMessage.content` optional, added `reasoning_content`, improved `SarvamChatResponse.content` fallback |
| `backend/app/integrations/sarvam/client.py` | Fixed — `model_dump(exclude_none=True)` for outbound payload, truncation warning log |
| `backend/app/agent/prompts.py` | Added — `LANGUAGE_ALIASES` map, `resolve_language()` function for BCP-47 locale code support |
| `backend/app/schemas/agent.py` | Added — `VALID_LANGUAGES` set, `field_validator` for `natural_language` and `programming_language` on `TurnRequest` |
| `backend/app/schemas/session.py` | Added — `VALID_LANGUAGES` set, `field_validator` for `natural_language` and `programming_language` on `SessionBase` |
| `backend/tests/conftest.py` | Fixed — renamed `app` import to `fastapi_app` to resolve module/variable collision |
| `backend/requirements.txt` | Added — `email-validator>=2.0.0` |

