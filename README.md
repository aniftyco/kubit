# Kubit

TypeScript‑first, monolithic MVC for the modern web. React for views. Inertia‑style navigation. Batteries included.

Status: exploratory. This repo contains a skeleton application and type‑only “core” stubs that define Kubit’s public API while implementation evolves.

## What Is Kubit?

Kubit aims to combine a classic MVC backend with a modern React frontend story: controllers and models on the server, React pages rendered on the server and hydrated on the client, and an Inertia‑style navigation protocol to bridge both worlds.

## Highlights

- Full‑stack MVC in TypeScript
- React for views (SSR + hydration)
- Named routes and class‑based controllers
- Conventional app structure with typed config
- Migrations/ORM, Jobs, and Mail (initially as stubs to drive the API)

## Repository Layout

- `packages/core` — ambient type definitions describing the public API
- `skeleton` — example app showing intended DX
- `docs` — spec, skeleton requirements, test plan, roadmap, and brain dump

## Read More

- Framework spec: `docs/SPEC.md`
- Skeleton app spec: `docs/SKELETON_APP.md`
- Test plan: `docs/TEST_PLAN.md`
- Roadmap: `docs/ROADMAP.md`
- RFCs: `docs/rfcs/README.md`
- Background and motivation: `docs/BRAINDUMP.md`

## Status and Next Steps

- This repo is design‑ and test‑driven; the CLI/runtime are not yet implemented.

License: see `LICENSE.md`.
