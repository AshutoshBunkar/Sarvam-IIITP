# Bhasha Doubt Solver — API Documentation (v1)

Base URL: `http://localhost:8000/api/v1`

All responses are delivered in JSON format. Authenticated routes require an `Authorization: Bearer <token>` header.

---

## 1. Health

### Check Service Health
- **Endpoint**: `GET /api/v1/health`
- **Auth**: None
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "app": "Bhasha Doubt Solver",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected",
  "sarvam_configured": true,
  "sarvam_model": "sarvam-105b"
}
```

---

## 2. Authentication

### Register Student
- **Endpoint**: `POST /api/v1/auth/register`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "full_name": "Arjun Sharma",
  "preferred_language": "Hindi",
  "programming_language": "python"
}
```
- **Response**: `201 Created`
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "student@example.com",
  "full_name": "Arjun Sharma",
  "is_active": true,
  "created_at": "2026-11-03T12:00:00Z",
  "profile": {
    "preferred_language": "Hindi",
    "programming_language": "python",
    "experience_level": "beginner"
  }
}
```

### Student Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```
- **Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Get Authenticated Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Auth**: `Bearer <token>`
- **Response**: `200 OK`
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "student@example.com",
  "full_name": "Arjun Sharma",
  "is_active": true,
  "created_at": "2026-11-03T12:00:00Z",
  "profile": {
    "preferred_language": "Hindi",
    "programming_language": "python",
    "experience_level": "beginner"
  }
}
```

---

## 3. Sessions & Socratic Turns

### Create New Doubt Session
- **Endpoint**: `POST /api/v1/sessions`
- **Auth**: `Bearer <token>`
- **Request Body**:
```json
{
  "title": "Recursion Doubt",
  "programming_language": "python",
  "natural_language": "English"
}
```
- **Response**: `201 Created`
```json
{
  "id": "8c385b0d-13bb-40ae-ba81-64d856230f81",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Recursion Doubt",
  "programming_language": "python",
  "natural_language": "English",
  "current_state": "INTAKE",
  "is_active": true,
  "created_at": "2026-11-03T12:05:00Z",
  "updated_at": "2026-11-03T12:05:00Z"
}
```

### List Student Sessions
- **Endpoint**: `GET /api/v1/sessions?limit=50&offset=0`
- **Auth**: `Bearer <token>`
- **Response**: `200 OK`
```json
[
  {
    "id": "8c385b0d-13bb-40ae-ba81-64d856230f81",
    "title": "Recursion Doubt",
    "programming_language": "python",
    "natural_language": "English",
    "current_state": "ELICIT_REASONING",
    "is_active": true,
    "created_at": "2026-11-03T12:05:00Z",
    "updated_at": "2026-11-03T12:06:00Z",
    "message_count": 2
  }
]
```

### Get Session Detail
- **Endpoint**: `GET /api/v1/sessions/{session_id}`
- **Auth**: `Bearer <token>`
- **Parameters**: `session_id` (UUID in path)
- **Response**: `200 OK`
```json
{
  "id": "8c385b0d-13bb-40ae-ba81-64d856230f81",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Recursion Doubt",
  "programming_language": "python",
  "natural_language": "English",
  "current_state": "ELICIT_REASONING",
  "is_active": true,
  "created_at": "2026-11-03T12:05:00Z",
  "updated_at": "2026-11-03T12:06:00Z"
}
```

### Get Session Message History
- **Endpoint**: `GET /api/v1/sessions/{session_id}/messages`
- **Auth**: `Bearer <token>`
- **Response**: `200 OK`
```json
[
  {
    "id": "a1b2c3d4-...",
    "session_id": "8c385b0d-...",
    "role": "user",
    "content": "Why does my recursive factorial function give a recursion error?",
    "code_snippet": "def fact(n):\n    return n * fact(n - 1)",
    "agent_state": "INTAKE",
    "created_at": "2026-11-03T12:05:10Z"
  },
  {
    "id": "e5f6g7h8-...",
    "session_id": "8c385b0d-...",
    "role": "assistant",
    "content": "Let's examine your approach first. What do you think happens when fact(0) is executed in your code?",
    "code_snippet": null,
    "agent_state": "ELICIT_REASONING",
    "created_at": "2026-11-03T12:05:15Z"
  }
]
```

### Submit a Dialogue Turn
- **Endpoint**: `POST /api/v1/sessions/{session_id}/turns`
- **Auth**: `Bearer <token>`
- **Request Body**:
```json
{
  "user_message": "It calls fact(-1), then fact(-2), and never stops.",
  "code_snippet": null,
  "programming_language": "python",
  "natural_language": "English"
}
```
- **Response**: `200 OK`
```json
{
  "session_id": "8c385b0d-13bb-40ae-ba81-64d856230f81",
  "assistant_message": "Spot on! You noticed that the numbers keep decreasing indefinitely. What condition can you add so that the function returns a known answer instead of continuing to call itself?",
  "agent_state": "ANALYZE_ATTEMPT",
  "awaiting_student": true,
  "language": "English",
  "code_blocks": [],
  "session_completed": false,
  "user_message_id": "b3c4d5e6-...",
  "assistant_message_id": "f7a8b9c0-..."
}
```

---

## 4. Error Responses

Standard HTTP error status codes are returned:
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Attempting to access another student's session.
- `404 Not Found`: Session or resource not found.
- `422 Unprocessable Entity`: Validation failure or duplicate email.
- `502 Bad Gateway`: Upstream Sarvam AI connection failure or invalid credentials.

Example error body:
```json
{
  "detail": "You are not authorized to access this session.",
  "details": {}
}
```

