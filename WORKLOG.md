# Work log — Civilization_AI

## 2026-10-29 — The Living Valley, Prototype 0.1

- **Authorization:** owner's continuation permits bounded local implementation and PR; excludes
  spending, providers/models, deployment/public access, new services and governance changes.
- **Branch:** `feat/living-valley-prototype`, from main `ed2d147`.
- **Sequence:** read main policy/design/checks; commit fresh bounded spec as `68e0d60` before code;
  implement engine/SQLite/HTTP/Phaser and tests as `f2c4f01`; finish viewer QA and handoff docs.
- **Implemented:** four deterministic inhabitants, personal observations, independent opportunities,
  resumable plans, finite material operations, persisted fixed clock and atomic state/event commits.
  Loopback observer is browser-independent. No AI Town imports; MIT DraganDrop license unchanged.
- **Evidence:** clean npm install; strict types; 14 product tests; five-day conservation; exact
  restart/closed-file restore; storage rollback/failure and single-writer checks; desktop/mobile
  Chromium smoke with no console errors or external requests. See `docs/prototype-validation.md`.
- **Controls:** existing governance/project checks and secret scan pass; normal commit hooks used.
  No trust-root files changed. Product checks are local evidence, not newly enforced CI.
- **Limits/next:** deterministic test cognition only; resources finite; no dialogue/institutions,
  advanced memory or invention. Future inference/provider/capacity and CI-control work need their
  own authorized scope. Paul reviews the PR; no merge by this agent.

## 2026-10-29 — Activate and verify GitHub protections

- **Branch:** `chore/activate-governance-protections`; documentation proposal in PR #2.
- **Authorization:** after merging PR #1, Paul instructed proceeding with the protection plan.
- **Completed:** verified the base-branch review status on PR #2, applied the existing V3 tool
  with the merged solo-owner profile, independently read back the active ruleset and effective
  branch rules, and checked Actions permissions. See `docs/governance-activation.md`.
- **Result:** required PRs and five checks, linear history, resolved conversations, blocked
  force pushes/deletion, no bypass actors, and no second-account approval requirement.
  Public visibility and the original MIT license are unchanged.
- **Validation:** governance/project checks and local commit gates pass; final GitHub results
  are recorded on PR #2. No destructive enforcement tests or simulation tests were run.
- **Next:** Paul reviews/merges the documentation. Simulation implementation remains separately
  scoped; this operational step does not approve unresolved product decisions.

## 2026-10-29 — Propose governance v3 single-owner installation

- **Branch:** `chore/setup-governance-v3-single-owner`.
- **Changed:** ran the actual V3 Windows bootstrap; adapted policy and solo-owner profile;
  added project brief, bounded spec, decision/architecture context and template provenance.
- **Sources:** clean kit `a975cec88ee8c39d93b4f41538dcef711a610896`; earlier solo-owner profile
  `6259fd2f340c192a63e5026c8d287ef1ecbc9b6e`; existing README and recovered conversation/review.
- **Verified:** `sh scripts/ci/validate-governance.sh`, `sh scripts/ci/project-checks.sh`,
  `lefthook run pre-commit`, `lefthook run commit-msg -- <message-file>` and Gitleaks history
  scan passed. Source-fidelity checks matched 13 unchanged manifest controls and verified the
  original license, vision, ignore rules, local links and absence of private markers.
  Native Windows public-kit `tests/acceptance.ps1`: **22 passed, 0 failed**, at the same source
  commit. The original local kit checkout flagged two history scans; the clean public-only
  checkout resolved those flags. Linux workflow results are recorded in the PR.
- **Limits:** no runtime exists; no simulation, live-device, performance or paid-provider
  validation is claimed. No independent review is claimed by the single-owner profile.
- **Next:** Paul reviews/merges governance; remote protections require a separately reviewed
  plan and authorization. First-PR exact-head status is unavailable until the base has the workflow.
- **Open decisions:** template naming interpretation and bootstrap limitations are explicit in
  `docs/governance-setup.md`; product decisions remain in `docs/decisions.md`.
- **Scope:** no simulation code, installation, spending, deployment or auto-merge.
