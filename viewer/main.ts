import Phaser from 'phaser';
import type { Inhabitant, World, WorldEvent } from '../src/world.ts';

type Snapshot = {
  world: World;
  events: WorldEvent[];
  day: number;
  phase: string;
  cognition: string;
};

let snapshot: Snapshot | undefined;
let selectedId = 'ada';
let selectedCategory: 'inhabitant' | 'landmark' | 'critter' = 'inhabitant';

const element = (id: string) => document.getElementById(id)!;
const text = (id: string, value: string) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

const inhabitantButtons = new Map<string, HTMLButtonElement>();
const landmarkButtons = new Map<string, HTMLButtonElement>();

const actionEmoji = (kind: string) => {
  switch (kind) {
    case 'gather': return '🍇';
    case 'deposit': return '📦';
    case 'eat': return '🍞';
    case 'rest': return '💤';
    case 'explore': return '🧭';
    default: return '💭';
  }
};

const actionLabel = (a: Inhabitant) => {
  if (!a.plan) return 'Considering the next opportunity';
  const moving = a.x !== a.plan.destination.x || a.y !== a.plan.destination.y;
  const labels: Record<string, string> = {
    gather: 'Gathering resources',
    deposit: 'Taking supplies to the granary',
    eat: 'Eating sustenance',
    rest: 'Resting to recover energy',
    explore: 'Exploring unvisited valley territory',
  };
  const base = labels[a.plan.action.kind] ?? 'Acting';
  return moving ? `Walking to (${a.plan.destination.x}, ${a.plan.destination.y}) · ${base}` : base;
};

function selectEntity(id: string, category: 'inhabitant' | 'landmark' | 'critter') {
  selectedId = id;
  selectedCategory = category;
  renderInspector();
}

function renderInspector(): void {
  if (!snapshot) return;
  const w = snapshot.world;

  for (const [id, btn] of inhabitantButtons) {
    btn.setAttribute('aria-pressed', String(selectedCategory !== 'landmark' && id === selectedId));
  }
  for (const [id, btn] of landmarkButtons) {
    btn.setAttribute('aria-pressed', String(selectedCategory === 'landmark' && id === selectedId));
  }

  const badgeEl = element('badge');
  const metersEl = element('meters');
  const detailsEl = element('details');
  const knowledgeEl = element('knowledge');
  const knowledgeHeading = element('knowledge-heading');
  const knowledgeSub = element('knowledge-sub');

  if (selectedCategory === 'landmark') {
    const landmark = w.landmarks?.find(l => l.id === selectedId) ?? w.landmarks?.[0];
    if (!landmark) return;

    badgeEl.textContent = landmark.kind.toUpperCase();
    text('name', landmark.name);
    text('goal', landmark.description);
    text('action', `Authoritative location at (${landmark.x}, ${landmark.y})`);

    metersEl.replaceChildren();
    detailsEl.replaceChildren();

    const occupants = w.inhabitants.filter(a => Math.abs(a.x - landmark.x) + Math.abs(a.y - landmark.y) <= 1);
    const occupantNames = occupants.length ? occupants.map(o => o.name).join(', ') : 'None currently present';

    const items: [string, string][] = [
      ['Coordinates', `${landmark.x}, ${landmark.y}`],
      ['Landmark type', landmark.kind],
      ['Present inhabitants', occupantNames],
      ['Village purpose', landmark.description],
    ];

    if (landmark.kind === 'granary') {
      items.push(
        ['Stored food', `${w.stock.berries} berries`],
        ['Stored timber', `${w.stock.wood} wood`],
        ['Total consumed', `${w.consumed.berries} berries eaten`],
      );
    }

    for (const [label, val] of items) {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = val;
      detailsEl.append(dt, dd);
    }

    knowledgeHeading.textContent = 'Landmark history & occupants';
    knowledgeSub.textContent = 'Permanent village fixture persisted in SQLite world state.';
    knowledgeEl.replaceChildren();
    if (occupants.length) {
      for (const occ of occupants) {
        const li = document.createElement('li');
        li.textContent = `${occ.name} is resting or working here (Energy: ${Math.round(occ.energy)}%, Hunger: ${Math.round(occ.hunger)}%)`;
        knowledgeEl.append(li);
      }
    } else {
      const li = document.createElement('li');
      li.textContent = 'Quiet at the moment. Inhabitants visit during their daily routines.';
      knowledgeEl.append(li);
    }
    return;
  }

  if (selectedId === 'pippin') {
    const critter = w.critters?.find(c => c.id === 'pippin');
    badgeEl.textContent = 'VALLEY FAUNA';
    text('name', 'Pippin the Meadow Slime');
    text('goal', 'A gentle, peaceful valley creature that hops quietly in the southeastern wildflower pasture.');
    text('action', critter ? `Hopping cheerfully near (${critter.x}, ${critter.y})` : 'Roaming the meadow');

    metersEl.replaceChildren();
    detailsEl.replaceChildren();
    for (const [label, val] of [
      ['Species', 'Orange Meadow Slime'],
      ['Temperament', 'Friendly & peaceful'],
      ['Coordinates', critter ? `${critter.x}, ${critter.y}` : 'Unknown'],
      ['Facing', critter?.facing ?? 'front'],
    ]) {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = val;
      detailsEl.append(dt, dd);
    }

    knowledgeHeading.textContent = 'Fauna notes';
    knowledgeSub.textContent = 'Inhabitants who wander within 2 tiles perceive Pippin in their local observations.';
    knowledgeEl.replaceChildren();
    const li = document.createElement('li');
    li.textContent = 'Valley residents see Pippin as a welcome sign of living nature in the valley.';
    knowledgeEl.append(li);
    return;
  }

  const a = w.inhabitants.find(a => a.id === selectedId) ?? w.inhabitants[0];
  badgeEl.textContent = 'INHABITANT';
  text('name', a.name);
  text('goal', `Prefers gathering ${a.preference}; hunger, energy, and day/night cycle guide decisions.`);
  text('action', actionLabel(a));

  metersEl.replaceChildren();
  for (const [name, val, cls] of [
    ['Hunger', a.hunger, 'hunger'],
    ['Energy', a.energy, 'energy'],
  ] as const) {
    const row = document.createElement('div'); row.className = 'meter-row';
    const label = document.createElement('span'); label.textContent = name;
    const bar = document.createElement('div'); bar.className = 'meter-bar';
    const fill = document.createElement('div');
    fill.className = `meter-fill ${cls}`;
    fill.style.width = `${Math.min(100, Math.max(0, val))}%`;
    bar.append(fill);
    const num = document.createElement('span'); num.textContent = `${Math.round(val)}%`;
    row.append(label, bar, num);
    metersEl.append(row);
  }

  detailsEl.replaceChildren();
  for (const [label, val] of [
    ['Coordinates', `${a.x}, ${a.y}`],
    ['Carrying', `${a.inventory.berries} berries, ${a.inventory.wood} wood`],
    ['Completed actions', String(a.completed)],
    ['Decision opportunities', String(a.opportunities)],
    ['Visited locations', `${a.visited.length} tiles recorded`],
  ]) {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = val;
    detailsEl.append(dt, dd);
  }

  knowledgeHeading.textContent = 'Personal observations & memory';
  knowledgeSub.textContent = 'Evidence witnessed firsthand (Manhattan radius 2). Personal memory may become stale as reality changes.';
  knowledgeEl.replaceChildren();
  for (const k of a.knowledge) {
    const li = document.createElement('li');
    li.textContent = `${k.resource} patch at (${k.x}, ${k.y}): ${k.quantity} remaining (seen at tick ${k.observedAt})`;
    knowledgeEl.append(li);
  }
  if (!a.knowledge.length) {
    const li = document.createElement('li');
    li.textContent = 'No resource patches seen yet. Exploring territory to discover food and timber.';
    knowledgeEl.append(li);
  }
}

function renderPage(): void {
  if (!snapshot) return;
  const w = snapshot.world;
  text('time', `Day ${snapshot.day} · ${snapshot.phase.toUpperCase()} · Tick ${w.tick}s`);
  text('stock', `${w.stock.berries} berries · ${w.stock.wood} wood stored in granary · ${w.consumed.berries} total berries consumed`);

  if (!inhabitantButtons.size) {
    const container = element('inhabitants');
    for (const a of w.inhabitants) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = a.color;
      dot.setAttribute('aria-hidden', 'true');
      btn.append(dot, a.name);
      btn.addEventListener('click', () => selectEntity(a.id, 'inhabitant'));
      container.append(btn);
      inhabitantButtons.set(a.id, btn);
    }
    const slimeBtn = document.createElement('button');
    slimeBtn.type = 'button';
    const slimeDot = document.createElement('span');
    slimeDot.className = 'dot';
    slimeDot.style.background = '#e88938';
    slimeDot.setAttribute('aria-hidden', 'true');
    slimeBtn.append(slimeDot, 'Pippin (Fauna)');
    slimeBtn.addEventListener('click', () => selectEntity('pippin', 'critter'));
    container.append(slimeBtn);
    inhabitantButtons.set('pippin', slimeBtn);
  }

  if (!landmarkButtons.size && w.landmarks) {
    const container = element('landmarks');
    for (const l of w.landmarks) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const icon = l.kind === 'granary' ? '🌾 ' : l.kind === 'shelter' ? '🏡 ' : l.kind === 'commons' ? '⛲ ' : '⚒️ ';
      btn.textContent = `${icon}${l.name}`;
      btn.addEventListener('click', () => selectEntity(l.id, 'landmark'));
      container.append(btn);
      landmarkButtons.set(l.id, btn);
    }
  }

  renderInspector();

  const eventsEl = element('events');
  eventsEl.replaceChildren();
  for (const e of [...snapshot.events].reverse().slice(0, 16)) {
    const li = document.createElement('li');
    const time = document.createElement('span');
    time.className = 'tick';
    time.textContent = `Tick ${e.tick}`;
    const actor = w.inhabitants.find(a => a.id === e.actor)?.name ?? e.actor;
    li.append(time, `${actor} ${e.kind === 'rejected' ? 'could not act: ' : ''}${e.detail}`);
    eventsEl.append(li);
  }
}

async function poll(): Promise<void> {
  try {
    const response = await fetch('/api/world', { signal: AbortSignal.timeout(2000), cache: 'no-store' });
    if (!response.ok) throw Error('connection');
    snapshot = await response.json() as Snapshot;
    renderPage();
    text('connection', 'Watching live');
    element('connection').classList.remove('error');
  } catch {
    text('connection', 'Disconnected · showing last observation. Retrying…');
    element('connection').classList.add('error');
  } finally {
    setTimeout(() => { void poll(); }, 500);
  }
}

class ValleyScene extends Phaser.Scene {
  private windmillBlade!: Phaser.GameObjects.Sprite;
  private campfireLight!: Phaser.GameObjects.Arc;
  private actors = new Map<string, Phaser.GameObjects.Container>();
  private critterSprite?: Phaser.GameObjects.Sprite;
  private resources = new Map<string, Phaser.GameObjects.Text>();
  private night!: Phaser.GameObjects.Rectangle;
  private selection!: Phaser.GameObjects.Arc;
  private bubbles = new Map<string, Phaser.GameObjects.Text>();

  preload(): void {
    // Pocket Village 16x16 tilesets and spritesheets
    this.load.image('ground', '/assets/Tilesets/Ground Tiles.png');
    this.load.image('buildings', '/assets/Tilesets/PreMade Buildings.png');
    this.load.image('props', '/assets/Tilesets/Building Props.png');
    this.load.image('decor', '/assets/Tilesets/Decor.png');
    this.load.image('shadows', '/assets/Tilesets/Shadows.png');

    // 16-frame 144x112 animated windmill blades
    this.load.spritesheet('windmill', '/assets/Tilesets/WindmillBlade-Animation.png', {
      frameWidth: 144,
      frameHeight: 112,
    });

    // Pocket Hero 48x48 animated character sheets
    this.load.spritesheet('hero-idle', '/assets/Pocket Hero/48x48 Idle - Hero-Sheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('hero-run', '/assets/Pocket Hero/48x48 Run - Hero-Sheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('hero-attack', '/assets/Pocket Hero/48x48 Attack - Hero-Sheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Wildlife / critter sheet
    this.load.spritesheet('slime-front', '/assets/Enemy/slime_Orange_front-Sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    // Setup animation states
    if (!this.anims.exists('spin-windmill')) {
      this.anims.create({
        key: 'spin-windmill',
        frames: this.anims.generateFrameNumbers('windmill', { start: 0, end: 15 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists('hero-idle-anim')) {
      this.anims.create({
        key: 'hero-idle-anim',
        frames: this.anims.generateFrameNumbers('hero-idle', { start: 0, end: 11 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this.anims.exists('hero-run-anim')) {
      this.anims.create({
        key: 'hero-run-anim',
        frames: this.anims.generateFrameNumbers('hero-run', { start: 0, end: 17 }),
        frameRate: 12,
        repeat: -1,
      });
    }
    if (!this.anims.exists('hero-work-anim')) {
      this.anims.create({
        key: 'hero-work-anim',
        frames: this.anims.generateFrameNumbers('hero-attack', { start: 0, end: 13 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists('slime-hop')) {
      this.anims.create({
        key: 'slime-hop',
        frames: this.anims.generateFrameNumbers('slime-front', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // 1. Slice sub-frames from Ground Tiles.png
    const groundTex = this.textures.get('ground');
    if (!groundTex.has('grass-0')) groundTex.add('grass-0', 0, 0, 0, 16, 16);
    if (!groundTex.has('grass-1')) groundTex.add('grass-1', 0, 16, 0, 16, 16);
    if (!groundTex.has('grass-2')) groundTex.add('grass-2', 0, 32, 0, 16, 16);
    if (!groundTex.has('dirt-path')) groundTex.add('dirt-path', 0, 16, 416, 16, 16);
    if (!groundTex.has('water-tile')) groundTex.add('water-tile', 0, 16, 80, 16, 16);
    if (!groundTex.has('farmland-tile')) groundTex.add('farmland-tile', 0, 0, 416, 16, 16);
    if (!groundTex.has('cliff-tile')) groundTex.add('cliff-tile', 0, 16, 32, 16, 16);

    // 2. Slice sub-frames from PreMade Buildings.png
    const bldgTex = this.textures.get('buildings');
    if (!bldgTex.has('cottage-west')) bldgTex.add('cottage-west', 0, 16, 256, 112, 64);
    if (!bldgTex.has('cottage-east')) bldgTex.add('cottage-east', 0, 160, 256, 112, 64);
    if (!bldgTex.has('windmill-tower')) bldgTex.add('windmill-tower', 0, 416, 64, 64, 80);
    if (!bldgTex.has('workshop-shed')) bldgTex.add('workshop-shed', 0, 352, 64, 32, 80);

    // 3. Slice sub-frames from Building Props.png
    const propsTex = this.textures.get('props');
    if (!propsTex.has('stone-well')) propsTex.add('stone-well', 0, 16, 96, 32, 32);
    if (!propsTex.has('wooden-bridge')) propsTex.add('wooden-bridge', 0, 128, 48, 32, 16);
    if (!propsTex.has('barrel')) propsTex.add('barrel', 0, 0, 16, 16, 16);
    if (!propsTex.has('crates')) propsTex.add('crates', 0, 0, 32, 16, 16);
    if (!propsTex.has('workbench')) propsTex.add('workbench', 0, 32, 0, 32, 16);

    // 4. Slice sub-frames from Decor.png
    const decorTex = this.textures.get('decor');
    if (!decorTex.has('oak-tree')) decorTex.add('oak-tree', 0, 0, 0, 48, 64);
    if (!decorTex.has('pine-tree')) decorTex.add('pine-tree', 0, 80, 0, 32, 48);
    if (!decorTex.has('berry-bush')) decorTex.add('berry-bush', 0, 0, 144, 48, 32);
    if (!decorTex.has('campfire-lit')) decorTex.add('campfire-lit', 0, 0, 128, 16, 16);
    if (!decorTex.has('rock-large')) decorTex.add('rock-large', 0, 16, 48, 32, 32);
    if (!decorTex.has('flowers')) decorTex.add('flowers', 0, 32, 224, 16, 16);

    // 5. Slice sub-frames from Shadows.png
    const shadowTex = this.textures.get('shadows');
    if (!shadowTex.has('shadow-med')) shadowTex.add('shadow-med', 0, 0, 0, 48, 16);
    if (!shadowTex.has('shadow-large')) shadowTex.add('shadow-large', 0, 0, 16, 64, 32);

    // Render 20x14 cell base landscape using Ground Tiles.png
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 20; x++) {
        const px = x * 40;
        const py = y * 40;

        // River stream down column 0, with wooden bridge at y=6
        if (x === 0) {
          this.add.image(px, py, 'ground', 'water-tile')
            .setDisplaySize(40, 40)
            .setOrigin(0, 0)
            .setDepth(1);
          if (y === 6) {
            this.add.image(px, py + 8, 'props', 'wooden-bridge')
              .setDisplaySize(40, 24)
              .setOrigin(0, 0)
              .setDepth(2);
          }
          continue;
        }

        // Farmland soil plots around (14..16, 8..9)
        if (x >= 14 && x <= 16 && y >= 8 && y <= 9) {
          this.add.image(px, py, 'ground', 'farmland-tile')
            .setDisplaySize(40, 40)
            .setOrigin(0, 0)
            .setDepth(1);
          continue;
        }

        // Dirt paths connecting bridge, cottages, granary, and workshop
        const isPath = (y === 6 && x >= 1 && x <= 4)
          || (x === 5 && y >= 4 && y <= 6)
          || (y === 5 && x >= 5 && x <= 9)
          || (x === 9 && y >= 5 && y <= 7)
          || (y === 7 && x >= 9 && x <= 15)
          || (x === 12 && y === 6);

        if (isPath) {
          this.add.image(px, py, 'ground', 'dirt-path')
            .setDisplaySize(40, 40)
            .setOrigin(0, 0)
            .setDepth(1);
          continue;
        }

        // Cliff ridges at NW and NE corners
        if ((x === 1 && y === 0) || (x >= 18 && y <= 1)) {
          this.add.image(px, py, 'ground', 'cliff-tile')
            .setDisplaySize(40, 40)
            .setOrigin(0, 0)
            .setDepth(1);
          continue;
        }

        // Natural meadow grass with texture variations
        const variant = ['grass-0', 'grass-1', 'grass-2'][(x * 7 + y * 13) % 3];
        this.add.image(px, py, 'ground', variant)
          .setDisplaySize(40, 40)
          .setOrigin(0, 0)
          .setDepth(1);
      }
    }

    // Render permanent landmark structures using PreMade Buildings.png and Props
    this.renderLandmarkVisuals();

    // Night lighting overlay and cozy campfire glow
    this.night = this.add.rectangle(400, 280, 800, 560, 0x142136, 0).setDepth(8);
    this.campfireLight = this.add.circle(8 * 40 + 20, 5 * 40 + 20, 36, 0xf7b85e, 0).setDepth(9);

    // Selection ring
    this.selection = this.add.circle(0, 0, 18).setStrokeStyle(2.5, 0xffffff, 0.95).setDepth(12);

    // Title label
    this.add.text(28, 12, 'The Living Valley', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#1a332c',
      backgroundColor: '#edf3efdd',
      padding: { x: 8, y: 3 },
    }).setDepth(15);
  }

  private renderLandmarkVisuals(): void {
    // 1. Pioneer's Cottage at (5, 4) from PreMade Buildings.png
    const cwX = 5 * 40 + 20;
    const cwY = 4 * 40 + 20;
    this.add.image(cwX, cwY + 16, 'shadows', 'shadow-large').setScale(1.8).setDepth(2);
    const cottageWest = this.add.image(cwX, cwY + 8, 'buildings', 'cottage-west')
      .setOrigin(0.5, 0.7)
      .setScale(0.85)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    cottageWest.on('pointerdown', () => selectEntity('cottage-west', 'landmark'));

    const cottageWestText = this.add.text(cwX, cwY - 32, "Pioneer's Cottage", {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#233f38',
      backgroundColor: '#edf3efdd',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5).setDepth(7).setInteractive({ useHandCursor: true });
    cottageWestText.on('pointerdown', () => selectEntity('cottage-west', 'landmark'));

    // 2. Valley Haven Cottage at (15, 7) from PreMade Buildings.png
    const ceX = 15 * 40 + 20;
    const ceY = 7 * 40 + 20;
    this.add.image(ceX, ceY + 16, 'shadows', 'shadow-large').setScale(1.8).setDepth(2);
    const cottageEast = this.add.image(ceX, ceY + 8, 'buildings', 'cottage-east')
      .setOrigin(0.5, 0.7)
      .setScale(0.85)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    cottageEast.on('pointerdown', () => selectEntity('cottage-east', 'landmark'));

    const cottageEastText = this.add.text(ceX, ceY - 32, 'Valley Haven', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#233f38',
      backgroundColor: '#edf3efdd',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5).setDepth(7).setInteractive({ useHandCursor: true });
    cottageEastText.on('pointerdown', () => selectEntity('cottage-east', 'landmark'));

    // 3. Commons & Campfire Plaza at (9, 5) & (8, 5) from Building Props.png & Decor.png
    const comX = 9 * 40 + 20;
    const comY = 5 * 40 + 20;
    const stoneWell = this.add.image(comX, comY + 4, 'props', 'stone-well')
      .setScale(1.1)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    stoneWell.on('pointerdown', () => selectEntity('commons', 'landmark'));

    const fireX = 8 * 40 + 20;
    const fireY = 5 * 40 + 20;
    this.add.image(fireX, fireY + 4, 'decor', 'campfire-lit')
      .setScale(1.5)
      .setDepth(4);

    const commonsText = this.add.text(comX - 20, comY - 26, 'Commons & Well', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#233f38',
      backgroundColor: '#edf3efdd',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5).setDepth(7).setInteractive({ useHandCursor: true });
    commonsText.on('pointerdown', () => selectEntity('commons', 'landmark'));

    // 4. Valley Workshop at (12, 7) from PreMade Buildings.png & Props
    const wsX = 12 * 40 + 20;
    const wsY = 7 * 40 + 20;
    this.add.image(wsX, wsY + 16, 'shadows', 'shadow-med').setScale(1.5).setDepth(2);
    const workshopShed = this.add.image(wsX, wsY + 4, 'buildings', 'workshop-shed')
      .setOrigin(0.5, 0.7)
      .setScale(0.9)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    workshopShed.on('pointerdown', () => selectEntity('workshop', 'landmark'));

    this.add.image(wsX + 22, wsY + 14, 'props', 'workbench').setScale(1.2).setDepth(5);
    this.add.image(wsX - 20, wsY + 14, 'props', 'crates').setScale(1.2).setDepth(5);

    const workshopText = this.add.text(wsX, wsY - 32, 'Workshop', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#233f38',
      backgroundColor: '#edf3efdd',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5).setDepth(7).setInteractive({ useHandCursor: true });
    workshopText.on('pointerdown', () => selectEntity('workshop', 'landmark'));

    // 5. Village Windmill & Granary at (9, 7) from PreMade Buildings.png & WindmillBlade-Animation.png
    const wmX = 9 * 40 + 20;
    const wmY = 7 * 40 + 16;
    this.add.image(wmX, wmY + 18, 'shadows', 'shadow-large').setScale(1.6).setDepth(2);

    const windmillTower = this.add.image(wmX, wmY - 4, 'buildings', 'windmill-tower')
      .setOrigin(0.5, 0.6)
      .setScale(1.0)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    windmillTower.on('pointerdown', () => selectEntity('granary', 'landmark'));

    this.add.image(wmX - 18, wmY + 16, 'props', 'barrel').setScale(1.2).setDepth(5);
    this.add.image(wmX + 18, wmY + 16, 'props', 'crates').setScale(1.2).setDepth(5);

    // Animated Windmill Blades
    this.windmillBlade = this.add.sprite(wmX, wmY - 38, 'windmill')
      .setDepth(6)
      .setScale(0.68)
      .setInteractive({ useHandCursor: true });
    this.windmillBlade.play('spin-windmill');
    this.windmillBlade.on('pointerdown', () => selectEntity('granary', 'landmark'));

    const granaryText = this.add.text(wmX, wmY + 28, 'Windmill & Granary', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#233f38',
      backgroundColor: '#edf3efdd',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5).setDepth(7).setInteractive({ useHandCursor: true });
    granaryText.on('pointerdown', () => selectEntity('granary', 'landmark'));

    // Nature decor: Rocks and Flowers
    this.add.image(18 * 40 + 20, 2 * 40 + 20, 'decor', 'rock-large').setScale(1.1).setDepth(3);
    this.add.image(17 * 40 + 12, 11 * 40 + 12, 'decor', 'flowers').setScale(1.3).setDepth(3);
  }

  update(): void {
    if (!snapshot) return;
    const w = snapshot.world;

    const targetAlpha = snapshot.phase === 'night' ? 0.45 : 0;
    this.night.alpha = Phaser.Math.Linear(this.night.alpha, targetAlpha, 0.08);
    this.campfireLight.alpha = snapshot.phase === 'night' ? 0.28 : 0;

    // Render / update resource nodes using Decor.png
    if (!this.resources.size) {
      for (const p of w.patches) {
        const x = p.x * 40 + 20;
        const y = p.y * 40 + 20;
        if (p.resource === 'wood') {
          if (p.id === 'east-wood') {
            // Pine grove at (13, 3)
            this.add.image(x, y + 14, 'shadows', 'shadow-med').setScale(1.2).setDepth(2);
            this.add.image(x, y + 6, 'decor', 'pine-tree').setScale(1.15).setDepth(4);
          } else {
            // Oak tree grove at (4, 10)
            this.add.image(x, y + 14, 'shadows', 'shadow-large').setScale(1.2).setDepth(2);
            this.add.image(x, y + 4, 'decor', 'oak-tree').setScale(0.95).setDepth(4);
          }
        } else {
          // Lush berry bushes from Decor.png
          this.add.image(x, y + 12, 'shadows', 'shadow-med').setScale(1.1).setDepth(2);
          this.add.image(x, y + 6, 'decor', 'berry-bush').setScale(0.95).setDepth(4);
        }
        const label = this.add.text(x, y - 32, '', {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#233f38',
          backgroundColor: '#edf3efdd',
          padding: { x: 4, y: 1 },
        }).setOrigin(0.5).setDepth(7);
        this.resources.set(p.id, label);
      }
    }

    for (const p of w.patches) {
      const lbl = this.resources.get(p.id);
      if (lbl) lbl.setText(`${p.resource}: ${p.quantity}`);
    }

    // Render / update Pippin the meadow slime
    if (w.critters && w.critters.length > 0) {
      const c = w.critters[0];
      const cx = c.x * 40 + 20;
      const cy = c.y * 40 + 20;
      if (!this.critterSprite) {
        this.critterSprite = this.add.sprite(cx, cy, 'slime-front')
          .setDepth(6)
          .setScale(0.9)
          .setInteractive({ useHandCursor: true });
        this.critterSprite.play('slime-hop');
        this.critterSprite.on('pointerdown', () => selectEntity('pippin', 'critter'));

        this.add.text(cx, cy - 20, 'Pippin', {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#d46b28',
          backgroundColor: '#edf3efdd',
          padding: { x: 3, y: 0 },
        }).setOrigin(0.5).setDepth(7);
      }
      this.critterSprite.setPosition(cx, cy);
      if (selectedCategory === 'critter' && selectedId === 'pippin') {
        this.selection.setPosition(cx, cy);
      }
    }

    // Render / update inhabitants
    for (const a of w.inhabitants) {
      let actor = this.actors.get(a.id);
      let bubble = this.bubbles.get(a.id);

      if (!actor) {
        const charColor = Phaser.Display.Color.HexStringToColor(a.color).color;
        // Shadow from Shadows.png
        const shadow = this.add.image(0, 14, 'shadows', 'shadow-med').setScale(0.6).setAlpha(0.7);
        // Base character sprite
        const sprite = this.add.sprite(0, 0, 'hero-idle').setScale(0.85);
        sprite.play('hero-idle-anim');

        // Color aura badge
        const colorDot = this.add.circle(0, 12, 4, charColor).setStrokeStyle(1.5, 0x233f38);

        // Name tag
        const label = this.add.text(0, 18, a.name, {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#233f38',
          backgroundColor: '#edf3efdd',
          padding: { x: 4, y: 1 },
        }).setOrigin(0.5, 0);

        actor = this.add.container(0, 0, [shadow, sprite, colorDot, label]).setDepth(7);
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', () => selectEntity(a.id, 'inhabitant'));
        this.actors.set(a.id, actor);

        bubble = this.add.text(0, 0, '💭', {
          fontSize: '16px',
          backgroundColor: '#ffffffdd',
          padding: { x: 3, y: 1 },
        }).setOrigin(0.5, 1).setDepth(8);
        this.bubbles.set(a.id, bubble);
      }

      const sprite = actor.list[1] as Phaser.GameObjects.Sprite;
      const isMoving = a.plan && (a.x !== a.plan.destination.x || a.y !== a.plan.destination.y);
      const isWorking = a.plan && !isMoving && (a.plan.action.kind === 'gather' || a.plan.action.kind === 'deposit');

      if (isMoving) {
        if (sprite.anims.currentAnim?.key !== 'hero-run-anim') sprite.play('hero-run-anim');
      } else if (isWorking) {
        if (sprite.anims.currentAnim?.key !== 'hero-work-anim') sprite.play('hero-work-anim');
      } else {
        if (sprite.anims.currentAnim?.key !== 'hero-idle-anim') sprite.play('hero-idle-anim');
      }

      const sharing = w.inhabitants.filter(other => other.x === a.x && other.y === a.y);
      const index = sharing.findIndex(other => other.id === a.id);
      const offsets = [[-8, -8], [8, 8], [-8, 8], [8, -8]];
      const [dx, dy] = sharing.length > 1 ? offsets[index] : [0, 0];

      const targetX = a.x * 40 + 20 + dx;
      const targetY = a.y * 40 + 20 + dy;

      actor.x = Phaser.Math.Linear(actor.x || targetX, targetX, 0.25);
      actor.y = Phaser.Math.Linear(actor.y || targetY, targetY, 0.25);

      (actor.list[3] as Phaser.GameObjects.Text).setY(18 + (sharing.length > 1 ? index * 12 : 0));

      if (bubble) {
        const emoji = a.plan ? actionEmoji(a.plan.action.kind) : '💭';
        bubble.setText(emoji);
        bubble.setPosition(actor.x, actor.y - 20);
      }

      if (selectedCategory === 'inhabitant' && a.id === selectedId) {
        this.selection.setPosition(actor.x, actor.y);
      }
    }
  }
}

new Phaser.Game({
  type: Phaser.CANVAS,
  parent: 'valley',
  width: 800,
  height: 560,
  backgroundColor: '#538569',
  scene: ValleyScene,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  banner: false,
  audio: { noAudio: true },
  fps: { target: 24, forceSetTimeOut: true },
});

void poll();
