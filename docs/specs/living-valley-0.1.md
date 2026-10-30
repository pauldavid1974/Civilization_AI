# The Living Valley — Prototype 0.1

## Outcome and authority

Four inhabitants pursue separate material goals in an original TypeScript/Node world, with a
Phaser observer and SQLite continuity. Paul's 29 October 2026 continuation request authorizes
this bounded implementation and its unmerged PR. No AI Town source or assets. This is the
active product spec; root SPEC.md preserves the completed governance setup scope.

## Scope and files

- `src/world.ts`, `src/cognition.ts`: deterministic clock, four adults, personal observations,
  separate goals, resumable travel/gather/deposit/eat/rest/explore plans.
- `src/store.ts`: SQLite snapshot, ordered action/outcome events, atomic tick commits.
- `src/server.ts`: one local backend runner and read-only HTTP snapshots.
- `viewer/`: Phaser valley, keyboard-accessible inhabitant inspector and material/history views.
- `test/`, package/build files, README and design/work-log addenda: verification and handoff.

Excluded: governance/control changes, AI Town imports, providers/models, spending, new services,
deployment/public access, visitors, dialogue, institutions, general invention and sentience.
Deterministic agents exercise a cognition boundary; LLM/advanced memory remain pending.

## Provisional contracts

- One tick per real second using a monotonic accumulator; delayed ticks catch up in bounded
  batches without being dropped. Daylight/night default to 600 ticks each, configurable and
  persisted. Browser closure has no effect. Backend downtime does not advance world time.
- A single writer owns a save; refuse a second runner. Fail closed on storage failure.
  Bind IPv4 loopback, read-only API, Host allowlist, no CORS or runtime external requests.
- Fixed small grid, finite berry/wood patches, shared store, four distinct preferences.
  Local observations within two tiles; cognition sees only personal evidence and self state.
  Evidence can become stale; only the engine resolves physical outcomes.
- Each idle inhabitant gets a decision opportunity each tick. Engine validates travel,
  adjacency, quantities, capacities and durations. Resources move patch -> inventory -> store
  or consumed. Shared storage is a social convention, not magical physical ownership.
- A personally observed depleted patch changes later resource choice. No scripted biography
  or event schedule. Needs and opportunities drive the deterministic policy.
- Persist identities, needs, plans/progress, inventories, observations, clock/config, and events.
  Commit snapshot and tick events atomically; failed commits publish no state or duplicate effects.
- Schema v1; fail on unknown schema. Append history for this prototype; no event-only replay
  or indefinite-storage guarantees. Restore test copies a closed SQLite file to a fresh path.
- Save files stay ignored/private. The local owner inspector can see observations; this does
  not define future spectator privileges. No social law enforcement is implemented.

## Acceptance criteria (written before code)

1. `npm ci` and `npm run check` pass: strict types, Node tests, server/viewer build.
2. Identical seed/config yields identical state/events after 1,200 ticks. Test phase boundaries
   and unequal durations. Four inhabitants get opportunities and make material progress.
3. Multi-day accounting: initial resources = patches + carried + stored + consumed;
   capacities/quantities never invalid. Impossible/malformed/contested actions cannot create
   resources or teleport. Rejections are recorded.
4. Cognition cannot see distant resources or other minds. Witnessing depletion changes later
   choice. Social conventions cannot make an otherwise feasible physical action impossible.
5. Restart mid-plan exactly matches uninterrupted state/events/time. Closed-file restore
   matches saved state; unknown schema and second writer fail clearly.
6. HTTP tests show ticks progress with zero clients and after disconnect, updating within two
   seconds. Invalid Host/method/path denied. A storage failure stops rather than running unsaved.
7. Browser smoke: four visible inhabitants, changing time/actions, selectable details,
   mobile-readable layout, connection-error display, no console errors. Report unavailable QA.
8. Existing governance checks/hooks, secret and diff scans pass; LICENSE blob remains
   `b60acde446066bf5a02fed0affd4ce414e864087`. PR stays unmerged and main unchanged.

## Implementation sequence

Commit this spec first. Build/test the engine and persistence next, then local HTTP/viewer and
integration tests; finish with documentation and exact validation evidence in an open PR.
No unresolved owner choice blocks these provisional defaults.

## Check integration limit

Existing CI project checks cover documents/config/license only. Its script is a governed
control file, outside this request's authorization. Run product checks separately and report
that remote product-test enforcement needs a separately authorized control change.

## Viewer design

Fixed valley overview beside a small DOM inspector. Pine `#233f38`, meadow `#77985a`, river
`#619da6`, stone `#b6b9aa`, cloud `#edf3ef`, berry `#b35c78`; Georgia headings and system sans
text, left aligned. Original geometric terrain and named/color-coded inhabitants, restrained
movement, keyboard selection, visible focus and mobile stacking. The valley is the main view.
