import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createWorld, step, validateConfig, type Config, type World, type WorldEvent } from './world.ts';
import type { Cognition } from './cognition.ts';

export class WorldStore {
  private db!: DatabaseSync;
  private lease: DatabaseSync | undefined;
  world: World;

  constructor(path: string, config?: Config) {
    if (path !== ':memory:') {
      path = resolve(path);
      mkdirSync(dirname(path), { recursive: true });
      // Canonicalize filesystem path (resolving any symlinks) before deriving lease filename
      let realPath = path;
      try { realPath = realpathSync(path); } catch { /* path might not exist prior to creation */ }
      // A separate SQLite transaction holds the process lease across snapshot commits.
      // SQLite releases it after a crash, avoiding stale PID/lockfile recovery guesses.
      const lease = new DatabaseSync(`${realPath}.writer.sqlite`);
      try { lease.exec('BEGIN IMMEDIATE'); }
      catch { lease.close(); throw new Error('This save already has an active world writer.'); }
      this.lease = lease;
    }
    try {
      this.db = new DatabaseSync(path);
      this.db.exec('PRAGMA synchronous = FULL');
      const version = (this.db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      if (version !== 1 && (version !== 0 || tables.length !== 0)) throw new Error('Unsupported world database schema.');
      this.db.exec(`
        BEGIN IMMEDIATE;
        CREATE TABLE IF NOT EXISTS snapshot (id INTEGER PRIMARY KEY CHECK(id=1), state TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS events (
          sequence INTEGER PRIMARY KEY, tick INTEGER NOT NULL, payload TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS events_tick ON events(tick);
        PRAGMA user_version = 1;
        COMMIT;
      `);
      const row = this.db.prepare('SELECT state FROM snapshot WHERE id=1').get() as { state: string } | undefined;
      this.world = row ? JSON.parse(row.state) as World : createWorld(config);
      if (this.world.schemaVersion !== 1) throw new Error('Unsupported world snapshot schema.');
      validateConfig(this.world.config);
      if (!Number.isSafeInteger(this.world.tick) || this.world.tick < 0 || this.world.inhabitants.length !== 4) {
        throw new Error('Invalid world snapshot.');
      }
      if (!row) this.db.prepare('INSERT INTO snapshot VALUES(1, ?)').run(JSON.stringify(this.world));
    } catch (error) {
      this.db?.close(); this.lease?.close(); throw error;
    }
  }

  advance(cognition?: Cognition): WorldEvent[] {
    const next = step(this.world, cognition);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const insert = this.db.prepare('INSERT INTO events(tick, payload) VALUES(?, ?)');
      for (const event of next.events) insert.run(event.tick, JSON.stringify(event));
      this.db.prepare('UPDATE snapshot SET state=? WHERE id=1').run(JSON.stringify(next.world));
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK'); throw error;
    }
    this.world = next.world;
    return next.events;
  }

  recentEvents(limit = 30): WorldEvent[] {
    const rows = this.db.prepare('SELECT payload FROM events ORDER BY sequence DESC LIMIT ?').all(limit) as { payload: string }[];
    return rows.map(row => JSON.parse(row.payload) as WorldEvent).reverse();
  }

  allEvents(): WorldEvent[] {
    return (this.db.prepare('SELECT payload FROM events ORDER BY sequence').all() as { payload: string }[])
      .map(row => JSON.parse(row.payload) as WorldEvent);
  }

  close(): void { this.db.close(); this.lease?.close(); }
}
