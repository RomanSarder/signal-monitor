# Problem

Searching for hiring signals on Reddit, Hacker News and other similar websites is tedious and unreliable. You manually browse the same threads every few days, never sure if you missed something. Existing tools like F5Bot and Syften flood your inbox with every keyword match regardless of context. Signal Monitor watches your keywords continuously, scores each result for relevance using an LLM, and surfaces only what actually matters — so you open a dashboard of ranked hiring signals instead of a wall of noise.

https://signal-monitor-frontend-production.up.railway.app/

# Stack

| Technology | Role | Why |
|---|---|---|
| Fastify | HTTP API | Faster than Express, schema-first validation, first-party plugin ecosystem |
| Drizzle ORM | Database access | SQL-first — no magic, queries map directly to what hits the DB |
| BullMQ | Job queue | Redis-backed, handles repeatable jobs and retries without infrastructure overhead |
| Redis | Cache + queue backend | Atomic Lua scripts for dedup; BullMQ storage |
| PostgreSQL | Primary datastore | Relational — monitors, results, users have real foreign key relationships |
| Anthropic claude-haiku | Intent scoring | Cheapest model capable of structured JSON extraction |
| Resend | Transactional email | Simple API, generous free tier (3k emails/month) |
| React + Vite | Frontend | Lightweight SPA, no SSR needed for a dashboard |
| TanStack Query | Server state | Declarative fetching, caching, and background refetch out of the box |
| Railway | Deployment | Managed Postgres + Redis as plugins, cheap, zero devops |

# Architecture diagram

Coming soon

# Key technical decisions

**Why Hacker News first, not Reddit?**
Reddit repriced its API in 2023 with little warning, killing third-party clients overnight. HN Algolia is free, stable, and requires no authentication. Starting with HN keeps the project shippable and the demo reliable. Reddit is additive once the core loop is validated.

**Why pre-filter before calling the LLM?**
An LLM call on every result costs ~$0.0003. At 200 results/day that's $0.06 — cheap. But the principle matters: don't send obvious noise to an LLM. A keyword presence heuristic eliminates ~60–70% of results before any API call.

**Why a single digest cron instead of per-user jobs?**
One repeatable hourly job checks which users are due for a digest based on their preferred send time, rather than scheduling N jobs for N users. Simpler to reason about, easier to debug, and scales to hundreds of users without queue bloat.

**Why `job_run_sources` as a child table instead of JSONB on `job_runs`?**
Per-source failure tracking needs to be queryable — which sources failed most, which keywords had no results. JSONB hides a real entity and loses schema enforcement.

**What breaks first at scale?**
Each monitor runs its own poll job at a user-configured interval. At 1,000 active monitors firing at different rates, two problems compound: total API call volume to HN Algolia becomes unpredictable and hard to cap, and many calls are redundant — multiple monitors watching the same keyword each firing their own independent query.

The fix is to replace per-monitor jobs with a single global poll job running on a fixed tick. It queries all active monitors due for a run, deduplicates their keywords, fires one HN query per unique keyword, then fans out results to every monitor that matched. 500 monitors watching "React hiring" = 1 API call. Each monitor's `last_run_at` is then updated based on its configured interval, preserving user-defined scheduling with minor precision loss on the tick boundary.

To scale further, the global job becomes a coordinator — it pushes one BullMQ job per unique keyword into a `keyword-fetch-queue` and a pool of workers processes them concurrently. This gives horizontal scalability, per-keyword retries, and failure isolation without touching the rest of the architecture.

# Local Setup

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL and Redis)

## 1. Environment variables

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and fill in the required values:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Pre-filled in `.env.example` to match docker-compose |
| `REDIS_URL` | Yes | Pre-filled in `.env.example` to match docker-compose |
| `SECRET` | Yes | Any random string — used to sign JWTs |
| `ANTHROPIC_API_KEY` | Yes | Claude API key — used to score results |
| `RESEND_API_KEY` | No | Only needed to test email digests |
| `FRONTEND_URL` | No | Defaults to `http://localhost:5173` for CORS |

## 2. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL on port 5432 and Redis on port 6379.

## 3. Install dependencies

```bash
npm ci
```

## 4. Run database migrations

```bash
npm run db:migrate --workspace=backend
```

## 5. Start the backend (terminal 1)

```bash
npm run dev --workspace=backend
```

Fastify API server starts on http://localhost:3000.

## 6. Start the frontend (terminal 2)

```bash
npm run dev --workspace=frontend
```

Vite dev server starts on http://localhost:5173. All `/api` requests are proxied to the backend.

---

## Other useful commands

```bash
# Open Drizzle Studio (interactive DB browser)
npm run db:studio --workspace=backend

# Run backend tests
npm run test --workspace=backend

# Run individual background workers
npm run worker:poll --workspace=backend
npm run worker:score --workspace=backend
npm run worker:digest --workspace=backend
npm run worker:cleanup --workspace=backend
```
