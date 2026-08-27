# Odyssey Ops

A fullstack restaurant operations dashboard built for the Odyssey fullstack developer assignment.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Dashboard:** Expo (React Native + Web) with expo-router
- **Backend:** Hono on Cloudflare Workers
- **Database:** PostgreSQL + Drizzle ORM + drizzle-zod
- **API contract:** OpenAPI → Orval → React Query hooks

## Project structure

```text
apps/dashboard          Expo dashboard (web-first)
services/backend        Hono API on Cloudflare Workers
packages/db             Drizzle schema, migrations, seed
packages/types          API contracts + order state machine
packages/api-client     Orval-generated React Query client
packages/ui             Design system + primitives
packages/shared         Shared utilities
```

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 16+

## Quick start

```bash
# Install dependencies
pnpm install

# Start PostgreSQL and create the database (one-time)
sudo pg_ctlcluster 16 main start
sudo -u postgres psql -c "CREATE USER odyssey WITH PASSWORD 'odyssey' SUPERUSER;" || true
sudo -u postgres psql -c "CREATE DATABASE odyssey_ops OWNER odyssey;" || true

# Migrate, seed, and generate API client
pnpm setup

# Start backend (port 8799) and dashboard (port 8791)
pnpm dev:backend   # terminal 1
pnpm dev:dashboard # terminal 2
```

Open the dashboard at `http://127.0.0.1:8791` and API docs at `http://127.0.0.1:8799/docs`.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev:dashboard` | Start Expo web dashboard |
| `pnpm dev:backend` | Start Hono backend via Wrangler |
| `pnpm gen:contract` | Regenerate OpenAPI spec + Orval client |
| `pnpm gen:contract:check` | Fail if generated artifacts are stale |
| `pnpm db:migrate` | Run Drizzle migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:reset` | Drop and recreate public schema |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run tests |

## Architecture

Contract pipeline:

```text
Drizzle schema → drizzle-zod → Hono/OpenAPI → Orval → React Query hooks
```

- Persisted data truth starts in `packages/db`
- Frontend API types come from generated Orval output only
- Order status changes use `POST /orders/:id/transition` with explicit actions (server-side state machine)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/TRADEOFFS.md](docs/TRADEOFFS.md) for details.

## Seed data

Running `pnpm db:seed` creates:

- Menu categories and items
- 8 customers
- ~50 orders across statuses and dates for realistic KPIs

Default database URL:

```text
postgres://odyssey:odyssey@localhost:5432/odyssey_ops
```

## License

Private — technical assignment submission.
