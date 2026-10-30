import Phaser from 'phaser';
import type { Inhabitant, World, WorldEvent } from '../src/world.ts';

type Snapshot = { world: World; events: WorldEvent[]; day: number; phase: string; cognition: string };
let snapshot: Snapshot | undefined;
let selected = 'ada';
const element = (id: string) => document.getElementById(id)!;
const text = (id: string, value: string) => { element(id).textContent = value; };
const buttons = new Map<string, HTMLButtonElement>();
const actionText = (a: Inhabitant) => {
  if (!a.plan) return 'Considering the next opportunity';
  const moving = a.x !== a.plan.destination.x || a.y !== a.plan.destination.y;
  const labels = { gather: 'Gathering', deposit: 'Taking resources to the store',
    eat: 'Eating', rest: 'Resting', explore: 'Exploring' };
  return moving ? `Walking to ${a.plan.destination.x}, ${a.plan.destination.y}` : labels[a.plan.action.kind];
};

function renderInspector(): void {
  if (!snapshot) return;
  const w = snapshot.world;
  const a = w.inhabitants.find(a => a.id === selected)!;
  text('name', a.name);
  text('goal', `Prefers gathering ${a.preference}; hunger and rest can change the next choice.`);
  text('action', actionText(a));
  const details = element('details'); details.replaceChildren();
  for (const [label, value] of [
    ['Carrying', `${a.inventory.berries} berries, ${a.inventory.wood} wood`],
    ['Hunger', `${Math.round(a.hunger)} / 100`], ['Energy', `${Math.round(a.energy)} / 100`],
    ['Completed actions', String(a.completed)], ['Decision opportunities', String(a.opportunities)],
  ]) {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value; details.append(dt, dd);
  }
  const knowledge = element('knowledge'); knowledge.replaceChildren();
  for (const k of a.knowledge) {
    const li = document.createElement('li');
    li.textContent = `${k.resource} at ${k.x}, ${k.y}: ${k.quantity} last seen at tick ${k.observedAt}`;
    knowledge.append(li);
  }
  if (!a.knowledge.length) { const li = document.createElement('li'); li.textContent = 'No resource patches seen yet.'; knowledge.append(li); }
  for (const [id, button] of buttons) button.setAttribute('aria-pressed', String(id === selected));
}

function renderPage(): void {
  if (!snapshot) return;
  const w = snapshot.world;
  text('time', `Day ${snapshot.day} · ${snapshot.phase} · ${w.tick}s`);
  text('stock', `${w.stock.berries} berries · ${w.stock.wood} wood stored · ${w.consumed.berries} berries eaten`);
  if (!buttons.size) {
    for (const a of w.inhabitants) {
      const button = document.createElement('button'); button.type = 'button';
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = a.color;
      dot.setAttribute('aria-hidden', 'true'); button.append(dot, a.name);
      button.addEventListener('click', () => { selected = a.id; renderInspector(); });
      element('inhabitants').append(button); buttons.set(a.id, button);
    }
  }
  renderInspector();
  const events = element('events'); events.replaceChildren();
  for (const e of [...snapshot.events].reverse().slice(0, 16)) {
    const li = document.createElement('li');
    const time = document.createElement('span'); time.className = 'tick'; time.textContent = `Tick ${e.tick}`;
    const actor = w.inhabitants.find(a => a.id === e.actor)?.name ?? e.actor;
    li.append(time, `${actor} ${e.kind === 'rejected' ? 'could not act: ' : ''}${e.detail}`); events.append(li);
  }
}

async function poll(): Promise<void> {
  try {
    const response = await fetch('/api/world', { signal: AbortSignal.timeout(2000), cache: 'no-store' });
    if (!response.ok) throw Error('connection');
    snapshot = await response.json() as Snapshot;
    renderPage(); text('connection', 'Watching live'); element('connection').classList.remove('error');
  } catch {
    text('connection', 'Disconnected · showing last observation. Retrying…'); element('connection').classList.add('error');
  } finally { setTimeout(() => { void poll(); }, 500); }
}

class ValleyScene extends Phaser.Scene {
  private terrain!: Phaser.GameObjects.Graphics;
  private actors = new Map<string, Phaser.GameObjects.Container>();
  private resources = new Map<string, Phaser.GameObjects.Text>();
  private night!: Phaser.GameObjects.Rectangle;
  private selection!: Phaser.GameObjects.Arc;

  create(): void {
    const g = this.add.graphics(); this.terrain = g;
    g.fillStyle(0x77985a); g.fillRect(0, 0, 800, 560);
    // Original vector terrain. These shapes are visual ground cover, not physical obstacles.
    for (let y = 0; y < 14; y++) for (let x = 0; x < 20; x++) {
      const tone = (x * 13 + y * 7) % 5;
      g.fillStyle([0x829f62, 0x749455, 0x79995b, 0x7d9b60, 0x76915a][tone], 0.75);
      g.fillRoundedRect(x * 40 + 2, y * 40 + 2, 36, 36, 9);
      g.fillStyle(0xa7b87b, 0.6); g.fillCircle(x * 40 + 9, y * 40 + 26, 2);
    }
    // Valley edge stream sits outside the walkable cell centers.
    g.lineStyle(12, 0x619da6, 0.9); g.beginPath(); g.moveTo(1, 0);
    for (let y = 0; y <= 560; y += 20) g.lineTo(4 + Math.sin(y / 75) * 3, y);
    g.strokePath();
    this.add.text(32, 18, 'The valley', { fontFamily: 'Georgia', fontSize: '24px', color: '#233f38' });
    this.night = this.add.rectangle(400, 280, 800, 560, 0x172942, 0).setDepth(5);
    this.selection = this.add.circle(0, 0, 16).setStrokeStyle(2, 0xffffff).setDepth(8);
  }

  update(): void {
    if (!snapshot) return;
    const w = snapshot.world;
    this.night.setAlpha(snapshot.phase === 'night' ? 0.42 : 0);
    if (!this.resources.size) {
      const g = this.terrain;
      g.fillStyle(0xb6b9aa); g.fillRoundedRect(w.home.x * 40 - 5, w.home.y * 40 - 5, 50, 50, 8);
      this.add.text(w.home.x * 40 + 20, w.home.y * 40 + 47, 'Store',
        { fontFamily: 'Segoe UI', fontSize: '14px', color: '#233f38' }).setOrigin(0.5);
      for (const p of w.patches) {
        const x = p.x * 40 + 20, y = p.y * 40 + 20;
        if (p.resource === 'wood') {
          g.fillStyle(0x65513e); g.fillRect(x - 3, y, 6, 20);
          g.fillStyle(0x355c45); g.fillTriangle(x, y - 27, x - 22, y + 8, x + 22, y + 8);
        } else {
          g.fillStyle(0x47693e); g.fillCircle(x, y, 19); g.fillStyle(0xb35c78);
          for (const [dx, dy] of [[-8, 1], [4, -8], [9, 7]]) g.fillCircle(x + dx, y + dy, 4);
        }
        const label = this.add.text(x, y - 43, '', { fontFamily: 'Segoe UI', fontSize: '13px',
          color: '#233f38', backgroundColor: '#edf3ef', padding: { x: 3, y: 0 } }).setOrigin(0.5);
        this.resources.set(p.id, label);
      }
    }
    for (const p of w.patches) this.resources.get(p.id)!.setText(`${p.resource}: ${p.quantity}`);
    for (const a of w.inhabitants) {
      let actor = this.actors.get(a.id);
      if (!actor) {
        const color = Phaser.Display.Color.HexStringToColor(a.color).color;
        const body = this.add.circle(0, 0, 10, color).setStrokeStyle(2, 0x233f38);
        const head = this.add.circle(0, -10, 5, 0xf2d5aa);
        const label = this.add.text(0, 16, a.name, { fontFamily: 'Segoe UI', fontSize: '14px',
          color: '#233f38', backgroundColor: '#edf3ef', padding: { x: 3, y: 0 } }).setOrigin(0.5, 0);
        actor = this.add.container(0, 0, [body, head, label]).setDepth(7);
        body.setInteractive({ useHandCursor: true });
        body.on('pointerdown', () => { selected = a.id; renderInspector(); });
        this.actors.set(a.id, actor);
      }
      // Grid movement mirrors committed positions; the viewer never advances simulation.
      actor.setPosition(a.x * 40 + 20, a.y * 40 + 20);
      if (a.id === selected) this.selection.setPosition(actor.x, actor.y);
    }
  }
}

new Phaser.Game({ type: Phaser.CANVAS, parent: 'valley', width: 800, height: 560,
  backgroundColor: '#77985a', scene: ValleyScene,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  banner: false, audio: { noAudio: true }, fps: { target: 20, forceSetTimeOut: true } });
void poll();
