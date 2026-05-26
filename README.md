# VedaAI — AI Assessment Creator

Production-grade monorepo for **VedaAI**'s AI-powered question paper generator. Teachers create assignments by specifying question types, counts, marks, due date, and optional reference materials; the AI generates structured, curriculum-appropriate question papers **asynchronously**, with real-time progress streamed over WebSockets and a properly-paginated PDF export of the result.

> Built against the Figma reference: [VedaAI — Hiring Assignment](https://www.figma.com/design/nB2HMm1BhTpmHcHrmEslGB/VedaAI---Hiring-Assignment?node-id=0-1).

---

## What this delivers

**Assignment creation** — multi-step form with file upload (PDF / TXT / images up to 10 MB), due date, dynamic question-type table (counts + marks with steppers), and additional instructions; Zod validation + Zustand state.

**AI generation pipeline** — Express enqueues a BullMQ job; a worker fetches the assignment → builds a structured prompt → calls Gemini → **validates and parses the JSON** (with a built-in repair pass for truncated responses) → persists to Mongo → caches in Redis → emits WebSocket events at every stage (10 → 25 → 50 → 75 → 90 → 100 %). In serverless (Vercel) the same pipeline runs **inline** inside the HTTP request — same code path, no background worker.

**Output page** — student-info block, sections with title + instruction, numbered questions with **color-coded** `[Easy] / [Moderate] / [Challenging]` difficulty tags and `[N Marks]` suffix, an Answer Key section, a **Download as PDF** action using `@react-pdf/renderer` (proper PDF, not print-CSS), and a **Regenerate** action that re-enqueues the job. The AI's raw text is **never rendered** — only the validated, structured JSON.

**Pixel-perfect UI** — Figma-driven Tailwind theme tokens, orange V-mark brand, floating sidebar card with the Create Assignment pill, dark output banner with white Download pill, dashed upload + dashed textarea, white-pill steppers, mobile bottom nav and mobile header cards.

---

## Architecture

```
                        +--------------------------+
                        |   Next.js 14 (apps/web)  |
                        |  App Router · Tailwind   |
                        |  Zustand · WS client     |
                        |  @react-pdf/renderer     |
                        +-------------+------------+
                                      | REST + WS
                        +-------------v------------+
                        |  Express API (apps/api)  |
                        |  Routes · Controllers    |
                        |  Error + Zod middleware  |
                        +----+--------+---------+--+
                             |        |         |
                  +----------v-+ +----v--+ +----v------------+
                  |  MongoDB   | | Redis | | BullMQ Worker   |
                  | Assignment | | paper | | 1. fetch        |
                  | Paper      | | cache | | 2. build prompt |
                  +------------+ | +queue | | 3. call Gemini  |
                                 +-------+ | 4. parse+repair |
                                           | 5. persist+cache|
                                           | 6. ws.complete  |
                                           +-------+---------+
                                                   |
                                          +--------v---------+
                                          |  Gemini Flash    |
                                          |  (Google AI)     |
                                          +------------------+
```

In serverless mode the Worker box is bypassed — the same six-stage pipeline executes inline inside the `POST /api/assignments` HTTP handler.

---

## Repo layout

```
vedaai/
├── apps/
│   ├── web/                # Next.js 14 (App Router) frontend
│   │   └── src/
│   │       ├── app/        # /assignments, /assignments/create, /assignments/[id]/output, ...
│   │       ├── components/ # layout/, assignments/, create/, paper/, brand/
│   │       ├── stores/     # zustand stores (assignment, create, generation)
│   │       └── lib/        # api client, websocket client, cn()
│   │
│   └── api/                # Express + TypeScript backend
│       ├── api/index.ts    # Vercel serverless entry (wraps the Express app)
│       └── src/
│           ├── config/     # env, mongodb, redis
│           ├── models/     # Assignment, GeneratedPaper (mongoose)
│           ├── queues/     # BullMQ queue
│           ├── workers/    # generation worker (6-stage pipeline)
│           ├── services/   # promptBuilder, aiService, generationPipeline
│           ├── websocket/  # ws server, per-job rooms
│           ├── routes/     # /api/assignments, /api/jobs
│           ├── controllers/
│           └── middleware/ # errorHandler, validate
│
├── packages/
│   └── shared/             # TS types shared by web + api
│
├── docker-compose.yml      # mongo + redis + api + web (local infra)
├── vercel.json             # frontend deploy
├── apps/api/vercel.json    # backend deploy (serverless)
├── render.yaml             # alternative backend deploy on Render
└── README.md
```

---

## Tech stack

**Frontend** — Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · **Zustand** · React Hook Form + Zod · native WebSocket client (exponential backoff) · `@react-pdf/renderer` · `react-dropzone` · `lucide-react` · `date-fns`

**Backend** — Node 20+ · Express · TypeScript strict · **Mongoose** · **Redis** (ioredis for BullMQ + node-redis for cache) · **BullMQ** worker w/ retries + backoff · `ws` WebSocket server · **Google Gemini API** (configurable model)

**Infra** — MongoDB · Redis · Docker Compose (local) · Vercel (frontend + serverless backend) · Render (alt. backend) · MongoDB Atlas (managed Mongo) · Upstash Redis (managed Redis for serverless)

---

## Local development

### Prereqs
- Node 20+
- Docker Desktop (for Mongo + Redis), or local installs
- Gemini API key (optional — backend has a deterministic mock fallback)

### Install
```bash
npm install
```

### Configure env

`apps/api/.env`
```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=AIzaSy...            # optional — mock used when empty
GEMINI_MODEL=gemini-2.5-flash       # or gemini-2.0-flash
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

`apps/web/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### Start infra + dev servers
```bash
npm run docker:up        # mongo + redis
npm run build:shared     # build shared types package once
npm run dev              # api + web concurrently
```

Open http://localhost:3000.

### Full containerized stack
```bash
GEMINI_API_KEY=... npm run docker:full
```

---

## API reference

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/health`                                       | Health check |
| `POST`   | `/api/assignments`                              | Create assignment, enqueue (or inline) generation, returns `{ assignment, jobId, paperId? }` |
| `GET`    | `/api/assignments`                              | List all assignments |
| `GET`    | `/api/assignments/:id`                          | Get a single assignment |
| `DELETE` | `/api/assignments/:id`                          | Delete assignment + its paper + cache |
| `GET`    | `/api/assignments/:id/paper`                    | Generated paper (Redis-cached 24 h) |
| `POST`   | `/api/assignments/:id/regenerate`               | Re-enqueue (or inline-regenerate) |
| `GET`    | `/api/jobs/:jobId/status`                       | BullMQ job snapshot |

### WebSocket
`ws://<host>/ws/jobs/:jobId` — receives strongly-typed `WSMessage` events:

```ts
{ type: 'connected', jobId }
{ type: 'progress', stage, progress, message? }
{ type: 'completed', progress: 100, paperId }
{ type: 'failed', error }
```

Frontend client reconnects with exponential backoff (max 5 attempts). On serverless deploys the WS isn't reachable; the frontend then relies on the `paperId` returned in the POST response.

---

## Generation pipeline (the heart)

| # | Stage | Progress | What happens |
|---|---|---|---|
| 1 | `fetching`        | 10 %  | Load assignment from Mongo, mark `generating` |
| 2 | `building_prompt` | 25 %  | Construct structured prompt (counts, marks, instructions) |
| 3 | `generating`      | 50 %  | Call Gemini `:generateContent` with `responseMimeType: application/json`, thinking disabled |
| 4 | `parsing`         | 75 %  | Strict JSON.parse -> schema validation -> repair-and-retry on truncation |
| 5 | `persisting`      | 90 %  | Replace prior paper, save to Mongo, cache in Redis (24 h TTL) |
| 6 | `done`            | 100 % | Emit `completed` event with `paperId` |

Each stage is emitted to the per-job WS room. Failures emit `{ type: 'failed', error }` and mark the assignment `failed`. BullMQ retries x 3 with exponential backoff.

**Truncation repair** — when the LLM hits its output cap mid-array, `repairTruncatedJson()` walks bracket/string depth, truncates at the last complete element, and closes open `{`/`[` so the structured paper survives even partial responses.

---

## Validation (no garbage in)

**Frontend (Zod via React Hook Form)** — title required, due date `DD-MM-YYYY`, >= 1 question type, all numbers >= 1 and within sane bounds (questions <= 100, marks <= 50).

**Backend (Zod middleware)** — same schema enforced server-side; rejects empty / negative values with a `400 ValidationError`.

**AI response** — `parseResponse()` requires every section to have `label / title / instruction / questions[]`; every question to have `number / text / difficulty (easy|moderate|hard) / marks`. Bad shapes -> job fails cleanly, never reaches the UI.

---

## Deployment

The project deploys cleanly to **two Vercel projects** (one for the web app, one for the API), with managed Mongo and Redis.

### Frontend -> Vercel
1. **New Project** in Vercel -> import this repo.
2. **Root Directory**: `.` (leave at root — the root `vercel.json` handles the monorepo build).
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://your-api-vercel-url.vercel.app/api
   NEXT_PUBLIC_WS_URL  = wss://your-api-vercel-url.vercel.app
   ```
4. **Deploy**.

### Backend -> Vercel (serverless)
1. **New Project** in Vercel -> import the same repo.
2. **Root Directory**: `apps/api`.
3. **Application Preset**: `Other` (Vercel auto-detects from `apps/api/vercel.json`).
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `REDIS_URL` | Upstash Redis `rediss://...` string |
   | `GEMINI_API_KEY` | Your Google AI Studio key |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |
   | `CORS_ORIGIN` | Your Vercel frontend URL |
5. **Deploy**. Vercel reads `apps/api/vercel.json`, installs from the monorepo root, and deploys `apps/api/api/index.ts` as a serverless function with `maxDuration: 60`.

### Backend -> Render (alternative)
The repo also ships `render.yaml` (Blueprint):
1. Render -> **Blueprints** -> connect your repo.
2. Render provisions:
   - `vedaai-api` web service (Node) with health check at `/health`
   - `vedaai-redis` managed Redis (free tier)
3. Add secrets via the dashboard: `MONGODB_URI`, `GEMINI_API_KEY`, `CORS_ORIGIN`.

### MongoDB -> Atlas
1. Create a free **M0** cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a database user; allow network access from `0.0.0.0/0`.
3. Copy the SRV connection string, add `/vedaai` as the database name before the `?`, paste it into `MONGODB_URI`.

### Redis -> Upstash (for serverless)
1. https://upstash.com -> **Create database** -> Regional, free tier.
2. Copy the `rediss://...` connection string into `REDIS_URL`.

### Serverless mode (`VERCEL=1` is auto-set by Vercel)
- Standalone Worker process and WebSocket server are **not started**.
- The generation pipeline runs **inline** inside `POST /api/assignments` (max 60 s).
- The frontend immediately receives the completed assignment + `paperId` and navigates to the output page.
- All other code (BullMQ queue, WS server, etc.) is kept intact for local dev (`npm run dev:api`).

---

## Design tokens

```ts
// apps/web/tailwind.config.ts
brand:    #F4A024   // VedaAI orange (logo, badges, ring)
ink:      #1A1A1A   // primary text + pill buttons
muted:    #6B7280   // secondary text
page:     #F9FAFB   // page canvas
subtle:   #F5F5F5   // active nav background
line:     #E5E7EB   // borders/dividers
easy:     #DCFCE7 / #15803D
moderate: #FEF3C7 / #92400E
hard:     #FEE2E2 / #B91C1C
```

---

## Approach and decisions

- **Monorepo with `packages/shared`** — a single source of truth for `Assignment`, `Section`, `Question`, `WSMessage`, etc. Both apps import the same types; no drift between frontend expectations and backend payloads.
- **Async by default, inline as fallback** — locally the API enqueues to BullMQ and the worker processes in the background while WebSocket events stream progress. On Vercel (serverless) the exact same `runGenerationPipeline()` function runs inline inside the HTTP request. One pipeline, two execution models.
- **Never render raw AI** — every model response is JSON-parsed, schema-validated, and (if truncated) repaired before it touches the UI. A partial / malformed response surfaces as a clean failure with `Try Again` rather than garbled text on screen.
- **Pixel pass driven by exports** — Figma frames were pulled in as PNGs and the Tailwind tokens + every component was tuned against them: the floating sidebar card with the orange-outlined Create pill, the rounded white TopHeader pill, the dark output banner with the white Download pill, dashed file upload + dashed textarea, white-pill dropdowns + steppers, mobile bottom nav, color-coded difficulty tags inline with the question text.
- **PDF export is a real PDF** — uses `@react-pdf/renderer` to construct an A4 document with proper page breaks, fonts and layout — not a print-CSS hack. Filename pattern: `{subject}_{class}_{date}_question_paper.pdf`.

---

## Operational notes

- **Memory** — Next.js dev compile is heavy (~3 GB on Windows). The provided dev scripts use `NODE_OPTIONS=--max-old-space-size=4096` to avoid the `RangeError: Array buffer allocation failed` you'll otherwise hit on Windows.
- **Gemini free-tier quotas** — `gemini-2.0-flash` and `gemini-2.0-flash-lite` have daily caps that exhaust fast in dev. If you see `429 RESOURCE_EXHAUSTED`, switch `GEMINI_MODEL` to `gemini-2.5-flash` (separate quota pool) and restart the API.
- **Vercel function timeout** — the inline generation can take 15-30 s for a long paper. The function's `maxDuration` is set to 60 s in `apps/api/vercel.json` which is the cap on Vercel Hobby's Node runtime.

---

## Scripts

```bash
npm run dev          # api + web concurrently
npm run dev:api      # api only
npm run dev:web      # web only
npm run build        # shared -> api -> web
npm run docker:up    # mongo + redis containers
npm run docker:full  # full stack containerized
```

---

Made for the **VedaAI Full Stack Engineering Assignment**.
