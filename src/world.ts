import { deterministicAgent, type Cognition } from './cognition.ts';

export type Resource = 'berries' | 'wood';
export type Position = { x: number; y: number };
export type Stock = Record<Resource, number>;
export type Patch = Position & { id: string; resource: Resource; quantity: number; maxQuantity?: number };
export type Observation = Patch & { observedAt: number };
export type LandmarkKind = 'shelter' | 'granary' | 'commons' | 'workshop' | 'well';
export type Landmark = Position & {
  id: string;
  name: string;
  kind: LandmarkKind;
  description: string;
};
export type Critter = Position & {
  id: string;
  name: string;
  kind: 'slime';
  facing: 'front' | 'side' | 'back';
};
export type Action = { kind: 'gather'; target: string } | { kind: 'deposit' } | { kind: 'eat' } | { kind: 'rest' }
  | { kind: 'explore'; target: Position };
export type Plan = { action: Action; destination: Position; remaining: number };
export type Inhabitant = Position & {
  id: string; name: string; color: string; preference: Resource;
  inventory: Stock; hunger: number; energy: number; plan: Plan | null;
  knowledge: Observation[]; visited: string[]; opportunities: number; completed: number;
};
export type Config = { daylightTicks: number; nightTicks: number };
export type World = {
  schemaVersion: 1; tick: number; config: Config; width: number; height: number;
  home: Position; patches: Patch[]; landmarks: Landmark[]; inhabitants: Inhabitant[];
  stock: Stock; consumed: Stock; critters: Critter[]; blocked: string[];
};
export type WorldEvent = {
  tick: number; actor: string; kind: 'planned' | 'completed' | 'rejected';
  action: Action | null; detail: string;
};

export const distance = (a: Position, b: Position) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const phase = (w: World) => w.tick % (w.config.daylightTicks + w.config.nightTicks)
  < w.config.daylightTicks ? 'daylight' : 'night';
export const day = (w: World) => Math.floor(w.tick / (w.config.daylightTicks + w.config.nightTicks)) + 1;
export const carried = (a: Inhabitant) => a.inventory.berries + a.inventory.wood;

export function validateConfig(config: Config): void {
  for (const value of [config.daylightTicks, config.nightTicks]) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 86400) {
      throw new Error('Phase durations must be integer ticks between 1 and 86400.');
    }
  }
}

// Bounded BFS pathfinding over walkable navigation grid
export function nextStep(
  from: Position,
  to: Position,
  width: number,
  height: number,
  blocked: Set<string>
): Position {
  if (from.x === to.x && from.y === to.y) return from;
  if (distance(from, to) === 1 && !blocked.has(`${to.x},${to.y}`)) return to;

  const queue: Position[] = [{ x: from.x, y: from.y }];
  const visited = new Map<string, string | null>();
  const startKey = `${from.x},${from.y}`;
  visited.set(startKey, null);

  // Deterministic neighbor order: Up, Right, Down, Left
  const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

  let reached = false;
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === to.x && cur.y === to.y) {
      reached = true;
      break;
    }
    for (const d of dirs) {
      const nx = cur.x + d.x, ny = cur.y + d.y;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      // Allow reaching destination even if it's an interactable object tile
      if (blocked.has(key) && !(nx === to.x && ny === to.y)) continue;
      visited.set(key, `${cur.x},${cur.y}`);
      queue.push({ x: nx, y: ny });
    }
  }

  if (!reached) {
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    if (dx !== 0 && !blocked.has(`${from.x + dx},${from.y}`)) return { x: from.x + dx, y: from.y };
    if (dy !== 0 && !blocked.has(`${from.x},${from.y + dy}`)) return { x: from.x, y: from.y + dy };
    return from;
  }

  let curKey = `${to.x},${to.y}`;
  let prevKey = visited.get(curKey);
  while (prevKey && prevKey !== startKey) {
    curKey = prevKey;
    prevKey = visited.get(curKey);
  }
  const [nx, ny] = curKey.split(',').map(Number);
  return { x: nx, y: ny };
}

export function createWorld(config: Config = { daylightTicks: 600, nightTicks: 600 }): World {
  validateConfig(config);
  const inhabitants = [
    ['ada', 'Ada', '#e8b95e', 'berries', 3, 5],
    ['bram', 'Bram', '#bba4d5', 'wood', 12, 4],
    ['cleo', 'Cleo', '#ed947c', 'berries', 14, 7],
    ['dax', 'Dax', '#91c4d1', 'wood', 6, 10],
  ] as const;

  // Authoritative landmarks for the Pocket Village valley
  const landmarks: Landmark[] = [
    {
      id: 'granary',
      name: 'The Village Windmill & Granary',
      kind: 'granary',
      x: 9,
      y: 7,
      description: 'Central grain mill with turning sails and secure communal food and material stores.',
    },
    {
      id: 'cottage-west',
      name: "Pioneer's Cottage",
      kind: 'shelter',
      x: 5,
      y: 4,
      description: 'Cozy timber shelter with thatched roof, stone hearth, and beds for resting.',
    },
    {
      id: 'cottage-east',
      name: 'Valley Haven Cottage',
      kind: 'shelter',
      x: 15,
      y: 7,
      description: 'Warm cottage overlooking the garden plots, providing shelter from nighttime chills.',
    },
    {
      id: 'commons',
      name: 'Commons & Campfire Plaza',
      kind: 'commons',
      x: 9,
      y: 5,
      description: 'Central stone-paved gathering circle with communal well, log benches, and campfire.',
    },
    {
      id: 'workshop',
      name: 'Valley Workshop',
      kind: 'workshop',
      x: 12,
      y: 7,
      description: 'Carpentry and tool-crafting bench equipped with anvils, barrels, and timber crates.',
    },
  ];

  // Natural valley obstacles: river stream (col 0, bridge at y=6) and steep cliff ridges
  const blocked: string[] = [
    '0,0', '0,1', '0,2', '0,3', '0,4', '0,5', '0,7', '0,8', '0,9', '0,10', '0,11', '0,12', '0,13',
    '1,0', '18,0', '19,0', '19,1', '4,2', '5,2', '15,6', '16,6',
  ];

  const world: World = {
    schemaVersion: 1, tick: 0, config: { ...config }, width: 20, height: 14,
    home: { x: 9, y: 7 }, stock: { berries: 0, wood: 0 }, consumed: { berries: 0, wood: 0 },
    patches: [
      { id: 'north-berries', x: 3, y: 3, resource: 'berries', quantity: 90, maxQuantity: 90 },
      { id: 'south-berries', x: 14, y: 9, resource: 'berries', quantity: 90, maxQuantity: 90 },
      { id: 'east-wood', x: 13, y: 3, resource: 'wood', quantity: 90, maxQuantity: 90 },
      { id: 'west-wood', x: 4, y: 10, resource: 'wood', quantity: 90, maxQuantity: 90 },
    ],
    landmarks,
    critters: [
      { id: 'pippin', name: 'Pippin the Meadow Slime', kind: 'slime', x: 17, y: 11, facing: 'front' },
    ],
    blocked,
    inhabitants: inhabitants.map(([id, name, color, preference, x, y], index) => ({
      id, name, color, preference, x, y, inventory: { berries: 0, wood: 0 },
      hunger: 15 + index * 8, energy: 95 - index * 8, plan: null,
      knowledge: [], visited: [], opportunities: 0, completed: 0,
    })),
  };
  for (const a of world.inhabitants) observe(world, a);
  return world;
}

function observe(w: World, a: Inhabitant): void {
  const cell = `${a.x},${a.y}`;
  if (!a.visited.includes(cell)) a.visited.push(cell);
  for (const p of w.patches.filter(p => distance(p, a) <= 2)) {
    const observation = { ...p, observedAt: w.tick };
    const index = a.knowledge.findIndex(k => k.id === p.id);
    if (index < 0) a.knowledge.push(observation);
    else a.knowledge[index] = observation;
  }
}

// Runtime validation also protects against future model adapters returning malformed JSON.
export function parseAction(value: unknown): Action | null {
  if (!value || typeof value !== 'object') return null;
  const action = value as Record<string, unknown>;
  if (action.kind === 'eat' || action.kind === 'deposit' || action.kind === 'rest') {
    return { kind: action.kind };
  }
  if (action.kind === 'gather' && typeof action.target === 'string' && action.target.length <= 80) {
    return { kind: 'gather', target: action.target };
  }
  if (action.kind === 'explore' && action.target && typeof action.target === 'object') {
    const p = action.target as Position;
    if (Number.isSafeInteger(p.x) && Number.isSafeInteger(p.y)) {
      return { kind: 'explore', target: { x: p.x, y: p.y } };
    }
  }
  return null;
}

function makePlan(w: World, a: Inhabitant, action: Action): Plan | null {
  let destination: Position = { x: a.x, y: a.y };
  let remaining = 1;
  if (action.kind === 'gather') {
    const p = w.patches.find(p => p.id === action.target);
    if (!p || !a.knowledge.some(k => k.id === p.id) || carried(a) >= 6) return null;
    destination = { x: p.x, y: p.y };
    remaining = 3;
  } else if (action.kind === 'deposit') {
    if (carried(a) === 0) return null;
    destination = { ...w.home }; remaining = 2;
  } else if (action.kind === 'eat') {
    destination = a.inventory.berries > 0 ? destination : { ...w.home };
  } else if (action.kind === 'rest') {
    // If shelter is nearby and inhabitant is tired at night, they head towards shelter
    const shelter = w.landmarks.find(l => l.kind === 'shelter' && distance(a, l) <= 3);
    if (shelter && distance(a, shelter) > 0) destination = { x: shelter.x, y: shelter.y };
    remaining = 4;
  } else {
    destination = { ...action.target };
    if (destination.x < 0 || destination.y < 0 || destination.x >= w.width || destination.y >= w.height) return null;
    if (w.blocked?.includes(`${destination.x},${destination.y}`)) return null;
  }
  return { action, destination, remaining };
}

function finish(w: World, a: Inhabitant, action: Action): string | null {
  if (action.kind === 'gather') {
    const p = w.patches.find(p => p.id === action.target);
    if (!p || distance(a, p) !== 0 || p.quantity < 1 || carried(a) >= 6) return null;
    p.quantity--; a.inventory[p.resource]++;
    return `gathered 1 ${p.resource}`;
  }
  if (action.kind === 'deposit') {
    if (distance(a, w.home) !== 0 || carried(a) === 0) return null;
    const quantity = carried(a);
    for (const r of ['berries', 'wood'] as const) { w.stock[r] += a.inventory[r]; a.inventory[r] = 0; }
    return `stored ${quantity} resources`;
  }
  if (action.kind === 'eat') {
    const source = a.inventory.berries > 0 ? a.inventory : distance(a, w.home) === 0 ? w.stock : null;
    if (!source || source.berries < 1) return null;
    source.berries--; w.consumed.berries++; a.hunger = Math.max(0, a.hunger - 35);
    return 'ate 1 berry';
  }
  if (action.kind === 'rest') {
    const atShelter = w.landmarks?.some(l => l.kind === 'shelter' && distance(a, l) <= 1);
    const gain = atShelter ? 35 : 25;
    a.energy = Math.min(100, a.energy + gain);
    return atShelter ? 'rested peacefully in shelter' : 'rested';
  }
  return 'explored a place';
}

export function step(previous: World, cognition: Cognition = deterministicAgent): { world: World; events: WorldEvent[] } {
  const w = structuredClone(previous);
  w.tick++;
  const events: WorldEvent[] = [];
  const blockedSet = new Set(w.blocked ?? []);

  // Wildlife simulation: Pippin the meadow slime hops gently around pasture every 4 ticks
  if (w.critters && w.tick % 4 === 0) {
    for (const c of w.critters) {
      const dirs = [
        { dx: 0, dy: -1, facing: 'back' as const },
        { dx: 1, dy: 0, facing: 'side' as const },
        { dx: 0, dy: 1, facing: 'front' as const },
        { dx: -1, dy: 0, facing: 'side' as const },
      ];
      const d = dirs[(w.tick + c.x * 7 + c.y * 3) % dirs.length];
      const nx = c.x + d.dx, ny = c.y + d.dy;
      if (nx >= 15 && nx <= 18 && ny >= 10 && ny <= 12 && !blockedSet.has(`${nx},${ny}`)) {
        c.x = nx; c.y = ny; c.facing = d.facing;
      }
    }
  }

  // Rotate execution priority so a fixed first actor cannot always win contested resources.
  const offset = w.tick % w.inhabitants.length;
  const order = [...w.inhabitants.slice(offset), ...w.inhabitants.slice(0, offset)];
  for (const a of order) {
    a.hunger = Math.min(100, a.hunger + 0.025);
    a.energy = Math.max(0, a.energy - 0.035);
    observe(w, a);
    if (!a.plan) {
      a.opportunities++;
      let proposal: unknown;
      try {
        // Copy protects authoritative state from a buggy adapter mutating its input.
        proposal = cognition.propose(structuredClone({
          self: a,
          observations: a.knowledge,
          tick: w.tick,
          phase: phase(w),
          width: w.width,
          height: w.height,
          home: w.home,
          landmarks: w.landmarks,
          nearbyInhabitants: w.inhabitants
            .filter(other => other.id !== a.id && distance(other, a) <= 2)
            .map(other => ({ id: other.id, name: other.name, x: other.x, y: other.y })),
          nearbyWildlife: (w.critters ?? [])
            .filter(c => distance(c, a) <= 2)
            .map(c => ({ id: c.id, name: c.name, x: c.x, y: c.y })),
        }));
      } catch { proposal = null; }
      const action = parseAction(proposal);
      a.plan = action ? makePlan(w, a, action) : null;
      events.push({ tick: w.tick, actor: a.id, kind: a.plan ? 'planned' : 'rejected',
        action, detail: a.plan ? `chose to ${action!.kind}` : 'invalid or infeasible proposal' });
      // Planning and execution occupy separate ticks, making interruptions observable.
      continue;
    }
    const p = a.plan;
    if (a.x !== p.destination.x || a.y !== p.destination.y) {
      const stepPos = nextStep(a, p.destination, w.width, w.height, blockedSet);
      a.x = stepPos.x;
      a.y = stepPos.y;
    } else {
      p.remaining--;
      if (p.remaining <= 0) {
        const detail = finish(w, a, p.action);
        events.push({ tick: w.tick, actor: a.id, kind: detail ? 'completed' : 'rejected',
          action: p.action, detail: detail ?? 'physical precondition no longer holds' });
        if (detail) a.completed++;
        a.plan = null;
      }
    }
    observe(w, a);
  }
  return { world: w, events };
}
