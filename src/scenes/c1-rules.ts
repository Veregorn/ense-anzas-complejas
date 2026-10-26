import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { easeOutCubic, linear, phase } from '../core/math';
import { applyGrain, chalkStroke, chalkText, linePts, type Pt } from '../draw/chalk';
import { drawSchoolModel } from '../draw/school-model';
import { tagHTML } from '../draw/tag';

const COLS = [330, 960, 1590];

/** Un chip a tiza: el silicio "con impurezas". */
function drawChip(ctx: CanvasRenderingContext2D, cx: number, cy: number, draw: number) {
  const w = 190;
  const box: Pt[] = [
    [cx - w / 2, cy - w / 2], [cx + w / 2, cy - w / 2], [cx + w / 2, cy + w / 2], [cx - w / 2, cy + w / 2], [cx - w / 2, cy - w / 2],
  ];
  chalkStroke(ctx, box, { width: 4, progress: easeOutCubic(phase(draw, 0, 0.5)) });
  const pins = easeOutCubic(phase(draw, 0.4, 0.8));
  for (let i = 0; i < 5; i++) {
    const y = cy - w / 2 + 25 + i * 35;
    chalkStroke(ctx, linePts(cx - w / 2, y, cx - w / 2 - 34, y, 200 + i, 0.6, 6), { width: 3, progress: pins });
    chalkStroke(ctx, linePts(cx + w / 2, y, cx + w / 2 + 34, y, 210 + i, 0.6, 6), { width: 3, progress: pins });
  }
  const txt = phase(draw, 0.6, 1);
  chalkText(ctx, 'Si', cx, cy - 6, 84, { align: 'center', weight: 700, alpha: txt });
  // "Impurezas": unos puntitos misteriosos
  if (txt > 0) {
    const dots: Pt[] = [[-55, -60], [50, -48], [-40, 55], [62, 50], [0, 68]];
    dots.forEach(([dx, dy]) => chalkText(ctx, '•', cx + dx, cy + dy, 34, { align: 'center', color: '#f3d77e', alpha: txt }));
  }
}

/**
 * Bloque 1 · Reglas que caducan. Tres casos a tiza, cada uno con su etiqueta de supermercado.
 */
export class RulesScene extends Scene {
  readonly id = 'reglas';
  readonly stepCount = 8;
  private cv!: Canvas2D;

  protected build() {
    this.html('div', 'bg bg-board');
    this.cv = this.canvas();
    this.fx(this.html('p', 'chalk write abs rl-head', 'Trece reglas que caducan <small>(Karp, Bush y Dougherty, 2014)</small>'), 0);

    // Caso 1: la resta
    this.fx(this.html('p', 'chalk write abs rl-big', '5 − 7'), 1).style.left = `${COLS[0] - 200}px`;
    this.fx(this.html('p', 'chalk write abs rl-text', '“No se puede restar 7 a 5”'), 1).style.left = `${COLS[0] - 230}px`;
    this.tag(0, 2, { head: 'Consumir preferentemente antes de', main: '1º de ESO', rot: -6, seed: 11 });

    // Caso 2: la cuerda del Sol
    this.fx(this.html('p', 'chalk write abs rl-text', '“El Sol atrae a los planetas<br>con una cuerda invisible”'), 3).style.left = `${COLS[1] - 250}px`;
    this.tag(1, 4, { head: 'Consumir preferentemente antes de', main: 'leer a Einstein', rot: 4, seed: 23 });

    // Caso 3: los semiconductores
    this.fx(this.html('p', 'chalk write abs rl-text', '“Se le añaden impurezas<br>y conduce mejor”'), 5).style.left = `${COLS[2] - 230}px`;
    this.tag(2, 6, { head: 'Ingredientes', main: 'No consta', sub: 'Elaborado sin explicación', rot: -3, tone: 'blue', seed: 37 });

    this.fx(this.html('p', 'chalk yellow write abs rl-punch', 'Todo caduca. El problema es otro.'), 7);
  }

  private tag(col: number, step: number, o: Parameters<typeof tagHTML>[0]) {
    const wrap = this.html('div', 'abs rl-tag', tagHTML(o));
    wrap.style.left = `${COLS[col] - 210}px`;
    this.fx(wrap.firstElementChild!, step);
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if ((step === 2 || step === 4 || step === 6) && step > prev && !instant) this.shake(200);
  }

  protected render() {
    const { ctx } = this.cv;
    this.cv.clear();
    const dim = 1 - 0.35 * this.p(7, 1);
    if (this.step >= 3) {
      drawSchoolModel(ctx, { cx: COLS[1], cy: 455, scale: 0.55, t: this.now, draw: this.p(3, 2.6, 0, linear), threads: 1, forces: this.p(3, 1, 2), alpha: dim });
    }
    if (this.step >= 5) drawChip(ctx, COLS[2], 455, this.p(5, 2, 0, linear));
    // Una tachadura a tiza bajo "5 − 7"
    if (this.step >= 1) {
      chalkStroke(ctx, linePts(COLS[0] - 150, 520, COLS[0] + 150, 505, 9, 2, 20), { width: 5, color: '#f3d77e', progress: this.p(1, 0.8, 1.4), alpha: dim });
    }
    applyGrain(ctx, 0.8);
  }
}
