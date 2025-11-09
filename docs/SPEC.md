# Kubit Framework Spec (Living Doc)

This document defines Kubit’s goals, architecture, and public APIs. It is the living source of truth that evolves alongside the skeleton app and tests. See AGENTS.md for the elicitation playbook and editing guidance.

## How to Use This Spec
- Treat this as a specification you can extend. Start by updating acceptance criteria in `docs/SKELETON_APP.md` and tests, then reflect decisions here.
- When a design decision is made, record it under Decision Log with a brief rationale.
- Capture unknowns under Open Questions; mirror them in subsystem sections.

## Decision Log
- [TBD] Decisions will be recorded here with date and rationale.

## Open Questions
- [TBD] Aggregate unresolved items here and link to subsystem sections.

## Goals

- Full‑stack MVC in TypeScript with a cohesive DX
- React for views (SSR + hydration) with an Inertia‑style navigation protocol
- Class‑based controllers, models, jobs, and mailables
- Conventional file structure; sensible defaults; overridable via config
- First‑party CLI for dev/build/test/migrate/queue/mail
- Batteries included but modular (replaceable pieces over time)

## High‑Level Architecture

- HTTP Kernel: lightweight Node runtime, middleware pipeline, error handling
- Router: named routes; inline handlers and controller actions; method variants (GET/POST/etc.)
- Controllers: classes with methods; DI‑friendly construction
- Views: React components rendered on the server; hydrated via small client runtime
- Inertia‑style Protocol: responses carry a page component + props envelope
- ORM + DB: Model base class; migrations with a schema DSL
- Jobs: base Job, queue abstraction (in‑memory first, pluggable later)
- Mail: mailables rendered via React; transport abstraction (log/dev, SMTP, provider)
- Config: typed config via defineConfig and env helpers
- CLI: `kubit` entry to run/dev/build/test/migrate/queue/mail

## Request Lifecycle

1. Node HTTP server receives request
2. Middleware pipeline executes (auth/csrf/static/…)
3. Router matches path and method
4. Handler runs (inline or controller method)
5. Handler returns a Response, a `view()` result, JSON, redirect, or stream
6. If `view()`: server renders React page + envelope; injects assets and layout
7. Response written with status, headers, cookies
8. Client bootstraps hydration and page navigation via Inertia‑style client

## Public API Surface (initial)

Package entry (ambient types provided in packages/core/index.d.ts):

- `kubit`

  - `defineConfig<T>(config: T): T`
  - `env<T>(key: string, defaultValue: T): T`

- `kubit:router`

  - `router.name(name: string): router`
  - `router.get(path, handler)`; later: post/put/patch/delete/options
  - `handler`: `(...args) => any | Promise<any>` OR `[ControllerClass, "method"]`
  - Named routes enable reverse URL generation (future: `route('name', params)`).

- `kubit:inertia`

  - `view(page: string, data?: Record<string, any>)`
  - Resolves React component at `views/<page>.tsx` and renders SSR + envelope
  - Supports optional layout wrappers and page metadata

- `kubit:orm`

  - `class Model {}` base with future: `find`, `query`, relations, scopes

- `kubit:db`

  - `class Migration { up(); down(); }`
  - `schema.createTable(name, (table) => { ... })`
  - `schema.dropTableIfExists(name)`
  - Table builder (MVP): `uuid`, `string`, `primary`, `unique`, `index`, `timestamps`, `rememberToken`

- `kubit:jobs`

  - `class Job { async handle() {} }`
  - Future: `dispatch(job)`, queue workers, retries, backoff

- `kubit:mail`
  - `class Mailable { view(template: string, data?: Record<string, any>) }`
  - Future: `to`, `subject`, transports, queueable mails

## Conventions and Structure

- App root mirrors skeleton:
  - `app/controllers`, `app/models`, `app/jobs`, `app/mail`, `app/routes.ts`
  - `views/` for React components (pages/layouts)
  - `components/` for shared UI
  - `config/` for runtime config; `config/app.ts` as entry
  - `database/migrations` for migration classes
  - `public/` for static assets
  - `storage/` for runtime storage/logs/cache (implementation TBD)

## CLI (initial contract)

- `kubit start`: run the built server or start dev server with hot reload for server + client
- `kubit build`: produce production build (server + client bundles)
- `kubit test`: run project tests (unit + integration)
- `kubit migrate`: run pending migrations
- `kubit make:*`: code generators (controller, model, job, mail, migration)

## MVP Scope (what we’ll implement first)

- Minimal HTTP server + router with named routes and controller actions
- `view()` SSR for React pages; client hydration for links/forms (very small runtime)
- Static file serving from `public/`
- Config loading via `config/app.ts`, `env()` fallbacks
- Migrations with in-memory adapter (no real DB yet), table builder DSL (no-ops for now) to satisfy skeleton
- Jobs + Mail as stubs that log to console while preserving API shape
- CLI commands that wire the above together

## Non-Goals (for MVP)

- Full ORM/DB implementation
- Production‑grade queue or mail transports
- Advanced features (auth, policies, DI container, validation) beyond simple stubs

## Evolution

We’ll use the skeleton app and the tests in `docs/TEST_PLAN.md` to drive features. Any new capability should be expressed first in the skeleton or tests, then implemented in core with minimal API churn.

---

# Subsystem Specifications

Each subsystem below follows a consistent outline: Goals, Non‑Goals, Concepts, API Surface, Configuration, Lifecycle, Edge Cases & Errors, Security, Performance, Extensibility, Testing, Open Questions, Alternatives.

## HTTP Kernel & Server
- Goals: Minimal Node HTTP server with middleware pipeline and error handling.
- Non‑Goals: Full framework‑agnostic server replacement.
- Concepts: Request/Response abstraction (TBD: Node vs. Web standard), middleware chain.
- API Surface: `createServer(app)`, `use(middleware)`, `Response` helpers (text/json/redirect/stream).
- Configuration: Port, host, trust proxy, error pages, static root.
- Lifecycle: Accept → parse → middleware → route → handler → response → finalize.
- Edge Cases & Errors: 404/405/500 behavior; body size limits; timeouts.
- Security: CORS, CSRF (later), headers; cookie flags.
- Performance: Streaming, keep‑alive, compression (later), caching headers.
- Extensibility: Middleware API; hooks for request start/end; error hook.
- Testing: Supertest‑style integration; fake request/response harness.
- Open Questions: Which Request/Response abstraction to adopt for MVP?
- Alternatives: Undici fetch/Web standard vs. Node `http`.

## Router
- Goals: Named routes, controller actions, inline handlers.
- Non‑Goals: Advanced pattern matching beyond basic params.
- Concepts: Route table, name map, method map.
- API Surface: `router.get(path, handler).name(name)`; future `post/put/patch/delete`.
- Configuration: Case sensitivity, trailing slash, param constraints (later).
- Lifecycle: Match → extract params → invoke handler.
- Edge Cases & Errors: 404 on no match; 405 on method mismatch.
- Security: Input normalization; path traversal prevention.
- Performance: O(1) lookup by method then path pattern; precompiled regex.
- Extensibility: Route groups, per‑route middleware (later), reverse routing.
- Testing: Unit tests for matching and naming; integration via server.
- Open Questions: Reverse routing API (`route(name, params)`) details.
- Alternatives: Trie vs. regex routing; groups vs. middleware stacks.

## Controllers & Request/Response
- Goals: Class‑based controllers; clean access to request/context.
- Non‑Goals: Full DI container in MVP.
- Concepts: Controller instance per request; context shaping.
- API Surface: `[ControllerClass, "method"]` as handler; helpers for returns (text/json/view/redirect).
- Configuration: Controller namespaces/auto‑resolution (later).
- Lifecycle: Instantiate → call method → normalize return → send response.
- Edge Cases & Errors: Async errors; thrown HTTP errors; validation errors (later).
- Security: Avoid leaking internals; validate route params/body (later).
- Performance: Reuse controller prototypes; lightweight context passing.
- Extensibility: DI integration hooks (future); base Controller class (optional).
- Testing: Unit test controllers; integration via routes.
- Open Questions: Do we expose Request/Response objects directly in MVP?
- Alternatives: Functional handlers only vs. class methods.

## Middleware
- Goals: Simple, composable pipeline for cross‑cutting concerns.
- Non‑Goals: Complex dependency graph of middlewares.
- Concepts: `next()` chain; request context mutation.
- API Surface: `(ctx, next) => Promise<void>`; `app.use(fn)`.
- Configuration: Global vs. per‑route (later) registration.
- Lifecycle: Pre‑route and post‑route phases.
- Edge Cases & Errors: Early returns, error handling middleware.
- Security: CSRF, auth (later) implemented as middleware.
- Performance: Minimize overhead; short‑circuiting.
- Extensibility: Third‑party middlewares.
- Testing: Unit tests for order and behavior.
- Open Questions: Per‑route middleware ergonomics in MVP?
- Alternatives: Koa‑style vs. Express‑style.

## Config & Env
- Goals: Typed config via `defineConfig` and `env()`.
- Non‑Goals: Full schema validation engine in MVP.
- Concepts: Central `config/app.ts`; environment overlay.
- API Surface: `defineConfig<T>(config: T): T`, `env<T>(key: string, defaultValue: T): T`.
- Configuration: `.env` loading (later), defaults, runtime overrides.
- Lifecycle: Load at boot; cache values; expose to app.
- Edge Cases & Errors: Missing keys; type casting.
- Security: Secret management (later); avoid logging secrets.
- Performance: Negligible; cached reads.
- Extensibility: Pluggable loaders.
- Testing: Mock env; snapshot config.
- Open Questions: Automatic type coercion rules for booleans/numbers?
- Alternatives: zod‑based schema validation later.

## Views, SSR & Inertia‑style Protocol
- Goals: Server render React views and hydrate; lightweight client runtime.
- Non‑Goals: Full RSC adoption in MVP.
- Concepts: Page component, props, layout, envelope.
- API Surface: `view(page: string, data?: Record<string, any>)`.
- Configuration: View root, layout conventions, asset manifest path.
- Lifecycle: Controller returns `view()` → SSR → wrap envelope → send.
- Edge Cases & Errors: Missing page component; serialization issues.
- Security: XSS protections; escape props; CSP (later).
- Performance: Streaming SSR (later); memoized templates; code splitting.
- Extensibility: Custom layout resolvers; head/meta injection.
- Testing: Snapshot SSR output; hydration smoke tests.
- Open Questions: Envelope exact shape and client runtime responsibilities.
- Alternatives: Inertia protocol compatibility vs. bespoke envelope.

## Static Files & Assets
- Goals: Serve files from `public/`; integrate bundler for client assets.
- Non‑Goals: Full asset pipeline initially.
- Concepts: Static route prefix; fingerprinted assets.
- API Surface: Static file server; asset helper (later).
- Configuration: `public/` root; cache headers.
- Lifecycle: Check static before route; stream file.
- Edge Cases & Errors: 404; directory traversal.
- Security: Safe path joining; mime detection.
- Performance: ETags; caching; compression (later).
- Extensibility: Custom static mount points.
- Testing: GET `/favicon.ico` returns bytes.
- Open Questions: Which bundler and manifest format to adopt?
- Alternatives: Vite integration vs. esbuild custom.

## ORM/DB & Migrations
- Goals: Migration runner + schema DSL (no‑op/in‑memory for MVP).
- Non‑Goals: Full ORM in MVP.
- Concepts: Migration class (up/down); schema builder.
- API Surface: `class Migration { up(); down(); }`; `schema.createTable`, `schema.dropTableIfExists`.
- Configuration: Connection config (later); paths.
- Lifecycle: Discover → order → run → record.
- Edge Cases & Errors: Partial failures; reruns; down migrations.
- Security: Safe SQL generation (future when real DB).
- Performance: Minimal for MVP.
- Extensibility: Adapters (SQLite/Postgres) later.
- Testing: Record calls; assert order.
- Open Questions: Choose schema builder DSL compatibility target.
- Alternatives: Knex/Drizzle/Prisma migrations.

## Jobs & Queue
- Goals: Define jobs and run them (in‑memory in MVP).
- Non‑Goals: Distributed queue initially.
- Concepts: Job class; dispatcher; worker loop.
- API Surface: `class Job { async handle() {} }`; future `dispatch(job)`.
- Configuration: Concurrency; retry policy (later).
- Lifecycle: Enqueue → process → complete/fail.
- Edge Cases & Errors: Retries; idempotency (later).
- Security: Job payload validation.
- Performance: Batched processing (later).
- Extensibility: Adapter interface for real queues.
- Testing: Run a job and assert side‑effects.
- Open Questions: Dispatch API and worker design.
- Alternatives: BullMQ, Mini‑queues.

## Mail
- Goals: Render mailables via React; send via transport (stub in MVP).
- Non‑Goals: Complex templating beyond React.
- Concepts: Mailable class; transport abstraction.
- API Surface: `class Mailable { view(template: string, data?: Record<string, any>) }`.
- Configuration: SMTP/provider creds (later); dev preview mailbox.
- Lifecycle: Build → render → send/preview.
- Edge Cases & Errors: Invalid templates; transport failures.
- Security: Avoid XSS in email HTML; secret handling.
- Performance: Template caching.
- Extensibility: Pluggable transports; queue integration.
- Testing: Render to HTML string; snapshot.
- Open Questions: Built‑in preview server?
- Alternatives: Nodemailer vs. provider SDKs.

## CLI
- Goals: One entry point for dev/build/test/migrate/queue/mail.
- Non‑Goals: Full project generator initially (beyond `make:*`).
- Concepts: Commands, flags, config discovery.
- API Surface: `kubit start|build|test|migrate|make:*`.
- Configuration: `config/app.ts`, env, CLI flags.
- Lifecycle: Parse → execute command → report.
- Edge Cases & Errors: Helpful error messages; non‑zero exits.
- Security: Redact secrets in logs.
- Performance: Fast startup; watch mode (later).
- Extensibility: Plugin commands (later).
- Testing: Smoke tests per command.
- Open Questions: Separate `dev` vs. `start` commands.
- Alternatives: Oclif/Commander custom CLI.

## Observability & Errors
- Goals: Useful logs; clear stack traces and error pages.
- Non‑Goals: Full tracing/metrics initially.
- Concepts: Logger interface; error boundary page.
- API Surface: `logger` with levels; error handler hook.
- Configuration: Log level, JSON vs. pretty.
- Lifecycle: Request start/end logs; error logs.
- Edge Cases & Errors: Pretty 500 page in dev; terse in prod.
- Security: Avoid PII in logs.
- Performance: Minimal overhead.
- Extensibility: Plug external loggers.
- Testing: Snapshot error pages; assert logs.
- Open Questions: Built‑in logger vs. adapter.
- Alternatives: Pino/Winston adapters.
