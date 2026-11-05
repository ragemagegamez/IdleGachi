/* IdleGachi promo site. Every sprite here comes from the game's own pixel data (assets/gamedata.js). */
(() => {
const G = window.GD, $ = s => document.querySelector(s), RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- sprite helpers: 0 empty, 1 ink, 2 light, 3 mid ---------- */
const grid = (s, N) => { N = N || Math.round(Math.sqrt(s.length)); const g = []; for (let y = 0; y < N; y++) { const r = []; for (let x = 0; x < N; x++) r.push(+s[y * N + x]); g.push(r) } return g };
const pet = id => grid(G.PETSPR[id]);
const foe = (z, i) => grid(G.NEWSPR[z][i], i == 4 ? 26 : 22);
function spr(c, g, x, y, sc, pal, flip) {
  g.forEach((row, j) => row.forEach((v, i) => { if (!v) return; c.fillStyle = pal[v - 1];
    c.fillRect(Math.round(x + (flip ? row.length - 1 - i : i) * sc), Math.round(y + j * sc), sc, sc) }));
}
/* evolution lines. Every form uses the game's normal screen palette [ink, light, mid];
   colours only change through shiny hatches and gacha variant eggs (see VARS). */
const NORM = ['#2c3823', '#eaf5e0', '#8fa688'];
const LINE = {
  A: { n: 'Flame & Steel', root: 'i1', pal: NORM, bg: '#7fb6a0' },
  B: { n: 'Tide & Bloom', root: 'i2', pal: NORM, bg: '#7fb6a0' },
  C: { n: 'Gale & Spirit', root: 'i3', pal: NORM, bg: '#7fb6a0' },
  D: { n: 'Dusk & Dread', root: 'i4', pal: NORM, bg: '#7fb6a0' },
  E: { n: 'Dawn & Halo', root: 'i5', pal: NORM, bg: '#7fb6a0' }
};
const LCD = NORM, FOE = ['#14081c', '#ffe6b0', '#ff7a3d'];
const EVM = {}; G.EV.forEach(e => EVM[e.id] = e);
const rootOf = id => EVM[id].p ? rootOf(EVM[id].p) : id;
const lineOf = id => Object.keys(LINE).find(k => LINE[k].root == rootOf(id));
const stageOf = id => ({ i: 'Baby', c: 'Child', a: 'Adult', u: 'Ultimate' })[id[0]];
const STC = { Baby: '#9fb0e8', Child: '#5be36b', Adult: '#ffd23f', Ultimate: '#ff4a4a' };

/* ---------- 16px icons ---------- */
const ICO = {
  egg: ['......1111......', '.....122221.....', '....12222221....', '...1222222221...', '...1223222221...', '..122333222221..', '..122222222221..', '..122222233221..', '..122222233321..', '..112222222211..', '..133112211331..', '..133331133331..', '...1333333331...', '....11333311....', '......1111......', '................'],
  pick: ['................', '...111111111....', '..12222222221...', '.1211111112221..', '.11.....1.1121..', '.......121..121.', '......121....11.', '.....121........', '....121.........', '...121..........', '..131...........', '.131............', '131.............', '11..............', '................', '................'],
  sword: ['.............11.', '............1221', '...........12221', '..........12221.', '.........12221..', '........12221...', '..11...12221....', '..131.12221.....', '...13112221.....', '....131221......', '....13331.......', '...1311131......', '..131...131.....', '.131.....11.....', '.11.............', '................'],
  crown: ['................', '.1.....11.....1.', '121...1221...121', '1221.122221.1221', '1222122222212221', '1222222222222221', '1223322332233221', '1222222222222221', '1222222222222221', '1333333333333331', '1311131111311131', '1333333333333331', '.11111111111111.', '................', '................', '................']
};
const ICP = { egg: ['#1a1030', '#fff4dc', '#ffb35a'], pick: ['#1a1030', '#c8d4ff', '#a0603a'], sword: ['#1a1030', '#e8f0ff', '#ffd23f'], crown: ['#1a1030', '#ffd23f', '#ff4a4a'] };
document.querySelectorAll('canvas[data-ico]').forEach(cv => { const k = cv.dataset.ico, c = cv.getContext('2d');
  spr(c, ICO[k].map(r => [...r].map(ch => ch == '.' ? 0 : +ch)), 0, 0, 1, ICP[k]) });
document.querySelectorAll('canvas[data-mon]').forEach(cv => spr(cv.getContext('2d'), pet(cv.dataset.mon), 0, 0, 1, NORM));

/* ---------- shared drawing: Dragon Quest window and text ---------- */
const FONT = "'Press Start 2P', monospace";
function dqWin(c, x, y, w, h, fill) {
  c.fillStyle = fill || '#000'; c.fillRect(x, y, w, h);
  c.fillStyle = '#fff'; c.fillRect(x + 3, y + 2, w - 6, 2); c.fillRect(x + 3, y + h - 4, w - 6, 2);
  c.fillRect(x + 2, y + 3, 2, h - 6); c.fillRect(x + w - 4, y + 3, 2, h - 6);
}
function txt(c, s, x, y, col, size) { c.font = (size || 8) + 'px ' + FONT; c.fillStyle = col || '#fff'; c.textBaseline = 'top'; c.fillText(s, x, y) }
function bar(c, x, y, w, h, f, col) { c.fillStyle = '#000'; c.fillRect(x, y, w, h); c.fillStyle = '#fff'; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
  c.fillStyle = col; c.fillRect(x + 2, y + 2, Math.round((w - 4) * f), h - 4) }
function blueGrad(c, w, h) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a4ad0'); g.addColorStop(.6, '#0e1c78'); g.addColorStop(1, '#060c3a'); c.fillStyle = g; c.fillRect(0, 0, w, h) }

/* ---------- hero: a little overworld, Dragon Quest style ---------- */
const MAP = [
  'WWWWWWWWWWWWWWWWWWWWWWWWW',
  'WWSSSSWWWWWWWWWMMMMMWWWWW',
  'WSGGGGSSWWWWWMMMMHMMMWWWW',
  'WSGTTGGGSSWWMMHGGGMMMMWWW',
  'WSGTTGGCGGSSSGGGGGGHMMMWW',
  'WSGGGGGPGGGGGGGTTGGGGMMWW',
  'WWSGGGGPPPPPPPPTTTGGGGMWW',
  'WWSGTGGGGGGGGGPGTTGGGGSWW',
  'WWWSGGGTTGGGGGPGGGGGGSWWW',
  'WWWWSGGWWWWSGGPPPPGGSWWWW',
  'WWWSGGGGWWWSGTTGGPSSWWWWW',
  'WWSGGTGGGWWWSGTTGPGSWWWWW',
  'WWSGGGGPPPBBBPPPPPGSWWWWW',
  'WWWSSGGGGWWWSGGGGGSWWWWWW',
  'WWWWWSSSSWWWWSSSSSWWWWWWW'
];
const PATH = [[7, 5], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [14, 7], [14, 8], [14, 9], [15, 9], [16, 9], [17, 9], [17, 10], [17, 11], [17, 12], [16, 12], [15, 12], [14, 12], [13, 12], [12, 12], [11, 12], [10, 12], [9, 12], [8, 12], [7, 12]];
function tile(c, t, x, y, n) {
  const X = x * 8, Y = y * 8;
  const P = (col, a, b, w, h) => { c.fillStyle = col; c.fillRect(X + a, Y + b, w, h) };
  if (t == 'W' || t == 'B') { P('#2440d8', 0, 0, 8, 8); const k = ((n / 500 | 0) + x + y) % 3; P('#8cb4ff', (k * 3) % 8, 2 + k, 3, 1); P('#8cb4ff', (k * 3 + 4) % 8, 6 - k, 2, 1) }
  if (t == 'B') { P('#8a5420', 0, 1, 8, 6); P('#5a3410', 0, 1, 8, 1); P('#5a3410', 0, 6, 8, 1); P('#5a3410', 3, 1, 1, 6); P('#5a3410', 7, 1, 1, 6) }
  if (t == 'S') { P('#e8cc80', 0, 0, 8, 8); P('#c8a860', 2, 3, 1, 1); P('#c8a860', 6, 6, 1, 1) }
  if ('GTCMHP'.includes(t)) { P('#38a838', 0, 0, 8, 8); P('#1e7a24', (x * 5 + y) % 6, (y * 3 + x) % 6, 1, 2); P('#1e7a24', (x * 3 + 4) % 7, (y * 5 + 2) % 7, 1, 1) }
  if (t == 'P') { P('#c89a5a', 0, 0, 8, 8); P('#a07438', 1, 2, 1, 1); P('#a07438', 5, 5, 1, 1) }
  if (t == 'T') { P('#0c5a18', 1, 0, 6, 6); P('#0c5a18', 0, 1, 8, 4); P('#4ac84a', 2, 1, 2, 2); P('#6a3a10', 3, 6, 2, 2) }
  if (t == 'H') { P('#2a8a2a', 1, 3, 6, 5); P('#2a8a2a', 2, 2, 4, 1); P('#5ad45a', 2, 3, 2, 1) }
  if (t == 'M') { P('#8a6a4a', 0, 7, 8, 1); P('#8a6a4a', 1, 5, 6, 2); P('#8a6a4a', 2, 3, 4, 2); P('#8a6a4a', 3, 1, 2, 2); P('#fff', 3, 1, 2, 1); P('#5a4028', 4, 3, 2, 4) }
  if (t == 'C') { P('#a0a0b8', 1, 2, 6, 6); P('#a0a0b8', 0, 1, 2, 7); P('#a0a0b8', 6, 1, 2, 7); P('#fff', 0, 1, 1, 1); P('#fff', 7, 1, 1, 1); P('#202040', 3, 5, 2, 3); P('#ff3a3a', 4, -2 + ((n / 400 | 0) & 1), 2, 1); P('#fff', 3, -2, 1, 3) }
}
const wc = $('#world').getContext('2d'), WALK = pet('i1');
function world(n) {
  MAP.forEach((r, y) => [...r].forEach((t, x) => tile(wc, t, x, y, n)));
  const L = PATH.length, ph = (n / 650) % (2 * L - 2), f = ph < L - 1 ? ph : 2 * L - 2 - ph, i = Math.floor(f), fr = f - i;
  const a = PATH[i], b = PATH[Math.min(i + 1, L - 1)], px = (a[0] + (b[0] - a[0]) * fr) * 8 - 3, py = (a[1] + (b[1] - a[1]) * fr) * 8 - 10;
  const goingLeft = (ph >= L - 1) ? (b[0] > a[0]) : (b[0] < a[0]);
  wc.fillStyle = 'rgba(0,0,0,.3)'; wc.fillRect(Math.round(px) + 2, Math.round(py) + 14, 11, 2);
  spr(wc, WALK, px, py - ((n / 160 | 0) & 1), 1, LINE.A.pal, goingLeft);
}

/* ---------- hero dialog: typewriter ---------- */
const LINES = ['A capsule rolled out of thy Gachivice!', 'The capsule is hatching...', 'EMBYTE appeared! It looks hungry.', 'EMBYTE learned to mine STONE.', 'Thy EMBYTE is evolving!', 'BRIAR KING draws near!'];
let li = 0, ci = 0, hold = 0;
function typer() {
  const el = $('#typer'), s = LINES[li];
  if (RM) { el.textContent = s; li = (li + 1) % LINES.length; return setTimeout(typer, 2600) }
  if (ci <= s.length) { el.textContent = s.slice(0, ci++); return setTimeout(typer, 45) }
  if (hold++ < 1) return setTimeout(typer, 1800);
  hold = 0; ci = 0; li = (li + 1) % LINES.length; setTimeout(typer, 120);
}

/* ---------- screenshot 1: the Gachivice care screen ---------- */
const careC = $('#sc-care').getContext('2d'), CPET = pet('c1');
function care(n) {
  const c = careC; c.imageSmoothingEnabled = false; blueGrad(c, 256, 192);
  txt(c, 'CINDERPUP', 12, 8, '#ffd23f'); txt(c, 'AGE 4D', 196, 8, '#c8d4ff');
  c.fillStyle = '#4a3a30'; c.fillRect(8, 22, 240, 98); c.fillStyle = '#b8d8c8'; c.fillRect(12, 26, 232, 90);
  c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = 12; x < 244; x += 3) c.fillRect(x, 26, 1, 90); for (let y = 26; y < 116; y += 3) c.fillRect(12, y, 232, 1);
  c.fillStyle = '#8fa688'; c.fillRect(12, 104, 232, 2);
  const t = n / 1000, px = 128 - 32 + Math.round(Math.sin(t * .9) * 40), hop = (n / 300 | 0) & 1;
  spr(c, CPET, px, 104 - 63 - hop * 3, 3, LCD, Math.cos(t * .9) < 0);
  [[200, 98], [208, 98], [204, 94]].forEach(([x, y]) => { c.fillStyle = '#2c3823'; c.fillRect(x, y, 6, 4) });
  if ((n / 700 | 0) & 1) { c.fillStyle = '#2c3823'; c.fillRect(206, 88, 1, 3); c.fillRect(210, 86, 1, 4) }
  [['#ff7a8a', 'HP', 0.82], ['#ffb35a', 'FOOD', 0.46]].forEach(([col, l, f], i) => {
    txt(c, l, 12, 128 + i * 11, '#fff'); bar(c, 52, 127 + i * 11, 130, 9, f, col) });
  txt(c, 'POW 18', 192, 128, '#fff'); txt(c, 'VIT 14', 192, 139, '#fff'); txt(c, 'SPD 9', 192, 150, '#fff');
  ['FEED', 'BED', 'CLEAN', 'CURE'].forEach((l, i) => { const x = 8 + i * 61, sel = i == ((n / 1400 | 0) % 4);
    dqWin(c, x, 162, 57, 24, sel ? '#2348c8' : '#000'); txt(c, l, x + 28 - l.length * 4, 170, sel ? '#ffd23f' : '#fff') });
}

/* ---------- screenshot 2: evolution line ---------- */
const evoC = $('#sc-evo').getContext('2d');
function evo(n) {
  const c = evoC; c.fillStyle = '#000'; c.fillRect(0, 0, 256, 192); dqWin(c, 2, 2, 252, 188);
  txt(c, 'FLAME & STEEL LINE', 56, 12, '#ffd23f');
  const cells = [['i1', 8, 26, 3], ['c1', 132, 26, 3], ['a1', 132, 106, 2], ['u1', 8, 106, 2]];
  const lit = (n / 900 | 0) % 4;
  cells.forEach(([id, x, y, sc], k) => {
    const g = pet(id), s = g.length * sc, on = k == lit;
    c.fillStyle = on ? '#3a1408' : '#0c0c24'; c.fillRect(x + 6, y, 104, 72);
    if (on) { c.strokeStyle = '#ffd23f'; c.lineWidth = 2; c.strokeRect(x + 7, y + 1, 102, 70) }
    spr(c, g, x + 58 - s / 2, y + 30 - s / 2 + (on && ((n / 150 | 0) & 1) ? -1 : 0), sc, LINE.A.pal);
    const nm = EVM[id].n.toUpperCase(); txt(c, nm, x + 58 - nm.length * 4, y + 62, on ? '#ffd23f' : '#fff');
    txt(c, stageOf(id).toUpperCase(), x + 10, y + 3, STC[stageOf(id)]);
  });
  const blink = (n / 400 | 0) & 1 ? '#fff' : '#ffd23f';
  txt(c, '▶', 119, 58, blink); txt(c, '▼', 186, 98, blink); txt(c, '◀', 119, 138, blink);
}

/* ---------- screenshot 3: boss battle (zone 1, Meadow) ---------- */
const bossC = $('#sc-boss').getContext('2d'), BOSS = foe(0, 4), HERO = pet('c1');
const mix = (a, b, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.substr(i, 2), 16)), x = h(a), y = h(b); return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',') + ')' };
function boss(n) {
  const c = bossC, P = G.BPAL[0], t = n / 1000;
  for (let i = 0; i < 20; i++) { c.fillStyle = mix(P[0], P[1], i / 19); c.fillRect(0, i * 6, 256, 7) }
  c.fillStyle = mix(P[1], P[3], .45); for (let x = 0; x < 256; x += 2) { const h = 18 + 10 * Math.sin(x / 18) + 6 * Math.sin(x / 7); c.fillRect(x, Math.round(112 - h), 2, Math.round(h) + 2) }
  c.fillStyle = P[2]; c.fillRect(0, 112, 256, 80); c.fillStyle = P[3]; for (let y = 116; y < 192; y += 6) c.fillRect(0, y, 256, 1);
  c.fillStyle = P[4]; for (let i = 0; i < 22; i++) { const r = (i * 97.13) % 1, r2 = (i * 53.71) % 1; c.fillRect(Math.round((r * 256 + Math.sin(t * .8 + i) * 6) % 256), Math.round((r2 * 140 + t * (10 + r * 10)) % 140), 2, 2) }
  const shake = ((n / 2200 | 0) % 3 == 2) && ((n / 60 | 0) & 1) ? 2 : 0;
  spr(c, BOSS, 128 - 39 + shake, 34 + Math.round(Math.sin(t * 2) * 2), 3, FOE);
  spr(c, HERO, 24, 86, 2, LINE.A.pal);
  dqWin(c, 4, 4, 92, 34); txt(c, 'CINDERPUP', 12, 11, '#fff'); txt(c, 'H 42/50', 12, 23, '#fff');
  dqWin(c, 150, 4, 102, 22); txt(c, 'BRIAR KING', 158, 11, '#ff6a5a');
  dqWin(c, 4, 132, 84, 56);
  const sel = (n / 900 | 0) % 4; ['FIGHT', 'ITEM', 'CARE', 'RUN'].forEach((l, i) => { txt(c, l, 22, 140 + i * 11, '#fff'); if (i == sel && ((n / 300 | 0) & 1)) txt(c, '▶', 10, 140 + i * 11, '#fff') });
  dqWin(c, 92, 132, 160, 56); txt(c, 'BRIAR KING', 102, 142, '#fff'); txt(c, 'draws near!', 102, 154, '#fff'); txt(c, 'Command?', 102, 170, '#ffd23f');
}

/* ---------- screenshot 4: training list ---------- */
const skC = $('#sc-skill').getContext('2d');
const SKR = [['MINING', 34, '#c8d4ff'], ['FISHING', 21, '#7ad0ff'], ['FORAGING', 28, '#7aff8a'], ['WOODCUT', 17, '#d0a060'], ['COOKING', 25, '#ffb35a'], ['SMITHING', 30, '#ff8a6a'], ['CRAFTING', 12, '#ffd23f'], ['ALCHEMY', 9, '#d09cff']];
function skills(n) {
  const c = skC; blueGrad(c, 256, 192); txt(c, 'TRAIN', 12, 8, '#ffd23f'); txt(c, 'Lv', 176, 8, '#c8d4ff');
  const sel = 0;
  SKR.forEach(([nm, lv, col], i) => { const y = 24 + i * 15;
    if (i == sel) { c.fillStyle = 'rgba(255,210,63,.18)'; c.fillRect(6, y - 3, 244, 14); if ((n / 300 | 0) & 1) txt(c, '▶', 8, y, '#fff') }
    c.fillStyle = col; c.fillRect(22, y, 7, 7); txt(c, nm, 34, y, i == sel ? '#ffd23f' : '#fff'); txt(c, String(lv), 176, y, '#fff');
    bar(c, 200, y, 48, 8, ((lv * 37) % 100) / 100, col) });
  dqWin(c, 4, 146, 248, 42); txt(c, 'Mining Iron...', 14, 154, '#fff');
  const p = (n % 6000) / 6000; bar(c, 14, 168, 160, 10, p, '#c8d4ff'); txt(c, ((1 - p) * 6).toFixed(1) + 's', 184, 169, '#ffd23f');
  if (p > .92) txt(c, '+1 IRON', 184, 154, '#5be36b');
}

/* ---------- animation loop (only while visible) ---------- */
const vis = new Set();
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? vis.add(e.target.id) : vis.delete(e.target.id)));
['world', 'sc-care', 'sc-evo', 'sc-boss', 'sc-skill'].forEach(id => io.observe(document.getElementById(id)));
const DRAW = { world, 'sc-care': care, 'sc-evo': evo, 'sc-boss': boss, 'sc-skill': skills };
function frame(n) { vis.forEach(id => DRAW[id](n)); if (!RM) requestAnimationFrame(frame) }
document.fonts.ready.then(() => { Object.values(DRAW).forEach(f => f(1000)); if (RM) setInterval(() => frame(performance.now()), 1000); else requestAnimationFrame(frame); typer() });

/* =================== WIKI =================== */
const SN = { pow: 'Power', vit: 'Vitality', spd: 'Speed', foc: 'Focus' };
const SKN = { mine: 'Mining', fish: 'Fishing', forage: 'Foraging', woodcut: 'Woodcutting', cook: 'Cooking', smith: 'Smithing', craft: 'Crafting', alch: 'Alchemy' };
const SKS = { mine: 'pow', fish: 'foc', forage: 'spd', woodcut: 'vit', cook: 'vit', smith: 'pow', craft: 'spd', alch: 'foc' };
const FX = { dmg: 'Damage', hp: 'Max HP', xp: 'Skill XP', crit: 'Crit', iv: 'Attack speed', heal: 'Food healing' };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const fxTxt = fx => Object.entries(fx).map(([k, v]) => '+' + Math.round(v * 100) + '% ' + (FX[k] || k)).join(', ');
function reqTxt(r) {
  const o = [];
  for (const k in SN) if (r[k]) o.push(SN[k] + ' ' + r[k]);
  if (r.sk) for (const k in r.sk) o.push(SKN[k] + ' Lv ' + r.sk[k]);
  if (r.z != null) o.push('reach ' + G.ZONES[r.z].n);
  if (r.tr) o.push((r.tr.length > 1 ? 'traits ' : 'trait ') + r.tr.map(i => G.TR[i].n).join(' + '));
  if (r.g) o.push('life ' + r.g + '+');
  if (r.it) for (const k in r.it) o.push(r.it[k] + '× ' + (G.IDN[k] || k));
  return o.join(', ');
}

let dexLine = 'all', dexQ = '';
function dexHTML() {
  const chips = ['all', ...Object.keys(LINE)].map(k => `<button class="chip" data-line="${k}" aria-pressed="${dexLine == k}">${k == 'all' ? 'All lines' : LINE[k].n}</button>`).join('');
  return `<h3>Gachimon</h3><p>Every Gachimon hatches as one of five babies. Each one starts its own evolution line. Your stats, skill levels, traits and progress decide which branch it takes. Forms marked <em style="font-style:normal;color:var(--red)">Ultimate</em> also need crafted items and several lives of growth. Evolving never changes your Gachimon's colours. Those come from shiny hatches and the variant eggs you can win from the gacha.</p>
  <div class="tools"><input id="dexq" type="search" placeholder="Search Gachimon..." value="${esc(dexQ)}" aria-label="Search Gachimon">${chips}</div><div class="dex" id="dexg"></div>`;
}
function dexFill() {
  const q = dexQ.trim().toLowerCase(), list = G.EV.filter(e => (dexLine == 'all' || lineOf(e.id) == dexLine) && (!q || e.n.toLowerCase().includes(q)));
  const el = $('#dexg');
  el.innerHTML = list.length ? list.map(e => {
    const L = LINE[lineOf(e.id)], st = stageOf(e.id), par = e.p ? EVM[e.p].n : null, no = String(G.EV.indexOf(e) + 1).padStart(3, '0');
    return `<article class="mon"><div class="pic" style="--bg:${L.bg}"><canvas width="1" height="1" data-id="${e.id}"></canvas></div>
      <span class="no">No.${no} · ${L.n}</span><b>${esc(e.n)}</b><span class="st" style="--c:${STC[st]}">${st}</span>
      <small>${par ? 'From <em>' + esc(par) + '</em>. Needs ' + esc(reqTxt(e.r) || 'nothing extra') : 'Hatches from a capsule egg.'}</small>
      ${Object.keys(e.fx).length ? `<small>Bonus: ${esc(fxTxt(e.fx))}</small>` : ''}</article>`
  }).join('') : '<p>No Gachimon match that search.</p>';
  el.querySelectorAll('canvas[data-id]').forEach(cv => { const g = pet(cv.dataset.id), N = g.length, sc = Math.max(1, Math.floor(96 / N));
    cv.width = N * sc; cv.height = N * sc; spr(cv.getContext('2d'), g, 0, 0, sc, LINE[lineOf(cv.dataset.id)].pal) });
}

const PAGES = {
  dex: dexHTML,
  care: () => `<h3>Care basics</h3>
    <p>A new game starts with a capsule egg. It hatches after <b>3 minutes</b> and you get to name your partner. Each hatch has a <b>1 in 256</b> chance to be <span class="hl">shiny</span>.</p>
    <h4>Health and hunger</h4><p>Health drops in fights and comes back with food. Hunger falls over time, so cook meals from your Fishing and Foraging hauls. In Options you can set your Gachimon to eat on its own when hunger hits 30%, 50% or 70%.</p>
    <h4>Sleep</h4><p>Your Gachimon gets tired. Pick a bedtime between 8 PM and 2 AM in Options, or give it a quick nap during the day. Sleeping Gachimon sometimes dream, and you can tap the dream to see it.</p>
    <h4>Cleaning and sickness</h4><p>Clean up the droppings before your partner gets sick. Remedies from Alchemy cure it, and auto-cure can use them for you.</p>
    <h4>Fainting and rebirth</h4><p>When health runs out in a quest, your Gachimon faints and rests with 25% health. If a zone keeps beating you, <b>reincarnate</b>. The new life keeps 25% of its stats and all of its skills. Some Ultimate forms only unlock after several lives.</p>
    <h4>Saving</h4><p>Your game saves in the browser. Create an online account to save to the cloud, or export a save code to move to another device.</p>`,
  stats: () => `<h3>Stats</h3><p>Stats grow from the skills your Gachimon works. Each skill feeds one stat.</p>
    <table><thead><tr><th>Stat</th><th>What it does</th><th>Trained by</th></tr></thead><tbody>
    <tr><td><b>Power</b></td><td>Damage per hit is 1 + Power</td><td>Mining, Smithing</td></tr>
    <tr><td><b>Vitality</b></td><td>Max HP is 20 + 5 × Vitality</td><td>Woodcutting, Cooking</td></tr>
    <tr><td><b>Speed</b></td><td>Time between attacks starts at 2.6s and drops 0.025s per point, down to 0.8s</td><td>Foraging, Crafting</td></tr>
    <tr><td><b>Focus</b></td><td>+0.5% crit chance per point (crits hit for double damage, up to 60% crit chance)</td><td>Fishing, Alchemy</td></tr>
    </tbody></table>
    <h4>Bonuses</h4><p>Evolution forms, traits, enchantments and charms add percentage bonuses on top: Damage, Max HP, Attack speed, Crit, Skill XP and Food healing. Skill XP bonuses have diminishing returns.</p>`,
  skills: () => `<h3>Skills</h3><p>Gathering skills collect raw resources. Production skills turn them into bars, parts, meals and potions. New tiers unlock as the skill levels up.</p>
    <div class="skl">${Object.keys(SKN).map(k => `<div class="mon"><b>${SKN[k]}</b><small>Raises ${SN[SKS[k]]}</small><div class="tier">${G.ITEMS[k].map(it => `<span title="${esc(it.need.join(', '))}">${esc(it.n)} <i>Lv${it.lv}${it.heal ? ' +' + it.heal + 'HP' : ''}</i></span>`).join('')}</div></div>`).join('')}</div>
    <h4>Recipes</h4><p>Hover over a production item to see what it needs. For example, a <b>Copper Bar</b> takes 2 Copper, and <b>Herb Stew</b> takes 2 Herb and 1 Trout.</p>`,
  zones: () => `<h3>Zones &amp; bosses</h3><p>Questing sends your Gachimon through ten zones. Beat the four regular enemies in a zone to reach its boss, then win the hand-played boss fight to open the next zone.</p><div id="zl">${G.ZONES.map((z, i) => `<div class="zone"><canvas width="104" height="104" data-z="${i}"></canvas><div><b>${i + 1}. ${esc(z.n)}</b><br>Boss: <span class="boss">${esc(z.boss)}</span><br><small style="color:var(--muted)">${z.foes.map(esc).join(' · ')}</small><div class="bars"><span>Enemy HP ~${z.hp}</span><span>ATK ~${z.atk}</span><span>${z.xp} XP</span></div></div></div>`).join('')}</div>`,
  gacha: () => `<h3>Gacha &amp; variants</h3><p>Spend Gachipons on the gacha to win a random prize. Most pulls give supplies such as materials, cooked food and building materials. Some give exclusive cosmetics for your Gachivice, and a few give a <span class="hl">variant egg</span>.</p>
    <p>A variant egg is the only way to change your Gachimon's colours. Evolving does not change them: every form in a line keeps the same look unless it hatched from a variant egg or was born shiny.</p>
    <div class="dex">${VARS.map(v => `<article class="mon"><div class="pic" style="--bg:#7fb6a0"><canvas width="1" height="1" data-var="${v.k}"></canvas></div><b>${v.n}</b><small>${v.d}</small></article>`).join('')}</div>
    <h4>Using a variant egg</h4><p>Variant eggs wait in your collection until you choose your next egg. On that screen, tap the variant egg, then choose the line it should hatch into. The gacha's weekly specials also sell one variant egg each week. Variant eggs are kept through reincarnation, and every colour you immortalize gets its own spot in the Living Dex.</p>`,
  traits: () => `<h3>Traits</h3><p>Traits are permanent perks your Gachimon picks up along the way. Several evolutions need a particular trait.</p>
    <table><thead><tr><th>Trait</th><th>Effect</th></tr></thead><tbody>${G.TR.map(t => `<tr><td><b>${esc(t.n)}</b></td><td>${esc(fxTxt(t.fx))}</td></tr>`).join('')}</tbody></table>`
};
function zoneArt() {
  document.querySelectorAll('canvas[data-z]').forEach(cv => { const z = +cv.dataset.z, c = cv.getContext('2d'), P = G.BPAL[z];
    for (let i = 0; i < 13; i++) { c.fillStyle = mix(P[0], P[1], i / 12); c.fillRect(0, i * 6, 104, 7) }
    c.fillStyle = P[2]; c.fillRect(0, 76, 104, 28); c.fillStyle = P[3]; for (let y = 80; y < 104; y += 5) c.fillRect(0, y, 104, 1);
    spr(c, foe(z, 4), 13, 13, 3, ['#14081c', P[4], mix(P[4], '#14081c', .45)]) });
}
/* colour variants, matching the game: normal, shiny (1 in 256), and the gacha eggs */
const VARS = [
  { k: 'normal', n: 'Normal', d: 'The everyday look every Gachimon hatches with.', pal: NORM },
  { k: 'shiny', n: 'Shiny', d: 'A 1 in 256 chance on any hatch. Gold and purple.', pal: ['#6a2bb0', '#ffe66b', '#b79ad8'] },
  { k: 'gold', n: 'Golden Egg', d: 'Gacha prize. Always hatches a golden shiny.', pal: ['#7a4a08', '#fff0a0', '#f2b92e'] },
  { k: 'mighty', n: 'Mighty Egg', d: 'Gacha prize. Fiery orange colours and +6 to its first stat.', pal: ['#7a200a', '#ffc08a', '#ff7a3d'] },
  { k: 'rainbow', n: 'Rainbow Egg', d: 'Gacha prize. Shifting rainbow colours and +2 to all four stats.', rb: 1 }
];
function varArt() {
  document.querySelectorAll('canvas[data-var]').forEach(cv => { const v = VARS.find(x => x.k == cv.dataset.var), g = pet('c1'), N = g.length, sc = Math.max(1, Math.floor(96 / N)), c = cv.getContext('2d');
    cv.width = N * sc; cv.height = N * sc;
    if (!v.rb) return spr(c, g, 0, 0, sc, v.pal);
    g.forEach((row, y) => row.forEach((p, x) => { if (!p) return; c.fillStyle = 'hsl(' + ((x + y) * 26 % 360) + ',85%,' + [32, 78, 60][p - 1] + '%)'; c.fillRect(x * sc, y * sc, sc, sc) })) });
}
const pane = $('#wpane');
function show(w) {
  document.querySelectorAll('.wmenu button').forEach(b => b.setAttribute('aria-selected', b.dataset.w == w));
  pane.innerHTML = PAGES[w](); if (w == 'dex') dexFill(); if (w == 'zones') zoneArt(); if (w == 'gacha') varArt();
}
$('.wmenu').addEventListener('click', e => { const b = e.target.closest('button[data-w]'); if (b) show(b.dataset.w) });
pane.addEventListener('click', e => { const b = e.target.closest('[data-line]'); if (!b) return; dexLine = b.dataset.line;
  pane.querySelectorAll('[data-line]').forEach(x => x.setAttribute('aria-pressed', x.dataset.line == dexLine)); dexFill() });
pane.addEventListener('input', e => { if (e.target.id == 'dexq') { dexQ = e.target.value; dexFill() } });
show('dex');
})();
