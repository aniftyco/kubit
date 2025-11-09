RFC: <Descriptive Title>

- Status: Draft | Discussion | Accepted | Rejected | Deprecated
- RFC ID: <YYYY-MM-DD-unique-slug>
- Authors: <name>@<handle>
- Owners: <responsible maintainers>
- Reviewers: <reviewers>
- Created: <YYYY-MM-DD>
- Updated: <YYYY-MM-DD>

Summary

One or two paragraphs explaining the change at a high level and why it matters.

Motivation

- What problem does this solve? Who is affected?
- User stories and use‑cases
- Prior art and why it’s insufficient

Goals

- Explicit, testable outcomes for this proposal

Non‑Goals

- What’s intentionally out of scope for this RFC

Stakeholders & Impact

- Affected subsystems (link sections in `docs/SPEC.md`)
- Impact on skeleton app and developer workflow

Detailed Design

Concepts & Vocabulary

- Define new terms and clarify existing ones

Public API Surface (TypeScript)

- New/changed exports with signatures and examples
- Module IDs (e.g., `kubit:router`) and import paths

Data/Schema (if applicable)

- Data structures, migration needs, compatibility notes

Lifecycle & Control Flow

- Step‑by‑step flow, request/response paths, component interactions

Configuration

- Options, defaults, precedence, and how users override

Backwards Compatibility & Migration

- Breaking changes and the migration story

Security Considerations

- AuthN/Z, CSRF, CORS, secrets, injection vectors, privacy

Performance Considerations

- Latency, throughput, memory, streaming, caching

Observability

- Logging, metrics, tracing hooks, error reporting

Developer Experience

- CLI changes, error messages, scaffolding, ergonomics

Alternatives Considered

- Other approaches evaluated and why they were rejected

Implementation Plan

Phases & Milestones

- Incremental steps mapped to `docs/ROADMAP.md` where relevant

Test Plan & Acceptance Criteria

- Tests to add/update in `skeleton/tests/*`
- How this maps to `docs/TEST_PLAN.md`

Required Changes Across Repo

- Update `docs/SPEC.md` (subsystem sections)
- Update `AGENTS.md` (guidance must stay in sync with docs)
- Update `packages/core/index.d.ts` (public API types)
- Update skeleton app (routes, views, config, etc.) if needed

Open Questions

- Items to resolve before acceptance

Decision Record (populate on acceptance)

- Decision, date, brief rationale
- Reference updates to `docs/SPEC.md` Decision Log

References

- Links to related issues/PRs, prior art, external docs

Changelog

- Notable edits to this RFC during discussion
