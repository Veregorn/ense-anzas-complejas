import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { easeOutCubic, linear, phase, TAU } from '../core/math';
import { hex } from '../core/palette';
import { applyGrain, chalkHatchCircle, chalkStroke, circlePts, ellipsePts } from '../draw/chalk';
import { stampHTML } from '../draw/tag';

/** El átomo "de siempre" a tiza: núcleo y tres órbitas con electrones. Reutilizable. */
export function drawBohrAtom(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, t: number, draw = 1, alpha = 1) {
  if (alpha <= 0) return;
  const orbits = [0, Math.PI / 3, (2 * Math.PI) / 3];
  orbits.forEach((rot, i) => {
    const prog = easeOutCubic(phase(draw, 0.15 + i * 0.12, 0.55 + i * 0.12));
    chalkStroke(ctx, ellipsePts(cx, cy, 300 * s, 105 * s, rot, 11 + i, 1.6 * s), { width: 3.6 * s, progress: prog, alpha: alpha * 0.85 });
  });
  // Núcleo: protones y neutrones
  const nucleus: [number, number, string][] = [
    [0, 0, hex.chalkYellow], [-22, -10, hex.chalk], [20, -14, hex.chalkYellow],
    [-12, 18, hex.chalkYellow], [16, 16, hex.chalk], [2, -26, hex.chalk], [-28, 12, hex.chalk],
  ];
  const np = easeOutCubic(phase(draw, 0, 0.25));
  nucleus.forEach(([dx, dy, c], i) => {
    const x = cx + dx * s * 1.2;
    const y = cy + dy * s * 1.2;
    chalkHatchCircle(ctx, x, y, 17 * s, { color: c, gap: 5 * s, width: 2 * s, alpha: alpha * np, seed: 40 + i });
    chalkStroke(ctx, circlePts(x, y, 17 * s, 60 + i, 0.6 * s, 30), { width: 2.6 * s, color: c, progress: np, alpha });
  });
  // Electrones recorriendo sus órbitas
  const ep = phase(draw, 0.75, 1);
  if (ep <= 0) return;
  orbits.forEach((rot, i) => {
    const a = t * (0.9 + i * 0.25) + i * 2.1;
    const x0 = 300 * s * Math.cos(a);
    const y0 = 105 * s * Math.sin(a);
    const x = cx + x0 * Math.cos(rot) - y0 * Math.sin(rot);
    const y = cy + x0 * Math.sin(rot) + y0 * Math.cos(rot);
    chalkHatchCircle(ctx, x, y, 14 * s, { color: '#a9d0f5', gap: 4 * s, width: 2 * s, alpha: alpha * ep, seed: 70 + i });
    chalkStroke(ctx, circlePts(x, y, 14 * s, 80 + i, 0.5 * s, 28), { width: 2.4 * s, color: '#a9d0f5', alpha: alpha * ep });
  });
  void TAU;
}

/**
 * Bloque 0 · "Dibujad en el aire un átomo." Pizarra vacía → el átomo de siempre →
 * sello "Descartado en 1926" → la pregunta.
 */
export class AtomAirScene extends Scene {
  readonly id = 'atomo-aire';
  readonly stepCount = 4;
  private cv!: Canvas2D;

  protected build() {
    this.html('div', 'bg bg-board');
    this.cv = this.canvas();
    this.fx(this.html('p', 'chalk write abs aa-hint', 'Dibujad un átomo en el aire'), 0, 1);
    this.fx(this.html('div', 'abs aa-stamp', stampHTML('Descartado', 'en 1926', -11)).firstElementChild!, 2);
    this.fx(this.html('p', 'chalk write abs aa-question', '¿Os<br>engañaron?'), 3);
    this.fx(this.html('p', 'chalk yellow write abs aa-title', 'Enseñanzas con fecha de caducidad'), 3);
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step === 2 && prev < 2 && !instant) this.shake(230);
  }

  protected render() {
    const { ctx } = this.cv;
    this.cv.clear();
    drawBohrAtom(ctx, 900, 500, 1, this.now, this.p(1, 3.2, 0, linear), this.step >= 1 ? 1 : 0);
    applyGrain(ctx, 0.8);
  }
}
