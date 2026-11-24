# AI Agent Development Guidelines: DocAppointment AI Service

This document defines the core architecture, operational constraints, and development guidelines for AI agents and developers modifying the Python AI Clinical Agent service.

---

## 1. Role and Domain Boundaries

The DocAppointment AI Service operates strictly as an informational clinical triage and doctor appointment scheduling assistant.

### Strict Scope Constraints
1. **Medical Triage & Consultation Routing Only**:
   - The assistant only assists patients with preliminary symptom triage, home-care supportive tips, doctor recommendations, and appointment reservations.
   - It MUST NEVER provide prescription drug advice, off-label dosage instructions, or definitive clinical diagnoses.
2. **Mandatory Disclaimer**:
   - Every health consultation response must state that AI triage is informational and not a replacement for an in-person physical clinical consultation.
3. **Emergency Interception**:
   - Life-threatening symptoms (chest pain, dyspnea, stroke signs, severe hemorrhage, anaphylaxis) must be intercepted immediately without initiating normal appointment booking.
4. **Out-of-Domain Refusal**:
   - Inquiries about coding, software development, cryptocurrency, finance, politics, or entertainment must be courteously refused and redirected back to healthcare topics.

---

## 2. Technology Stack & Tooling

The AI Service strictly uses the following modern stack:
- **Runtime**: Python `>= 3.11` (Python 3.13)
- **Dependency & Project Management**: `uv` (`uv sync`, `uv run`)
- **API Framework**: FastAPI 0.115+
- **Agent Orchestration**: LangGraph 0.2+, LangChain 0.3+
- **Inference Engine**: ChatGroq via `langchain-groq` (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`)
- **Database Access**: PyMongo (sync operations for tool calls) and Motor (async operations)
- **Validation**: Pydantic v2, Pydantic Settings

Do NOT introduce legacy requirements files (`requirements.txt`), pipenv, or poetry. Manage all dependencies using `uv add` or `uv remove`.

---

## 3. Codebase Directory Organization

```text
src/docappoint_ai_agent/
├── config.py           # Centralized configuration using Pydantic Settings
├── main.py             # FastAPI entrypoint, CORS configuration, lifecycle
├── api/
│   ├── routes.py       # REST and SSE streaming endpoints
│   ├── schemas.py      # Pydantic request and response models
│   └── dependencies.py # Authentication guards and JWT decoding
├── core/
│   ├── database.py     # MongoDB connection management and query utilities
│   ├── security.py     # JWT token decoding using shared secret
│   └── logging.py      # Structured clinical logging
└── agent/
    ├── state.py        # LangGraph TypedDict AgentState
    ├── prompts.py      # System instructions and clinical prompts
    ├── guardrails.py   # Emergency and out-of-domain rule evaluations
    ├── graph.py        # LangGraph StateGraph assembly and MemorySaver checkpointer
    └── tools/
        ├── doctor_tools.py      # Doctor search and availability tools
        ├── appointment_tools.py # Booking, cancellation, and appointment listing tools
        └── triage_tools.py      # Symptom assessment and specialty discovery tools
```

---

## 4. Architectural Rules

### 1. Separation of Concerns
- **Endpoints (`api/routes.py`)**: Responsible for HTTP validation, passing inputs to `agent_graph`, and returning structured responses. Business logic must not reside in routes.
- **Agent Graph (`agent/graph.py`)**: Assembles the LangGraph StateGraph. Guardrails execute as the initial node before invoking the LLM.
- **Tools (`agent/tools/*.py`)**: Encapsulate discrete deterministic functions decorated with `@tool`. Tools MUST interact with the database through `db_manager` and handle offline/fallback conditions gracefully.
- **Data Access (`core/database.py`)**: The only module permitted to perform PyMongo or Motor queries against MongoDB.

### 2. State & StateGraph Principles
- Use standard `TypedDict` for `AgentState` with `add_messages` annotation for the message list.
- Checkpointing is handled in-memory using `MemorySaver`, keyed by `configurable: {"thread_id": session_id}`.
- All conditional edge functions must accept `state: AgentState` and return clean destination node names or `END`.

### 3. MongoDB Schema Contract
- Do not alter MongoDB collection names or field structures without synchronizing with the Node.js backend.
- The `slots_booked` structure in `doctormodels` uses date strings in `D_M_YYYY` format (e.g. `18_11_2026`).
- The `appointmentmodels` document must match the schema: `userId`, `docId`, `slotDate`, `slotTime`, `userData`, `docData`, `amount`, `data`, `cancelled`, `payment`, `isCompleted`.

---

## 5. Testing & Verification Standard

Before proposing any change:
1. Run the test suite:
   ```bash
   uv run pytest -v
   ```
2. Verify that all 21 test suites pass with zero failures:
   - `test_guardrails.py`: Validates emergency alerts and out-of-domain filtering.
   - `test_tools.py`: Validates tool execution, specialty mappings, and slot bookings.
   - `test_graph.py`: Validates LangGraph state transitions and conditional routing.
   - `test_api.py`: Validates FastAPI HTTP endpoints and payload serialization.
3. Keep code clean: Avoid emojis, unnecessary logging comments, and unverified library imports.

---

## 6. Docker & Container Orchestration Rules

1. Keep `Dockerfile` clean: Multi-stage build using `ghcr.io/astral-sh/uv:python3.13-bookworm-slim` builder and `python:3.13-slim-bookworm` runtime.
2. In `docker-compose.yml`, the service name is `ai-agent` and container name is `docappoint_ai_agent`.
3. It depends on `mongo` with `condition: service_healthy` and joins `docappoint_net`.
4. Ensure internal communication uses `mongodb://mongo:27017` and matches the shared `JWT_SECRET`.

---

## 7. Frontend Integration Standards

The patient client application in `frontend/` connects to this service via:
1. **API Service (`frontend/src/services/aiAgentService.js`)**:
   - Uses `VITE_AI_AGENT_URL` (default: `http://localhost:8000`).
   - Persists session IDs in `localStorage` under `docappoint_ai_session_id`.
   - Injects the authenticated patient's token into the `token` and `Authorization` headers.
2. **Components & Routes**:
   - Floating widget: `<ChatbotWidget />` registered globally in `frontend/src/App.jsx`.
   - Dedicated consultation page: `<AiConsultant />` accessible at `/ai-assistant` and `/ai-consultant`.
   - Navigation links: Linked in `Navbar.jsx` with an "AI Assistant" badge.
