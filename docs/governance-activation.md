# GitHub governance activation

## Scope and authorization

After merging setup PR #1, Paul authorized proceeding with the documented GitHub protection
plan. This follow-up validates the base-branch review gate before requiring its status, then
applies the existing V3 tool with this repository's single-owner profile.

No simulation implementation, dependency installation, spending or deployment is included.
Governance documentation remains a proposal for Paul to merge.

## Activation sequence

1. Verify the merged profile and run the existing kit in read-only plan mode.
2. Open this follow-up PR with a governance-path change. Confirm that the base-branch workflow
   publishes `governance/exact-head-review` for its exact head using the single-owner opt-out.
3. Apply the reviewed plan with the existing kit and explicit repository profile.
4. Independently read back the ruleset, effective branch rules and Actions permissions.
5. Record observed results here and leave this governance PR open for Paul.

## Verified result — 29 October 2026

Setup PR #1 is merged. The existing V3 `github-governance.ps1` ran first in read-only plan mode,
then with `-Apply` and this repository's explicit `.github/governance-profile.json`.

Independent API reads verified active ruleset
[`repo-governance-v3`, ID 26171850](https://github.com/pauldavid1974/Civilization_AI/rules/26171850):

- Applies to the default branch only, with no bypass actors, including no administrator bypass.
- Requires a pull request, resolved review conversations and current passing checks.
- Requires linear history; permitted merge methods are squash or rebase.
- Blocks force pushes and default-branch deletion.
- Requires exactly the five profile statuses, all bound to GitHub Actions integration 15368:
  `Governance / invariants`, `Governance / secrets`, `Governance / actions-security`,
  `Project / checks`, and `governance/exact-head-review`.
- Requires zero approving reviews; code-owner, last-push and extra unattributed-change
  approval requirements are false. Stale-review dismissal remains enabled.
- Actions default token permissions are read-only and Actions cannot approve pull requests.
- Repository remains public, default branch `main`; original `LICENSE` blob remains
  `b60acde446066bf5a02fed0affd4ce414e864087`, including `DraganDrop`.

Before activation, the [review-gate run](https://github.com/pauldavid1974/Civilization_AI/actions/runs/40978563294)
on follow-up PR #2 published success on exact head `cc1b15f85cfe764f613ae10812f535ae3dd720f1`,
with description “Independent review not required by repository policy”. This governance-path
change exercises the solo opt-out rather than the prose-only exemption.

The effective rules for `main` were also read back separately. No destructive force-push or
branch-deletion attempt was made as a test. Final-head workflow results are recorded on PR #2.
Green automation does not ratify governance: Paul alone reviews and merges this documentation PR.
