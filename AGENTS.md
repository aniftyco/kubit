# AGENTS.md

Operating guide for AI agents working in this repository.

Scope: The entire repository unless superseded by a more specific AGENTS.md deeper in the tree.

## Primary References

- Framework spec: `docs/SPEC.md`
- Skeleton app spec: `docs/SKELETON_APP.md`
- Test plan: `docs/TEST_PLAN.md`
- Background/motivation: `docs/BRAINDUMP.md`

Always consult these docs before changing public APIs or directory structure. If you adjust the API, update the spec and tests in the same change.

## Docs Sync Requirement

If any file under `docs/` changes (SPEC, SKELETON_APP, TEST_PLAN, ROADMAP, BRAINDUMP, or new docs), you must update `AGENTS.md` in the same change to reflect new or modified guidance. This prevents agents from operating against stale instructions and ensures new capabilities are discoverable here.

## Way of Working

- Plan first: keep a short, up‑to‑date plan and mark progress as you go.
- Drive by tests: express intended behavior in `skeleton/tests/*` and then implement packages to satisfy those tests.
- Keep it small: minimal, focused changes; avoid unrelated refactors.
- Preserve the skeleton: don’t break the structure or imports unless a doc change explicitly precedes it.
- Update docs with code: if the spec or acceptance criteria change, update `docs/*` in the same PR.

## Source of Truth (Public API)

- `packages/core/index.d.ts` defines the ambient types for the public API (`kubit`, `kubit:router`, `kubit:inertia`, `kubit:orm`, `kubit:db`, `kubit:jobs`, `kubit:mail`).
- Treat these definitions as the contract. When adding capabilities, update the types, the spec, and the tests together.

## Implementation Guidance

- Language: TypeScript. Favor class‑based objects for controllers, models, jobs, and mailables.
- Views: React (19) for SSR + hydration. Inertia‑style protocol for navigation.
- Minimal viable implementations are acceptable initially (no‑op/stub) if they match the API and enable tests to pass. Examples:
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

Subpath Exports:

- The skeleton imports module IDs like `kubit:router`. When creating a runtime package, ensure `kubit` provides subpath exports (Node `exports` field) so `kubit:router` resolves properly.

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

1. Update acceptance criteria in `docs/SKELETON_APP.md` and/or `docs/TEST_PLAN.md`
2. Add/adjust tests in `skeleton/tests/*`
3. Update `packages/core/index.d.ts` if the public API changes
4. Implement the minimal feature in `packages/*`
5. Ensure docs remain accurate
