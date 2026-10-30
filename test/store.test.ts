import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { WorldStore } from '../src/store.ts';

test('mid-plan restart and closed-file restore match uninterrupted continuation exactly', () => {
  const dir = mkdtempSync(join(tmpdir(), 'valley-'));
  let live: WorldStore | undefined; let resumed: WorldStore | undefined; let restored: WorldStore | undefined;
  try {
    live = new WorldStore(join(dir, 'live.sqlite'), { daylightTicks: 10, nightTicks: 7 });
    for (let i = 0; i < 13; i++) live.advance();
    assert.ok(live.world.inhabitants.some(a => a.plan !== null));
    const saved = structuredClone(live.world); const history = live.allEvents(); live.close(); live = undefined;
    copyFileSync(join(dir, 'live.sqlite'), join(dir, 'restore.sqlite'));
    resumed = new WorldStore(join(dir, 'live.sqlite'), { daylightTicks: 999, nightTicks: 999 });
    restored = new WorldStore(join(dir, 'restore.sqlite'));
    assert.deepEqual(resumed.world, saved); assert.deepEqual(restored.world, saved);
    assert.deepEqual(resumed.allEvents(), history);
    live = new WorldStore(':memory:', { daylightTicks: 10, nightTicks: 7 });
    for (let i = 0; i < 13; i++) live.advance();
    for (let i = 0; i < 100; i++) { resumed.advance(); restored.advance(); live.advance(); }
    assert.deepEqual(resumed.world, live.world); assert.deepEqual(restored.world, live.world);
    assert.deepEqual(resumed.allEvents(), live.allEvents());
  } finally { live?.close(); resumed?.close(); restored?.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('second writer refused; lease released cleanly; unknown schema refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'valley-'));
  try {
    const path = join(dir, 'world.sqlite'); const first = new WorldStore(path);
    try { assert.throws(() => new WorldStore(path), /active world writer/); }
    finally { first.close(); }
    const second = new WorldStore(path); second.close();
    const db = new DatabaseSync(path); db.exec('PRAGMA user_version=99'); db.close();
    assert.throws(() => new WorldStore(path), /Unsupported world database schema/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('failed transaction rolls back events and snapshot, then retry has no duplicate effects', () => {
  const dir = mkdtempSync(join(tmpdir(), 'valley-'));
  const path = join(dir, 'world.sqlite'); const store = new WorldStore(path);
  const db = new DatabaseSync(path);
  try {
    db.exec("CREATE TRIGGER fail_snapshot BEFORE UPDATE ON snapshot BEGIN SELECT RAISE(ABORT, 'test failure'); END");
    const before = structuredClone(store.world);
    assert.throws(() => store.advance(), /test failure/);
    assert.deepEqual(store.world, before); assert.deepEqual(store.allEvents(), []);
    db.exec('DROP TRIGGER fail_snapshot');
    store.advance();
    assert.equal(store.world.tick, 1); assert.equal(store.allEvents().length, 4);
  } finally { db.close(); store.close(); rmSync(dir, { recursive: true, force: true }); }
});
