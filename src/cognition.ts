import { carried, distance, type Action, type Inhabitant, type Observation, type Position, type Landmark } from './world.ts';

export type Perception = {
  self: Inhabitant;
  observations: Observation[];
  tick: number;
  phase: 'daylight' | 'night';
  width: number;
  height: number;
  home: Position;
  landmarks: Landmark[];
  nearbyInhabitants: { id: string; name: string; x: number; y: number }[];
  nearbyWildlife: { id: string; name: string; x: number; y: number }[];
};
// No provider SDK, credentials or full-world handle crosses this boundary.
// shortcut: synchronous test policy only; use a bounded async mailbox before adding real inference.
export interface Cognition { name: string; propose(perception: Perception): unknown }

export const deterministicAgent: Cognition = {
  name: 'deterministic-test-agent',
  propose(p): Action {
    const a = p.self;
    if (a.hunger > 45 && a.inventory.berries > 0) return { kind: 'eat' };
    // Inhabitant knows the village granary / shared store exists at home and seeks nourishment there
    if (a.hunger > 60) return { kind: 'eat' };
    if (a.energy < 30 || (p.phase === 'night' && a.energy < 85)) return { kind: 'rest' };
    if (carried(a) >= 4) return { kind: 'deposit' };
    const wanted = a.hunger > 45 ? 'berries' : a.preference;
    const patches = p.observations.filter(k => k.quantity > 0)
      .sort((x, y) => Number(y.resource === wanted) - Number(x.resource === wanted)
        || distance(a, x) - distance(a, y) || x.id.localeCompare(y.id));
    if (patches.length) return { kind: 'gather', target: patches[0].id };
    if (carried(a) > 0) return { kind: 'deposit' };
    // Nearest unvisited tile, with a stable personal tie-break, produces exploration without a story script.
    const cells: Position[] = [];
    for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) {
      if (!a.visited.includes(`${x},${y}`)) cells.push({ x, y });
    }
    const direction = a.id === 'ada' || a.id === 'dax' ? 1 : -1;
    cells.sort((x, y) => distance(a, x) - distance(a, y) || direction * (x.x - y.x || x.y - y.y));
    return cells.length ? { kind: 'explore', target: cells[0] } : { kind: 'rest' };
  },
};
