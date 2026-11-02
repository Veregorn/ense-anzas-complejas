import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { clamp01, easeInOutCubic, easeOutCubic, lerp, rng, TAU } from '../core/math';
import { hex } from '../core/palette';
import { tagHTML } from '../draw/tag';

const COLS = 9;
const ROWS = 4;
const SP = 160;
const X0 = 960 - ((COLS - 1) * SP) / 2;
const Y0 = 250;
const P_AT = [2, 1] as const;
const B_AT = [5, 2] as const;
const ax = (c: number) => X0 + c * SP;
const ay = (r: number) => Y0 + r * SP;
const ELEC = '#8fd0ff';
const HOP = 0.95;

type Slot = { x: number; y: number };

/** Los dos electrones ("las manos") de un enlace, desplazados a cada lado de la línea. */
function bondSlots(x1: number, y1: number, x2: number, y2: number): [Slot, Slot] {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const horiz = y1 === y2;
  const o = 9;
  return horiz ? [{ x: mx, y: my - o }, { x: mx, y: my + o }] : [{ x: mx - o, y: my }, { x: mx + o, y: my }];
}

/**
 * Bloque 4d · Los semiconductores: red de silicio, dopaje con fósforo (electrón libre)
 * y, en otro cristal, con boro (hueco que se mueve, como un asiento libre en el cine).
 * Nunca los dos en el mismo trozo: se compensarían y conduciría peor.
 */
export class RecSemisScene extends Scene {
  readonly id = 'rec-semis';
  readonly stepCount = 4;
  private cv!: Canvas2D;
  private walk: Slot[] = [];

  protected build() {
    this.html('div', 'bg bg-night');
    this.cv = this.canvas();
    this.fx(this.html('p', 'abs fx sm-case', 'Los semiconductores'), 0);
    this.fx(this.html('p', 'abs fx sm-cap', 'Cada átomo de silicio se da la mano con cuatro vecinos. Todas las manos ocupadas: apenas conduce.'), 0, 1);
    this.fx(this.html('p', 'abs fx sm-cap', '<b class="amber">Fósforo</b>: cinco manos. Le sobra una, un electrón libre. Y si algo se mueve, hay corriente.'), 1, 2);
    this.fx(this.html('p', 'abs fx sm-cap', '<b class="rose">Boro</b>: tres manos. Falta una, y queda un hueco… que se mueve.'), 2);
    this.fx(this.html('p', 'abs fx sm-new', 'Otro cristal, ahora con boro'), 2);
    this.fx(this.html('p', 'abs fx sm-cine-cap', 'Como un asiento libre en el cine cuando la gente se va cambiando de sitio'), 2);
    // La etiqueta del bloque 1 vuelve: «Ingredientes: no consta»… y al final se tacha
    const old = this.html(
      'div',
      'abs sm-old',
      tagHTML({ head: 'Ingredientes', main: 'No consta', tone: 'blue', rot: -3, seed: 37, className: 'tag-small' }) + '<div class="sm-strike"></div>',
    );
    this.fx(old.querySelector('.tag')!, 0);
    this.fx(old.querySelector('.sm-strike')!, 3);
    const tag = this.html(
      'div',
      'abs sm-tag',
      tagHTML({ head: 'Ingredientes', main: 'Si + P · Si + B', sub: 'Modelo de las manos. En Bachillerato: bandas de energía', tone: 'blue', rot: -3, seed: 97 }),
    );
    this.fx(tag.firstElementChild!, 3);

    // Camino del electrón libre: de hueco en hueco entre los átomos de la red
    const r = rng(15);
    let c = P_AT[0] + 0.5;
    let rr = P_AT[1] + 0.5;
    this.walk.push({ x: ax(P_AT[0]), y: ay(P_AT[1]) - 40 });
    for (let i = 0; i < 80; i++) {
      this.walk.push({ x: ax(c), y: ay(rr) });
      const dir = Math.floor(r() * 4);
      const nc = c + [1, -1, 0, 0][dir];
      const nr = rr + [0, 0, 1, -1][dir];
      if (nc > 0 && nc < COLS - 1 && nr > 0 && nr < ROWS - 1) {
        c = nc;
        rr = nr;
      }
    }
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step === 3 && prev < 3 && !instant) this.shake(200);
  }

  protected render() {
    const ctx = this.cv.ctx;
    this.cv.clear();
    const appear = this.p(0, 1.6);
    // El boro va en otro cristal: al entrar, el fósforo vuelve a ser silicio y su electrón desaparece
    const pIn = this.step >= 2 ? 0 : this.p(1, 0.8);
    const pFade = 1 - this.p(2, 0.6);
    const bIn = this.p(2, 0.8);
    const holeT = this.since(2);

    // Enlaces y electrones de enlace
    const bonds: { a: [number, number]; b: [number, number] }[] = [];
    for (let rr = 0; rr < ROWS; rr++) {
      for (let c = 0; c < COLS; c++) {
        if (c < COLS - 1) bonds.push({ a: [c, rr], b: [c + 1, rr] });
        if (rr < ROWS - 1) bonds.push({ a: [c, rr], b: [c, rr + 1] });
      }
    }
    // Hueco: recorre los enlaces horizontales de la fila del boro hacia la derecha
    const hops = holeT < 0 ? -1 : Math.floor(holeT / HOP);
    const frac = holeT < 0 ? 0 : (holeT % HOP) / HOP;
    const holeBond = (k: number) => B_AT[0] + (k % (COLS - 1 - B_AT[0]));
    const holeCol = hops < 0 ? -1 : holeBond(hops);
    const nextCol = hops < 0 ? -1 : holeBond(hops + 1);

    ctx.save();
    ctx.globalAlpha = appear;
    ctx.lineCap = 'round';
    for (const { a, b } of bonds) {
      const x1 = ax(a[0]);
      const y1 = ay(a[1]);
      const x2 = ax(b[0]);
      const y2 = ay(b[1]);
      ctx.strokeStyle = 'rgba(159,178,255,0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const slots = bondSlots(x1, y1, x2, y2);
      const isRowB = a[1] === B_AT[1] && b[1] === B_AT[1];
      slots.forEach((s, i) => {
        if (isRowB && i === 0 && hops >= 0) {
          if (a[0] === holeCol) {
            this.hole(ctx, s, bIn);
            return;
          }
          if (a[0] === nextCol && frac > 0.55) {
            // El electrón de la derecha salta al hueco
            const k = easeInOutCubic(clamp01((frac - 0.55) / 0.4));
            const target = bondSlots(ax(holeCol), y1, ax(holeCol + 1), y2)[0];
            this.electron(ctx, { x: lerp(s.x, target.x, k), y: lerp(s.y, target.y, k) - Math.sin(k * Math.PI) * 26 }, 1.3);
            return;
          }
        }
        this.electron(ctx, s, 1);
      });
    }
    // Enlaces que salen de la red (la red continúa)
    for (let rr = 0; rr < ROWS; rr++) {
      for (const [c, dx] of [[0, -1], [COLS - 1, 1]] as const) {
        const x = ax(c);
        const y = ay(rr);
        ctx.strokeStyle = 'rgba(159,178,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * 90, y);
        ctx.stroke();
      }
    }

    // Átomos
    for (let rr = 0; rr < ROWS; rr++) {
      for (let c = 0; c < COLS; c++) {
        const delay = (c + rr) * 0.05;
        const s = easeOutCubic(clamp01((this.since(0) - delay) / 0.5));
        let kind: 'Si' | 'P' | 'B' = 'Si';
        let mix = 0;
        if (c === P_AT[0] && rr === P_AT[1] && pIn > 0) {
          kind = 'P';
          mix = pIn;
        }
        if (c === B_AT[0] && rr === B_AT[1] && bIn > 0) {
          kind = 'B';
          mix = bIn;
        }
        this.atom(ctx, ax(c), ay(rr), kind, mix, s, kind === 'P' && this.since(1) > 1.6 ? '+' : kind === 'B' && hops >= 1 ? '−' : '');
      }
    }
    ctx.restore();

    // Electrón libre del fósforo
    const T = this.since(1);
    if (T > 0.6 && pFade > 0) {
      const tt = (T - 0.6) / 0.55;
      const i = Math.min(this.walk.length - 2, Math.floor(tt));
      const k = easeInOutCubic(tt - Math.floor(tt));
      const trail = 8;
      for (let j = trail; j >= 0; j--) {
        const tj = Math.max(0, tt - j * 0.12);
        const ij = Math.min(this.walk.length - 2, Math.floor(tj));
        const kj = easeInOutCubic(tj - Math.floor(tj));
        const p = { x: lerp(this.walk[ij].x, this.walk[ij + 1].x, kj), y: lerp(this.walk[ij].y, this.walk[ij + 1].y, kj) };
        ctx.globalAlpha = (1 - j / trail) * 0.35 * pFade;
        this.electron(ctx, p, 1.2);
      }
      ctx.globalAlpha = pFade;
      const p = { x: lerp(this.walk[i].x, this.walk[i + 1].x, k), y: lerp(this.walk[i].y, this.walk[i + 1].y, k) };
      this.electron(ctx, p, 2.1, hex.time);
      ctx.globalAlpha = 1;
    }

    if (holeT >= 0) this.drawCinema(ctx, hops, frac, this.p(2, 1, 0.4));
    this.drawBulb(ctx, appear);
  }

  /** ¿Conduce? Una bombilla: casi apagada con el silicio puro, encendida en cuanto algo se mueve. */
  private drawBulb(ctx: CanvasRenderingContext2D, a: number) {
    if (a <= 0) return;
    const x = 1800;
    const y = 450;
    const on = this.step >= 3 ? 1 : this.step === 2 ? 0.12 + 0.88 * this.p(2, 0.8, 1.0) : this.step === 1 ? this.p(1, 0.9, 1.0) : 0;
    const level = 0.05 + 0.03 * Math.sin(this.now * 3) + 0.92 * on;
    ctx.save();
    ctx.globalAlpha = a;
    // Resplandor
    const glow = ctx.createRadialGradient(x, y, 10, x, y, 190);
    glow.addColorStop(0, `rgba(255,210,138,${0.55 * level})`);
    glow.addColorStop(1, 'rgba(255,210,138,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 200, y - 200, 400, 400);
    // Cristal
    const glass = ctx.createRadialGradient(x - 14, y - 16, 4, x, y, 52);
    glass.addColorStop(0, `rgba(255,244,214,${0.15 + 0.85 * level})`);
    glass.addColorStop(1, `rgba(255,190,110,${0.06 + 0.5 * level})`);
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.arc(x, y, 50, Math.PI * 0.72, Math.PI * 2.28);
    ctx.lineTo(x + 20, y + 62);
    ctx.lineTo(x - 20, y + 62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(220,226,245,${0.5 + 0.5 * level})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    // Filamento
    ctx.strokeStyle = level > 0.3 ? '#fff6dc' : 'rgba(200,190,170,0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 52);
    ctx.lineTo(x - 12, y + 6);
    for (let i = 0; i <= 6; i++) ctx.lineTo(x - 12 + i * 4, y + (i % 2 ? -6 : 6));
    ctx.lineTo(x + 12, y + 52);
    ctx.stroke();
    // Casquillo
    ctx.fillStyle = '#8a92a8';
    ctx.beginPath();
    ctx.roundRect(x - 22, y + 62, 44, 34, 6);
    ctx.fill();
    ctx.strokeStyle = '#5c637a';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 22, y + 62 + i * 8.5);
      ctx.lineTo(x + 22, y + 62 + i * 8.5);
      ctx.stroke();
    }
    // Rótulo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'italic 400 28px Newsreader, serif';
    ctx.fillStyle = `rgba(200,206,228,${1 - on})`;
    ctx.fillText('Silicio puro:', x, y + 116);
    ctx.fillText('apenas conduce', x, y + 150);
    ctx.font = 'italic 600 34px Newsreader, serif';
    ctx.fillStyle = `rgba(255,210,138,${on})`;
    ctx.fillText('Conduce', x, y + 126);
    ctx.restore();
  }

  private electron(ctx: CanvasRenderingContext2D, s: Slot, scale = 1, color = ELEC) {
    const r = 6 * scale;
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
    g.addColorStop(0, color);
    g.addColorStop(0.3, color + 'aa');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * 0.55, 0, TAU);
    ctx.fill();
  }

  private hole(ctx: CanvasRenderingContext2D, s: Slot, a: number) {
    ctx.save();
    ctx.globalAlpha *= a;
    const pulse = 1 + 0.15 * Math.sin(this.now * 6);
    ctx.fillStyle = 'rgba(255,138,122,0.18)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 16 * pulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#ff8a7a';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(s.x, s.y, 16 * pulse, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private atom(ctx: CanvasRenderingContext2D, x: number, y: number, kind: 'Si' | 'P' | 'B', mix: number, s: number, ion: string) {
    if (s <= 0) return;
    const r = 34 * (0.6 + 0.4 * s) * (1 + 0.25 * Math.sin(Math.PI * mix));
    const col = kind === 'P' ? hex.time : kind === 'B' ? '#ff8a7a' : '#9fb2ff';
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
    g.addColorStop(0, kind === 'Si' ? '#3a4c8f' : col);
    g.addColorStop(1, kind === 'Si' ? '#1a2550' : '#5a2a1a');
    ctx.save();
    ctx.globalAlpha *= s;
    if (kind !== 'Si') {
      const halo = ctx.createRadialGradient(x, y, r, x, y, r * 2.6);
      halo.addColorStop(0, col + '66');
      halo.addColorStop(1, col + '00');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.6, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = kind === 'Si' ? 'rgba(159,178,255,0.7)' : col;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#eef1fa';
    ctx.font = '600 28px Newsreader, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kind, x, y + 1);
    if (ion) {
      ctx.fillStyle = col;
      ctx.font = '700 26px "IBM Plex Mono", monospace';
      ctx.fillText(ion, x + r * 0.95, y - r * 0.95);
    }
    ctx.restore();
  }

  /** Fila de cine: el asiento libre "viaja" hacia la derecha mientras la gente se corre a la izquierda. */
  private drawCinema(ctx: CanvasRenderingContext2D, hops: number, frac: number, a: number) {
    if (a <= 0) return;
    const n = 12;
    const x0 = 440;
    const dx = 80;
    const y = 960;
    const span = n - 3;
    const empty = 2 + (Math.max(0, hops) % span);
    ctx.save();
    ctx.globalAlpha = a;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * dx;
      ctx.fillStyle = '#4a1f2a';
      ctx.beginPath();
      ctx.roundRect(x - 30, y - 10, 60, 56, 10);
      ctx.fill();
      ctx.fillStyle = '#6b2b3a';
      ctx.beginPath();
      ctx.roundRect(x - 30, y - 34, 60, 30, 8);
      ctx.fill();
    }
    for (let i = 0; i < n; i++) {
      if (i === empty) continue;
      let x = x0 + i * dx;
      if (i === empty + 1 && frac > 0.55) x -= dx * easeInOutCubic(clamp01((frac - 0.55) / 0.4));
      const hop = i === empty + 1 && frac > 0.55 ? Math.sin(Math.PI * clamp01((frac - 0.55) / 0.4)) * 14 : 0;
      ctx.fillStyle = '#c9d3f2';
      ctx.beginPath();
      ctx.arc(x, y - 52 - hop, 15, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x - 22, y - 36 - hop, 44, 34, 14);
      ctx.fill();
    }
    // El asiento libre, marcado
    const ex = x0 + empty * dx;
    ctx.strokeStyle = '#ff8a7a';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(ex - 34, y - 70, 68, 120, 12);
    ctx.stroke();
    ctx.restore();
  }
}
