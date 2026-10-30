# Work log — Civilization_AI

## 2026-10-29 — PR #3 Merge & Pocket Village World Upgrade

- **Authorization:** owner's explicit handoff prompt authorized merging PR #3 into `main` after
  verifying checks and resolving review threads, creating `feat/pocket-village-world`, and integrating
  the Pocket Village V1.1.1 asset pack and world upgrades.
- **Merge PR #3:** verified all 5 required checks (`Governance / invariants`, `Governance / secrets`,
  `Governance / actions-security`, `Project / checks`, `governance/exact-head-review`) green, resolved
  two review conversation threads, and squash merged PR #3 into `main` (`9339978`).
- **Branch:** `feat/pocket-village-world` created from updated `main`.
- **Integrated Assets:** extracted and organized Pocket Village V1.1.1 pixel-art assets into
  `viewer/assets/` (`Tilesets`, `NPCs`, `Pocket Hero`, `Enemy`), well under file-size limits.
- **Authoritative World Model:**
  - Added five permanent village landmarks: The Village Windmill & Granary (`granary` at `9, 7`),
    Pioneer's Cottage (`cottage-west` at `5, 4`), Valley Haven Cottage (`cottage-east` at `15, 7`),
    Commons & Campfire Plaza (`commons` at `9, 5`), and Valley Workshop (`workshop` at `12, 7`).
  - Added terrain walkability grid with authoritative `blocked` cells (river stream, cliffs, structural walls)
    and bounded BFS pathfinding in `nextStep()` to navigate around obstacles.
  - Implemented enhanced shelter rest affordance (+35 energy recovery in shelter vs +25 in open terrain).
  - Implemented granary food consumption affordance when hungry (>60 hunger) with empty inventory.
  - Added Pippin the gentle orange meadow slime critter hopping in southeastern pasture, perceived locally.
  - Canonicalized save paths in `WorldStore` via `realpathSync` to prevent companion lease collisions.
- **Upgraded Phaser Viewer:**
  - 16-frame animated spinning windmill blades on the mill tower.
  - Character action state animations (idle, run, attack/harvest) and floating action emote bubbles.
  - Animated bouncing meadow slime sprite.
  - Interactive selection and inspection for both inhabitants and landmarks.
  - Visual status meters for hunger and energy.
  - Smooth day/night lighting transitions with warm campfire glow.
  - Static asset serving under `/assets/*` with path-containment checks and CSP `blob:` support.
- **Verification Evidence:**
  - `npm run check`: strict TypeScript pass (zero errors), 20 automated unit/integration tests pass
    (including 1,200-tick determinism, 6,000-tick material conservation, landmarks, BFS navigation,
    shelter rest, granary consumption, and wildlife perception), and esbuild bundle succeeds.
  - Playwright browser smoke test: verified headless Chromium rendering, button navigation,
    zero console errors, zero failed network requests, and clean local asset loading.
  - Governance checks: `validate-governance.sh` and `project-checks.sh` pass.
  - License integrity: original MIT license byte-for-byte with `DraganDrop` preserved (`b60acde446066bf5a02fed0affd4ce414e864087`).
- **Attribution:** credited SebbySpoons (Pocket Village 16×16 Tileset) and Erisesra (Character animation template).

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
