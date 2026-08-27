# Architecture

## Data flow

```
PostgreSQL
    ↓ Drizzle schema + drizzle-zod
packages/db + packages/types (contracts)
    ↓ @hono/zod-openapi routes
services/backend (OpenAPI spec)
    ↓ Orval
packages/api-client (React Query hooks)
    ↓ feature hooks
apps/dashboard (Expo pages)
```

## Backend (`services/backend`)

- **Runtime**: Cloudflare Workers via Wrangler; local dev uses Hyperdrive binding with `localConnectionString` pointed at Postgres.
- **App factory**: `createApp({ getDb })` accepts a DB factory for test injection (PGlite in Vitest, Postgres in production).
- **Error model**: `AppError` maps domain failures to structured `{ error: { code, message, details? } }` JSON.
- **Routes**: Grouped by domain (menu, customers, orders, settings, metrics). Each route uses Zod schemas from `@odyssey/types`.

### Order transitions

Orders follow a finite state machine in `packages/types/src/order-state-machine.ts`. The API exposes allowed actions on each order response; clients call:

```
POST /orders/:id/transition
{ "action": "confirm" | "reject" | ... , "reason"?: string }
```

Terminal states (`completed`, `cancelled`, `rejected`) expose no further actions.

## Frontend (`apps/dashboard`)

- **Routing**: expo-router file-based routes under `app/(app)/`.
- **Shell**: Responsive layout — sidebar navigation on desktop (≥960px), bottom tabs on mobile.
- **Providers**: `ThemeProvider`, React Query, and toast notifications wrap the tree in `AppProviders`.
- **Feature hooks**: Each domain (`home`, `orders`, `crm`, `menu`, `settings`) owns data orchestration; page components stay presentational.

## Design system (`packages/ui`)

Cross-platform primitives built on React Native primitives + `react-native-web`. Semantic theming via `ThemeProvider` with light/dark palettes. Components include layout (Card, Table), forms (Input, Select), feedback (Toast, Skeleton, EmptyState), and domain helpers (`StatusBadge`, `MoneyText`, `StatCard`).

## Contract generation

1. `pnpm --filter @odyssey/backend gen:openapi` writes `services/backend/openapi/openapi.json`.
2. `pnpm --filter @odyssey/api-client gen:client` runs Orval with the custom fetch mutator.
3. `pnpm gen:contract:check` regenerates and asserts a clean git diff.

Orval defaults generate **query hooks for GET** and **mutation hooks for POST/PATCH/DELETE**. Avoid setting both global `useQuery: true` and `useMutation: true` — that inverts hook types.

## Testing strategy

| Layer | Tool | Scope |
|-------|------|-------|
| State machine | Vitest | Pure transition logic |
| API services | Vitest + PGlite | In-memory DB, injected `createApp` |
| Worker runtime | `@cloudflare/vitest-pool-workers` | Smoke test on fetch handler |
| Dashboard hooks | jest-expo + MSW | Generated mock handlers from api-client |

## Monorepo tooling

- **pnpm hoisted node_modules** (`.npmrc`: `node-linker=hoisted`) for Metro compatibility.
- **Turborepo** orchestrates `dev`, `build`, `test`, and codegen tasks with dependency ordering.
