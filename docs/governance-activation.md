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

## Initial observation

Setup PR #1 is merged. The read-only plan detects ruleset support and proposes all five checks,
PRs, resolved conversations, linear history, blocked force pushes/deletion, zero approving
reviews and no second-account review requirements. Activation results are pending validation.
