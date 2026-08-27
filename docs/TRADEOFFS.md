# Tradeoffs

## Cloudflare Workers + Hyperdrive vs. traditional Node server

**Choice**: Hono on Workers with Hyperdrive for Postgres connectivity.

**Why**: Matches the assignment stack; edge deployment path with minimal cold-start surface. Hyperdrive pools connections so Workers don't open raw Postgres sockets per request.

**Tradeoff**: Local dev depends on Wrangler + Hyperdrive local connection string; PGlite is used in unit tests instead of spinning up Workers for every assertion.

## OpenAPI → Orval vs. hand-written client

**Choice**: Generate React Query hooks from the committed OpenAPI artifact.

**Why**: Single source of truth; frontend cannot drift from backend types. MSW mocks are co-generated for tests.

**Tradeoff**: Orval global overrides must stay minimal — explicit `useQuery: true` + `useMutation: true` together inverts GET/POST hook generation. We rely on Orval defaults instead.

## Expo / React Native Web vs. Next.js

**Choice**: Expo SDK 57 with expo-router for web and native from one codebase.

**Why**: Required stack; shared UI package works across platforms; Metro monorepo config proves workspace package imports.

**Tradeoff**: Web UX is optimized for operator dashboards, not marketing sites. Some RN primitives (e.g. Select via Modal) are simpler than native web `<select>` but keep parity with mobile.

## Integer cents for money

**Choice**: All monetary fields stored and transmitted as integer cents.

**Why**: Avoids floating-point rounding in totals, tax, and fee calculations (`calculateOrderTotals` in `@odyssey/types`).

**Tradeoff**: Human entry sometimes uses cent inputs in admin forms; display formatting is centralized in `MoneyText` / `formatMoney`.

## Order transition API vs. PATCH status

**Choice**: Dedicated transition endpoint with named actions.

**Why**: Encodes business rules in one place (state machine); invalid transitions return 409 with clear errors; audit timeline records each action.

**Tradeoff**: Clients need to read `allowedActions` and map UI buttons to actions rather than setting a status dropdown directly — slightly more frontend logic, much safer backend.

## Feature hooks vs. page-level data fetching

**Choice**: `useOrdersList`, `useHomeMetrics`, etc. wrap generated hooks.

**Why**: Keeps route components thin and testable; centralizes toast/error handling and navigation side effects.

**Tradeoff**: Extra indirection layer; developers must remember not to call generated hooks directly from pages (team convention).

## PGlite for backend unit tests

**Choice**: In-memory PGlite with Drizzle migrator for API tests.

**Why**: Fast, no Docker Postgres required in CI; validates SQL migrations apply cleanly.

**Tradeoff**: PGlite doesn't replicate every Postgres extension (e.g. some UUID defaults); tests focus on route/integration behavior rather than Postgres-specific features.

## pnpm hoisted node_modules

**Choice**: Hoisted linker for the monorepo root.

**Why**: Expo Metro resolves workspace packages reliably with `watchFolders` + `disableHierarchicalLookup`.

**Tradeoff**: Less strict isolation than pnpm's default isolated mode; acceptable for this assignment's package count.
