# Civilization_AI
An open-source, persistent AI civilization where autonomous inhabitants live, learn, explore, and create their own history.


## The Living Valley — Prototype 0.1 & Pocket Village World

An original world engine with four inhabitants, a living Phaser pixel-art valley viewer, and SQLite saves.
Ada, Bram, Cleo and Dax gather finite resources, carry them to a shared granary, eat, rest in resident
cottages, and explore the terrain. Needs, preferences, and personally observed opportunities determine
their next action. The inhabitants use a **deterministic test agent**, not a language model.
Actual LLM cognition, advanced memory, and open-ended invention are pending. No AI Town code or assets are imported.

### The Pocket Village World

- **Authoritative Landmarks:** Five permanent village structures exist in world state:
  - **The Village Windmill & Granary:** Central landmark at `(9, 7)` with spinning 16-frame animated blades, food processing, and shared stores.
  - **Pioneer's Cottage:** Thatched resident shelter at `(5, 4)` where Ada and Bram rest and recover energy.
  - **Valley Haven Cottage:** Resident shelter at `(15, 7)` overlooking the valley gardens for Cleo and Dax.
  - **Commons & Campfire Plaza:** Central social circle at `(9, 5)` with a stone well and campfire gathering ground.
  - **Valley Workshop:** Crafting and carpentry bench at `(12, 7)` with tool racks and supply barrels.
- **Walkability & Obstacle Navigation:** The valley navigation grid distinguishes walkable biomes (grasslands, dirt footpaths, farm plots, bridge) from blocked terrain obstacles (river stream, cliff edges, building back walls). Inhabitants use bounded BFS pathfinding to route around obstacles.
- **Enhanced Shelter Rest:** Resting in or near a resident cottage grants +35 energy recovery (compared to +25 in open terrain).
- **Store Sustenance:** Hungry inhabitants without food in personal inventory navigate to the village granary to eat shared berries.
- **Living Fauna:** Pippin the gentle orange meadow slime hops peacefully in the southeastern wildflower pasture and is observed locally within perception radius.
- **Pixel-Art Viewer:** 16×16 tilesets, animated windmill blades, character movement/work animations, crisp nearest-neighbor scaling (`image-rendering: pixelated`), smooth day/night lighting transitions, and clickable inspection for people and landmarks.

### Run locally

Use Node **24.19.x** and npm. From the repository folder:

```sh
npm ci
npm run check
npm start
```

Open [the local valley](http://localhost:4317). Keep the terminal running; Ctrl+C stops it.
The viewer is read-only. Choose an inhabitant or landmark using navigation buttons or click them on the map.
The map shows world truth; the inspector separately shows that inhabitant's timestamped evidence.
No fonts, images, models or scripts are fetched from other sites at runtime.

### Time, saves and recovery

- A real second advances one deterministic world tick, whether or not a browser is connected.
- Provisional default: 600 ticks of daylight, then 600 ticks of night. These are configurable,
  not a final owner-approved ratio. Process delays catch up in batches; stopped-process downtime
  is paused and does not generate unseen offline history.
- `saves/valley.sqlite` contains world time, identities, observations, resources, ongoing plans
  and append-only action/outcome history. It is private and ignored by Git. A companion
  `*.writer.sqlite` file enforces one active world process per save; filesystem paths are canonicalized
  to prevent companion lease collisions across symlinks.
- Environment options: `WORLD_DB` (save path), `PORT` (local port), `DAYLIGHT_TICKS` and
  `NIGHT_TICKS` (positive integer ticks, at most 86400). Phase settings apply to **new saves**;
  an existing save retains its own settings. Use another save path to try other timings.
- To back up, stop the backend cleanly, copy its `.sqlite` save, then restart. To restore,
  with the backend stopped, use `WORLD_DB` to select a copy. Closed-file restore is tested.
  Live backup, migration from future schemas and event-only reconstruction are not implemented.
- Storage failure stops the runtime; it does not continue with unsaved consequences. Unknown
  database/snapshot schema versions fail rather than being silently reset.

PowerShell example for a separate, faster-cycle trial:

```powershell
$env:WORLD_DB = 'saves/trial.sqlite'
$env:DAYLIGHT_TICKS = '30'
$env:NIGHT_TICKS = '20'
npm start
```

### Boundaries and limitations

The backend binds only to IPv4 loopback, has no write API and denies unexpected Host headers
and cross-site browser requests. This is an owner-only local inspector; it is not an authenticated
multi-user or public spectator service. Do not expose or deploy it as one.

Resources do not regenerate spontaneously; strict material conservation is preserved across time.
There is no crafting, health/death system, dialogue, social-law enforcement or institution model.
Inhabitants can share a tile; obstacles are authoritatively modeled in `blocked` coordinates.
Hunger/energy are bounded need signals. No general invention or sentience is claimed.

The cognition adapter accepts personal perception and returns an action proposal. The engine
validates and commits all physical effects. It is synchronous test cognition; real inference
needs a separately approved provider/capacity decision and a bounded asynchronous integration.

### Verification

`npm run check` runs strict TypeScript checking, automated simulation/SQLite/HTTP tests and the
server/viewer build. Tests cover deterministic time, five-day resource conservation, personal
knowledge, invalid/contested proposals, restart/restore, transactional rollback, single-writer
protection, viewer independence, storage failure, landmarks, terrain walkability, shelter rest,
granary consumption, and wildlife perception. See [validation evidence](docs/prototype-validation.md).

The existing governance CI remains unchanged and checks documents/config/license; it does
**not** yet run product tests. Product-test CI integration requires a separately authorized
governance/control change. The PR reports local product evidence separately from GitHub checks.

### Asset attribution

The graphical world environment and character sprites utilize the following assets:
- **Pocket Village 16×16 Tileset** by **SebbySpoons** ([https://sebbyspoons.itch.io](https://sebbyspoons.itch.io)).
- **Character animation template** by **Erisesra** ([https://erisesra.itch.io/character-templates-pack](https://erisesra.itch.io/character-templates-pack)).

### Project records

- [Project brief and vision](PRD.md)
- [Confirmed decisions and open questions](docs/decisions.md)
- [Provisional architectural context](docs/architecture.md)
- [Working agreement](AGENTS.md) and [repository rules](REPO_RULES.md)
- [Governance template source, single-owner variant and remote plan](docs/governance-setup.md)
- [Prototype 0.1 spec](docs/specs/living-valley-0.1.md)
- [Pocket Village world spec](docs/specs/pocket-village-world.md)
- [Historical setup scope](SPEC.md) and [work log](WORKLOG.md)

Paul (`@pauldavid1974`) is the sole product/governance decision-maker. Governance changes are
proposals for his review and merge.

The project remains public and [MIT licensed](LICENSE), with the original intentional copyright
name **DraganDrop** preserved byte-for-byte (`b60acde446066bf5a02fed0affd4ce414e864087`).
