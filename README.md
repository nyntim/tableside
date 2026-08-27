# Tableside

Fullstack restaurant operations dashboard.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Expo SDK 57, React Native Web, expo-router
- **Backend**: Hono on Cloudflare Workers
- **Database**: PostgreSQL + Drizzle ORM + drizzle-zod
- **Contract pipeline**: Drizzle → OpenAPI → Orval → React Query hooks

## Quick start

```bash
pnpm setup          # install, migrate, seed, generate API client
pnpm dev:backend    # API on http://127.0.0.1:8799
pnpm dev:dashboard  # Web dashboard on http://127.0.0.1:8791
```

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL with database `tableside` (user/password: `tableside`)

```bash
createdb tableside
# or: psql -c "CREATE USER tableside WITH PASSWORD 'tableside'; CREATE DATABASE tableside OWNER tableside;"
```

## Workspace layout

| Path | Purpose |
|------|---------|
| `apps/dashboard` | Expo operator dashboard (web + native) |
| `services/backend` | Hono API worker |
| `packages/db` | Drizzle schema, migrations, seed |
| `packages/types` | Shared Zod contracts, order state machine |
| `packages/api-client` | Orval-generated React Query hooks |
| `packages/ui` | Cross-platform design system |
| `packages/shared` | Money/date utilities |

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Backend + dashboard in parallel |
| `pnpm gen:contract` | Regenerate OpenAPI + client |
| `pnpm gen:contract:check` | Fail if generated artifacts drift |
| `pnpm lint` / `typecheck` / `test` | Quality gates across packages |

## Architecture highlights

- **Order workflow**: Status changes only via `POST /orders/:id/transition` with explicit actions (never loose status PATCHes).
- **Frontend data layer**: Pages consume feature hooks; hooks call only generated `@tableside/api-client` hooks.
- **Money**: Stored and transmitted as integer cents; formatted at the UI layer via `MoneyText`.
- **Contract-first**: Backend routes derive schemas from `@tableside/types` (drizzle-zod); OpenAPI is generated and checked in CI.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/TRADEOFFS.md](./docs/TRADEOFFS.md) for deeper context.

## UI Library

Open the dashboard and navigate to **UI Library** (sidebar footer on desktop) to preview all `@tableside/ui` primitives.

## API docs

With the backend running: [http://127.0.0.1:8799/docs](http://127.0.0.1:8799/docs)
