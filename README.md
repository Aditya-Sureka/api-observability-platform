# API-Monitoring

> **API observability in minutes.** Drop-in middleware streams your API traffic into
> a multi-tenant dashboard with live traffic, error rates, and latency — secured by a
> strict role-based access matrix.

API-Monitoring is a self-hostable, SaaS-style API monitoring system. A lightweight
client middleware sends every request to the ingest endpoint; a resilient event
pipeline (RabbitMQ + circuit breaker) stores raw hits in MongoDB and rolls them up
into PostgreSQL for fast analytics. A Next.js dashboard renders traffic, errors, and
latency per tenant, with role-scoped access for platform admins and client users.

---

## Why this exists (the SaaS idea)

Most observability tools are heavy, expensive, and built for infra teams. API-Monitoring
is built for **product engineers who just want to see their API traffic**:

- **Instrument in under 10 lines.** The `demo/demo_project/monitoring.js` middleware
  shows the whole integration: wrap `res.end`, measure latency, `POST` one JSON object.
- **Secure multi-tenancy by design.** A verified RBAC matrix (below) keeps super admins,
  client admins, and read-only viewers strictly scoped to their own data.
- **Resilient ingestion.** Ingest returns `202 Accepted` immediately; RabbitMQ + a
  circuit breaker absorb spikes and outages without losing data.
- **Zero dashboard code to see value.** Analytics, top endpoints, and time-series render
  out of the box — no custom charts to wire up.
- **Machine-to-machine first.** API-key auth (not user sessions) protects the ingest path.

**Target users:** indie devs, startups, and platform teams who need per-client API
visibility without standing up Prometheus + Grafana.

**The hook:** *"Point our middleware at your API. See your traffic in 60 seconds."*

---

## RBAC matrix (enforced backend + frontend)

| Role | Scope | Capabilities |
| --- | --- | --- |
| `super_admin` | Global | All clients, onboarding, user/key creation, global + per-tenant analytics |
| `client_admin` | Own `clientId` | Manage own tenant's users & API keys, view own analytics |
| `client_viewer` | Own `clientId` | Read-only: own client detail, users directory, analytics |

### Endpoint access

| Endpoint | super_admin | client_admin | client_viewer |
| --- | --- | --- | --- |
| `POST /api/auth/onboard-super-admin` | public (first user only) | – | – |
| `POST /api/auth/login` · `/logout` | ✓ | ✓ | ✓ |
| `GET /api/auth/profile` | ✓ | ✓ | ✓ |
| `POST /api/auth/register` | ✓ | – | – |
| `POST /api/admin/clients/onboard` | ✓ | – | – |
| `GET /api/admin/clients` | ✓ | – | – |
| `GET /api/admin/clients/:clientId` | ✓ | own | own |
| `GET /api/admin/clients/:clientId/users` | ✓ | own | own (read) |
| `POST /api/admin/clients/:clientId/users` | ✓ | own | – |
| `GET /api/admin/clients/:clientId/api-keys` | ✓ | own | – |
| `POST /api/admin/clients/:clientId/api-keys` | ✓ | own | – |
| `GET /api/analytics/dashboard` · `/stats` | global + `?clientId` | own | own (needs `canViewAnalytics`) |
| `POST /api/hit` | API-key (machine) | API-key | API-key |

The dashboard mirrors this exactly: `super_admin` sees the **Clients** nav and
onboarding; tenant roles see **My Client**; management buttons hide for viewers.

---

## Architecture

```
                ┌────────────┐
 client app ───▶│ POST /api/hit│  (x-api-key, canIngest)
                └─────┬──────┘
                      │ 202 Accepted
                      ▼
                 RabbitMQ (api_hits)  ── circuit breaker ──▶ consumer
                      │                                                │
                      │                                                ▼
                      │                              MongoDB (raw hits) + PostgreSQL (endpoint_metrics)
                      │                                                │
   dashboard ◀── GET /api/analytics/* ◀────── processor rollups ◀─────┘
```

- **Ingest** validates and publishes events; never blocks the client.
- **Processor** consumes, persists raw hits to Mongo, upserts aggregates to Postgres.
- **Analytics** reads Postgres aggregates for fast dashboard queries.

---

## Repository Layout

```
API-Monitoring/
├── README.md
├── Docs/
│   └── Engineering-Journal/      # architecture & implementation notes
│       ├── day-01 … day-07      # build journal
│       ├── engineering-decisions.md
│       └── implementation-plan.md # RBAC matrix compliance plan
├── Server/                       # Express backend (Docker multi-container)
│   ├── docker-compose.yml        # postgres, mongo, rabbitmq, pgadmin, api-app, consumer
│   ├── Dockerfile / Dockerfile.consumer
│   ├── scripts/init-postgres.sql
│   └── src/
│       ├── server.js
│       └── services/{analytics,auth,client,ingest,processor}
│       └── shared/{config,constants,events,middleware,models,utils}
├── demo/
│   └── demo_project/            # sample API + drop-in monitoring middleware
└── dashboard/                   # Next.js (React 19) analytics console
    ├── app/(app)/               # dashboard, clients, settings
    ├── components/  hooks/  lib/
    └── next.config.ts           # rewrites /api/* → backend
```

---

## Tech Stack

- **Backend:** Node.js 22 + Express, ES modules, JWT auth, bcryptjs, Zod validation
- **Datastores:** MongoDB (raw hits, users, clients, keys) + PostgreSQL (metrics)
- **Messaging:** RabbitMQ with publisher confirms + circuit breaker
- **Frontend:** Next.js 16, React 19, TanStack Query, Recharts, lucide-react
- **Ops:** Docker / docker-compose, Helmet, CORS allowlist, rate limiting, Winston

---

## Prerequisites

- Node.js 22+
- Docker & Docker Compose (for the full backend stack)
- A Vercel account (for the dashboard) — or any host that runs `next start`

---

## Quick Start (local)

### 1. Backend

```bash
cd Server
npm install
# create a .env (see Server/.env for the required keys)
npm start                 # API on :5000
# in another terminal, run the processor:
npm run processor
```

### 2. Full stack with Docker

```bash
cd Server
docker compose up -d --build
# postgres, mongo, rabbitmq, pgadmin, api-app, consumer all come up
curl http://localhost:5000/health   # → healthy
```

`scripts/init-postgres.sql` auto-creates the `endpoint_metrics` table on first boot.

### 3. Dashboard

```bash
cd dashboard
npm install
npm run dev             # http://localhost:3000
```

The dashboard proxies `/api/*` to the backend via `next.config.ts` rewrites, so the
auth cookie stays first-party (no CORS configuration required for local dev).

### 4. Try it in 60 seconds

Onboard the first super admin, then point the demo API at the backend:

```bash
# 1) onboard super admin (public only until the first user exists)
curl -X POST http://localhost:5000/api/auth/onboard-super-admin \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","email":"admin@local","password":"Admin123"}'

# 2) run the demo client (it POSTs hits to /api/hit)
cd demo/demo_project && npm install && npm start
```

Open the dashboard, log in, and watch traffic appear.

---

## Demo Data (seed an attractive dashboard)

Two scripts populate realistic traffic so the dashboard looks alive on day one.

- **HTTP seed (`scripts/seed-hits.mjs`)** — logs in as super admin, creates a demo
  client + API key, then loops `POST /api/hit` with a realistic mix of services,
  endpoints, status codes, and latency. Re-runnable.
- **Direct DB backfill (`scripts/backfill-metrics.mjs`)** — writes historical time
  buckets straight into Mongo + Postgres (mirrors the processor's rollup) so the
  time-series chart shows past days, not just "now".

Both are documented in `Docs/` and require no application code changes.

---

## Deploying to Production

### Backend — generic Linux VPS (Docker Compose)

1. Provision a VPS, install Docker + docker-compose.
2. Copy `Server/` up; create a production `.env`:
   - `JWT_SECRET` (generate a strong secret), `NODE_ENV=production`, `PORT=5000`
   - `MONGO_URI`, `PG_*`, `RABBITMQ_URL`, `RABBITMQ_QUEUE=api_hits`
   - `FRONTEND_ORIGIN` = your Vercel dashboard URL (safety net)
3. Add a `.dockerignore` excluding `node_modules`, `logs`, `.env` to avoid leaking
   secrets into the image.
4. `docker compose up -d --build`. Verify `curl http://<IP>:5000/health`.
5. (Optional) Put nginx in front as a reverse proxy and add Let's Encrypt TLS via
   certbot when you have a domain.

> The compose file already wires `api-app` → `postgres` + `rabbitmq` healthchecks
> and the `consumer` service, so the pipeline runs end-to-end on one host.

### Frontend — Vercel

1. Import the `dashboard/` folder into Vercel.
2. Set the build env `BACKEND_URL=http://<VPS-IP>:5000` (or your domain).
3. Leave `NEXT_PUBLIC_API_BASE_URL` empty — all calls go same-origin through the
   `/api/*` rewrite, keeping the httpOnly `authToken` cookie first-party.
4. Deploy. Log in through the dashboard and the cookie-based session just works.

---

## Environment Variables (backend)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGO_URI`, `MONGO_DB_NAME` | MongoDB connection |
| `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` | PostgreSQL |
| `RABBITMQ_URL`, `RABBITMQ_QUEUE` | Event bus |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth tokens |
| `FRONTEND_ORIGIN` | CORS allowlist (comma-separated) |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Auth endpoint throttle |
| `VALID_API_KEYS` | Optional static key allowlist |

See `Server/.env` for a working local example.

---

## Useful Files

- `Server/src/server.js` — app entry point and route mounting
- `Server/src/shared/config/` — connection + runtime config
- `Server/scripts/init-postgres.sql` — relational schema
- `demo/demo_project/monitoring.js` — the drop-in integration middleware
- `dashboard/next.config.ts` — `/api/*` → backend rewrite
- `Docs/Engineering-Journal/implementation-plan.md` — RBAC matrix compliance plan

---

## Status

- Server backend: ✅ active (multi-container, hardened)
- Event pipeline: ✅ active (RabbitMQ + circuit breaker)
- Dashboard: ✅ complete (role-gated, Vercel-ready)
- Demo data tooling: ✅ seed + backfill scripts

## License

ISC
