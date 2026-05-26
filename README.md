# VedaAI — AI Assessment Creator

Production-grade monorepo for **VedaAI**'s AI-powered question paper generator. Teachers create assignments by specifying question types, counts, marks, due date, and optional reference materials; the AI generates structured, curriculum-appropriate question papers **asynchronously**, with real-time progress streamed over WebSockets and a properly-paginated PDF export of the result.

> Built against the Figma reference: [VedaAI — Hiring Assignment](https://www.figma.com/design/nB2HMm1BhTpmHcHrmEslGB/VedaAI---Hiring-Assignment?node-id=0-1).

---

## ✨ What this delivers

**Assignment creation** — multi-step form with file upload (PDF / TXT / images up to 10 MB), due date, dynamic question-type table (counts + marks with steppers), and additional instructions; Zod validation + Zustand state.

**AI generation pipeline** — Express enqueues a BullMQ job; a worker fetches the assignment → builds a structured prompt → calls Gemini → **validates and parses the JSON** (with a built-in repair pass for truncated responses) → persists to Mongo → caches in Redis → emits WebSocket events at every stage (10 → 25 → 50 → 75 → 90 → 100 %).

**Output page** — student-info block, sections with title + instruction, numbered questions with **color-coded** `[Easy] / [Moderate] / [Challenging]` difficulty tags and `[N Marks]` suffix, an Answer Key section, a **Download as PDF** action using `@react-pdf/renderer` (proper PDF, not print-CSS), and a **Regenerate** action that re-enqueues the job. The AI's raw text is **never rendered** — only the validated, structured JSON.

**Pixel-perfect UI** — Figma-driven Tailwind theme tokens, orange V-mark brand, floating sidebar card with the Create Assignment pill, dark output banner with white Download pill, dashed upload + dashed textarea, white-pill steppers, mobile bottom nav and mobile header cards.

---

## 🧱 Architecture

```
                        ┌──────────────────────────┐
                        │   Next.js 14 (apps/web)  │
                        │  App Router · Tailwind   │
                        │  Zustand · WS client     │
                        │  @react-pdf/renderer     │
                        └────────────┬─────────────┘
                                     │ REST + WS
                        ┌────────────▼─────────────┐
                        │  Express API (apps/api)  │
                        │  Routes · Controllers    │
                        │  Error + Zod middleware  │
                        └────┬───────┬──────┬──────┘
                             │       │      │
                  ┌──────────▼─┐ ┌───▼───┐ ┌▼────────────────┐
                  │  MongoDB   │ │ Redis │ │ BullMQ Worker   │
                  │ Assignment │ │ paper │ │ ① fetch         │
                  │ Paper      │ │ cache │ │ ② build prompt  │
                  └────────────┘ │ +queue│ │ ③ call Gemini   │
                                 └───────┘ │ ④ parse+repair  │
                                           │ ⑤ persist+cache │
                                           │ ⑥ ws.complete   │
                                           └─────────────────┘
                                                   │
                                          ┌────────▼─────────┐
                                          │  Gemini Flash    │
                                          │  (Google AI)     │
                                          └──────────────────┘
```

---

## 📁 Repo layout

```
vedaai/
├── apps/
│   ├── web/                # Next.js 14 (App Router) frontend
│   │   └── src/
│   │       ├── app/        # /assignments, /assignments/create, /assignments/[id]/output, …
│   │       ├── components/ # layout/, assignments/, create/, paper/, brand/
│   │       ├── stores/     # zustand stores (assignment, create, generation)
│   │       └── lib/        # api client, websocket client, cn()
│   │
│   └── api/                # Express + TypeScript backend
│       └── src/
│           ├── config/     # env, mongodb, redis
│           ├── models/     # Assignment, GeneratedPaper (mongoose)
│           ├── queues/     # BullMQ queue
│           ├── workers/    # generation worker (6-stage pipeline)
│           ├── services/   # promptBuilder, aiService (with JSON repair)
│           ├── websocket/  # ws server, per-job rooms
│           ├── routes/     # /api/assignments, /api/jobs
│           ├── controllers/
│           └── middleware/ # errorHandler, validate
│
├── packages/
│   └── shared/             # TS types shared by web + api
│
├── docker-compose.yml      # mongo + redis + api + web
├── vercel.json             # frontend deploy
├── render.yaml             # backend + redis deploy
└── README.md
```

---

## 🛠 Tech stack

**Frontend** — Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · **Zustand** · React Hook Form + Zod · native WebSocket client (exponential backoff) · `@react-pdf/renderer` · `react-dropzone` · `lucide-react` · `date-fns`

**Backend** — Node 18+ · Express · TypeScript strict · **Mongoose** · **Redis** (ioredis for BullMQ + node-redis for cache) · **BullMQ** worker w/ retries + backoff · `ws` WebSocket server · **Google Gemini API** (configurable model)

**Infra** — MongoDB · Redis · Docker Compose (local) · Vercel (frontend) · Render (backend + managed Redis) · MongoDB Atlas (managed Mongo)

---

## 🚀 Local development

### Prereqs
- Node 18.18+
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

### Start infra
```bash
npm run docker:up        # mongo + redis
npm run build:shared     # build shared types package once
npm run dev              # api + web concurrently
```

Open http://localhost:3000.

### Full containerized stack
```bash
ANTHROPIC_API_KEY=... npm run docker:full
```

---

## 📚 API reference

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/health`                                       | Health check |
| `POST`   | `/api/assignments`                              | Create assignment, enqueue generation, returns `{ assignment, jobId }` |
| `GET`    | `/api/assignments`                              | List all assignments |
| `GET`    | `/api/assignments/:id`                          | Get a single assignment |
| `DELETE` | `/api/assignments/:id`                          | Delete assignment + its paper + cache |
| `GET`    | `/api/assignments/:id/paper`                    | Generated paper (Redis-cached 24 h) |
| `POST`   | `/api/assignments/:id/regenerate`               | Re-enqueue with same data |
| `GET`    | `/api/jobs/:jobId/status`                       | BullMQ job snapshot |

### WebSocket
`ws://<host>/ws/jobs/:jobId` — receives strongly-typed `WSMessage` events:

```ts
{ type: 'connected', jobId }
{ type: 'progress', stage, progress, message? }
{ type: 'completed', progress: 100, paperId }
{ type: 'failed', error }
```

Frontend client reconnects with exponential backoff (max 5 attempts).

---

## 🔁 Generation pipeline (the heart)

| # | Stage | Progress | What happens |
|---|---|---|---|
| 1 | `fetching`        | 10 %  | Load assignment from Mongo, mark `generating` |
| 2 | `building_prompt` | 25 %  | Construct structured prompt (counts, marks, instructions) |
| 3 | `generating`      | 50 %  | Call Gemini `:generateContent` with `responseMimeType: application/json`, thinking disabled |
| 4 | `parsing`         | 75 %  | Strict JSON.parse → schema validation → repair-and-retry on truncation |
| 5 | `persisting`      | 90 %  | Replace prior paper, save to Mongo, cache in Redis (24 h TTL) |
| 6 | `done`            | 100 % | Emit `completed` event with `paperId` |

Each stage is emitted to the per-job WS room. Failures emit `{ type: 'failed', error }` and mark the assignment `failed`. BullMQ retries × 3 with exponential backoff.

**Truncation repair** — when the LLM hits its output cap mid-array, `repairTruncatedJson()` walks bracket/string depth, truncates at the last complete element, and closes open `{`/`[` so the structured paper survives even partial responses.

---

## 🧪 Validation (no garbage in)

**Frontend (Zod via React Hook Form)** — title required, due date `DD-MM-YYYY`, ≥ 1 question type, all numbers ≥ 1 and within sane bounds (questions ≤ 100, marks ≤ 50).

**Backend (Zod middleware)** — same schema enforced server-side; rejects empty / negative values with a `400 ValidationError`.

**AI response** — `parseResponse()` requires every section to have `label / title / instruction / questions[]`; every question to have `number / text / difficulty (easy|moderate|hard) / marks`. Bad shapes → job fails cleanly, never reaches the UI.

---

## ☁️ Deployment

### Frontend → Vercel
1. Push to GitHub.
2. Import repo in Vercel.
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
   NEXT_PUBLIC_WS_URL=wss://your-api.onrender.com
   ```
4. Vercel reads `vercel.json` at the root — builds `@vedaai/shared` then the Next.js app. Output → `apps/web/.next`.

### Backend → Render
The repo ships `render.yaml` (Blueprint):
1. In Render → **Blueprints** → connect your repo.
2. Render provisions:
   - `vedaai-api` web service (Node) with health check at `/health`
   - `vedaai-redis` managed Redis (Render free tier)
3. Add secrets via the dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `GEMINI_API_KEY`
   - `CORS_ORIGIN` — your Vercel URL (e.g. `https://vedaai.vercel.app`)
4. Render auto-deploys on every push.

### MongoDB → Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a database user, allow access from `0.0.0.0/0` (or Render's egress IPs).
3. Copy the connection string into `MONGODB_URI`.

### Notes on Vercel + the backend
Vercel Functions are serverless — they can't host BullMQ workers or WebSocket servers, both of which require long-running processes. That's why the backend lives on Render. The frontend on Vercel calls the backend over HTTPS + WSS.

---

## 🎨 Design tokens

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

## 🧠 Approach & decisions

- **Monorepo with `packages/shared`** — a single source of truth for `Assignment`, `Section`, `Question`, `WSMessage`, etc. Both apps import the same types; no drift between frontend expectations and backend payloads.
- **Async by default** — the API never blocks on the LLM. Every request to create or regenerate enqueues a BullMQ job; the frontend opens a WS to watch it. UX is never frozen behind a 20 s model call.
- **Never render raw AI** — every model response is JSON-parsed, schema-validated, and (if truncated) repaired before it touches the UI. A partial / malformed response surfaces as a clean failure with `Try Again` rather than garbled text on screen.
- **Pixel pass driven by exports** — Figma frames were pulled in as PNGs and the Tailwind tokens + every component was tuned against them: the floating sidebar card with the orange-outlined Create pill, the rounded white TopHeader pill, the dark output banner with the white Download pill, dashed file upload + dashed textarea, white-pill dropdowns + steppers, mobile bottom nav, color-coded difficulty tags inline with the question text.
- **PDF export is a real PDF** — uses `@react-pdf/renderer` to construct an A4 document with proper page breaks, fonts and layout — not a print-CSS hack. Filename pattern: `{subject}_{class}_{date}_question_paper.pdf`.

---

## 🧯 Operational notes

- **Memory** — Next.js dev compile is heavy (~3 GB on Windows). The provided dev scripts use `NODE_OPTIONS=--max-old-space-size=4096` to avoid the `RangeError: Array buffer allocation failed` you'll otherwise hit on Windows.
- **Gemini free-tier quotas** — `gemini-2.0-flash` and `gemini-2.0-flash-lite` have daily caps that exhaust fast in dev. If you see `429 RESOURCE_EXHAUSTED`, switch `GEMINI_MODEL` to `gemini-2.5-flash` (separate quota pool) and restart the API.
- **Truncated paper** — the JSON repair runs automatically; if a response is so short it has no valid section, the job fails fast with a clear error.

---

## 📜 Scripts

```bash
npm run dev          # api + web concurrently
npm run dev:api      # api only
npm run dev:web      # web only
npm run build        # shared → api → web
npm run docker:up    # mongo + redis containers
npm run docker:full  # full stack containerized
```

---

Made for the **VedaAI Full Stack Engineering Assignment**.
