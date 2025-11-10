# AGENTS.md

Operating guide for AI agents working in this repository.

Scope: The entire repository unless superseded by a more specific AGENTS.md deeper in the tree.

## Primary References

- Framework spec: `docs/SPEC.md`
- Skeleton app spec: `docs/SKELETON_APP.md`
- Test plan: `docs/TEST_PLAN.md`
- Background/motivation: `docs/BRAINDUMP.md`
- RFC process: `docs/rfcs/README.md`
- RFC template: `docs/RFC_TEMPLATE.md`

Always consult these docs before changing public APIs or directory structure. If you adjust the API, update the spec and
tests in the same change.

## Docs Sync Requirement

If any file under `docs/` changes (SPEC, SKELETON_APP, TEST_PLAN, ROADMAP, BRAINDUMP, or new docs), you must update
`AGENTS.md` in the same change to reflect new or modified guidance. This prevents agents from operating against stale
instructions and ensures new capabilities are discoverable here.

Documentation conventions:

- When updating public APIs, include concise TypeScript signatures in `docs/SPEC.md`.
- Avoid inline code examples in docs; instead, reference the living examples in `skeleton/*` using file paths (e.g., `skeleton/app/routes.ts:1`).
- Keep skeleton references (`skeleton/*`) in `docs/SKELETON_APP.md` accurate.
- Prefer declarative instructions in `docs/TEST_PLAN.md`; commands should point to the skeleton where relevant.

## Spec Elicitation Playbook

When expanding the spec, use the prompts below to extract details and capture them in `docs/SPEC.md` under the
appropriate subsystem sections. Prefer concrete examples and TypeScript signatures.

General prompts (ask per subsystem):

- Goals vs. non‑goals: What is in scope for MVP vs. later?
- Inputs/outputs: What goes in and what must come out? Data shapes?
- Lifecycle: Step‑by‑step flow; extension points?
- Configuration: Knobs, defaults, and override mechanisms?
- Errors: Failure modes; error types; surfacing to users/devs?
- Edge cases: Tricky scenarios to support or explicitly reject?
- Security: AuthN/Z, CSRF, CORS, secrets, privacy?
- Performance: Latency, streaming, caching, batching?
- Extensibility: Hooks, interfaces, adapters, plugin points?
- Testing: What tests prove it? Unit/integration/e2e? Fixtures?
- Open questions: Anything undecided → add to SPEC “Open Questions”.

Subsystem deep‑dive prompts:

- HTTP Kernel & Responses
  - Request/response abstraction (Node vs. Web standard)? Streaming?
  - Middleware pipeline order/composition? Error handling policy?
  - Static vs. app route precedence? 404/405/500 behavior?
- Router
  - Path syntax, params, constraints, trailing slash, case sensitivity?
  - Named routes, reverse routing, route groups, per‑route middleware?
  - Controller action resolution: instantiation, async, context binding?
- Controllers & DI
  - Construction: DI container or factories? Access to request/config?
  - Return types: text, JSON, redirects, `view()`, streams; helpers?
  - Validation strategy and error reporting (MVP vs. future)?
- Views, SSR & Inertia‑style Protocol
  - Envelope shape: `{ component, props, url, version }`? Layouts?
  - Hydration: bundle splitting, asset manifest, client runtime duties?
  - Forms/links: enhancement, file uploads, optimistic UI?
- Assets & Static
  - Bundler choice (Vite/esbuild/rollup) and dev server integration?
  - Cache headers, etags, fingerprinting?
- Config & Env
  - Loading order (`.env`, process env), type casting, overrides?
  - Runtime vs. build‑time config split?
- ORM/DB & Migrations
  - Table builder DSL surface and compat plan (Knex/Drizzle)?
  - Runner: tracking table, up/down, transactions, seeding?
- Jobs & Queue
  - Dispatch API, queue names, retries/backoff, idempotency, scheduling?
  - Worker lifecycle, graceful shutdown, visibility timeouts?
- Mail
  - Rendering API, transport abstraction, env config, attachments?
  - Preview/dev mailbox, test fakes?
- CLI
  - Commands, flags, config discovery, watch mode, error UX?
- Observability
  - Logging format/levels, tracing hooks, metrics?

Capture answers in the relevant SPEC section; when a decision is made, add it to the SPEC’s Decision Log.

## Subsystem Spec Template (use in SPEC)

For each subsystem in `docs/SPEC.md`, structure content using this outline:

- Goals
- Non‑Goals
- Concepts & Vocabulary
- API Surface (TypeScript)
- Configuration
- Lifecycle & Control Flow
- Edge Cases & Errors
- Security & Privacy
- Performance & Scaling
- Extensibility & Integration Points
- Testing Strategy & Fixtures
- Open Questions
- Alternatives Considered

## Way of Working

- Plan first: keep a short, up‑to‑date plan and mark progress as you go.
- Drive by tests: express intended behavior in `skeleton/tests/*` and then implement packages to satisfy those tests.
- Keep it small: minimal, focused changes; avoid unrelated refactors.
- Preserve the skeleton: don’t break the structure or imports unless a doc change explicitly precedes it.
- Update docs with code: if the spec or acceptance criteria change, update `docs/*` in the same PR.

## Source of Truth (Public API)

- `packages/core/index.d.ts` defines the ambient types for the public API (`kubit`, `kubit:router`, `kubit:inertia`,
  `kubit:server`, `kubit:orm`, `kubit:db`, `kubit:queue`, `kubit:mail`, `kubit:hash`).
- Treat these definitions as the contract. When adding capabilities, update the types, the spec, and the tests together.

## Implementation Guidance

- Language: TypeScript. Favor class‑based objects for controllers, models, jobs, and mailables.
- Views: React (19) for SSR + hydration. Inertia‑style protocol for navigation.
- Minimal viable implementations are acceptable initially (no‑op/stub) if they match the API and enable tests to pass.
  Examples:
  - DB/migrations can record schema calls in memory without a real database.
  - Jobs and Mail can log to console/return HTML while preserving the API.
- Packages: start small. Likely candidates as code emerges (names may evolve):
  - `packages/kubit` (entry; exports `defineConfig`, `env` and subpath exports)
  - `packages/router` (named routes, controller actions)
  - `packages/inertia` (view rendering + client runtime hookup)
  - `packages/runtime` (HTTP server, middleware, responses)
  - `packages/db` (migrations DSL, adapters)
  - `packages/queue` (jobs)
  - `packages/mail` (mailable rendering, transports)

TypeScript Config:

- Follow the skeleton’s `tsconfig.json` for compatibility:
  - Enable `experimentalDecorators`
  - Include `lib: ["ESNext", "DOM"]` for React/DOM types
  - Ensure `types` includes `packages/core/index.d.ts` and `packages/core/tests.d.ts`
- Ambient modules provided by core types:
  - `datetime` with `DateTime` alias for timestamp fields
  - Minimal `react` typings to support `FC`

Subpath Exports:

- The skeleton imports module IDs like `kubit:router`. When creating a runtime package, ensure `kubit` provides subpath
  exports (Node `exports` field) so `kubit:router` resolves properly.

## Conventions

- Project structure mirrors the skeleton described in `docs/SKELETON_APP.md`.
- Keep public APIs stable. If changes are necessary, update docs + tests first.
- Avoid adding new dependencies unless they’re essential.
- Don’t add license headers or sweeping formatters/config unless asked.
- Follow TypeScript best practices; use descriptive names; avoid one‑letter variables.
- Keep code comments brief and purposeful.

## Validation Checklist (per change)

- Types: `packages/core/index.d.ts` reflect any new/changed APIs
- Docs: `docs/SPEC.md` and related docs updated if behavior changes
- Skeleton: compiles and tests reflect intended behavior (`skeleton/tests/*`)
- Minimal runtime contracts honored (SSR, routing, config) as per `docs/TEST_PLAN.md`

## MVP Boundaries

As noted in `docs/SPEC.md`, initial implementations can be simplified:

- HTTP server, router, and SSR are minimal but real
- Static files from `public/`
- Config via `config/app.ts` + `env()`
- DB/Jobs/Mail may start as stubs that satisfy the contract

## Proposing Changes

0. For non‑trivial design or any public API change, create an RFC (`docs/rfcs/README.md`) and follow the template.
1. Update acceptance criteria in `docs/SKELETON_APP.md` and/or `docs/TEST_PLAN.md`
2. Add/adjust tests in `skeleton/tests/*`
3. Update `packages/core/index.d.ts` if the public API changes
4. Implement the minimal feature in `packages/*`
5. Ensure docs remain accurate (including `AGENTS.md` per Docs Sync Requirement)
