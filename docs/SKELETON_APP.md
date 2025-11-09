# Skeleton App Spec

The skeleton demonstrates the intended developer experience and acts as the acceptance suite driver for core features.

## Layout

- `skeleton/app/routes.ts`: route definitions
- `skeleton/app/controllers/*`: class‑based controllers
- `skeleton/app/models/*`: class‑based models using decorators, relations, and traits
- `skeleton/views/*`: React page components
- `skeleton/components/*`: shared React components
- `skeleton/config/app.ts`: app config via `defineConfig` and `env`
- `skeleton/database/migrations/*`: migration classes using `schema`
- `skeleton/app/jobs/*`: Job subclasses
- `skeleton/app/mail/*`: Mailable subclasses
- `skeleton/tests/*`: tests driving features

## Must‑Have Behaviors (MVP)

- Boot a dev server that:
  - Serves `/` via `HomeController.index` returning `view('home', props)`
  - Serves `/foo` and `/bar` with inline handlers (string/async)
  - Serves static assets from `public/`
- Controller actions receive an `HttpContext` param and may set `response.status`
- Render `views/home.tsx` to HTML on the server, include assets, and hydrate on the client so the Button click works.
- Support named routes (`router.name('home')`) and preserve them for reverse routing later.
- Load typed config from `config/app.ts` using `env()` fallbacks.
- Execute migration classes (no real DB required in MVP; schema API can be no‑op but callable).
- Process a `Job` subclass by calling `handle()` (console log is acceptable in MVP).
- Render a `Mailable` via `view()` returning HTML (no transport in MVP).

## Example References

- Routes: `skeleton/app/routes.ts:1`
- Controller: `skeleton/app/controllers/home.ts:1`
- Models: `skeleton/app/models/user.ts:1`, `skeleton/app/models/post.ts:1`
- View: `skeleton/views/home.tsx:1`
- Component: `skeleton/components/button.tsx:1`
- Config: `skeleton/config/app.ts:1`
- Migration: `skeleton/database/migrations/0000_00_00_000000_create_users_table.ts:1`
- Job: `skeleton/app/jobs/example.ts:1`
- Mail: `skeleton/app/mail/example.ts:1`

## Acceptance Criteria Checklists

Server + Router

- Resolves inline and controller handlers
- Supports `router.name()` and persists names in route table
- Returns 200 for `/`, `/foo`, `/bar`

Views + Inertia

- `view('home', props)` SSR matches component output and includes props
- Client hydration enables Button click alert

Static Files

- Requests to `/favicon.ico` return file from `public/`

Config

- `defineConfig` returns typed object
- `env()` resolves string/boolean with default fallback

Migrations

- `schema.createTable()` and `schema.dropTableIfExists()` are callable and tracked

Jobs

- `new ExampleJob().handle()` is callable and runs once

Mail

- `new ExampleMail().handle()` returns HTML via `view()`
