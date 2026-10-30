import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { WorldStore } from './store.ts';
import { SimulationClock } from './clock.ts';
import { day, phase, type Config } from './world.ts';
import { deterministicAgent } from './cognition.ts';

export type RuntimeOptions = { path: string; port?: number; config?: Config; tickMs?: number; viewerDir?: string };

export async function startRuntime(options: RuntimeOptions) {
  const store = new WorldStore(options.path, options.config);
  const viewerDir = options.viewerDir ?? resolve('dist/viewer');
  const routes: Record<string, [string, string]> = {
    '/': ['index.html', 'text/html; charset=utf-8'],
    '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
    '/style.css': ['style.css', 'text/css; charset=utf-8'],
  };
  let port = 0;
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'");
    const allowedHosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!allowedHosts.includes(req.headers.host ?? '') || req.headers['sec-fetch-site'] === 'cross-site') {
      res.writeHead(403); res.end('Local observer only.'); return;
    }
    if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }); res.end('Read-only observer.'); return; }
    if (req.url === '/api/world') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        world: store.world,
        events: store.recentEvents(),
        day: day(store.world),
        phase: phase(store.world),
        cognition: deterministicAgent.name,
      }));
      return;
    }
    const parsedPath = decodeURIComponent((req.url ?? '').split('?')[0]);
    const route = routes[parsedPath];
    if (route) {
      try {
        const content = await readFile(join(viewerDir, route[0]));
        res.setHeader('Content-Type', route[1]); res.end(content);
        return;
      } catch {
        res.writeHead(503); res.end('Viewer unavailable. Run npm run build, then restart.');
        return;
      }
    }
    if (parsedPath.startsWith('/assets/')) {
      const rel = parsedPath.slice('/assets/'.length);
      const safe = normalize(rel).replace(/^(\.\.[\/\\])+/, '');
      const full = join(viewerDir, 'assets', safe);
      const base = resolve(viewerDir, 'assets');
      if (!resolve(full).startsWith(base)) {
        res.writeHead(403); res.end('Forbidden.'); return;
      }
      try {
        const content = await readFile(full);
        const ext = safe.split('.').pop()?.toLowerCase();
        const types: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          svg: 'image/svg+xml',
          txt: 'text/plain; charset=utf-8',
          json: 'application/json',
        };
        res.setHeader('Content-Type', types[ext ?? ''] ?? 'application/octet-stream');
        res.end(content);
        return;
      } catch {
        res.writeHead(404); res.end('Asset not found.'); return;
      }
    }
    res.writeHead(404); res.end('Not found.');
  });
  try {
    await new Promise<void>((done, fail) => {
      server.once('error', fail);
      server.listen(options.port ?? 4317, '127.0.0.1', () => { server.off('error', fail); done(); });
    });
  } catch (error) { store.close(); throw error; }
  port = (server.address() as { port: number }).port;
  let stopping: Promise<void> | undefined;
  let timer: ReturnType<typeof setInterval>;
  const stop = () => {
    if (!stopping) {
      clearInterval(timer);
      stopping = new Promise<void>((done, fail) => server.close(error => {
        store.close(); if (error) fail(error); else done();
      }));
      server.closeIdleConnections();
    }
    return stopping;
  };
  let reportFailure: (error: Error) => void;
  const failure = new Promise<Error>(done => { reportFailure = done; });
  const clock = new SimulationClock(performance.now(), options.tickMs ?? 1000, () => { store.advance(); });
  timer = setInterval(() => {
    try { clock.pump(performance.now()); }
    catch (error) {
      const fatal = error instanceof Error ? error : new Error(String(error));
      reportFailure(fatal);
      void stop().catch(() => { /* original storage error is already reported */ });
    }
  }, Math.min(options.tickMs ?? 1000, 100));
  return { url: `http://127.0.0.1:${port}`, store, stop, failure };
}

function integerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw Error(`Invalid ${name}.`);
  return Number(raw);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const port = integerEnv('PORT', 4317);
    if (port < 1 || port > 65535) throw Error('PORT must be between 1 and 65535.');
    const runtime = await startRuntime({ path: process.env.WORLD_DB ?? 'saves/valley.sqlite', port,
      config: { daylightTicks: integerEnv('DAYLIGHT_TICKS', 600), nightTicks: integerEnv('NIGHT_TICKS', 600) } });
    console.log(`The Living Valley is running locally at ${runtime.url}`);
    console.log('Deterministic test cognition; LLM capabilities pending. Stop with Ctrl+C.');
    const stop = () => { void runtime.stop().catch(error => { console.error(error.message); process.exitCode = 1; }); };
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    void runtime.failure.then(error => { console.error(`World stopped: ${error.message}`); process.exitCode = 1; });
  } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
