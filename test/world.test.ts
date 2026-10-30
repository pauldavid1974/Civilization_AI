import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, step, phase, day, parseAction, carried, nextStep, type World, type Stock } from '../src/world.ts';
import { deterministicAgent, type Cognition, type Perception } from '../src/cognition.ts';

function totals(w: World): Stock {
  const result = { ...w.consumed };
  for (const r of ['berries', 'wood'] as const) {
    result[r] += w.stock[r] + w.patches.filter(p => p.resource === r).reduce((n, p) => n + p.quantity, 0)
      + w.inhabitants.reduce((n, a) => n + a.inventory[r], 0);
  }
  return result;
}

test('identical worlds have deterministic outcomes for a complete day', () => {
  let a = createWorld(); let b = createWorld();
  for (let i = 0; i < 1200; i++) {
    const x = step(a); const y = step(b);
    assert.deepEqual(x, y); a = x.world; b = y.world;
  }
  assert.equal(day(a), 2); assert.equal(phase(a), 'daylight');
  for (const actor of a.inhabitants) {
    assert.ok(actor.opportunities > 5); assert.ok(actor.completed > 5);
  }
});

test('unequal configurable phases use precise persisted tick boundaries', () => {
  const w = createWorld({ daylightTicks: 3, nightTicks: 2 });
  for (const [tick, expectedPhase, expectedDay] of [[0, 'daylight', 1], [2, 'daylight', 1],
    [3, 'night', 1], [4, 'night', 1], [5, 'daylight', 2]] as const) {
    w.tick = tick; assert.equal(phase(w), expectedPhase); assert.equal(day(w), expectedDay);
  }
  for (const bad of [0, -1, 1.5, NaN, Infinity, 86401]) {
    assert.throws(() => createWorld({ daylightTicks: bad, nightTicks: 2 }));
  }
});

test('resources are conserved over five days, including consumption and contested actions', () => {
  let w = createWorld(); const initial = totals(w);
  for (let i = 0; i < 6000; i++) {
    w = step(w).world;
    assert.deepEqual(totals(w), initial);
    for (const a of w.inhabitants) {
      assert.ok(carried(a) <= 6 && carried(a) >= 0);
      assert.ok(a.energy >= 0 && a.energy <= 100 && a.hunger >= 0 && a.hunger <= 100);
    }
    assert.ok(w.patches.every(p => p.quantity >= 0));
  }
  assert.ok(w.stock.wood > 0); assert.ok(w.stock.berries > 0); assert.ok(w.consumed.berries > 0);
});

test('malformed, impossible and omniscient action proposals fail without physical changes', () => {
  for (const proposal of [null, { kind: 'invent', quantity: 999 }, { kind: 'explore', target: { x: NaN, y: 0 } },
    { kind: 'explore', target: { x: 100, y: 0 } }, { kind: 'explore', target: { x: 0, y: 0 } }, { kind: 'gather', target: 'imaginary' }]) {
    const before = createWorld();
    const result = step(before, { name: 'invalid', propose: () => proposal });
    assert.ok(result.events.every(e => e.kind === 'rejected'));
    assert.deepEqual(totals(result.world), totals(before));
    assert.deepEqual(result.world.inhabitants.map(a => [a.x, a.y]), before.inhabitants.map(a => [a.x, a.y]));
  }
  assert.equal(parseAction({ kind: 'gather', target: 7 }), null);
  const w = createWorld();
  const result = step(w, { name: 'omniscient', propose: () => ({ kind: 'gather', target: 'south-berries' }) });
  assert.equal(result.world.inhabitants[0].plan, null);
});

test('last unit can only be claimed once; stale plans record rejection', () => {
  let w = createWorld(); const patch = w.patches[0]; patch.quantity = 1;
  for (const a of w.inhabitants) {
    a.x = patch.x; a.y = patch.y;
    a.plan = { action: { kind: 'gather', target: patch.id }, destination: { x: patch.x, y: patch.y }, remaining: 1 };
  }
  const result = step(w); w = result.world;
  assert.equal(w.patches[0].quantity, 0);
  assert.equal(w.inhabitants.reduce((n, a) => n + a.inventory.berries, 0), 1);
  assert.equal(result.events.filter(e => e.kind === 'rejected').length, 3);
});

test('personal evidence excludes distant truth and other minds and can change later choice', () => {
  const w = createWorld(); const seen: Perception[] = [];
  const spy: Cognition = { name: 'spy', propose: p => { seen.push(p); return { kind: 'rest' }; } };
  step(w, spy);
  const ada = seen.find(p => p.self.id === 'ada')!;
  assert.deepEqual(Object.keys(ada).sort(), [
    'height', 'home', 'landmarks', 'nearbyInhabitants', 'nearbyWildlife',
    'observations', 'phase', 'self', 'tick', 'width',
  ]);
  assert.equal(ada.observations.some(p => p.id === 'south-berries'), false);
  assert.equal('inhabitants' in ada, false);
  assert.equal(ada.landmarks.length, 5);
  assert.deepEqual(deterministicAgent.propose(ada), { kind: 'gather', target: 'north-berries' });
  w.patches[0].quantity = 0;
  seen.length = 0; step(w, spy);
  const after = seen.find(p => p.self.id === 'ada')!;
  assert.equal(after.observations[0].quantity, 0);
  assert.equal(after.observations[0].observedAt, 1);
  assert.equal((deterministicAgent.propose(after) as {kind: string}).kind, 'explore');
});

test('adapter input mutation cannot alter the engine, and thrown proposals do not starve other agents', () => {
  const w = createWorld();
  const result = step(w, { name: 'bad', propose: p => { p.self.inventory.wood = 1000; throw Error('outage'); } });
  assert.deepEqual(totals(result.world), totals(w));
  assert.ok(result.world.inhabitants.every(a => a.opportunities === 1));
  assert.equal(result.events.filter(e => e.kind === 'rejected').length, 4);
});

test('shared-store convention does not prohibit physical consumption by any inhabitant', () => {
  const w = createWorld(); w.stock.berries = 1;
  const a = w.inhabitants[2]; Object.assign(a, w.home);
  a.plan = { action: { kind: 'eat' }, destination: { ...w.home }, remaining: 1 };
  const next = step(w).world;
  assert.equal(next.stock.berries, 0); assert.equal(next.consumed.berries, 1);
});

test('world landmarks are authoritative and perceived by inhabitants', () => {
  const w = createWorld();
  assert.equal(w.landmarks.length, 5);
  const kinds = w.landmarks.map(l => l.kind).sort();
  assert.deepEqual(kinds, ['commons', 'granary', 'shelter', 'shelter', 'workshop']);
  const granary = w.landmarks.find(l => l.kind === 'granary')!;
  assert.equal(granary.x, w.home.x);
  assert.equal(granary.y, w.home.y);
  assert.match(granary.name, /Windmill & Granary/);

  // Inhabitant perception receives landmarks
  let perceivedLandmarksCount = 0;
  step(w, {
    name: 'observer',
    propose: p => {
      perceivedLandmarksCount = p.landmarks.length;
      return { kind: 'rest' };
    },
  });
  assert.equal(perceivedLandmarksCount, 5);
});

test('terrain navigation respects blocked cells and routes via BFS', () => {
  const blocked = new Set(['1,1']);
  const start = { x: 1, y: 0 };
  const dest = { x: 1, y: 2 };
  // Direct path is blocked at (1, 1), so nextStep must navigate around
  const step1 = nextStep(start, dest, 5, 5, blocked);
  assert.notEqual(`${step1.x},${step1.y}`, '1,1', 'did not step into blocked cell');
  assert.equal(step1.y, 0, 'moved horizontally around obstacle');

  // Verify explore action rejected for blocked cell
  const w = createWorld();
  const res = step(w, { name: 'test', propose: () => ({ kind: 'explore', target: { x: 0, y: 0 } }) });
  assert.equal(res.events[0].kind, 'rejected');
});

test('shelter rest affords enhanced energy recovery', () => {
  const w = createWorld();
  const shelter = w.landmarks.find(l => l.kind === 'shelter')!;
  const a = w.inhabitants[0];
  a.x = shelter.x; a.y = shelter.y; a.energy = 50;
  a.plan = { action: { kind: 'rest' }, destination: { x: shelter.x, y: shelter.y }, remaining: 1 };
  const next = step(w).world;
  const updatedA = next.inhabitants.find(i => i.id === a.id)!;
  // Enhanced shelter rest gives +35 energy (minus tick exertion)
  assert.ok(updatedA.energy >= 84);
});

test('hungry inhabitants seek and consume shared food from village granary', () => {
  const w = createWorld();
  w.stock.berries = 10;
  const ada = w.inhabitants[0];
  ada.hunger = 70;
  ada.inventory.berries = 0;
  // Propose should choose eat even without carried food
  const action = deterministicAgent.propose({
    self: ada,
    observations: ada.knowledge,
    tick: 1,
    phase: 'daylight',
    width: w.width,
    height: w.height,
    home: w.home,
    landmarks: w.landmarks,
    nearbyInhabitants: [],
    nearbyWildlife: [],
  });
  assert.deepEqual(action, { kind: 'eat' });
});

test('wildlife exists in meadow and is observed locally without omniscience', () => {
  const w = createWorld();
  assert.ok(w.critters && w.critters.length > 0);
  const pippin = w.critters[0];
  assert.equal(pippin.id, 'pippin');

  let seenWildlifeCount = 0;
  const cleo = w.inhabitants.find(i => i.id === 'cleo')!;
  assert.ok(cleo);
  // Cleo at (14, 7) is distance 7 from Pippin at (17, 11) -> out of perception radius 2
  step(w, {
    name: 'spy',
    propose: p => {
      if (p.self.id === 'cleo') seenWildlifeCount = p.nearbyWildlife.length;
      return { kind: 'rest' };
    },
  });
  assert.equal(seenWildlifeCount, 0, 'far inhabitant cannot see critter');

  // Place Cleo within radius 2
  w.inhabitants[2].x = 16;
  w.inhabitants[2].y = 11;
  step(w, {
    name: 'spy',
    propose: p => {
      if (p.self.id === 'cleo') seenWildlifeCount = p.nearbyWildlife.length;
      return { kind: 'rest' };
    },
  });
  assert.equal(seenWildlifeCount, 1, 'nearby inhabitant observes critter locally');
});
