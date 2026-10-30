# Specification — Pocket Village World & Environment Upgrade

## Outcome

Integrates the Pocket Village V1.1.1 asset pack (`viewer/assets`) into Civilization_AI and elevates
the living valley environment into an authoritative, persistent village with meaningful landmarks,
terrain navigation grid, enhanced shelter affordances, granary sustenance, wildlife fauna, and
a crisp pixel-art browser inspector.

## Authoritative World Additions

1. **Village Landmarks:**
   - `granary` (The Village Windmill & Granary at `(9, 7)`): central landmark, food processing, shared storage.
   - `cottage-west` (Pioneer's Cottage at `(5, 4)`): thatched resident cottage for Ada & Bram.
   - `cottage-east` (Valley Haven Cottage at `(15, 7)`): garden-side cottage for Cleo & Dax.
   - `commons` (Commons & Campfire Plaza at `(9, 5)`): social gathering point with freshwater well and campfire.
   - `workshop` (Valley Workshop at `(12, 7)`): carpentry and tool-crafting bench with supply barrels.
2. **Terrain Walkability & Obstacles:**
   - Authoritative `blocked` tile set in `World` model: river stream down column 0 (with walkable bridge at `(0, 6)`), cliff faces, and structural back walls.
   - Bounded BFS pathfinding in `nextStep()` ensures inhabitants route around natural obstacles and cannot plan impossible movements into deep river water or solid stone cliffs.
3. **Affordances & Cognition:**
   - **Shelter Rest:** Resting at or near a resident cottage recovers +35 energy (vs +25 in open terrain).
   - **Granary Sustenance:** Hungry inhabitants (>60 hunger) with empty personal inventory propose `eat` and walk to the shared storehouse at `home` to consume deposited berries, resolving stock starvation.
4. **Valley Wildlife:**
   - Pippin the gentle orange meadow slime hops peacefully in the southeastern pasture `(15..18, 10..12)` and is perceived locally by nearby inhabitants (radius 2) without omniscience.

## Viewer & Client Experience

1. **Pixel-Art Rendering:**
   - Crisp nearest-neighbor scaling (`image-rendering: pixelated`) on 800×560 canvas.
   - 16-frame animated spinning windmill blades (`WindmillBlade-Animation.png`, 144×112 frames).
   - Animated character movement, gathering, and resting states using Pocket Hero and NPC sheets.
   - Animated bouncing meadow slime (`slime_Orange_front-Sheet.png`).
2. **Interactive Inspection:**
   - Clickable entity selection for both inhabitants and village landmarks.
   - Visual Hunger and Energy progress meters.
   - Floating action emote bubbles (🍇, 🪵, 🍞, 💤, 🧭, 📦, 💭) above inhabitants' heads.
   - Day/night lighting transitions with warm campfire glow.
3. **Security & Independence:**
   - Static assets served locally under `/assets/*` with strict path containment and MIME detection.
   - Viewer remains strictly read-only; closing the tab does not pause the authoritative engine.

## Asset Attribution

- *Pocket Village 16×16 Tileset* by **SebbySpoons** (`https://sebbyspoons.itch.io`).
- *Character animation template* by **Erisesra** (`https://erisesra.itch.io/character-templates-pack`).
- Original MIT license with copyright `DraganDrop` preserved byte-for-byte (`b60acde446066bf5a02fed0affd4ce414e864087`).
