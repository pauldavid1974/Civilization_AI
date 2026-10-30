#!/bin/sh
# Governance-stage checks; replace/extend with real product checks when implementation starts.
set -eu
cd "$(git rev-parse --show-toplevel)"
if command -v jq >/dev/null 2>&1; then jq() { command jq -b "$@"; }; fi
command -v jq >/dev/null 2>&1 || { echo "jq is required." >&2; exit 2; }

git diff --check
for path in README.md LICENSE PRD.md SPEC.md WORKLOG.md docs/decisions.md docs/architecture.md docs/governance-setup.md; do
  [ -s "$path" ] || { echo "Missing or empty project document: $path" >&2; exit 1; }
done
for path in scripts/hooks/*.sh scripts/ci/*.sh; do
  sh -n "$path"
done
for path in .governance/*.json .github/governance-profile.json; do
  jq empty "$path"
done
expected_license=b60acde446066bf5a02fed0affd4ce414e864087
[ "$(git hash-object --path=LICENSE LICENSE)" = "$expected_license" ] || {
  echo "Original MIT license changed; preserve DraganDrop and the exact original text." >&2
  exit 1
}
echo "Project documents, JSON, shell syntax and original MIT license verified. No simulation/build exists yet."
