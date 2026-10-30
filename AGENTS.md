# Working agreement — Civilization_AI

This is the canonical repository policy for people and coding agents. Nested `AGENTS.md`
files may add instructions for their directory, but may not weaken this file. When rules
conflict, the closest file controls ordinary implementation detail and this root file controls
security, governance, and authority.

## Project and commands

Civilization_AI is a public MIT-licensed experiment in a persistent autonomous civilization.
Read `PRD.md`, `docs/decisions.md`, and `docs/architecture.md` before proposing implementation.
This initial setup contains governance and planning only; there is no runnable simulation.

- Install local hooks: `lefthook install` (Git for Windows provides `sh`; also install Gitleaks and jq).
- Validate governance: `sh scripts/ci/validate-governance.sh`
- Check project documents, configuration and shell syntax: `sh scripts/ci/project-checks.sh`
- Check a proposed diff: `git diff --check`
- Runtime, simulation tests and product build: not available until a separately approved implementation.

Only list commands and constraints that are not obvious from the repository.

## Autonomy and scope

Once the owner approves the outcome, make ordinary implementation decisions and execute them.
For meaningful work, plan once: name the files likely to change, what is out of scope, and the
evidence that will prove completion. Use `SPEC.md` for substantial work; skip that ceremony for
trivial changes.

Stop for a decision that materially changes product scope, cost, privacy/security boundaries,
credentials, production/shared infrastructure, a major architecture or dependency, destructive
or hard-to-reverse state, or these rules and the limits of your authority.

One branch carries one cohesive, shippable deliverable. Include its tests and necessary docs;
defer unrelated cleanup.

## Git and pull requests

1. Branch before changing files; never commit or push directly to the protected default branch.
2. Use Conventional Commits with an imperative subject of at most 72 characters. Keep logical
   commits reviewable and explain why in the body when it is not obvious.
3. Run the smallest relevant checks while working and the complete relevant suite before review.
4. Push completed work to the authoritative remote and any configured mirrors without force.
5. Obtain independent review for normal and high-risk work. A deterministically prose-only change
   is exempt, and so is any repository that sets `review.requireIndependentReview` to `false` in
   `.github/governance-profile.json` — an explicit owner choice for solo or AI-authored work with no
   second human available; the reusable template defaults this to `true`. Review must cover the
   exact code state submitted.
6. Open a pull request with the outcome, test evidence, migration notes, and limitations. Never
   merge red. Never bypass required checks.
7. A change to a governance/control file is a proposal only. An agent may author and submit it,
   but only the human owner may ratify or merge it.

No remote means commit locally and report what could not be pushed or reviewed remotely.

## Engineering rules

Build the smallest complete solution: prefer no change, an existing capability, the platform or
standard library, an installed dependency, then small new code. Add a dependency only with a
one-line reason. Do not trade away correctness, security, accessibility, maintainability, or
explicit requirements for a smaller diff.

- Never put secrets in code, config, history, logs, prompts, test fixtures, or commit messages.
- Never hand-edit generated lockfiles; change the manifest and regenerate them.
- Do not disable or route around hooks, scanners, CI, reviews, or hosting protections.
- Do not rewrite shared history, force-push protected branches, or use administrative bypasses.
- Keep one authoritative source of truth; mirrors must not silently diverge.
- Paul (`@pauldavid1974`) is the sole product and governance decision-maker. AI agents are
  contributors, not owners or approvers. Governance PRs require his review and merge.
- Use the established single-owner V3 profile: zero required GitHub approving reviews;
  independent, code-owner, last-push and extra unattributed-change approvals are disabled.
  This removes second-account requirements; it never grants agents governance merge authority.
- The authoritative remote is `https://github.com/pauldavid1974/Civilization_AI`; no mirror is configured.
- Keep the repository public and preserve `LICENSE` byte-for-byte, including `DraganDrop`.
- Preserve inhabitants' autonomy and persistent consequences. Do not substitute scripted life
  stories or entertainment targets for the project vision.
- Architecture recommendations are provisional until Paul approves the relevant bounded spec.
  Governance setup does not authorize simulation code, dependency/model installation, spending,
  deployment, resident web access, visitors, or broadcasting.
- Keep credentials, private infrastructure details, world saves, models and private mind records
  out of this public repository. Public source does not authorize public access to a running world.
- Remote-policy tools remain plan-only until Paul reviews and explicitly authorizes applying a plan.

## Review and evidence

When independent review is required by the configured profile, stabilize the branch before it.
The implementer cannot count a self-review as independent. Any behavior-changing change after
review invalidates it; deterministically
classified prose-only follow-ups may remain exempt. Record the reviewer, verdict, and exact state
reviewed using the repository's configured attestation method.

Completion requires evidence: the command and result, test output, or another observable proof.
Update `WORKLOG.md` only when work materially advances or leaves context another session needs;
do not add filler or make a commit solely for the log.

## Control boundaries

- `AGENTS.md` guides behavior; it is not a security boundary.
- Lefthook and `scripts/hooks/` provide local enforcement for every tool and manual commit.
- `.github/workflows/` and the hosting policy provide independent remote enforcement.
- Agent adapters may add convenience or defense in depth, but do not define core authority.
- If a required control fails or its result cannot be determined safely, stop and report it.

Details, recovery procedures, the control matrix, and platform notes live in `REPO_RULES.md` and
`docs/`. Governance generation: `.governance-version`.
