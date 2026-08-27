# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git commits

When creating git commits, do not add "Co-Authored-By: Claude", "Generated with Claude Code", or any similar attribution. Write commit messages as if authored solely by the user.

Never name branches using "claude", "cursor", or any other AI-tool attribution (e.g. no `claude/*` or `cursor/*` prefixes).

## Commands

This is a pnpm + Turborepo monorepo. Run these from the repo root unless noted.

```bash
pnpm setup          # install deps, migrate db, seed db, generate API client — first-time setup
pnpm dev:backend    # API on http://127.0.0.1:8799 (docs at /docs)
pnpm dev:dashboard  # Web dashboard on http://127.0.0.1:8791
pnpm dev            # both in parallel

pnpm typecheck      # tsc --noEmit across all packages
pnpm lint           # across all packages
pnpm test           # all test suites across all packages

pnpm gen:contract       # regenerate OpenAPI spec + api-client from backend routes
pnpm gen:contract:check # regenerate and fail if the generated artifacts drift (CI check)

pnpm db:generate | db:migrate | db:seed | db:reset   # drizzle-kit operations, delegates to packages/db
```

Requires Postgres reachable at `postgres://tableside:tableside@localhost:5432/tableside` (or set `DATABASE_URL`). `docker compose up -d` starts one, or `createdb tableside`.

### Running a single test

Turbo runs `test` per-package; to target one package or one file, go directly to that workspace:

```bash
# backend: two separate vitest configs (pglite integration tests, and Workers-runtime smoke tests)
cd services/backend
pnpm vitest run --config vitest.config.ts src/tests/orders.pglite.test.ts
pnpm vitest run --config vitest.smoke.config.ts

# packages/types (state machine, business logic)
cd packages/types && pnpm vitest run src/order-state-machine.test.ts

# dashboard (jest-expo)
cd apps/dashboard && pnpm jest src/features/home/useHomeMetrics.test.tsx
```

`turbo run test --filter=@tableside/backend` (or any package name) runs a whole package's tests from the root.

## Architecture

Contract-first pipeline, source of truth flows one direction:

```
PostgreSQL
    ↓ Drizzle schema + drizzle-zod
packages/db + packages/types (contracts)
    ↓ @hono/zod-openapi routes
services/backend (OpenAPI spec, committed to services/backend/openapi/openapi.json)
    ↓ Orval (packages/api-client/orval.config.ts)
packages/api-client (React Query hooks, fully generated — never hand-edit src/generated/**)
    ↓ feature hooks
apps/dashboard (Expo pages)
```

Never hand-edit `services/backend/openapi/openapi.json` or `packages/api-client/src/generated/**`; run `pnpm gen:contract` after changing backend routes/schemas. `pnpm gen:contract:check` (CI) fails on drift.

### Backend (`services/backend`)

- Hono on Cloudflare Workers (Wrangler). Local dev uses a Hyperdrive binding whose `localConnectionString` points at Postgres.
- `createApp({ getDb })` takes a DB factory for test injection — PGlite in Vitest (`src/tests/*.pglite.test.ts`), real Postgres in production, Workers runtime in `*.smoke.test.ts` via `@cloudflare/vitest-pool-workers`.
- Routes are grouped by domain in `src/routes/` (menu, customers, orders, settings, metrics), each backed by a `src/services/*.service.ts` and Zod schemas from `@tableside/types`.
- `AppError` (`src/lib/errors.ts`) maps domain failures to a structured `{ error: { code, message, details? } }` response shape.

**Order transitions**: orders are never updated via a loose status PATCH. The state machine lives in `packages/types/src/order-state-machine.ts`; the API surface is `POST /orders/:id/transition` with an explicit `action`. Each order response includes `allowedActions` for the current state; terminal states (`completed`, `cancelled`, `rejected`) expose none.

### Frontend (`apps/dashboard`)

- expo-router file-based routes under `app/(app)/`. Responsive shell: sidebar nav on desktop (≥960px), bottom tabs on mobile.
- `AppProviders` wraps the tree with `ThemeProvider`, React Query, and toast notifications.
- Each domain (`home`, `orders`, `crm`, `menu`, `settings`) has a feature-hook module under `src/features/*` that owns data orchestration (calls generated `@tableside/api-client` hooks, handles toasts/navigation side effects). Page components stay presentational and must not call generated api-client hooks directly.
- Targets web (Metro bundler), iOS, and Android from one codebase (`expo start --web|--ios|--android`).

### Design system (`packages/ui`)

Cross-platform primitives on React Native + `react-native-web`, themed via `ThemeProvider` (light/dark). Includes layout (Card, Table), forms (Input, Select), feedback (Toast, Skeleton, EmptyState), and domain components (`StatusBadge`, `MoneyText`, `StatCard`). Preview all of them at the dashboard's `/ui-library` route.

### Orval config caveat

Orval defaults generate query hooks for GET and mutation hooks for POST/PATCH/DELETE. Don't set both global `useQuery: true` and `useMutation: true` in `orval.config.ts` — that inverts which hook type gets generated for which verb.

### Other conventions

- Money is stored and transmitted everywhere as integer cents (never floats); formatting only happens at the UI layer via `MoneyText` / `formatMoney` in `@tableside/shared`.
- pnpm uses a hoisted `node_modules` (`.npmrc`: `node-linker=hoisted`) — required for Metro to resolve workspace packages via `watchFolders`.
