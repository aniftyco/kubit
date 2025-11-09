RFCs

Use RFCs to propose non‑trivial changes to Kubit’s design or public APIs.

Process
- Copy `docs/RFC_TEMPLATE.md` to `docs/rfcs/<YYYY-MM-DD-your-slug>.md`.
- Fill in all sections, including test plan and required repo changes.
- Open a PR with the RFC and link to any prototype branches if applicable.
- On acceptance, update `docs/SPEC.md` (Decision Log + relevant subsystems) and `AGENTS.md`.

Naming
- File: `YYYY-MM-DD-short-title.md`
- Title: Human‑readable, descriptive of the change

Status Flow
- Draft → Discussion → Accepted/Rejected → (optionally) Deprecated

Checklist (before merge)
- Spec updated (`docs/SPEC.md`)
- Agents file updated (`AGENTS.md`)
- Types updated (`packages/core/index.d.ts`) if APIs change
- Skeleton tests added/updated (`skeleton/tests/*`)
