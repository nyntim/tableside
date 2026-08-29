# Tableside

Restaurant operations dashboard for a single kitchen: menu, orders, customers, settings, and home KPIs. Operator tool, not a guest-facing ordering app.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Expo SDK 57, React Native Web, expo-router
- **Backend**: Hono on Cloudflare Workers
- **Database**: PostgreSQL + Drizzle ORM + drizzle-zod
- **Contracts**: Drizzle → OpenAPI → Orval → React Query hooks

## Run locally

**Prerequisites:** Node.js 22+, pnpm 10+, Docker (or a local Postgres).

Default connection: `postgres://tableside:tableside@localhost:5432/tableside`. Override with `DATABASE_URL` if needed.

```bash
docker compose up -d    # Postgres 16 on :5432 (user/password/db: tableside)
pnpm setup              # install, migrate, seed, generate API client
pnpm dev                # API + dashboard
```

Without Docker, create the role and database yourself:

```bash
psql -c "CREATE USER tableside WITH PASSWORD 'tableside'; CREATE DATABASE tableside OWNER tableside;"
```

| | URL |
|---|---|
| Dashboard | http://127.0.0.1:8791 |
| API | http://127.0.0.1:8799 |
| OpenAPI docs | http://127.0.0.1:8799/docs |
| UI library | http://127.0.0.1:8791/ui-library |

Start the apps separately with `pnpm dev:backend` and `pnpm dev:dashboard`. Wrangler reads Postgres through a Hyperdrive binding whose `localConnectionString` is the local URL. The dashboard calls the API via `EXPO_PUBLIC_API_URL` (defaults to `http://127.0.0.1:8799`).

Web is the review target. Native: `pnpm --filter @tableside/dashboard ios` or `android`.

## Seed data

Seed runs as part of `pnpm setup`. On an already-migrated database:

```bash
pnpm db:seed
```

The script is idempotent. If business settings already exist, it prints `Database already seeded. Skipping.` and exits.

To wipe and re-seed (destructive):

```bash
pnpm db:reset
pnpm db:migrate
pnpm db:seed
```

What you get:

- Restaurant **Tableside Kitchen** (America/New_York, tax 8.25%, service 2.5%, delivery $4.99, $15 minimum, auto-accept off, accepting orders on)
- 4 categories / 12 items (Soup of the Day is unavailable)
- 8 customers
- ~51 orders over 15 days, mixed statuses and fulfillment types (pickup / delivery / dine-in)

On Home and Orders you should see a pending order you can confirm or reject, plus preparing, ready, and confirmed examples. Terminal orders (completed, cancelled, rejected) expose no further actions. Create a new order from the dashboard against seeded customers and menu items; totals are computed server-side in integer cents.

## Workspace

| Path | Purpose |
|------|---------|
| `apps/dashboard` | Expo operator dashboard (web + native) |
| `services/backend` | Hono API worker |
| `packages/db` | Drizzle schema, migrations, seed |
| `packages/types` | Shared Zod contracts, order state machine |
| `packages/api-client` | Orval-generated React Query hooks |
| `packages/ui` | Cross-platform design system |
| `packages/shared` | Money / date utilities |

Dashboard pages: Home, Orders, CRM, Menu, Settings. Design-system preview is at `/ui-library`.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm setup` | Install, migrate, seed, generate API client |
| `pnpm dev` | Backend + dashboard in parallel |
| `pnpm dev:backend` / `dev:dashboard` | Start one app |
| `pnpm db:migrate` / `db:seed` / `db:reset` | Database |
| `pnpm gen:contract` | Regenerate OpenAPI + client |
| `pnpm gen:contract:check` | Fail if generated artifacts drift |
| `pnpm lint` / `typecheck` / `test` | Quality gates |

Do not hand-edit `services/backend/openapi/openapi.json` or `packages/api-client/src/generated/**`. After backend schema or route changes, run `pnpm gen:contract`.

## Architecture

Persistence is the source of truth. Types flow one direction; the frontend does not hand-write DTOs.

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

**Orders.** Status is never a free PATCH. Clients send `POST /orders/:id/transition` with an explicit action (`confirm`, `reject`, `start_prep`, …). Each response includes `allowedActions`. Delivery orders must dispatch before complete; pickup and dine-in cannot dispatch. Invalid transitions return 409. An audit timeline is written per action.

**Money.** Every monetary field is integer cents through DB, API, and client. Tax and fees use basis points. Formatting only happens in `MoneyText` / `formatMoney`. Create-order verifies server totals, rejects unavailable items, and enforces min-order and store-open (hours + `acceptingOrders`).

**Frontend.** Pages stay presentational. Feature hooks (`useOrdersList`, `useHomeMetrics`, …) own generated-client calls, toasts, and navigation. Responsive shell: sidebar on desktop (≥960px), bottom tabs on mobile.

**Backend.** Hono on Workers. `createApp({ getDb })` injects PGlite in tests so order flows don’t need Wrangler. Errors map to `{ error: { code, message, details? } }`.

**pnpm** is hoisted (`.npmrc`: `node-linker=hoisted`) so Metro can resolve workspace packages.

**Tests.** State machine (Vitest), order API (Vitest + PGlite), worker smoke (`@cloudflare/vitest-pool-workers`), dashboard hooks (jest-expo + MSW from the generated client).

Longer notes: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Tradeoffs and incomplete areas

| Choice | Cost |
|--------|------|
| Workers + Hyperdrive instead of a Node server | Local dev is Wrangler; tests use PGlite, not a real Hyperdrive pool |
| Generated Orval hooks instead of hand-written fetch | Must not set global `useQuery` + `useMutation` together — that inverts verbs |
| Expo web instead of Next.js | Select/modals follow RN patterns; native is structured, not the review target |
| Feature hooks wrapping generated hooks | Extra layer; pages must not call api-client hooks directly |
| Hoisted pnpm `node_modules` | Metro works; less isolation than pnpm’s default linker |
| One light semantic theme | No dark mode. A no-op toggle was worse than shipping one canvas |
| ESLint on dashboard + backend only | `packages/*` lint scripts are stubs; those packages are gated by typecheck and tests |

**Out of scope:** auth, roles, multi-tenant restaurants, payments, guest-facing ordering, realtime kitchen board. Prep time is stored and shown on Home; it does not drive a countdown. Production Cloudflare Hyperdrive is not wired — the wrangler binding uses a placeholder id and a local connection string.

**Known gaps:** customer `POST` exists on the API; CRM UI lists and edits seeded customers. New orders pick an existing customer. CRM VIP / new / inactive chips filter the current page, not the full set on the server. Menu item images in seed are one Unsplash placeholder.

Longer notes: [docs/TRADEOFFS.md](./docs/TRADEOFFS.md).
