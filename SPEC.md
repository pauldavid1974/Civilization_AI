# Spec — Governance v3 single-owner setup

## Outcome

A traceable installation of Paul's actual V3 governance with established solo-owner settings,
on `chore/setup-governance-v3-single-owner`, submitted as an unmerged PR to `main`.

## In scope

- Inspect the repository, configured governance kit and an earlier solo-owner installation.
- Run the real bootstrap; adapt policy/ownership, brief, architecture context and checks.
- Preserve the original vision and license; record sources, ambiguities and approval limits.
- Validate, commit governance files and open a PR for Paul.

## Out of scope

- Simulation/viewer code, dependencies/models, benchmarks, costs, deployment and remote-policy apply.
- Merging the setup PR or treating advisory architecture as approved implementation.

## Constraints and prior decisions

Public GitHub repository, MIT license byte-for-byte with `DraganDrop`, sole owner
`@pauldavid1974`, PR workflow, no governance self-approval or agent merge. Use the source kit
at `a975cec88ee8c39d93b4f41538dcef711a610896` and the existing solo variant described in
`docs/governance-setup.md`. Do not import private infrastructure details.

## Plan (files & steps)

1. Bootstrap V3 policy, hooks, workflows, metadata and adapters on the setup branch.
2. Fill `AGENTS.md`, `REPO_RULES.md`, `.github/governance-profile.json`, CODEOWNERS and checks.
3. Fill `PRD.md`, context/decisions/provenance docs, `WORKLOG.md` and README navigation.
4. Verify structure, source fidelity, license, secrets, shell/JSON and appropriate acceptance checks.
5. Commit, push the branch, open an unmerged PR and inspect its GitHub checks.

## How we'll verify it works

- `sh scripts/ci/validate-governance.sh` and `sh scripts/ci/project-checks.sh` pass.
- Local Lefthook pre-commit and commit-msg gates pass; no bypasses.
- Compare unchanged control files with source template normalized hashes.
- `LICENSE` Git blob remains `b60acde446066bf5a02fed0affd4ce414e864087`.
- Original README vision sentence and original Node ignore rules remain.
- Appropriate V3 acceptance suite passes on native Windows; Linux checks are reported by CI.
- PR targets `main`, remains open/unmerged, and contains no simulation code.

## Open questions

No governance owner choice blocks this proposal. The template naming ambiguity, first-PR
review-gate limitation and unapplied hosting protection are explicit in the provenance doc.
Product choices are deferred in `docs/decisions.md`; setup does not approve them.
