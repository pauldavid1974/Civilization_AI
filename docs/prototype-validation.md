# Prototype 0.1 validation

Executed on 29 October 2026, Windows 11, Node 24.19.0, npm 11.17.0.
Scope: [first-slice specification](specs/living-valley-0.1.md). No paid calls or deployment.

## Automated product evidence

- `npm ci`: successful clean install, 9 packages audited, 0 reported vulnerabilities.
  npm reported esbuild's pending install-script approval; the installed platform binary built
  successfully without changing npm's approval settings.
- `npm run check`: strict TypeScript check, **14 tests passed / 0 failed**, server/viewer build passed.
- Determinism: identical state and ordered events for 1,200 ticks from identical initial state.
- Accounting: 6,000 ticks (five default days), initial stock equals remaining patches + carried
  + shared store + consumed, with bounded needs/capacity and nonnegative resources.
- Personal evidence: no distant resources or other minds in cognition inputs; witnessed depletion
  changes the later choice. Buggy adapters cannot mutate authoritative inputs or block other actors
  by throwing; malformed and contested actions do not create resources.
- Recovery: restart at tick 13 with active plans matches uninterrupted continuation through tick
  113 exactly, including ordered history. A closed-file copy restores the same continuation.
- Durability: forced snapshot-update failure rolls back already inserted tick events and does not
  publish state; retry commits once. Second writers and incompatible schema are refused.
- Runtime: loopback HTTP integration proves progression before any viewer, between requests and
  after disconnect; disallowed method/path/Host rejected. Injected storage failure stops the runner.
- Clock delay: catch-up batches are bounded to 20 ticks while retaining all remaining time debt.

## Browser evidence

Used Game Studio's Phaser/UI/playtest guidance and existing Python Playwright with Chromium
153.0.8010.12, without installing a browser. Tested the built application, not a static mockup.

- Desktop 1440×1080 and mobile 390×844, full-page screenshot review.
- Canvas boot and four inhabitant selectors; real backend time updates observed.
- Pointer selection and keyboard Enter selection update the inspector.
- Interrupted snapshot response shows disconnected/last-observation state; normal polling recovers.
- No horizontal overflow at mobile width; no console/page errors or external runtime requests.
- Visual review found overlapping resource/person labels; moved resource labels above patches.
  Shared-tile markers now use display offsets while retaining authoritative grid positions.
- Final type check/build and browser smoke passed after those visual fixes. Screenshots are
  supplied as local review artifacts rather than committing private runtime captures into source.

## Repository controls

- Existing `sh scripts/ci/validate-governance.sh` and `sh scripts/ci/project-checks.sh`: pass.
- Lefthook pre-commit/commit-message gates: pass, including staged secret/large-file checks.
- `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`: no leaks found.
- `git diff --check`: clean. License blob: `b60acde446066bf5a02fed0affd4ce414e864087` unchanged.
- No trust-root files changed, no protections changed, no agent merge. GitHub required-check
  results belong to the PR's exact head; do not infer product-test CI from those statuses.

The historical project check still prints “No simulation/build exists yet.” Its assertions
cover documents/JSON/shell/license only; that output is stale. The script is a governed control
and was deliberately left unchanged under this request. Product CI integration needs separate
owner authorization. Local product checks above provide this milestone's product evidence.

## Limits of this evidence

This establishes a small original deterministic vertical slice. It does not establish LLM
cognition, advanced/episodic memory, invention, sentience, long-term survival, population scale,
indefinite storage/performance, live backup, event-only replay, safe public hosting, or behavior
under machine power loss. Graceful restart, transactional rollback and closed-file restore are
tested separately; they are not a physical power-cut test.
