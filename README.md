## Treyson Website Monorepo

This repository now hosts the React frontend and the FastAPI backend side‑by‑side. Each app keeps its own tooling, but the root README gives you the mental model plus the minimum commands to get going.

```
.
├── frontend/   # Vite + React + Tailwind (public site + dashboard)
└── backend/    # FastAPI + SQLModel + Alembic (API + persistence)
```

### Frontend

```
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Key files:

- `src/pages/Stats.tsx` & hooks – stats page + work log UI.
- `src/lib/config.ts` – frontend runtime config (GitHub username, API base URL).
- `src/lib/api.ts` – thin helper for backend requests (so components stay clean).

### Backend

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Key files:

- `app/main.py` – FastAPI app factory + CORS + router registration.
- `app/routers/` – API endpoints (one module per domain, e.g. `work_log.py`).
- `models.py` – SQLModel models shared between routers and Alembic.
- `alembic/` – migrations (use `alembic revision --autogenerate` after model changes).

### Environment variables

- Frontend:
  - `VITE_API_BASE_URL` so the SPA knows where to call the backend.
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Supabase Auth (Google OAuth uses these to bootstrap the client SDK).
  - `VITE_ALLOWED_WORKLOG_USER_ID` to indicate which Supabase user owns the work log (used to hide the form for everyone else).
  - **Optional**: `VITE_USE_API_PROXY=true` if you only want to talk to the API through Express (see proxy section below).
- Backend:
  - `DATABASE_URL` and `CORS_ORIGINS` (comma-separated origins like `http://localhost:5173,http://localhost:4173`).
  - Supabase auth secrets: `SUPABASE_JWT_SECRET` (from your Supabase project settings) plus optional overrides for `SUPABASE_JWT_AUDIENCE`/`SUPABASE_JWT_ALGORITHM`.
  - `ALLOWED_WORKLOG_USER_ID` so only that user can create/update/delete entries while everyone else can read.
  - When you run behind the proxy we add below, include `http://localhost:8081` in `CORS_ORIGINS`.

### Google OAuth with Supabase + same-origin proxy

1. In Supabase → Authentication → Providers, enable **Google** and add your OAuth credentials (redirect URL should include your frontend origin, e.g. `http://localhost:8081`).
2. Copy the project URL + anon key into `frontend/.env.local`.
3. Copy the JWT secret (Auth → Settings → JWT) into `backend/.env`.
4. Start the Express proxy (see `proxy/server.ts` below) so your React dev server can hit the API on the same origin; the middleware injects the `Authorization` header from the current Supabase session.
5. Restart both apps. Public visitors hit `/stats` and see the work log in read-only mode; only the configured Supabase user can sign in via `/auth` to add or delete entries, and every write request includes the JWT through the proxy.

With this layout you can evolve each side independently while still keeping everything in one repo. Add more backend routers (e.g. `/work-log`) and surface them in the frontend by exporting typed helpers in `src/lib/api.ts`. Just keep the cross‑cutting config in the env files so switching between local and production remains painless.
