# Repository rules — Civilization_AI

`AGENTS.md` is the concise canonical policy. This document explains the enforcement model,
edge cases, recovery, and platform details. It does not grant an agent additional authority.

## 1. Repository shape and sources of truth

The authoritative repository is [pauldavid1974/Civilization_AI](https://github.com/pauldavid1974/Civilization_AI),
public with the original MIT `LICENSE` and intentional copyright name `DraganDrop`.
`PRD.md` records the vision, `docs/decisions.md` separates owner choices from proposals, and
`docs/architecture.md` records provisional boundaries. No product directories or runtime are
created by governance setup. The bounded setup plan is `SPEC.md`.

### Single-owner profile

Paul (`@pauldavid1974`) is the only product/governance owner. This installation uses the existing
V3 solo-maintainer variant, not a new governance framework. The committed profile requires zero
GitHub approving reviews and disables independent, code-owner, last-push and extra unattributed-
change approvals. CODEOWNERS still identifies Paul for every canonical trust-root path.
Agents may propose and test governance changes and open PRs; only Paul may ratify or merge them.
Ordinary implementation autonomy begins only after he approves the outcome. Product scope,
major architecture, cost, privacy/security, credentials, deployment and authority changes remain
his decisions. Governance approval is not authorization to implement the simulation.

Source versions and exact adaptations are in `docs/governance-setup.md`.

The root `AGENTS.md` controls security, governance, and authority. A nested `AGENTS.md` may
add directory-specific build or style instructions, but it may not weaken a root requirement.
The nearest applicable file wins only when instructions do not conflict with the root trust
boundary.

Agent entry points are adapters:

| Agent | Entry point | Role |
|---|---|---|
| Codex | `AGENTS.md` | Native canonical policy |
| Claude Code | `CLAUDE.md` | Thin import/pointer plus optional ergonomics |
| Gemini / Antigravity | `GEMINI.md` | Thin pointer |
| Cursor | `.cursor/rules/agents.mdc` | Thin pointer |

Do not duplicate policy text into adapters. Agent instructions are advisory; Git hooks, CI,
hosting rules, and human approval are separate controls.

## 2. Four control layers

| Layer | Examples | Enforces | Trust limit |
|---|---|---|---|
| Advisory policy | `AGENTS.md`, this file | Expected behavior and authority | A process can ignore prose |
| Local enforcement | Lefthook, Gitleaks, `scripts/hooks/` | Default-branch commits, secrets, large files, commit format, lockfile warning | A user controlling the workstation can bypass local hooks |
| Remote enforcement | CI and GitHub rulesets/branch protection | Re-runs checks, exact-state review, merge restrictions, force-push/deletion blocks | Availability varies by GitHub plan and repository visibility |
| Human-only | Governance ratification and exceptional risk decisions | Changes to the trust root and agent authority | Requires the named owner; never delegated to an implementation agent |

Controls should live at the lowest practical layer. Agent-specific hooks may make mistakes
harder, but no critical invariant depends only on Claude, Codex, or another agent remembering
instructions.

## 3. Git workflow

- Work on a branch named `<type>/<short-description>`; never commit or push directly to the
  protected default branch.
- Keep one cohesive deliverable per branch. Include required tests, documentation, and small
  supporting refactors; defer unrelated work.
- Use Conventional Commits. The `commit-msg` hook checks the subject.
- Never force-push a protected branch or use an administrative merge bypass.
- Push finished work to the authoritative remote and all declared mirrors. If histories
  diverge, stop rather than discarding either side.
- Open a PR containing the outcome, reason, exact test evidence, migrations, and limitations.
  Merge only when required checks and review are current and green.

### Authority ceiling

The paths listed in `.governance/policy.json` are the trust root. They include canonical policy,
local hooks, scanner configuration, governance metadata/updaters, CI workflows, agent permission
configuration, remote-policy configuration, and review-verification logic.

An agent may edit those files on a branch and open a PR. It may not approve or merge that PR.
The desired ruleset requires PRs and checks; optional agent hooks add defense in depth.
In this single-owner installation, CODEOWNERS is an ownership map, not a native approving-review
requirement: Paul cannot approve his own GitHub PR. He manually inspects governance changes and
performs their merge. No second account is required and there is no automatic ratification path.
Committed policy and CODEOWNERS alone do not enforce this human-only rule on GitHub.

## 4. Local gates

Install with `lefthook install`. The default hooks are POSIX shell with LF line endings so they
run on Linux and in Git for Windows:

- `no-commit-on-main.sh` refuses commits on the protected default branch, including an unborn
  first commit.
- `gitleaks protect --staged` refuses staged credentials and redacts findings.
- `check-large-files.sh` refuses newly added files over 2048 KiB unless the repository sets a
  deliberate `governance.maxFileKB` value.
- `check-lockfiles.sh` warns when a lockfile changes without its manifest. It does not block
  legitimate package-manager regeneration.
- `check-commit-message.sh` enforces the supported Conventional Commit subject form.
- configured project lint/test commands run where the project adds them.

Do not use `--no-verify` to escape a failure. Local hooks are not the only trust boundary, so CI
re-runs critical checks after push.

## 5. Secrets, generated files, and large files

Never commit a credential, private key, access token, secret-bearing log, prompt transcript, or
real secret used as a test fixture. Commit an obviously fake example instead. If a real secret
enters history, rotate it first, then remove it from history; removal does not unexpose it.

Ignore dependencies, build output, caches, editor state, local configuration, and downloadable
data. Use Git LFS or external storage for intentionally versioned large assets. Never hand-edit a
generated lockfile: update its manifest and invoke the package manager.

## 6. Independent review

The reusable default requires a reviewer other than the implementation agent; this repository
uses its documented single-owner opt-out described below.
Prose-only changes are exempt only when `scripts/ci/classify-change.sh` deterministically finds
no behavior-changing or governance path.

On GitHub, the default mode requires an `APPROVED` review whose `commit_id` equals the current PR
head SHA and whose reviewer is not the PR author. Any later behavior-changing commit changes HEAD
and invalidates the check. Branch/ruleset settings should dismiss stale approvals and require the
last push to be approved by someone else. CI re-checks this immediately before merge.

A repository may opt out entirely by setting `review.requireIndependentReview` to `false` in
`.github/governance-profile.json`. This is meant for solo maintainers or AI-authored work with no second
human available; the reusable template ships this `true` by default. The workflow reads the flag
from the base branch's committed profile, never the pull request's own copy, so a PR cannot flip
it to escape review on itself. The `governance/exact-head-review` status still runs and posts on
every PR while the flag is off, but always succeeds, leaving a visible, auditable record of the
choice rather than silently removing the check.

For hosts without review APIs, `.governance/review-attestation.json` may record a deterministic
code digest. `scripts/ci/verify-review.sh` recomputes it. This proves which bytes were reviewed,
but it is not cryptographically independent: anyone able to write the branch can fabricate the
file. Treat it as evidence, not an external trust boundary. [Upstream security model](https://github.com/Paul-Osborn/repo-governance-templates/blob/a975cec88ee8c39d93b4f41538dcef711a610896/docs/security-model.md) explains the limitations.

## 7. Remote enforcement

`.github/governance-profile.json` is the desired GitHub state. The upstream kit's
`github-governance.ps1` / `.sh` inspect capabilities and print a plan by default. Supply this
repository's profile explicitly; the kit's own default profile is stricter. Mutation requires
Paul's explicit approval after he reviews a concrete plan.

The proposed single-owner ruleset requires PRs, the configured checks, resolved conversations
and linear history, and blocks force pushes and deletion. It requires zero approving reviews;
code-owner, last-push and extra unattributed-change approvals are off. The independent-review
status remains visible but accepts the opt-out only from the committed base-branch profile.
Rulesets and some features vary by plan; unsupported capabilities must be reported.

At setup, `main` is unprotected and the repository has no rulesets. No hosting settings are
changed by this PR. The base branch does not yet have the review-gate workflow or policy, so
the first setup PR cannot claim that custom status is active. Paul reviews this bootstrap PR;
after merge, verify the status on a subsequent PR before requiring it through remote settings.

The `governance/exact-head-review` status can optionally be produced by a dedicated, least-
privilege GitHub App instead of the shared Actions identity every other check uses, so a required
check can trust that one producer specifically. This needs a human owner to register the App,
generate its private key, and install it — an agent never performs that setup. See the [upstream security model](https://github.com/Paul-Osborn/repo-governance-templates/blob/a975cec88ee8c39d93b4f41538dcef711a610896/docs/security-model.md).

CI uses read-only permissions unless a job needs more. Third-party actions are pinned to immutable
commits. zizmor statically checks workflow files without requiring GitHub Advanced Security.

## 8. Verification and durable memory

During work, run the smallest check likely to catch the current mistake. Before review and PR,
run the complete relevant suite plus migration/acceptance checks for governance work. Report the
actual command and result.

Update `WORKLOG.md` when work materially advances or leaves durable context. Do not require a log
entry for a typo or add one merely to satisfy automation.

## 9. Installation and updates

Linux/Omarchy:

```sh
"$REPO_GOVERNANCE_HOME/update-governance.sh" --target . --dry-run
```

Windows PowerShell 5.1+:

```powershell
& "$env:REPO_GOVERNANCE_HOME\update-governance.ps1" -Target . -DryRun
```

Updaters only replace manifest-owned files that match a known shipped hash. Customized files are
reported and preserved. Replaced files are backed up, dry-run is non-mutating, a second run is a
no-op, and project source is outside the update set. Resolve conflicts deliberately; never use a
force option to erase project customizations.

## 10. Recovery

- Failed update: restore the timestamped `.governance-backup/` copy or use the updater's rollback.
- Diverged mirrors: identify the authoritative history and obtain a human decision; do not force.
- False-positive secret: narrow `.gitleaks.toml` with an exact path/regex and submit that governance
  change for human ratification.
- Incorrect gate: propose a fix with a reproducing test. Do not bypass it to continue other work.
- Missing GitHub capability: retain local/CI checks, apply classic branch protection where possible,
  and document the remaining human-only merge step.

These rules protect repository integrity, explicit review policy, and the ceiling on agent authority.
