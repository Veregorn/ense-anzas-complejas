import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { easeInOutCubic, smoothstep, TAU } from '../core/math';
import { Tween } from '../core/tween';
import { applyGrain } from '../draw/chalk';
import { drawSchoolModel } from '../draw/school-model';

interface Region {
  name: string;
  cx: number;
  cy: number;
  r: number;
  seed: number;
  color: [number, number, number];
  dashed?: boolean;
  /** Paso en el que aparece. */
  from: number;
  places: { label: string; x: number; y: number }[];
  /** Zoom por debajo del cual sus etiquetas se desvanecen. */
  minZoom: number;
}

const REGIONS: Region[] = [
  {
    name: '¿?',
    cx: 300,
    cy: -40,
    r: 1320,
    seed: 3,
    color: [170, 179, 204],
    dashed: true,
    from: 3,
    minZoom: 0,
    places: [
      { label: '¿El interior de un agujero negro?', x: -760, y: -880 },
      { label: '¿El primer instante del universo?', x: -680, y: 830 },
    ],
  },
  {
    name: 'Einstein',
    cx: 200,
    cy: -20,
    r: 560,
    seed: 2,
    color: [159, 178, 255],
    from: 2,
    minZoom: 0.45,
    places: [
      { label: 'La órbita de Mercurio', x: 60, y: -280 },
      { label: 'Relojes a distinta altura', x: 60, y: -90 },
      { label: 'Ondas gravitacionales', x: 60, y: 100 },
      { label: 'Agujeros negros', x: 60, y: 290 },
    ],
  },
  {
    name: 'Newton',
    cx: 0,
    cy: 0,
    r: 230,
    seed: 1,
    color: [240, 180, 90],
    from: 1,
    minZoom: 0.95,
    places: [
      { label: 'Las mareas', x: -60, y: -112 },
      { label: 'La manzana', x: -150, y: 4 },
      { label: 'El viaje a la Luna', x: -116, y: 118 },
    ],
  },
];

/** Cámara del mapa para cada paso: [foco x, foco y, zoom]. */
const VIEWS: [number, number, number][] = [
  [0, 0, 1.3],
  [0, 0, 1.3],
  [200, -20, 0.72],
  [240, -30, 0.36],
  [240, -30, 0.36],
  [240, -30, 0.36],
  [240, -30, 0.36],
];

const blobR = (g: Region, a: number) =>
  g.r * (1 + 0.065 * Math.sin(3 * a + g.seed) + 0.045 * Math.sin(5 * a + 2.1 * g.seed) + 0.025 * Math.sin(9 * a + 3.3 * g.seed));

/**
 * Bloque 4 · ¿Me engañaron? Los modelos como mapas: Newton dentro de Einstein,
 * Einstein dentro de un mapa que aún no existe. La transposición didáctica de Chevallard
 * da nombre al problema. Termina con LA FRASE.
 */
export class MapsScene extends Scene {
  readonly id = 'mapas';
  readonly stepCount = 7;
  private chalkCv!: Canvas2D;
  private mapCv!: Canvas2D;
  private fx_ = new Tween(0);
  private fy_ = new Tween(0);
  private zoom = new Tween(1.3);

  protected build() {
    this.html('div', 'bg bg-night');
    this.fx(this.html('div', 'bg bg-board fade'), 0, 1);
    this.chalkCv = this.canvas();
    this.mapCv = this.canvas();
    this.fx(this.html('p', 'chalk write abs maps-question', '¿Me engañaron?'), 0, 1);
    this.fx(this.html('div', 'scrim fx'), 4);
    this.fx(
      this.html(
        'div',
        'abs fx maps-chev',
        `<p class="chev-author">Yves Chevallard, 1985</p>
         <h2 class="chev-title">Transposición didáctica</h2>
         <div class="chev-row">
           <div class="chev-box sabio"><b>Saber sabio</b><span>lo que sabe la ciencia</span></div>
           <svg class="chev-arrow" viewBox="0 0 420 40" aria-hidden="true">
             <line x1="4" y1="20" x2="396" y2="20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
             <path d="M386 8 L410 20 L386 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
           <div class="chev-box ensenado"><b>Saber enseñado</b><span>lo que llega al aula</span></div>
         </div>
         <p class="chev-vig fx"><b>Vigilancia epistemológica:</b> no perder de vista la distancia entre los dos.</p>`,
      ),
      4,
      5,
    );
    this.el.querySelectorAll('.maps-chev .chev-vig').forEach((el) => this.fx(el, 4, 5));
    this.fx(this.html('p', 'abs phrase fx maps-nobody', 'Nadie me dijo<br>que era un mapa.'), 5, 6);
    this.fx(
      this.html(
        'div',
        'abs maps-thesis',
        `<p class="phrase fx t1">Simplificar no es engañar.</p>
         <p class="phrase fx t2">Lo que engaña es ocultar<br>que estás simplificando.</p>`,
      ),
      6,
    );
    const thesis = this.el.querySelectorAll('.maps-thesis .fx');
    thesis.forEach((el) => this.fx(el, 6));
  }

  protected onStep(step: number, _prev: number, instant: boolean) {
    const [fx, fy, z] = VIEWS[step];
    const dur = 2.6;
    this.fx_.go(fx, this.now, instant, dur);
    this.fy_.go(fy, this.now, instant, dur);
    this.zoom.go(z, this.now, instant, dur, easeInOutCubic);
  }

  protected render() {
    // Paso 0: pizarra con el modelo del colegio en pequeño
    const cc = this.chalkCv.ctx;
    this.chalkCv.clear();
    const chalkA = this.step === 0 ? this.p(0, 1) : 0;
    if (chalkA > 0) {
      drawSchoolModel(cc, { cx: 1530, cy: 560, scale: 0.68, t: this.now, draw: this.p(0, 2.4, 0.3), threads: 1, forces: 0.8, alpha: chalkA });
      applyGrain(cc, 0.85);
    }

    const ctx = this.mapCv.ctx;
    this.mapCv.clear();
    const mapA = this.p(1, 1.4) * (1 - 0.85 * this.p(4, 1)) * (1 - this.p(6, 1.2));
    if (mapA <= 0) return;
    const z = this.zoom.value(this.now);
    const fx = this.fx_.value(this.now);
    const fy = this.fy_.value(this.now);
    const S = (wx: number, wy: number): [number, number] => [960 + (wx - fx) * z, 560 + (wy - fy) * z];

    ctx.save();
    ctx.globalAlpha = mapA;
    for (const g of REGIONS) {
      const a = g.from === 1 ? 1 : this.p(g.from, 1.6, 0.8);
      if (a <= 0) continue;
      ctx.save();
      this.drawRegion(ctx, g, S, z, a);
      ctx.restore();
    }
    ctx.restore();
  }

  private drawRegion(ctx: CanvasRenderingContext2D, g: Region, S: (x: number, y: number) => [number, number], z: number, a: number) {
    const [r, gg, b] = g.color;
    const path = (scale: number) => {
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const ang = (TAU * i) / 160;
        const rr = blobR(g, ang + scale * 0.6) * scale;
        const [x, y] = S(g.cx + Math.cos(ang) * rr, g.cy + Math.sin(ang) * rr);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    // Relleno suave
    const [cx, cy] = S(g.cx, g.cy);
    const fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.r * z * 1.05);
    fill.addColorStop(0, `rgba(${r},${gg},${b},${g.dashed ? 0.03 : 0.12})`);
    fill.addColorStop(1, `rgba(${r},${gg},${b},${g.dashed ? 0.06 : 0.04})`);
    path(1);
    ctx.fillStyle = fill;
    ctx.globalAlpha *= a;
    ctx.fill();

    // Curvas de nivel, como en un mapa topográfico
    const rings = g.dashed ? 1 : 7;
    for (let i = 0; i < rings; i++) {
      const sc = 1 - i * 0.125;
      path(sc);
      ctx.strokeStyle = `rgba(${r},${gg},${b},${i === 0 ? 0.95 : 0.32 - i * 0.03})`;
      ctx.lineWidth = i === 0 ? 2.6 : 1.4;
      ctx.setLineDash(g.dashed ? [14, 12] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Nombre del mapa, en el borde superior izquierdo
    const nameA = g.name === 'Newton' ? smoothstep(0.42, 0.6, z) : 1;
    const ang = -2.25;
    const [nx, ny] = S(g.cx + Math.cos(ang) * blobR(g, ang) * 1.02, g.cy + Math.sin(ang) * blobR(g, ang) * 1.02);
    ctx.save();
    ctx.globalAlpha *= nameA;
    ctx.fillStyle = `rgb(${r},${gg},${b})`;
    ctx.font = `500 ${g.dashed ? 84 : 58}px Newsreader, serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(g.name, nx - 6, ny - 6);
    ctx.restore();

    // Lugares del mapa
    const placeA = smoothstep(g.minZoom * 0.8, g.minZoom, z) * (g.from === 1 ? this.p(1, 1.2, 1.2) : this.p(g.from, 1.2, 1.8));
    if (placeA <= 0) return;
    ctx.save();
    ctx.globalAlpha *= placeA;
    ctx.font = 'italic 400 29px Newsreader, serif';
    ctx.textBaseline = 'middle';
    for (const p of g.places) {
      const [x, y] = S(g.cx + p.x, g.cy + p.y);
      ctx.fillStyle = `rgb(${r},${gg},${b})`;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e9edf7';
      ctx.fillText(p.label, x + 16, y + 1);
    }
    ctx.restore();
  }
}
