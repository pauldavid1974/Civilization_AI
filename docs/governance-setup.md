# Governance source, adaptations and remote plan

## Actual source and naming ambiguity

The configured `REPO_GOVERNANCE_HOME` points to the owner's existing **Repo Governance V3** kit.
Its clean source commit is [`a975cec`](https://github.com/Paul-Osborn/repo-governance-templates/commit/a975cec88ee8c39d93b4f41538dcef711a610896),
generation **3.0.0**. The Windows `new-governed-repo.ps1` bootstrap was used on a setup branch.
This is not a generic replacement.

There is no separate shipped package titled exactly “Repo Governance Template v3 — Single Owner”.
The kit ships a strict default and a documented solo-maintainer opt-out. The established
single-owner adaptation is evidenced by the owner's earlier
[Fusion Design Assistant profile](https://github.com/Paul-Osborn/fusion-design-assistant/blob/6259fd2f340c192a63e5026c8d287ef1ecbc9b6e/.github/governance-profile.json)
at clean commit `6259fd2f340c192a63e5026c8d287ef1ecbc9b6e`, independently fetched from GitHub.
That profile and the kit's [security model](https://github.com/Paul-Osborn/repo-governance-templates/blob/a975cec88ee8c39d93b4f41538dcef711a610896/docs/security-model.md) agree on the opt-out.
This installation follows those existing values. Paul can review this interpretation in the PR.

## Faithful controls and deliberate adaptations

| Files | Treatment |
|---|---|
| `.governance-version`, `.governance/policy.json`, attestation example | V3 bootstrap controls retained. Example attestation is not evidence of an actual review. |
| `lefthook.yml`, `scripts/hooks/*`, classifier/review/governance validators | Shipped V3 controls retained; branch, secret, size, lockfile and commit gates. |
| `.github/workflows/governance.yml`, `review-gate.yml` | Shipped least-privilege, commit-pinned workflows retained. Review gate never executes PR code. |
| `.github/governance-profile.json` | Name/owner adapted; zero approvals and four review switches off per existing single-owner profile. Other baseline fields retained. |
| `.github/CODEOWNERS` | Same canonical trust-root paths, all owned by `@pauldavid1974`; comments describe solo ownership accurately. |
| `AGENTS.md`, `REPO_RULES.md` | Core policy retained; project commands, sole-owner authority, public-data boundaries and actual installed profile paths filled in. Generic second-account language qualified for the solo variant. |
| `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/agents.mdc` | Thin V3 adapters retained; no parallel authority rules. |
| `.gitattributes`, `.gitleaks.toml` | Shipped controls; project name substituted in scanner title. |
| `.gitignore` | Original Node rules preserved; relevant kit secret/local-state patterns and private save/model exclusions appended. |
| `scripts/ci/project-checks.sh` | Placeholder replaced with actual governance-stage document, JSON, shell and original-license checks. No fake simulation tests/build. |
| `PRD.md`, `SPEC.md`, `WORKLOG.md`, `SPEC.template.md` | Established brief/spec/worklog structure; filled project docs plus reusable bounded-spec template. |
| `docs/decisions.md`, `docs/architecture.md`, `README.md` | Vision/context and navigation; proposals separated from confirmed choices. Original README vision sentence retained. |

The earlier Fusion profile has a project-specific `Governance / windows-verification` required
status; it is not copied because this bootstrap workflow does not define that job. Requiring
a nonexistent job would block every PR. The five baseline status names match the shipped jobs
and exact-head status. Native Windows local execution is reported separately from Linux CI.

The public source kit is a reusable template source, not a configured mirror of Civilization_AI.
No source-template private remote, machine name, local path or operational address is published.

## Proposed single-owner remote state

- Public visibility, default branch `main`, original MIT license unchanged.
- Paul is sole owner and sole governance ratifier; AI agents cannot approve or merge governance.
- Require PRs, resolved conversations, linear history and all five profile status checks.
- Block force pushes and default-branch deletion.
- Zero GitHub approving reviews; independent, code-owner, last-push and extra unattributed-change
  approvals are false. Keep stale-review dismissal enabled. No second account or reviewer App needed.
- Actions default token permission read; Actions cannot approve PRs.
- Retain visible `governance/exact-head-review`; with the base-branch solo profile it reports the
  opt-out rather than independent review. A green status is not human governance approval.

## Observed state and bootstrap limitation

Initial inspection found only `README.md`, `LICENSE` and the Node `.gitignore`; `main` was
unprotected and the ruleset collection was empty. Committed desired settings do not activate
GitHub protections. This setup proposes files and a PR only; it does not apply remote policy.

The first PR's base has no policy/profile/review-gate workflow. Therefore the protected-base
review status cannot run for this initial setup. Paul must inspect and merge it himself.
After merge, verify the custom status on a later PR before making it required. Local review
classification against the pre-governance base correctly fails closed; do not fake an approval.

To inspect a concrete remote plan using the existing kit (PowerShell; no mutation):

```powershell
& "$env:REPO_GOVERNANCE_HOME\github-governance.ps1" `
  -Repo pauldavid1974/Civilization_AI `
  -Profile (Join-Path (Get-Location) '.github/governance-profile.json')
```

Only after Paul reviews and explicitly authorizes that plan may a separate step apply it and
independently verify the resulting settings. Do not silently use the stricter kit default profile.

## Product source limitations

The README, explicit owner statements in **AI Village Project**, and its recovered follow-up
architecture review inform the brief. The original Astra document and full original vision
were unavailable. No missing document is represented as approved or archived, and the raw
follow-up review is not published because it contains private operational context.
