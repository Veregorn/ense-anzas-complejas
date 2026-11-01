import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { lerp, mixRgb, rgba, TAU } from '../core/math';
import { rgb } from '../core/palette';
import { specTagHTML } from '../draw/tag';

const CX = 1390;
const R = 250;
const RV = 50;
const TH0 = -Math.PI / 2;
const TH_END = Math.PI / 2 + 3 * TAU;
const Y_BOTTOM = 930;
const Y_TOP = 300;
const nodeTheta = (k: number) => Math.PI / 2 + TAU * (k - 1);
const baseY = (th: number) => lerp(Y_BOTTOM, Y_TOP, (th - TH0) / (TH_END - TH0));
const point = (th: number): [number, number, number] => [CX + R * Math.cos(th), baseY(th) + RV * Math.sin(th), Math.sin(th)];
const colorAt = (th: number) => mixRgb(rgb.time, rgb.starlight, (th - TH0) / (TH_END - TH0));
const STAGES = ['Primaria', 'ESO', 'Bachillerato', 'Universidad'];

/**
 * Bloque 3 · Poner la etiqueta. ¿Dejamos de simplificar? → Chevallard (transposición didáctica) → la etiqueta del profesor
 * → la espiral de Bruner.
 */
export class LabelScene extends Scene {
  readonly id = 'etiqueta';
  readonly stepCount = 4;
  private cv!: Canvas2D;

  protected build() {
    this.html('div', 'bg bg-night');
    this.cv = this.canvas();
    this.fx(this.html('p', 'abs fx lb-q', 'Entonces… ¿dejamos de simplificar?'), 0, 1);
    this.fx(
      this.html(
        'div',
        'abs fx lb-chev',
        `<p class="fr-kicker">Yves Chevallard, 1985</p>
         <h2 class="lb-title">Transposición didáctica</h2>
         <div class="lb-row">
           <div class="lb-box sabio"><b>Saber sabio</b><span>lo que sabe la ciencia</span></div>
           <svg class="lb-arrow" viewBox="0 0 420 40" aria-hidden="true">
             <line x1="4" y1="20" x2="396" y2="20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
             <path d="M386 8 L410 20 L386 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
           <div class="lb-box ensenado"><b>Saber enseñado</b><span>lo que llega al aula</span></div>
         </div>
         <p class="lb-vig">Inevitable y legítima. Pero exige <b>vigilancia epistemológica</b>.</p>`,
      ),
      1,
      2,
    );
    this.fx(this.html('p', 'abs fx lb-tool-cap', 'La vigilancia epistemológica, traducida al aula:'), 2, 3);
    const tag = this.html(
      'div',
      'abs lb-tag',
      specTagHTML(
        [
          ['Producto', 'Un modelo'],
          ['Válido hasta', '4º de ESO'],
          ['Continúa en', 'Bachillerato'],
        ],
        'Etiqueta del profesor',
        5,
        -2,
      ),
    );
    this.fx(tag.firstElementChild!, 2, 3);

    this.fx(
      this.html(
        'blockquote',
        'abs fx lb-bruner',
        `<p class="quote">Cualquier materia puede enseñarse a cualquier edad de una forma intelectualmente honesta.</p>
         <p class="quote-author">Jerome Bruner, <i>El proceso de la educación</i>, 1960</p>
         <p class="caption soft lb-bruner-note">La misma idea, cada vez más a fondo. Sin desmentir la anterior.</p>`,
      ),
      3,
    );
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step === 2 && prev < 2 && !instant) this.shake(220);
  }

  protected render() {
    const ctx = this.cv.ctx;
    this.cv.clear();
    if (this.step < 3) return;
    const reach = lerp(TH0, TH_END, this.p(3, 4.2, 0.4));
    const segs: { a: [number, number, number]; b: [number, number, number]; th: number }[] = [];
    for (let th = TH0; th < reach; th += 0.025) segs.push({ a: point(th), b: point(Math.min(reach, th + 0.025)), th });
    ctx.lineCap = 'round';
    for (const pass of [0, 1]) {
      for (const s of segs) {
        const front = (s.a[2] + s.b[2]) / 2 > 0;
        if ((pass === 1) !== front) continue;
        const depth = (s.a[2] + 1) / 2;
        ctx.strokeStyle = rgba(colorAt(s.th), pass ? 0.55 + 0.45 * depth : 0.22);
        ctx.lineWidth = pass ? 4 + 6 * depth : 3;
        ctx.beginPath();
        ctx.moveTo(s.a[0], s.a[1]);
        ctx.lineTo(s.b[0], s.b[1]);
        ctx.stroke();
      }
    }
    ctx.font = '500 34px Newsreader, serif';
    ctx.textBaseline = 'middle';
    for (let k = 1; k <= 4; k++) {
      const th = nodeTheta(k);
      if (reach < th) continue;
      const [x, y] = point(th);
      const c = colorAt(th);
      const halo = ctx.createRadialGradient(x, y, 0, x, y, 44);
      halo.addColorStop(0, rgba(c, 0.6));
      halo.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(x - 44, y - 44, 88, 88);
      ctx.fillStyle = rgba(c);
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, TAU);
      ctx.fill();
      ctx.fillText(STAGES[k - 1], x + R + 40, y);
    }
  }
}
