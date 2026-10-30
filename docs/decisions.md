# Decisions and unresolved choices

## Prototype 0.1 continuation — 29 October 2026

Paul explicitly authorized the original engine (no AI Town fork/imports), TypeScript/Node,
SQLite, a Phaser browser viewer, four inhabitants, and a bounded local implementation plus
unmerged PR. This supersedes the earlier governance-only authorization for this slice.
He also requested use of Game Studio; its Phaser, UI and playtest guidance was applied.

Implementation defaults remain provisional: one-second fixed ticks, 600 ticks each of daylight
and night, no stopped-process catch-up, finite resources and a deterministic test policy.
The adapter is provider-independent but contains no actual inference. The selected packages
are pinned in package.json/lockfile: Phaser 4.2.1 for rendering, TypeScript 7.0.2 for strict
checking, esbuild 0.28.2 for a small local build, @types/node 24.19.2 for Node's standard APIs.
Node 24.19.x supplies SQLite directly, avoiding a native database package. Node's SQLite API
is still experimental in this runtime; tested behavior is bounded to this prototype.

No owner approval is inferred for spending, providers/models, new accounts/services,
deployment/public access, governance changes or a final time ratio. Existing CI cannot be
extended without crossing the explicit control-change boundary; product checks run separately.
See the [active spec](specs/living-valley-0.1.md) for acceptance and deferred work.

Paul (`@pauldavid1974`) is the sole owner. Assistant agreement and architecture recommendations
are not owner ratification. This record preserves that distinction.

## Confirmed owner direction

| Decision | Source | Consequence |
|---|---|---|
| Public repository with MIT licensing | AI Village Project conversation and current repository | Retain visibility and original license. |
| `DraganDrop` is intentional | Owner's explicit correction in that conversation | Never replace it with a guessed legal name. |
| Establish governance v3, single owner | Owner's continuation request | Use actual V3 kit and existing solo profile; PR to `main`, no merge. |
| Persistent autonomous civilization | Existing README and conversation | Preserve independent inhabitants and lasting history, not scripted performances. |
| Start with only a few inhabitants | Owner's statement in AI Village Project | Do not begin with a full civilization or promise a final population. |
| Accelerated days/nights, real-time interactions | Same owner statement | Exact duration remains adjustable and unresolved. |

## Provisional architecture recommendations

The recovered **AI civilization architecture review.md**, dated 29 October 2026 and marked
“Review only”, recommends four adult inhabitants, a small valley, an early viewer, an authoritative
TypeScript/Node world, SQLite, Phaser, replaceable inference, resumable actions, personal evidence
and separate physical/social laws. The prior assistant supported much of this. Neither that
support nor this governance PR approves implementation or all proposed contracts.

The original Astra proposal/analysis and full original vision document were not available in
the retrieved conversation. Do not reconstruct missing content or claim these files were archived.
This repository records a bounded synthesis of the README, explicit owner statements and the
available follow-up review. It omits the review's private operational details.

## Decisions needed before dependent implementation

| Choice | Current status |
|---|---|
| Final stack and pinned package/model versions | Provisional; verify and approve in the first implementation spec. |
| Initial population and exact first-slice mechanics | Few inhabitants approved; four adults and scenario remain recommendations. |
| Day/night lengths and outage/downtime behavior | Accelerated time approved; exact ratio, slowdowns and resume policy open. |
| Maximum paid budget and paid fallback | No spending authorized; explicit budget/provider decision needed first. |
| Historical retention and recovery commitments | Proposed contracts need owner selection and restore evidence. |
| Private thought inspection and public projection | Access and broadcast policy unresolved; keep runtime records out of public Git. |
| Hosting, visitors, resident web access, generations, streaming | Future separate decisions; none authorized by setup. |
| Applying GitHub protection settings | Paul authorized proceeding after PR #1 merged; active settings independently verified in `docs/governance-activation.md`. |

The prior assistant's 10-minute day and 10-minute night is an example, not an approved constant.
Population and performance estimates in the review are planning hypotheses, not measurements.
