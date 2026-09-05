# FixFlow — Smart property maintenance, from problem to resolution.

> Property maintenance, without the chaos. FixFlow connects tenants, property managers, and technicians in one intelligent workflow.

![FixFlow](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI%20%2B%20PostgreSQL-black) ![Demo Ready](https://img.shields.io/badge/Demo-Ready-success)

## Problem
Property maintenance is fragmented: tenant messages landlord → landlord hunts for technician → repair tracked in chats → history lost → recurring issues missed → costs balloon.

## Solution
FixFlow structures the entire lifecycle:

**Report → AI Triage → Assign → Track → Verify → Cost → Learn**

- **AI Maintenance Triage**: deterministic mock (live OpenAI when `USE_REAL_AI=1`) categorizes in <1s, with clear `MOCK` badge.
- **Maintenance Intelligence**: detects recurring issues (e.g., "Sunrise Apartments — 4 plumbing in 60 days, 2.3× avg"), spending by category, resolution trends.
- **Three-sided workflow**: Tenant (report) → Manager (assign + analytics) → Technician (execute).

## Features
- **Tenant**: property view, 30-sec report with photo, instant AI card (category/urgency/action), timeline, history.
- **Manager**: portfolio dashboard, priority queue, properties with occupancy/cost, assignment, status controls, analytics & smart alerts.
- **Technician**: Today's/Upcoming/Completed jobs, status transitions (Accepted → On the way → In Progress → Completed), notes, cost.
- **System**: JWT + RBAC, REST API, notifications, search/filter/sort, responsive, skeletons/empty states.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite, Tailwind CSS, React Router, Recharts, Lucide, Axios
- **Backend**: FastAPI + SQLAlchemy + Pydantic, JWT (python-jose), Passlib/bcrypt
- **DB**: SQLite (dev) / PostgreSQL (prod via `DATABASE_URL`) — same SQLAlchemy models
- **AI**: `backend/app/ai_service.py` — keyword mock + optional OpenAI `gpt-4o-mini`

## Architecture
```
Frontend (Vite React) → REST API (FastAPI) → Auth (JWT/RBAC) → Business Logic → AI Service → PostgreSQL
```
See `docs/architecture.md` for diagram + lifecycle.

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic-settings python-jose passlib bcrypt python-multipart alembic
python -m uvicorn app.main:app --reload --port 8000
# -> http://localhost:8000/docs
```

Env (`backend/.env.example`):
```
DATABASE_URL=sqlite:///./fixflow.db
SECRET_KEY=change-me
OPENAI_API_KEY=
USE_REAL_AI=0
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# -> http://localhost:5173  (expects API at http://localhost:8000)
# or VITE_API_URL=http://localhost:8000 npm run dev
```

## Demo Accounts (password: `demo123`)
| Role | Email | Use |
|------|-------|-----|
| Manager | `manager@fixflow.demo` | Dashboard, analytics, assign |
| Tenant (Alex) | `alex@demo.com` | Sunrise Apt 4B — hero leak scenario |
| Technician | `carlos@fixflow.demo` | Plumbing jobs |

Seeded: 4 properties, 29 units, 16 seeded requests + live creations, 5 technicians, costs & recurring plumbing pattern.

### Perfect Demo (60 sec)
1. Login as **Alex** (`alex@demo.com`) → Tenant → paste: *"Water is leaking underneath the kitchen sink and the cabinet is getting wet."* → Preview AI → Submit → see `FF-10xx` with **Plumbing / High** + timeline.
2. Login as **Manager** → Dashboard shows new High-priority ticket at top, Smart Alert for Sunrise.
3. Open ticket → Assign **Carlos Rivera** → status → Assigned.
4. Login as **Carlos** → Technician → Today's Jobs → change to **In Progress** → add notes + cost → **Completed**.
5. Back as Manager → Analytics → spending + Avg resolution updated, recurring insight persists.

## API (selected)
```
POST /api/auth/login
GET  /api/auth/me
POST /api/ai/analyze-maintenance
POST /api/maintenance
GET  /api/maintenance?search=&status=&priority=&category=&sort=
GET  /api/maintenance/{id}
PATCH /api/maintenance/{id}
POST /api/maintenance/{id}/assign
POST /api/maintenance/{id}/notes
POST /api/maintenance/{id}/complete
GET  /api/properties
GET  /api/properties/{id}
GET  /api/technicians
GET  /api/analytics/overview
GET  /api/analytics/notifications
POST /api/seed   # reset demo data
```

## Business Model
- **Starter** $19/mo — up to 10 units — tickets + tenant portal + basic analytics
- **Growth** $59/mo — up to 100 units — AI triage + tech management + smart alerts + advanced analytics
- **Scale** Custom — unlimited + team + API + priority
- Future: marketplace fee (10% on technician jobs), premium AI, enterprise integrations.

## Project Structure
```
FixFlow/
  backend/app/{main,database,models,schemas,auth,ai_service,seed,routers/*}
  frontend/src/{pages,components,context,lib}
  docs/architecture.md
```

## Deployment
- Frontend: Vercel (`VITE_API_URL` env)
- Backend: Render/Railway/Fly (`DATABASE_URL` → Supabase/Postgres)
- DB: `Base.metadata.create_all` on boot + seed if empty; use Alembic for migrations in prod.

## Roadmap
- File storage (Supabase Storage) + image AI
- Push notifications, SLA timers, recurring preventive work orders
- Technician marketplace & payouts
- Mobile PWA + offline queue

## Hackathon Notes
Built for **Next Founders Hackathon** — optimized for Technical (real auth/RBAC/DB), Innovation (AI triage + intelligence), Business (clear pricing), Communication (landing → demo in 30s).

---
© 2026 FixFlow
