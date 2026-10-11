import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { easeInOutCubic, lerp, mixRgb, rgba, TAU } from '../core/math';
import { rgb } from '../core/palette';
import { Tween } from '../core/tween';

const CX = 1350;
const R = 290;
const RV = 58;
const TH0 = -Math.PI / 2;
const TH_END = Math.PI / 2 + 3 * TAU;
const Y_BOTTOM = 940;
const Y_TOP = 250;

const nodeTheta = (k: number) => Math.PI / 2 + TAU * (k - 1);
const baseY = (th: number) => lerp(Y_BOTTOM, Y_TOP, (th - TH0) / (TH_END - TH0));
const point = (th: number): [number, number, number] => [CX + R * Math.cos(th), baseY(th) + RV * Math.sin(th), Math.sin(th)];
const colorAt = (th: number) => mixRgb(rgb.time, rgb.starlight, (th - TH0) / (TH_END - TH0));

const LEVELS = [
  { stage: 'Primaria', text: 'Las cosas con mucha masa deforman el espacio y el tiempo.' },
  { stage: 'ESO', text: 'El tiempo va más lento cerca de la Tierra: por eso caen las cosas.' },
  { stage: 'Bachillerato', text: 'Newton: una aproximación brillante… y sus límites.' },
  {
    stage: 'Universidad',
    text: 'Las ecuaciones de Einstein: <span class="eq">G<sub>μν</sub> + Λg<sub>μν</sub> = <span class="frac"><span>8πG</span><span>c<sup>4</sup></span></span> T<sub>μν</sub></span>',
  },
];

/**
 * Bloque 6 · El currículo en espiral de Bruner: la misma idea, cada curso más profunda.
 * Los nodos quedan alineados en vertical: ninguna etapa contradice a la anterior.
 */
export class SpiralScene extends Scene {
  readonly id = 'espiral';
  readonly stepCount = 6;
  private cv!: Canvas2D;
  private reach = new Tween(TH0);

  protected build() {
    this.html('div', 'bg bg-night');
    this.cv = this.canvas();
    this.fx(
      this.html(
        'blockquote',
        'abs fx sp-bruner',
        `<p class="quote">Cualquier materia puede enseñarse con eficacia, de alguna forma intelectualmente honesta, a cualquier niño en cualquier etapa de su desarrollo.</p>
         <p class="quote-author">Jerome Bruner, <i>El proceso de la educación</i>, 1960</p>`,
      ),
      0,
      1,
    );
    LEVELS.forEach((lvl, i) => {
      const k = i + 1;
      const [, y] = point(nodeTheta(k));
      const el = this.html('div', 'abs fx sp-level', `<p class="sp-stage">${lvl.stage}</p><p class="sp-text">${lvl.text}</p>`);
      el.style.top = `${y - 48}px`;
      el.style.setProperty('--c', rgba(colorAt(nodeTheta(k))));
      this.fx(el, k);
    });
    this.fx(this.html('p', 'abs quote fx sp-final', 'Ninguna etapa contradice a la anterior.'), 5);
  }

  protected onStep(step: number, _prev: number, instant: boolean) {
    const target = step === 0 ? TH0 : nodeTheta(Math.min(4, step));
    this.reach.go(target, this.now, instant, step <= 1 ? 1.6 : 2.2, easeInOutCubic);
  }

  protected render() {
    const ctx = this.cv.ctx;
    this.cv.clear();
    const reach = this.reach.value(this.now);
    if (reach <= TH0 + 0.001) return;

    const segs: { a: [number, number, number]; b: [number, number, number]; th: number }[] = [];
    const d = 0.025;
    for (let th = TH0; th < reach; th += d) {
      const th2 = Math.min(reach, th + d);
      segs.push({ a: point(th), b: point(th2), th });
    }
    ctx.lineCap = 'round';
    // Detrás: tenue y fino. Delante: brillante y grueso.
    for (const pass of [0, 1]) {
      for (const s of segs) {
        const front = (s.a[2] + s.b[2]) / 2 > 0;
        if ((pass === 1) !== front) continue;
        const depth = (s.a[2] + 1) / 2;
        const c = colorAt(s.th);
        ctx.strokeStyle = rgba(c, pass ? 0.55 + 0.45 * depth : 0.22);
        ctx.lineWidth = pass ? 4 + 6 * depth : 3;
        ctx.beginPath();
        ctx.moveTo(s.a[0], s.a[1]);
        ctx.lineTo(s.b[0], s.b[1]);
        ctx.stroke();
      }
    }

    // Haz vertical: todas las etapas alineadas
    const beam = this.p(5, 1.6, 0.2);
    if (beam > 0) {
      const [, y1] = point(nodeTheta(1));
      const [, y4] = point(nodeTheta(4));
      const yTop = lerp(y1, y4, beam);
      const g = ctx.createLinearGradient(0, y1, 0, y4);
      g.addColorStop(0, rgba(rgb.time, 0.9));
      g.addColorStop(1, rgba(rgb.starlight, 0.9));
      ctx.save();
      ctx.shadowColor = 'rgba(200,210,255,0.8)';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = g;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(CX, y1);
      ctx.lineTo(CX, yTop);
      ctx.stroke();
      ctx.restore();
    }

    // Nodos y líneas guía hacia los textos
    for (let k = 1; k <= 4; k++) {
      const th = nodeTheta(k);
      if (reach < th - 0.02) continue;
      const [x, y] = point(th);
      const c = colorAt(th);
      const a = Math.min(1, (reach - th + 0.3) / 0.3);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = rgba(c, 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1010, y);
      ctx.lineTo(x - 24, y);
      ctx.stroke();
      ctx.setLineDash([]);
      const halo = ctx.createRadialGradient(x, y, 0, x, y, 46);
      halo.addColorStop(0, rgba(c, 0.6));
      halo.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(x - 46, y - 46, 92, 92);
      ctx.fillStyle = rgba(c);
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}
