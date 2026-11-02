import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { clamp01, easeOutCubic, rng } from '../core/math';
import { applyGrain, chalkHatchCircle, chalkStroke, chalkText, circlePts, linePts, type Pt } from '../draw/chalk';
import { tagHTML } from '../draw/tag';

const XS = [250, 730, 1190, 1670];
const Y = 360;

/** Puntos de la nube 2p, muestreados como en la reconstrucción (densidad ∝ r² e^(−r) cos²θ), en 2D. */
const CLOUD: [number, number, number][] = (() => {
  const r = rng(1926);
  const pts: [number, number, number][] = [];
  while (pts.length < 1100) {
    const z = 2 * r() - 1;
    if (r() > z * z) continue;
    const a = 2 * Math.PI * r();
    const q = Math.sqrt(1 - z * z);
    let rad = 0;
    for (let i = 0; i < 5; i++) rad -= Math.log(1 - r());
    rad *= 16;
    pts.push([q * Math.cos(a) * rad, z * rad * 1.05, z >= 0 ? 1 : -1]);
  }
  return pts;
})();

/** La nube a tiza: dos lóbulos de puntos y el núcleo. */
function drawChalkCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number) {
  if (a <= 0) return;
  ctx.save();
  for (const [x, y, sgn] of CLOUD) {
    if (Math.abs(x) > 190 || Math.abs(y) > 190) continue;
    ctx.globalAlpha = a * 0.75;
    ctx.fillStyle = sgn > 0 ? '#f3d77e' : '#a9d0f5';
    ctx.fillRect(cx + x - 1.6, cy + y - 1.6, 3.2, 3.2);
  }
  ctx.restore();
  chalkHatchCircle(ctx, cx, cy, 9, { color: '#ece8dc', alpha: a, gap: 4 });
}

/** La "sábana" a tiza: una malla que se hunde bajo el Sol. */
function drawChalkWell(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number) {
  const well = (x: number, y: number) => 70 * Math.exp(-(((x - cx) / 80) ** 2) - (((y - cy) / 60) ** 2));
  for (let j = -4; j <= 4; j++) {
    const pts: Pt[] = [];
    for (let x = cx - 170; x <= cx + 170; x += 10) pts.push([x, cy + j * 26 + well(x, cy + j * 26)]);
    chalkStroke(ctx, pts, { width: 2.4, alpha: a * 0.7 });
  }
  for (let k = -6; k <= 6; k++) {
    const pts: Pt[] = [];
    const x = cx + k * 28;
    for (let y = cy - 104; y <= cy + 104; y += 8) pts.push([x, y + well(x, y)]);
    chalkStroke(ctx, pts, { width: 2.4, alpha: a * 0.7 });
  }
  chalkHatchCircle(ctx, cx, cy + 62, 26, { color: '#f3d77e', alpha: a, gap: 6 });
  chalkStroke(ctx, circlePts(cx, cy + 62, 26, 9, 1), { width: 3, color: '#f3d77e', alpha: a });
}

/** Dos cristales de silicio en miniatura: uno con fósforo y otro con boro (nunca juntos en el mismo trozo). */
function drawChalkLattice(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number) {
  const sp = 52;
  ([[-88, 'P'], [88, 'B']] as const).forEach(([ox, dop], k) => {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const x = cx + ox + c * sp;
        const y = cy + r * sp;
        if (c < 1) chalkStroke(ctx, linePts(x + 15, y, x + sp - 15, y, k * 31 + r * 7 + c, 0.6, 6), { width: 2.2, alpha: a * 0.7 });
        if (r < 1) chalkStroke(ctx, linePts(x, y + 15, x, y + sp - 15, k * 31 + r * 9 + c + 3, 0.6, 6), { width: 2.2, alpha: a * 0.7 });
        const label = c === 0 && r === 0 ? dop : 'Si';
        const col = label === 'P' ? '#f3d77e' : label === 'B' ? '#ff8a7a' : '#ece8dc';
        chalkStroke(ctx, circlePts(x, y, 15, 30 + k * 13 + r * 5 + c, 0.6, 28), { width: 2.2, color: col, alpha: a });
        chalkText(ctx, label, x, y + 1, label === 'Si' ? 15 : 20, { align: 'center', color: col, alpha: a, weight: 700 });
      }
    }
  });
}

/**
 * Bloque 5 · Cierre. Los cuatro casos vuelven a la pizarra, cada uno con su etiqueta.
 * La pregunta final y la frase.
 */
export class ClosingScene extends Scene {
  readonly id = 'cierre';
  readonly stepCount = 4;
  private cv!: Canvas2D;

  protected build() {
    this.html('div', 'bg bg-board');
    this.cv = this.canvas();
    const tags: Parameters<typeof tagHTML>[0][] = [
      { head: 'Modelo de nube', main: 'Válido en la ESO', tone: 'green', rot: -4, seed: 61 },
      { head: 'Números enteros', main: 'Desde 1º de ESO', tone: 'green', rot: 3, seed: 71 },
      { head: 'Modelo de la sábana', main: 'También caduca', tone: 'green', rot: -2, seed: 83 },
      { head: 'Modelo de las manos', main: 'Válido en la ESO', tone: 'green', rot: 4, seed: 97 },
    ];
    tags.forEach((t, i) => {
      const w = this.html('div', 'abs cl-tag', tagHTML({ ...t, className: 'tag-small' }));
      w.style.left = `${XS[i] - 170}px`;
      const el = w.firstElementChild as HTMLElement;
      el.style.transitionDelay = `${0.9 + i * 0.45}s`;
      this.fx(el, 0, 1);
    });
    this.fx(this.html('p', 'abs chalk write cl-question', '¿Qué estáis enseñando<br>vosotros sin etiqueta?'), 1, 2);
    this.fx(this.html('div', 'bg bg-night fade'), 2);
    this.fx(
      this.html(
        'div',
        'abs cl-final',
        `<p class="phrase fx c1">Simplificar no es engañar.</p>
         <p class="phrase fx c2">Engañar es quitar la etiqueta.</p>`,
      ),
      2,
    );
    this.el.querySelectorAll('.cl-final .fx').forEach((el) => this.fx(el, 2));
    this.fx(this.html('p', 'abs fx cl-thanks', 'Gracias.'), 3);
  }

  protected render() {
    const ctx = this.cv.ctx;
    this.cv.clear();
    if (this.step >= 2 && this.since(2) > 1.6) return;
    const dim = 1 - 0.75 * this.p(1, 0.9);
    const item = (i: number) => easeOutCubic(clamp01((this.since(0) - i * 0.45) / 0.9)) * dim;
    drawChalkCloud(ctx, XS[0], Y, item(0));
    chalkText(ctx, '5 − 7 = −2', XS[1], Y, 76, { align: 'center', weight: 700, alpha: item(1) });
    drawChalkWell(ctx, XS[2], Y - 20, item(2));
    drawChalkLattice(ctx, XS[3], Y, item(3));
    applyGrain(ctx, 0.8);
  }
}
