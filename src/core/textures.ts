/**
 * Texturas generadas al arrancar (sin descargar nada): grano de tiza, la pizarra usada
 * y el cielo estrellado. Se exponen como variables CSS y como patrones para canvas.
 */
import { rng } from './math';

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  return { c, ctx };
}

/** Moteado negro con alfa aleatorio: al "borrar" con él, la tiza se vuelve granulosa. */
export function makeGrainCanvas(size = 220, density = 0.42, seed = 7) {
  const { c, ctx } = makeCanvas(size, size);
  const img = ctx.createImageData(size, size);
  const r = rng(seed);
  for (let i = 0; i < size * size; i++) {
    const v = r();
    const a = v < density ? Math.pow(r(), 0.7) * 235 : 0;
    img.data[i * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Máscara CSS para texto de tiza: opaca con huecos irregulares. */
function makeChalkMask(size = 240, seed = 11) {
  const { c, ctx } = makeCanvas(size, size);
  const img = ctx.createImageData(size, size);
  const r = rng(seed);
  for (let i = 0; i < size * size; i++) {
    const v = r();
    const a = v < 0.3 ? 70 + r() * 120 : 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = 255;
    img.data[i * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

/** Pizarra con borrones de tiza antiguos: se nota que se ha usado mucho. */
function makeBoard(w = 1920, h = 1080, seed = 3) {
  const { c, ctx } = makeCanvas(w, h);
  const r = rng(seed);
  const g = ctx.createRadialGradient(w * 0.45, h * 0.4, 100, w * 0.5, h * 0.5, w * 0.75);
  g.addColorStop(0, '#294438');
  g.addColorStop(1, '#1b2d26');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Borrones: arcos anchos y muy tenues, como pasadas de borrador.
  ctx.filter = 'blur(18px)';
  for (let i = 0; i < 26; i++) {
    const x = r() * w;
    const y = r() * h;
    const len = 220 + r() * 520;
    ctx.strokeStyle = `rgba(236,232,220,${0.018 + r() * 0.035})`;
    ctx.lineWidth = 40 + r() * 90;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + len * 0.3, y - 40 + r() * 80, x + len * 0.7, y - 40 + r() * 80, x + len, y + (r() - 0.5) * 60);
    ctx.stroke();
  }
  ctx.filter = 'none';
  // Polvo fino.
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(236,232,220,${r() * 0.05})`;
    ctx.fillRect(r() * w, r() * h, 1.2, 1.2);
  }
  // Viñeta.
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.72);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  return c.toDataURL('image/jpeg', 0.9);
}

/** Cielo profundo: miles de estrellas pequeñas, unas pocas brillantes y nebulosa tenue. */
function makeStarfield(w = 1920, h = 1080, seed = 21) {
  const { c, ctx } = makeCanvas(w, h);
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#04071200');
  ctx.fillStyle = '#060a19';
  ctx.fillRect(0, 0, w, h);
  const neb = [
    [0.18, 0.25, 520, 'rgba(70,90,190,0.10)'],
    [0.82, 0.7, 640, 'rgba(110,70,160,0.08)'],
    [0.55, 0.05, 460, 'rgba(40,110,170,0.07)'],
  ] as const;
  for (const [x, y, rad, col] of neb) {
    const ng = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, rad);
    ng.addColorStop(0, col);
    ng.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, w, h);
  }
  for (let i = 0; i < 2600; i++) {
    const x = r() * w;
    const y = r() * h;
    const s = Math.pow(r(), 6) * 1.8 + 0.35;
    const warm = r();
    const col = warm < 0.15 ? '255,220,190' : warm < 0.35 ? '190,205,255' : '235,238,250';
    ctx.fillStyle = `rgba(${col},${0.25 + r() * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 28; i++) {
    const x = r() * w;
    const y = r() * h;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 9 + r() * 8);
    halo.addColorStop(0, 'rgba(235,240,255,0.55)');
    halo.addColorStop(1, 'rgba(235,240,255,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(x - 20, y - 20, 40, 40);
  }
  return c.toDataURL('image/jpeg', 0.88);
}

let grain: HTMLCanvasElement | null = null;
export function grainCanvas() {
  if (!grain) grain = makeGrainCanvas();
  return grain;
}

export function installTextures() {
  const root = document.documentElement.style;
  root.setProperty('--tx-board', `url(${makeBoard()})`);
  root.setProperty('--tx-stars', `url(${makeStarfield()})`);
  root.setProperty('--tx-chalk-mask', `url(${makeChalkMask()})`);
}
