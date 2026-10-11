import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { easeOutCubic, linear, rng } from '../core/math';
import { hex } from '../core/palette';
import { applyGrain, chalkArrow, chalkStroke, linePts, type Pt } from '../draw/chalk';
import { drawSchoolModel, planetPositions, PLANETS } from '../draw/school-model';

const CX = 700;
const CY = 545;
const SUN_R = 46;

interface Dust {
  thread: number;
  vx: number;
  vy: number;
  size: number;
}

/**
 * Bloque 1 · El Sistema Solar del colegio, a tiza, con los planetas atados al Sol.
 * Pasos: dibujo → «una cuerda invisible» → el libro de Hawking → los hilos se rompen.
 */
export class SchoolScene extends Scene {
  readonly id = 'colegio';
  readonly stepCount = 4;
  private cv!: Canvas2D;
  private dust: Dust[] = [];
  private snapAt = PLANETS.map((_, i) => 0.42 + ((i * 37) % 23) / 100);

  protected build() {
    this.html('div', 'bg bg-board');
    this.cv = this.canvas();
    this.fx(this.html('p', 'chalk write abs school-label', '“una cuerda invisible”'), 1, 3);
    this.fx(
      this.html(
        'figure',
        'abs book fx',
        `<div class="book-cover">
           <p class="book-author">Stephen Hawking</p>
           <p class="book-title">Breve historia<br>del tiempo</p>
           <p class="book-sub">Del big bang a los agujeros negros</p>
         </div>
         <figcaption class="chalk book-note">cap. 2: “Espacio y tiempo”</figcaption>`,
      ),
      2,
      3,
    );
    this.fx(this.html('p', 'abs phrase fx school-punch', 'Esa cuerda<br>no existe.'), 3);

    const r = rng(42);
    PLANETS.forEach((_, i) => {
      for (let k = 0; k < 16; k++) this.dust.push({ thread: i, vx: (r() - 0.5) * 90, vy: -30 - r() * 70, size: 1 + r() * 2.4 });
    });
  }

  protected render() {
    const { ctx } = this.cv;
    const t = this.now;
    this.cv.clear();

    const draw = this.p(0, 3.6, 0.15, linear);
    const breakT = this.since(3);
    const broken = breakT >= 0;
    const glow = this.step >= 1 && !broken ? 0.55 + 0.45 * Math.sin((this.since(1) ?? 0) * 3.2) * this.p(1, 0.6) : 0;

    drawSchoolModel(ctx, {
      cx: CX,
      cy: CY,
      t,
      draw,
      threads: broken ? 0 : 1,
      threadGlow: Math.max(0, glow),
      forces: this.p(0, 1, 3.2) * (1 - this.p(3, 0.5)),
    });

    // Flecha de la etiqueta hacia el hilo del planeta exterior
    if (this.step >= 1 && this.step < 3) {
      const [px, py] = planetPositions({ cx: CX, cy: CY, t })[3];
      const mx = CX + (px - CX) * 0.62;
      const my = CY + (py - CY) * 0.62;
      chalkArrow(ctx, 1150, 210, mx + 14, my - 10, { width: 3.4, progress: this.p(1, 0.7, 1.6), seed: 77, head: 18 });
    }

    if (broken) this.drawBreak(ctx, breakT, t);
    applyGrain(ctx, 0.85);
  }

  /** Cada hilo se parte por un punto, las dos mitades se recogen y suelta polvo de tiza. */
  private drawBreak(ctx: CanvasRenderingContext2D, bt: number, t: number) {
    const k = easeOutCubic(Math.min(1, bt / 0.9));
    const pos = planetPositions({ cx: CX, cy: CY, t });
    const posSnap = planetPositions({ cx: CX, cy: CY, t: t - bt });
    pos.forEach(([px, py], i) => {
      const ang = Math.atan2(py - CY, px - CX);
      const s: Pt = [CX + Math.cos(ang) * (SUN_R + 6), CY + Math.sin(ang) * (SUN_R + 6)];
      const f = this.snapAt[i];
      const m: Pt = [s[0] + (px - s[0]) * f, s[1] + (py - s[1]) * f];
      const alpha = 1 - k;
      if (alpha > 0.01) {
        const sag = 22 * k;
        chalkStroke(ctx, linePts(s[0], s[1], s[0] + (m[0] - s[0]) * (1 - k), s[1] + (m[1] - s[1]) * (1 - k) + sag, 90 + i, 1.2, 14), { width: 2.9, alpha });
        chalkStroke(ctx, linePts(px, py, px + (m[0] - px) * (1 - k), py + (m[1] - py) * (1 - k) + sag, 95 + i, 1.2, 14), { width: 2.9, alpha });
      }
      // Polvo de tiza que cae desde el punto de rotura
      const [qx, qy] = posSnap[i];
      const sx = CX + Math.cos(Math.atan2(qy - CY, qx - CX)) * (SUN_R + 6);
      const sy = CY + Math.sin(Math.atan2(qy - CY, qx - CX)) * (SUN_R + 6);
      const ox = sx + (qx - sx) * f;
      const oy = sy + (qy - sy) * f;
      const da = Math.max(0, 1 - bt / 2.2);
      if (da <= 0) return;
      ctx.fillStyle = hex.chalk;
      for (const d of this.dust) {
        if (d.thread !== i) continue;
        const x = ox + d.vx * bt;
        const y = oy + d.vy * bt + 0.5 * 260 * bt * bt;
        ctx.globalAlpha = da * 0.8;
        ctx.fillRect(x, y, d.size, d.size);
      }
      ctx.globalAlpha = 1;
    });
  }
}
