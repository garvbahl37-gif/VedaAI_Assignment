# VedaAI — AI Assessment Creator

Production-grade monorepo for **VedaAI**'s AI-powered teacher's workspace. The core flow generates curriculum-appropriate question papers asynchronously via Gemini, but the app is a full toolkit: teachers manage class groups, run instant MCQ quizzes, archive saved content in a personal library, edit their school profile, receive activity notifications, and dictate prompts by voice. Real-time progress streams over WebSockets locally; the same pipeline runs inline on Vercel serverless. The generated paper exports as a properly-paginated PDF.

> Built against the Figma reference: [VedaAI — Hiring Assignment](https://www.figma.com/design/nB2HMm1BhTpmHcHrmEslGB/VedaAI---Hiring-Assignment?node-id=0-1).

---

## Features

### Assignments (`/assignments`, `/assignments/create`, `/assignments/[id]/output`)
- Multi-step create form with file upload (PDF / TXT / images up to 10 MB — **PDF and TXT content is parsed in the browser via `pdfjs-dist` and fed into the generation prompt under a `REFERENCE MATERIAL` block**, so generated questions actually reference the uploaded chapter), due date (DD-MM-YYYY with calendar pop), dynamic question-type table (counts + marks with white-pill steppers, configurable types from a shared enum), additional instructions textarea, and **voice-to-text dictation**.
- Zod-validated client-side and server-side; no empty or negative values can be submitted.
- The submit handler enqueues a BullMQ job locally or runs the pipeline inline on serverless; the form then navigates to the output page where progress streams over WebSocket and the paper renders the moment generation completes.
- Output page: dark banner with white Download pill, student-info block (Name / Roll Number / Section input lines), sections grouped with title + instruction, numbered questions with **color-coded** `[Easy] / [Moderate] / [Challenging]` difficulty tags and `[N Marks]` suffix, a separate Answer Key, and a **Regenerate** action that re-runs the pipeline.
- The AI's raw text is **never rendered** — only validated, structured JSON.

### AI Teacher's Toolkit (`/toolkit`)
- **Quick Quiz Generator** — a fast, ungraded path to 1-15 MCQs on any topic. Single Gemini call, no Mongo persistence, no queue. Inputs: topic, class level, question count, difficulty (Mixed / Easy / Moderate / Hard pill selector). Output: numbered questions with 4 lettered options, the correct option revealed on a **Show Answers** toggle (highlighted green with checkmark and one-line explanation).
- **Save to Library** — each generated quiz can be saved into the local library archive with one click.
- Backend endpoint: `POST /api/toolkit/quick-quiz` with its own [Zod schema](apps/api/src/controllers/toolkitController.ts) and [JSON parser](apps/api/src/services/quickQuizService.ts) (truncation-tolerant).

### My Groups (`/groups`)
- Full CRUD for classes / sections a teacher manages: name, class level, subject, student count, description, and a color (8 choices).
- Grid of group cards with colored top stripe, class + subject + student-count chips, edit / delete icons, and a **Create Assignment** action that pre-fills the create-form title and pushes `defaultClass` + `defaultSubject` into the profile — so the next assignment's prompt is automatically class-aware.
- Empty state, validation in the edit modal, footer counter of total groups and total students.
- Persisted entirely in `localStorage` (`vedaai:groups`).

### My Library (`/library`)
- Personal archive of saved Quick Quizzes from the Toolkit.
- Card grid: topic, class chip, question-count chip, difficulty chip, saved date, **View** (modal showing the full quiz with answers highlighted and explanations), **Delete**.
- Empty state with a CTA to open the Toolkit.
- Persisted in `localStorage` (`vedaai:library`).

### Settings (`/settings`)
- **School Profile** card — School Name, City, Principal Name, Teacher Name. Inline editing (blur or Enter to save); a green "Saved" badge animates on commit.
- **Generation Defaults** card — Default Class, Default Subject. Pre-fill the create-assignment form and toolkit on subsequent visits.
- **Reset to Defaults** — wipes the profile back to defaults with a confirm prompt.
- Same profile fields are also editable from a modal that opens when clicking the school card in the sidebar.

### School Profile flows into generated papers
The profile is read by the create-assignment page on submit and added to the request body. The backend stores `schoolName` + `city` on the assignment document, and [`buildPrompt()`](apps/api/src/services/promptBuilder.ts) injects a directive instructing Gemini to use that exact school name as the `schoolName` field in the generated paper. The school name then prints at the top of the PDF output. Editing the profile changes what the AI writes — it is not just decorative.

### Notifications (bell icon in top header)
- A persistent notification feed shown in a popover anchored under the bell.
- Auto-fires on six event types: **assignment created**, **paper ready**, **quiz generated**, **quiz saved to library**, **group created/updated**, **school profile updated**.
- Each row: colored type icon, bold title (turns regular weight once read), description, relative timestamp, optional deep-link.
- Unread badge on the bell shows numeric count (or `9+` past 9). Mark-all-read and Clear-all controls at the top of the popover.
- Persisted in `localStorage` (`vedaai:notifications`), capped at 30 items.
- Closes on click-outside or Escape.

### Voice input on the Additional Information textarea
- A microphone button in the bottom-right of the textarea uses the Web Speech API (`window.SpeechRecognition` / `webkitSpeechRecognition`) to dictate teacher instructions.
- Continuous + interim-results mode; transcript appears live as you speak. Language is set to `en-IN` for better Indian-English recognition.
- Visual: idle mic icon → red pulsing icon while listening, with a small status line below the textarea.
- Graceful fallback: button is greyed-out with a `MicOff` icon and a tooltip in browsers without speech recognition support (e.g. Firefox).
- Error handling for permission denied, no speech detected, and network errors — each surfaces a clear inline hint.

---

## Architecture

```
                        +--------------------------+
                        |   Next.js 14 (apps/web)  |
                        |  App Router · Tailwind   |
                        |  Zustand (persisted)     |
                        |  WS client · Web Speech  |
                        |  @react-pdf/renderer     |
                        +-------------+------------+
                                      | REST + WS
                        +-------------v------------+
                        |  Express API (apps/api)  |
                        |  /api/assignments        |
                        |  /api/jobs               |
                        |  /api/toolkit            |
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

In serverless mode (Vercel) the Worker box is bypassed — the same six-stage pipeline executes inline inside `POST /api/assignments`. The Toolkit's Quick Quiz endpoint is a separate single-call path that does not enqueue, persist, or cache; it returns parsed JSON in the same HTTP response.

---

## Repo layout

```
vedaai/
├── apps/
│   ├── web/                          # Next.js 14 (App Router) frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── assignments/      # list + create + [id]/output pages
│   │       │   ├── groups/           # My Groups CRUD page
│   │       │   ├── toolkit/          # AI Teacher's Toolkit (Quick Quiz)
│   │       │   ├── library/          # My Library (saved quizzes archive)
│   │       │   ├── settings/         # Settings (profile + defaults + reset)
│   │       │   └── home/             # Home landing
│   │       ├── components/
│   │       │   ├── layout/           # Sidebar, TopHeader, ProfileEditDialog,
│   │       │   │                     #   NotificationsPopover, MobileHeader,
│   │       │   │                     #   MobileBottomNav
│   │       │   ├── create/           # Form pieces incl. AdditionalInfoTextarea
│   │       │   │                     #   (Web Speech mic), FileUploadZone,
│   │       │   │                     #   DueDateInput, QuestionTypeTable
│   │       │   ├── paper/            # QuestionPaper, DifficultyTag,
│   │       │   │                     #   PaperPdfDocument, DownloadPdfButton
│   │       │   ├── groups/           # GroupEditDialog
│   │       │   └── brand/            # Logo
│   │       ├── stores/               # Zustand stores (see "Client state" below)
│   │       │   ├── assignmentStore.ts
│   │       │   ├── createAssignmentStore.ts
│   │       │   ├── generationStore.ts
│   │       │   ├── profileStore.ts        (persisted)
│   │       │   ├── groupsStore.ts         (persisted)
│   │       │   ├── libraryStore.ts        (persisted)
│   │       │   └── notificationsStore.ts  (persisted)
│   │       └── lib/                  # api client, websocket client, cn()
│   │
│   └── api/                          # Express + TypeScript backend
│       ├── api/index.ts              # Vercel serverless entry (wraps Express)
│       └── src/
│           ├── config/               # env, mongodb, redis
│           ├── models/               # Assignment, GeneratedPaper (mongoose)
│           ├── queues/               # BullMQ queue
│           ├── workers/              # generationWorker (6-stage pipeline)
│           ├── services/             # promptBuilder, aiService,
│           │                         #   generationPipeline, quickQuizService
│           ├── websocket/            # ws server, per-job rooms
│           ├── routes/               # assignments, generation, toolkit
│           ├── controllers/          # assignmentController, toolkitController
│           └── middleware/           # errorHandler, validate
│
├── packages/
│   └── shared/                       # TS types shared by web + api
│
├── docker-compose.yml                # mongo + redis + api + web
├── vercel.json                       # frontend deploy
├── apps/api/vercel.json              # backend deploy (serverless)
├── render.yaml                       # alt. backend deploy on Render
└── README.md
```

---

## Tech stack

**Frontend** — Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · **Zustand** with `persist` middleware (4 of 7 stores persisted to `localStorage`) · React Hook Form + Zod · native WebSocket client (exponential backoff, max 5 attempts) · `@react-pdf/renderer` (real A4 PDF, not print-CSS) · `react-dropzone` (file upload) · `pdfjs-dist` (browser PDF text extraction, dynamic-imported to keep it out of SSR) · `lucide-react` (icons) · `date-fns` (date helpers) · **Web Speech API** for voice-to-text dictation (`SpeechRecognition` / `webkitSpeechRecognition`, `en-IN`).

**Backend** — Node 20+ · Express · TypeScript strict · **Mongoose** · **Redis** (ioredis for BullMQ + node-redis for cache) · **BullMQ** worker with 3 retries and exponential backoff · `ws` WebSocket server with per-job rooms and heartbeat · **Google Gemini API** (configurable model, `responseMimeType: application/json`, thinking budget disabled on 2.5-series models).

**Shared** — single `packages/shared` source of truth for `Assignment`, `Section`, `Question`, `SchoolProfile`, `WSMessage`, `QuickQuizRequest/Response`, request/response payloads, and enums.

**Infra** — MongoDB · Redis · Docker Compose (local) · Vercel (frontend + serverless backend) · Render (alternative backend) · MongoDB Atlas (managed Mongo) · Upstash Redis (managed Redis for serverless).

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
| `POST`   | `/api/assignments`                              | Create assignment, enqueue (or inline) generation. Body includes optional `schoolName` + `city` from the profile store. Returns `{ assignment, jobId, paperId? }`. |
| `GET`    | `/api/assignments`                              | List all assignments |
| `GET`    | `/api/assignments/:id`                          | Get a single assignment |
| `DELETE` | `/api/assignments/:id`                          | Delete assignment + its paper + cache |
| `GET`    | `/api/assignments/:id/paper`                    | Generated paper (Redis-cached 24 h) |
| `POST`   | `/api/assignments/:id/regenerate`               | Re-enqueue (or inline-regenerate) |
| `GET`    | `/api/jobs/:jobId/status`                       | BullMQ job snapshot |
| `POST`   | `/api/toolkit/quick-quiz`                       | Stateless MCQ generator. Body: `{ topic, className, numberOfQuestions, difficulty }`. Returns `{ topic, className, questions: [{ text, options[4], correctIndex, explanation }] }`. |

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
| 2 | `building_prompt` | 25 %  | Construct structured prompt (counts, marks, instructions, school name directive) |
| 3 | `generating`      | 50 %  | Call Gemini `:generateContent` with `responseMimeType: application/json`, thinking disabled |
| 4 | `parsing`         | 75 %  | Strict JSON.parse → schema validation → repair-and-retry on truncation |
| 5 | `persisting`      | 90 %  | Replace prior paper, save to Mongo, cache in Redis (24 h TTL) |
| 6 | `done`            | 100 % | Emit `completed` event with `paperId` |

Each stage is emitted to the per-job WS room. Failures emit `{ type: 'failed', error }` and mark the assignment `failed`. BullMQ retries × 3 with exponential backoff.

**Truncation repair** — when the LLM hits its output cap mid-array, `repairTruncatedJson()` walks bracket / string depth, truncates at the last complete element, and closes open `{` / `[` so the structured paper survives even partial responses.

---

## Validation (no garbage in)

**Frontend (Zod + manual)** — title required, due date `DD-MM-YYYY`, ≥ 1 question type, all numbers ≥ 1 and within sane bounds (questions ≤ 100, marks ≤ 50). Group form requires name + class + subject and clamps student count to 0-500. Quick Quiz form clamps question count to 1-15.

**Backend (Zod middleware)** — same schema enforced server-side; rejects empty or negative values with a `400 ValidationError`.

**AI response** — `parseResponse()` requires every section to have `label / title / instruction / questions[]`; every question to have `number / text / difficulty (easy | moderate | hard) / marks`. Quick Quiz parsing requires exactly 4 options and a valid `correctIndex` in 0-3. Bad shapes → request fails cleanly, never reaches the UI.

---

## Client state (Zustand)

Seven stores cover all client-side state. Four are persisted to `localStorage` so the teacher's setup survives reloads and revisits.

| Store | File | Persisted | Purpose |
|---|---|---|---|
| `assignmentStore` | [assignmentStore.ts](apps/web/src/stores/assignmentStore.ts) | no | List of assignments fetched from the API for the badge count and listing |
| `createAssignmentStore` | [createAssignmentStore.ts](apps/web/src/stores/createAssignmentStore.ts) | no | Multi-step create form state (title, file, due date, question types, instructions) |
| `generationStore` | [generationStore.ts](apps/web/src/stores/generationStore.ts) | no | Live generation status (jobId, stage, progress, message, paper) |
| `profileStore` | [profileStore.ts](apps/web/src/stores/profileStore.ts) | `vedaai:profile` | School profile + generation defaults (schoolName, city, principalName, teacherName, defaultClass, defaultSubject) |
| `groupsStore` | [groupsStore.ts](apps/web/src/stores/groupsStore.ts) | `vedaai:groups` | My Groups CRUD: each group has id, name, classLevel, subject, studentCount, description, color, createdAt |
| `libraryStore` | [libraryStore.ts](apps/web/src/stores/libraryStore.ts) | `vedaai:library` | Saved Quick Quizzes from the Toolkit |
| `notificationsStore` | [notificationsStore.ts](apps/web/src/stores/notificationsStore.ts) | `vedaai:notifications` | Activity feed with mark-read / mark-all-read / clear actions (capped at 30 items) |

---

## Deployment

The project deploys cleanly to **two Vercel projects** (one for the web app, one for the API), with managed Mongo and Redis.

### Frontend → Vercel
1. **New Project** in Vercel → import this repo.
2. **Root Directory**: `.` (leave at root — the root `vercel.json` handles the monorepo build).
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://your-api-vercel-url.vercel.app/api
   NEXT_PUBLIC_WS_URL  = wss://your-api-vercel-url.vercel.app
   ```
4. **Deploy**.

### Backend → Vercel (serverless)
1. **New Project** in Vercel → import the same repo.
2. **Root Directory**: `apps/api`.
3. **Framework Preset**: `Other` (Vercel auto-detects from `apps/api/vercel.json`).
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `REDIS_URL` | Upstash Redis `rediss://...` string |
   | `GEMINI_API_KEY` | Your Google AI Studio key |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |
   | `CORS_ORIGIN` | Your Vercel frontend URL (origin only, no trailing slash) |
5. **Deploy**. Vercel reads `apps/api/vercel.json`, installs from the monorepo root, and deploys `apps/api/api/index.ts` as a serverless function with `maxDuration: 60`.

### Backend → Render (alternative)
The repo also ships `render.yaml` (Blueprint):
1. Render → **Blueprints** → connect your repo.
2. Render provisions:
   - `vedaai-api` web service (Node) with health check at `/health`
   - `vedaai-redis` managed Redis (free tier)
3. Add secrets via the dashboard: `MONGODB_URI`, `GEMINI_API_KEY`, `CORS_ORIGIN`.

### MongoDB → Atlas
1. Create a free **M0** cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a database user; allow network access from `0.0.0.0/0`.
3. Copy the SRV connection string, add `/vedaai` as the database name before the `?`, paste into `MONGODB_URI`.

### Redis → Upstash (for serverless)
1. https://upstash.com → **Create database** → Regional, free tier.
2. Copy the `rediss://...` connection string into `REDIS_URL`.

### Serverless mode (`VERCEL=1` is auto-set by Vercel)
- Standalone Worker process and WebSocket server are **not started**.
- The generation pipeline runs **inline** inside `POST /api/assignments` (max 60 s).
- The frontend immediately receives the completed assignment + `paperId` and navigates to the output page.
- All other code (BullMQ queue, WS server, etc.) is kept intact for local dev (`npm run dev:api`).
- The Toolkit's Quick Quiz path is also single-shot — same single Gemini call, no queue dependency, works identically in both local and serverless modes.

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

Per-feature accent colors are used where they aid scanning:
- Groups: 8 selectable colors per group (emerald, amber, blue, purple, pink, rose, indigo, teal)
- Library: purple
- Toolkit: brand orange
- Notifications: per-type icon colors (blue for assignments, green for papers, purple for library, amber for groups, pink for profile)

---

## Approach and decisions

- **Monorepo with `packages/shared`** — a single source of truth for `Assignment`, `Section`, `Question`, `SchoolProfile`, `WSMessage`, `QuickQuizRequest`, etc. Both apps import the same types; no drift between frontend expectations and backend payloads.
- **Async by default, inline as fallback** — locally the API enqueues to BullMQ and the worker processes in the background while WebSocket events stream progress. On Vercel (serverless) the exact same `runGenerationPipeline()` function runs inline inside the HTTP request. One pipeline, two execution models.
- **Two generation paths, one prompt-parse discipline** — the full Assignment pipeline and the Toolkit Quick Quiz both build a strict JSON schema prompt, parse with truncation repair, validate the structure, and only then surface to the UI. Neither shows raw AI text to the user.
- **Profile → prompt → output** — the sidebar profile card is not cosmetic. Editing the school name updates a Zustand store persisted in `localStorage`; the create-assignment page reads it, the API stores it on the assignment, the prompt builder injects it as a directive to Gemini, and the printed PDF shows it at the top of the question paper. End-to-end change in three clicks.
- **Activity surfaces in the bell** — every meaningful user action (assignment created, paper ready, quiz generated, quiz saved, group created, profile updated) writes a typed entry into the notifications store. The bell badge shows unread count; the popover acts as a recent-activity log so a teacher returning to the app sees what's changed.
- **Persistent client state** — four of seven Zustand stores use `persist` middleware so school profile, groups, library, and notifications survive reloads and revisits. No backend write is needed for personal organizational state.
- **Voice input where it counts** — the Additional Information textarea has the most variable content (free-form teacher guidance to the AI). Wiring the Web Speech API there saves typing time on phones and tablets without adding any backend cost.
- **Never render raw AI** — every model response is JSON-parsed, schema-validated, and (if truncated) repaired before it touches the UI. A partial or malformed response surfaces as a clean failure with `Try Again` rather than garbled text on screen.
- **Pixel pass driven by exports** — Figma frames were pulled in as PNGs and the Tailwind tokens + every component was tuned against them: the floating sidebar card with the orange-outlined Create pill, the rounded white TopHeader pill, the dark output banner with the white Download pill, dashed file upload + dashed textarea, white-pill dropdowns + steppers, mobile bottom nav, color-coded difficulty tags inline with the question text.
- **PDF export is a real PDF** — uses `@react-pdf/renderer` to construct an A4 document with proper page breaks, fonts, and layout — not a print-CSS hack. Filename pattern: `{subject}_{class}_{date}_question_paper.pdf`.

---

## Operational notes

- **Memory** — Next.js dev compile is heavy (~3 GB on Windows). The provided dev scripts use `NODE_OPTIONS=--max-old-space-size=4096` to avoid the `RangeError: Array buffer allocation failed` you'll otherwise hit on Windows.
- **Gemini free-tier quotas** — `gemini-2.0-flash` and `gemini-2.0-flash-lite` have daily caps that exhaust fast in dev. If you see `429 RESOURCE_EXHAUSTED`, switch `GEMINI_MODEL` to `gemini-2.5-flash` (separate quota pool) and restart the API.
- **Vercel function timeout** — the inline generation can take 15-30 s for a long paper. The function's `maxDuration` is set to 60 s in `apps/api/vercel.json` which is the cap on Vercel Hobby's Node runtime.
- **Web Speech API browser support** — works in Chrome, Edge, Brave, and Safari. In Firefox the mic button shows a `MicOff` icon and a tooltip — the form remains fully usable via typing.
- **CORS on serverless** — set `CORS_ORIGIN` to the frontend origin only (e.g. `https://vedaaiweb.vercel.app`, no path, no trailing slash). The middleware accepts a comma-separated list for multi-environment setups.

---

## Scripts

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
