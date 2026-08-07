<div align="center">

# Claude Scope

**Inspect your UI. Prompt your AI.**

Record your browser tab, detect UI changes, inspect the DOM via accessibility snapshots, and generate structured system prompts for AI coding agents — automatically.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://claude-scope-frontend-production.up.railway.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Live App](https://claude-scope-frontend-production.up.railway.app/) · [Documentation](https://claudescope.mintlify.app/) · [Report Bug](https://github.com/ash-win19/claude-scope/issues) · [Request Feature](https://github.com/ash-win19/claude-scope/issues)

</div>

---

## What is Claude Scope?

Claude Scope bridges the gap between what you **see** in a UI and what an AI coding agent **needs to know** to fix or build it.

Instead of manually writing prompts describing your UI state, you simply **record your screen**, and Claude Scope:

1. **Extracts key frames** using SSIM-based frame differencing
2. **Analyzes each frame** with Vision AI for element detection
3. **Captures ARIA accessibility snapshots** via Playwright for structural inspection
4. **Synthesizes** both lanes into a single structured prompt ready for your coding agent

The generated prompt works with **Claude Code**, **OpenAI Codex**, **Cursor**, or as **raw markdown**.

## Demo

🔗 **Try it live:** [claude-scope-frontend-production.up.railway.app](https://claude-scope-frontend-production.up.railway.app/)

## How It Works

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────────────┐
│  Record Tab  │────▶│  Frame Extraction  │────▶│  Dual-Lane Analysis │
│  (Browser)   │     │  (FFmpeg + SSIM)   │     │                     │
└──────────────┘     └───────────────────┘     │  ┌───────────────┐  │
                                                │  │  Vision AI    │  │
                                                │  │  (Anthropic)  │  │
                                                │  └───────┬───────┘  │
                                                │          │          │
                                                │  ┌───────▼───────┐  │
                                                │  │   Synthesis   │──┼──▶  Structured Prompt
                                                │  └───────▲───────┘  │
                                                │          │          │
                                                │  ┌───────┴───────┐  │
                                                │  │  Playwright   │  │
                                                │  │  (ARIA Tree)  │  │
                                                │  └───────────────┘  │
                                                └─────────────────────┘
```

| Step | What happens |
|------|-------------|
| **Record** | Capture any browser tab. Claude Scope extracts key frames using SSIM-based frame differencing — no manual screenshots needed. |
| **Analyze** | Vision AI analyzes each frame for UI elements. Playwright inspects the URL and captures a full ARIA accessibility snapshot. Both run simultaneously. |
| **Prompt** | The visual timeline and structural inspection are merged into a single prompt. Copy it into Claude Code, Codex, or Cursor and start coding. |

## Architecture

Claude Scope is a full-stack application with a React SPA frontend and a NestJS API backend, connected to a PostgreSQL database hosted on Neon.

```
claude-scope/
├── frontend/          # React SPA (Vite + TypeScript)
├── backend/           # NestJS API (TypeScript)
├── design-system/     # Shared design tokens
└── README.md
```

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tooling & dev server |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| TanStack Query v5 | Server state & caching |
| Tailwind CSS v3 | Utility-first styling |
| Radix UI | Accessible headless primitives |
| Auth0 | Authentication |
| Lucide React | Icon system |
| Shiki | Syntax highlighting for generated prompts |

### Backend

| Technology | Purpose |
|-----------|---------|
| NestJS 11 | API framework |
| Drizzle ORM | Type-safe database queries |
| Neon (PostgreSQL) | Serverless database |
| Passport + JWT | Auth0 RS256 token validation |
| Anthropic SDK | Vision AI analysis |
| Playwright | ARIA accessibility snapshot capture |
| FFmpeg | Video frame extraction |
| Swagger | API documentation |

### Database Schema

```
users ──────────── sessions ──────── frames
  │                    │                 │
  ├── user_settings    ├── session_      ├── session_assets
  │                    │   analysis      │
  └── user_model_      └── (processing   └── (thumbnails,
      credentials          status, prompt)     ARIA trees)
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **FFmpeg** installed locally
- **PostgreSQL** database (or a [Neon](https://neon.tech) account)
- **Auth0** application configured
- **Anthropic API key** (for vision analysis)

### Environment Variables

#### Frontend (`frontend/.env`)

```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-auth0-audience
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience
PORT=3000
FRONTEND_URL=http://localhost:8080
ANTHROPIC_API_KEY=your-anthropic-api-key
CREDENTIAL_ENCRYPTION_KEY=your-32-byte-hex-key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/ash-win19/claude-scope.git
cd claude-scope

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running Locally

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (port 3000)
cd backend
npm run start:dev

# Terminal 2 — Frontend (port 8080)
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |

### Database Migrations

```bash
cd backend
npm run db:generate    # Generate migration files from schema changes
npm run db:migrate     # Apply pending migrations
npm run db:studio      # Open Drizzle Studio for visual DB exploration
```

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/me` | GET | Sync authenticated user |
| `/api/sessions` | GET | List user sessions |
| `/api/sessions/:id` | GET | Session details with frames |
| `/api/recordings` | POST | Upload screen recording (multipart, max 100MB) |
| `/api/settings` | GET/PATCH | User preferences |
| `/api/credentials` | CRUD | Encrypted API key management |
| `/api/assets/:id` | GET | Serve session assets (thumbnails, etc.) |

Full API documentation is available at `/api/docs` (Swagger) when running the backend.

## Key Features

- **Screen Recording** — Record any browser tab directly from the app using the `getDisplayMedia` API
- **Intelligent Frame Extraction** — SSIM-based differencing detects meaningful UI changes and discards duplicate frames
- **Dual-Lane Analysis** — Vision AI and Playwright run in parallel for comprehensive UI understanding
- **ARIA Accessibility Snapshots** — Full accessibility tree capture with diff tracking between frames
- **Multi-Agent Support** — Generate prompts formatted for Claude Code, Codex, Cursor, or raw markdown
- **BYOK (Bring Your Own Key)** — Users provide their own Anthropic API key; credentials are encrypted at rest
- **Real-Time Processing Status** — Live pipeline status tracking across extraction, vision, Playwright, and synthesis stages
- **Session Management** — Organize recordings with titles, notes, and searchable session history

## Deployment

The backend includes a production `Dockerfile`:

```dockerfile
# Node 22 slim base with FFmpeg and Playwright Chromium
FROM node:22-slim
# Installs ffmpeg, Playwright Chromium, builds NestJS
```

The app is deployed on **Railway**:

- **Frontend:** [claude-scope-frontend-production.up.railway.app](https://claude-scope-frontend-production.up.railway.app/)
- **Database:** Neon PostgreSQL (serverless)

## Scripts Reference

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run start:dev` | NestJS watch mode (port 3000) |
| `npm run start:prod` | Production server |
| `npm run build` | Compile TypeScript |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |

## Tech Stack at a Glance

```
Frontend:  React · Vite · TypeScript · Tailwind · Radix UI · Zustand · TanStack Query · Auth0
Backend:   NestJS · Drizzle ORM · Passport JWT · FFmpeg · Playwright · Anthropic SDK
Database:  PostgreSQL (Neon)
Infra:     Render · Docker · Auth0
```

## Deploy on Render

The repo ships a [`render.yaml`](./render.yaml) Blueprint that provisions two services:

| Service | Type | Plan | Notes |
|---------|------|------|-------|
| `claude-scope-backend` | Docker web service | **Standard (2 GB)** | Runs Chromium + ffmpeg — needs a real container and >512 MB RAM (free/starter will OOM mid-recording). Persistent disk mounted at `/app/uploads`. |
| `claude-scope-frontend` | Static site | Free | Vite SPA served from Render's CDN — no cold start. SPA rewrite (`/* → /index.html`). |

Postgres is **not** provisioned by Render — the app uses **Neon** (external). Point `DATABASE_URL` at your Neon connection string.

### 1. Environment variables

**Backend** (`claude-scope-backend`):

| Var | Secret? | Value / source |
|-----|---------|----------------|
| `DATABASE_URL` | 🔒 secret | Neon connection string (`...?sslmode=require`) |
| `ANTHROPIC_API_KEY` | 🔒 secret | Server-side Anthropic key |
| `CREDENTIAL_ENCRYPTION_KEY` | 🔒 secret | `openssl rand -hex 32` — **never rotate** (existing stored user credentials become undecryptable) |
| `AUTH0_DOMAIN` | plain | e.g. `claude-scope.us.auth0.com` |
| `AUTH0_AUDIENCE` | plain | `https://api.claude-scope.com` |
| `FRONTEND_URL` | plain | The frontend service URL (for CORS), e.g. `https://claude-scope-frontend.onrender.com` |
| `PORT` | — | **Do not set** — Render injects it; `main.ts` honors `process.env.PORT` |

**Frontend** (`claude-scope-frontend`) — all `VITE_*` vars are **build-time** (baked into the bundle, public; changing one requires a rebuild):

| Var | Value |
|-----|-------|
| `VITE_API_BASE_URL` | Backend URL **with `/api` suffix**, e.g. `https://claude-scope-backend.onrender.com/api` |
| `VITE_AUTH0_DOMAIN` | e.g. `claude-scope.us.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA client ID |
| `VITE_AUTH0_AUDIENCE` | `https://api.claude-scope.com` |

### 2. Resolve the URL chicken-and-egg

Each service needs the other's URL. After the first deploy:

1. Set the backend's `FRONTEND_URL` to the frontend's Render URL (triggers a backend redeploy).
2. Set the frontend's `VITE_API_BASE_URL` to `<backend-url>/api` and **redeploy the frontend** (it's baked at build time).

Using a custom domain for each service up front avoids this dance.

### 3. Auth0 dashboard (manual)

In the Auth0 SPA application, add the **frontend** Render URL to:

- **Allowed Callback URLs:** `https://<frontend>.onrender.com/workspace`
- **Allowed Logout URLs:** `https://<frontend>.onrender.com`
- **Allowed Web Origins:** `https://<frontend>.onrender.com`

Confirm an Auth0 **API** exists with Identifier (audience) `https://api.claude-scope.com`, signing alg RS256. (The backend never appears in Auth0 config — it only validates tokens via JWKS.)

### 4. Migrations

The backend Docker `CMD` runs `db:migrate:prod` on boot — idempotent and fine for a single instance. If you ever scale the backend past 1 instance, move migrations to a Render pre-deploy command (concurrent boots would race; Drizzle takes no advisory lock).

### 5. Verify

- Backend health: `GET https://<backend>.onrender.com/api/health` returns `{ status: "ok" }`.
- Run one recording end-to-end (confirms no OOM under Chromium + ffmpeg).
- Redeploy the backend and confirm previously uploaded assets still load (validates the persistent disk).

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Claude Scope** — Stop describing bugs with words.

[Get Started](https://claude-scope-frontend-production.up.railway.app/) · [Read the Docs](https://claudescope.mintlify.app/)

</div>
