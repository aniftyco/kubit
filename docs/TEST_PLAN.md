# Test Plan

We will drive Kubit’s core via tests authored against the skeleton app. The plan starts with minimal unit/integration
tests and grows toward end‑to‑end.

## Tooling

- Test runner: Vitest (or Jest) in the skeleton
- HTTP assertions: Supertest‑style or native fetch against the dev server
- Type checks: `tsc --noEmit` against skeleton with `packages/core` types

Type checks should be run against the skeleton app (see `skeleton/tsconfig.json:1`).

## Phases

Phase 0: Types

- `tsc` passes for the skeleton
- Imports from `kubit:*` resolve via `packages/core/index.d.ts`
- Decorators compile for models (tsconfig: `experimentalDecorators` enabled)
- DOM types available for React components (`lib: [ESNext, DOM]`)
- Ambient `datetime` module resolves and `DateTime` types fields
- `kubit:hash` import resolves and has async `hash(string)` signature

Phase 1: Routing + Responses

- GET `/` returns 200 and HTML containing “Welcome to the Home Page”
- GET `/foo` returns 200 and text `foo`
- GET `/bar` returns 200 and text `bar`
- Route table contains names: `home`, `foo`, `bar`
- Controller handlers receive `HttpContext` (with `{ request: { method, url }, response: { status, body } }`)
- Setting `response.status = 200` in a controller method is reflected in the response

Phase 2: Views + Inertia SSR

- `view('home', { time })` renders time into HTML
- Response includes minimal client boot script for hydration
- Client hydration runs; Button click triggers `alert`

Phase 3: Static Files

- GET `/favicon.ico` returns file from `public/`

Phase 4: Config

- `config/app.ts` evaluates with defaults when env vars are missing
- `env('APP_DEBUG', false)` is boolean false by default; true when set

Phase 5: DB Migrations (No‑op Backend)

- `schema.createTable(...)` calls are recorded and surfaced in logs
- `schema.dropTableIfExists(...)` calls are recorded
- Table builder calls include: `uuid`, `string`, `text`, `primary`, `unique`, `index`, `timestamps`, `softDeletes`, `rememberToken`, `foreignIdFor(Model)`

Phase 6: Queue + Mail (Stubs)

- `ExampleJob.dispatch({...})` enqueues and runs once; logs a line
- `ExampleMail.send({...})` dispatches; `handle()` returns HTML string from `view('emails.example', ...)`

## Stretch (Future)

- Reverse routing: `route('home')` produces `/`
- Form posts: minimal body parsing and validation errors envelope
- Error pages: 404/500 templates
