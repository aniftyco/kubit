# Kubit Framework Spec (Living Doc)

This document defines Kubit’s goals, architecture, and public APIs. It will evolve alongside the skeleton app and tests.

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

We’ll use the skeleton app and the tests in docs/TEST_PLAN.md to drive features. Any new capability should be expressed first in the skeleton or tests, then implemented in core with minimal API churn.
