# Architectural context — provisional

## Implemented bounded slice — Prototype 0.1

The owner's 29 October continuation authorizes the [first-slice contract](specs/living-valley-0.1.md).
The older recommendations below remain context for later work.

`world.ts` owns serializable truth and pure one-tick transitions. Each idle inhabitant gets
an opportunity; processing priority rotates to avoid a permanent first claimant. Plans store
their action, destination and remaining work. Travel and work happen on separate committed
ticks. Physical validation happens at proposal admission and again when resources change.
Social ownership is not a physical constraint; the shared-store convention is not enforced law.

`cognition.ts` receives a copied self/perception, clock/phase, known map dimensions and home.
Resource evidence is limited to personally observed patches within Manhattan radius two;
each record includes observed time and can become stale. No other minds or world object are
passed. The deterministic policy responds to need, preference, finite resources and exploration.
This is a synchronous testing adapter, not completed language-model cognition or advanced memory.

`store.ts` commits one snapshot and all tick events in one SQLite transaction, then publishes
the in-memory state. A separate SQLite write transaction holds a process lease across commits
and is released by the OS after a crash. Schema version 1 is explicit; no migrations or reset
on incompatibility. History is append-only for this bounded trial, not a replay/retention system.
Snapshots are the recovery authority; events explain actions and outcomes but do not encode
every position/need change for independent event replay. Restore testing copies a closed file.

`clock.ts` tracks monotonic elapsed time, processes at most 20 owed ticks per pump and retains
remaining debt. `server.ts` advances independently of HTTP traffic, binds loopback and provides
read-only snapshots. Backend downtime is paused; restarting resumes the committed tick/plan.
The browser polls every 500 ms and displays committed positions. Phaser owns only draw objects;
selection is a local browser concern. The DOM carries readable inspector/history and controls.
Original vector shapes and locally bundled assets require no external runtime requests.

The local projection includes world truth and all personal observations for the owner. It is
not a future public projection, authentication system or visitor interface. Provider calls,
asynchronous inference scheduling, social institutions and open-ended invention remain pending.

This is context for future bounded design work, not an implementation specification or a record
of architecture approval. It synthesizes the recovered 29 October 2026 follow-up review.

| Boundary | Proposed responsibility | Why it matters |
|---|---|---|
| Authoritative world | Validate and commit feasible actions and physical outcomes | Language alone cannot create resources or change reality. |
| Replaceable cognition | Propose actions from an inhabitant's own evidence | Model changes must not silently replace identity or grant omniscience. |
| Durable state/history | Persist identities, experiences, accepted outcomes and ongoing tasks | Restart continuity requires more than a biography. |
| Browser viewer | Inspect snapshots/events independently of world progression | Off-screen lives should not depend on the camera or an open tab. |
| Access projections | Distinguish inhabitants, private owner inspection and future spectators | Public source does not imply public private thoughts or administration. |

The recommended starting stack is TypeScript/Node.js, SQLite and Phaser, with llama.cpp/Ollama
or other replaceable inference adapters. No package versions are fixed, dependencies installed,
services provisioned or product folders created by governance setup. Benchmark a small workload
before choosing models, concurrency or population limits.

Preserve the distinction between physical feasibility and social rules. Social prohibitions
should not automatically become impossible physical actions. Invention must have testable effects
within implemented material relationships; declarations alone do not establish institutions.

Future action contracts should address retries, stale replies, atomic transfers, interrupted
tasks and branch/restore identity. Future memory contracts should distinguish world truth,
personal observation, rumors and unsupported recollections. Exact designs need their own spec.

The clock must reconcile accelerated world time with real-time interaction and finite inference
capacity. Slowdown, pause and outage behavior are open owner choices, not implied defaults.

The review proposes four adults and a minimal valley/browser inspector as a first slice, then
capacity-gated expansion. Public broadcasting, external visitors, web access and generations
are later independent gates. Do not add frameworks or services on the strength of this document.
