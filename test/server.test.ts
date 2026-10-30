import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { startRuntime } from '../src/server.ts';
import { SimulationClock } from '../src/clock.ts';

test('clock preserves delayed elapsed ticks in bounded batches without dropping debt', () => {
  let ticks = 0; const clock = new SimulationClock(0, 1000, () => { ticks++; });
  assert.equal(clock.pump(999), 0); assert.equal(clock.pump(1000), 1);
  assert.equal(clock.pump(51500), 20); assert.equal(ticks, 21);
  assert.equal(clock.pump(51500), 20); assert.equal(clock.pump(51500), 10);
  assert.equal(ticks, 51); assert.equal(clock.pump(52000), 1);
  assert.throws(() => clock.pump(51000), /monotonic/);
});

test('HTTP observer stays responsive while world advances with no viewers and after disconnect', async () => {
  const runtime = await startRuntime({ path: ':memory:', port: 0, tickMs: 30, config: { daylightTicks: 3, nightTicks: 2 } });
  try {
    await delay(160);
    assert.ok(runtime.store.world.tick >= 2, 'simulation started before any browser connected');
    const response = await fetch(`${runtime.url}/api/world`);
    const first = await response.json() as { world: { tick: number; inhabitants: unknown[] } };
    assert.equal(first.world.inhabitants.length, 4);
    await delay(150);
    const last = await (await fetch(`${runtime.url}/api/world`)).json() as typeof first;
    assert.ok(last.world.tick > first.world.tick);
    assert.equal((await fetch(`${runtime.url}/api/world`, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${runtime.url}/not-a-route`)).status, 404);
    const status = await new Promise<number>(done => {
      request(runtime.url, { headers: { Host: 'attacker.example' } }, res => { res.resume(); done(res.statusCode!); }).end();
    });
    assert.equal(status, 403);
    const tick = runtime.store.world.tick;
    await delay(90); assert.ok(runtime.store.world.tick > tick, 'no viewer required');
  } finally { await runtime.stop(); }
});

test('storage failure stops runtime and preserves last committed tick', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'valley-'));
  const path = join(dir, 'world.sqlite');
  const runtime = await startRuntime({ path, port: 0, tickMs: 40 });
  const db = new DatabaseSync(path);
  try {
    db.exec("CREATE TRIGGER fail_snapshot BEFORE UPDATE ON snapshot BEGIN SELECT RAISE(ABORT, 'disk failure'); END");
    const error = await Promise.race([runtime.failure, delay(2000).then(() => { throw Error('failure timeout'); })]);
    assert.match(error.message, /disk failure/);
    await runtime.stop();
    assert.equal(runtime.store.world.tick, 0);
  } finally { await runtime.stop(); db.close(); rmSync(dir, { recursive: true, force: true }); }
});
