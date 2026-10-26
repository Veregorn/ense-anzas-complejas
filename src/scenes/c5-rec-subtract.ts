import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { clamp01, easeInOutCubic, rng } from '../core/math';
import { hex } from '../core/palette';
import { tagHTML } from '../draw/tag';

const GROUND = 640;
const FH = 86;
const BX = 1010;
const BW = 480;
const SHAFT = BX + BW / 2;
const yc = (f: number) => GROUND - (f + 0.5) * FH;
const START = 1.6;
const PER = 0.62;

/**
 * Bloque 4b · La resta: un edificio con garaje. El ascensor baja siete plantas desde la quinta
 * y llega a la −2. Los números no se acaban en el cero.
 */
export class RecSubtractScene extends Scene {
  readonly id = 'rec-resta';
  readonly stepCount = 2;
  private cv!: Canvas2D;
  private display!: HTMLElement;
  private eq!: HTMLElement[];
  private windows: { x: number; y: number; on: boolean; tw: number }[] = [];

  protected build() {
    this.html('div', 'bg bg-night');
    this.cv = this.canvas();
    this.fx(this.html('p', 'abs fx rs-case', 'La resta'), 0);
    const panel = this.fx(
      this.html(
        'div',
        'abs fx rs-panel',
        `<p class="rs-label">Planta</p>
         <p class="rs-display" aria-live="polite">5</p>
         <p class="rs-eq"><span class="e0">5</span> <span class="e1">− 7</span> <span class="e2">= −2</span></p>
         <p class="rs-old">“No se puede restar 7 a 5”</p>`,
      ),
      0,
    );
    this.display = panel.querySelector('.rs-display')!;
    this.eq = [panel.querySelector('.e1')!, panel.querySelector('.e2')!];
    const tag = this.html('div', 'abs rs-tag', tagHTML({ head: 'Números enteros', main: 'Desde 1º de ESO', sub: 'La recta sigue bajo el cero', tone: 'green', rot: -4, seed: 71 }));
    this.fx(tag.firstElementChild!, 1);

    const r = rng(5);
    for (let f = 0; f <= 5; f++) {
      for (let c = 0; c < 6; c++) {
        const x = BX + 24 + c * 76;
        if (Math.abs(x + 26 - SHAFT) < 80) continue;
        this.windows.push({ x, y: GROUND - (f + 1) * FH + 20, on: r() > 0.35, tw: r() * 6 });
      }
    }
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step === 1 && prev < 1 && !instant) this.shake(200);
  }

  /** Planta (continua) en la que está el ascensor. */
  private floor() {
    const t = this.since(0);
    if (t < START) return 5;
    const tt = (t - START) / PER;
    const k = Math.floor(tt);
    if (k >= 7) return -2;
    return 5 - (k + easeInOutCubic(clamp01((tt - k) * 1.35)));
  }

  protected render() {
    const ctx = this.cv.ctx;
    this.cv.clear();
    const a = this.p(0, 1);
    const f = this.floor();
    const descending = this.since(0) > START;
    const arrived = f <= -2;
    this.display.textContent = String(Math.round(f)).replace('-', '−');
    this.display.classList.toggle('neg', Math.round(f) < 0);
    this.eq[0].classList.toggle('show', descending);
    this.eq[1].classList.toggle('show', arrived);
    this.el.classList.toggle('rs-arrived', arrived);

    ctx.save();
    ctx.globalAlpha = a;
    // Subsuelo
    const under = ctx.createLinearGradient(0, GROUND, 0, 1080);
    under.addColorStop(0, '#241a16');
    under.addColorStop(1, '#0e0a0a');
    ctx.fillStyle = under;
    ctx.fillRect(0, GROUND, 1920, 1080 - GROUND);
    // Calle
    ctx.fillStyle = '#2b3350';
    ctx.fillRect(0, GROUND - 6, 1920, 8);
    // Edificio sobre rasante
    ctx.fillStyle = '#131c3a';
    ctx.fillRect(BX, GROUND - 6 * FH, BW, 6 * FH);
    ctx.strokeStyle = 'rgba(159,178,255,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(BX, GROUND - 6 * FH, BW, 6 * FH);
    for (const w of this.windows) {
      const on = w.on && Math.sin(this.now * 0.4 + w.tw) > -0.85;
      ctx.fillStyle = on ? 'rgba(255,214,140,0.85)' : 'rgba(60,72,110,0.6)';
      ctx.fillRect(w.x, w.y, 52, 46);
    }
    // Plantas del garaje
    for (let f2 = -1; f2 >= -3; f2--) {
      const top = GROUND + (-f2 - 1) * FH;
      ctx.fillStyle = '#1b1514';
      ctx.fillRect(BX, top, BW, FH);
      ctx.strokeStyle = 'rgba(240,180,90,0.25)';
      ctx.strokeRect(BX, top, BW, FH);
      ctx.fillStyle = 'rgba(240,180,90,0.75)';
      ctx.font = '700 44px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${f2}`.replace('-', '−'), BX + 20, top + FH / 2);
      // Coches en silueta
      for (const cx of [BX + 340, BX + 420]) {
        if (Math.abs(cx - SHAFT) < 90) continue;
        ctx.fillStyle = '#3a2e2a';
        ctx.beginPath();
        ctx.roundRect(cx - 34, top + FH - 34, 68, 22, 7);
        ctx.roundRect(cx - 22, top + FH - 48, 44, 18, 7);
        ctx.fill();
      }
    }
    // Hueco del ascensor
    ctx.fillStyle = 'rgba(6,10,25,0.85)';
    ctx.fillRect(SHAFT - 60, GROUND - 6 * FH, 120, 9 * FH);
    ctx.strokeStyle = 'rgba(233,237,247,0.25)';
    ctx.strokeRect(SHAFT - 60, GROUND - 6 * FH, 120, 9 * FH);
    // Números de planta a la izquierda
    ctx.font = '400 40px Newsreader, serif';
    ctx.textAlign = 'right';
    for (let n = 5; n >= -3; n--) {
      const near = 1 - Math.min(1, Math.abs(n - f));
      ctx.fillStyle = n < 0 ? `rgba(240,180,90,${0.45 + 0.55 * near})` : `rgba(233,237,247,${0.45 + 0.55 * near})`;
      ctx.fillText(`${n}`.replace('-', '−'), BX - 30, yc(n));
    }
    // El cero, marcado
    ctx.strokeStyle = 'rgba(233,237,247,0.5)';
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(BX - 90, GROUND);
    ctx.lineTo(BX + BW + 120, GROUND);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(233,237,247,0.7)';
    ctx.font = 'italic 400 28px Newsreader, serif';
    ctx.textAlign = 'left';
    ctx.fillText('nivel de la calle: el cero', BX + BW + 24, GROUND - 22);
    // Cabina
    const y = yc(f);
    const glow = ctx.createRadialGradient(SHAFT, y, 10, SHAFT, y, 120);
    glow.addColorStop(0, 'rgba(255,214,140,0.35)');
    glow.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(SHAFT - 130, y - 130, 260, 260);
    ctx.fillStyle = '#e9e2cf';
    ctx.beginPath();
    ctx.roundRect(SHAFT - 48, y - 36, 96, 72, 8);
    ctx.fill();
    ctx.fillStyle = '#9a8f78';
    ctx.fillRect(SHAFT - 1, y - 30, 2, 60);
    ctx.strokeStyle = 'rgba(233,237,247,0.5)';
    ctx.beginPath();
    ctx.moveTo(SHAFT, GROUND - 6 * FH);
    ctx.lineTo(SHAFT, y - 36);
    ctx.stroke();
    // Rastro de los saltos
    if (descending) {
      ctx.strokeStyle = hex.time;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(SHAFT + 90, yc(5));
      ctx.lineTo(SHAFT + 90, y);
      ctx.stroke();
      ctx.fillStyle = hex.time;
      ctx.font = '700 30px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      const jumps = Math.min(7, Math.floor(5 - f + 0.001));
      for (let j = 1; j <= jumps; j++) ctx.fillText(`${j}`, SHAFT + 106, yc(5 - j));
    }
    ctx.restore();
  }
}
