# Founders' Village — visual composition correction

## Purpose
Make the original 20×14 Living Valley readable and welcoming without changing its
authoritative simulation, persistence, inhabitant actions, or landmark coordinates.

## Source and approach
Use the bundled Pocket Village V1.1.1 sprite sheets already present under
`viewer/assets`. Crop the correct **complete** assets; do not treat forest border
tiles as flat meadow, plank floors as earth paths, or barrel rows as berry bushes.

### Verified source atlas coordinates (pixel units)
- `Ground Tiles.png`: meadow (0,64,16,16); detail (0,288,16,16);
  sandy path (16,256,16,16); farm soil (16,160,16,16);
  bridge artwork (16,384,48,80).
- `PreMade Buildings.png`: blue cottage (16,256,112,128);
  red cottage (160,256,112,128); stone mill building (16,0,112,128);
  workshop (288,272,128,112).
- `Decor.png`: oak (0,296,80,104); pine (80,336,48,64);
  well (0,240,32,48); firewood (64,256,32,32).
- `Building Props.png`: berry bushes (224,0,32,32).

## Art direction
- Open grassy common ground; sparse edge trees and intermittent flowers.
- One legible connected network of sandy footpaths linking the bridge,
  Ada/Bram cottage, well/commons, granary, workshop and Cleo/Dax cottage.
- A coherent, visible farm area beside the eastern cottage.
- Building baselines aligned with paths; recognizable complete roofs and doors.
- No always-visible resource-count cards or building-name overlays.
  Keep named inhabitant labels and click-to-inspect behavior.
- Rendered decorations are not new colliders, farming systems, or resources.
  Permanent factual world positions come from the engine.

## Verification still required
1. With Node 24.19.x: `npm ci` then `npm run check`.
2. Run the valley and inspect a desktop screenshot (800×560 canvas) and
   a mobile-width browser, including daytime and nighttime.
3. Verify all five landmarks, the four inhabitants and Pippin remain clickable.
4. Watch walking animation, movement around blocked cells, and uninterrupted
   simulation when the viewer is closed.
5. Compare a screenshot with the actual asset ZIP; reject unintended transparent
   rectangles, sliced roofs, sprite-sheet bleed and excessive overlays.

This patch is a **visual-only correction** based on static atlas inspection.
No local runtime/browser playtest has been asserted yet.
