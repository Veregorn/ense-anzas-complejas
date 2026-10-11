import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { clamp01, easeInOutCubic, easeOutCubic, mixRgb, phase, rgba, rng, TAU } from '../core/math';
import { hex, rgb } from '../core/palette';

const GROUND = 930;
const TOP = 110;
const APPLE = { x: 1420, y: 478, r: 30 };
const PERSON_X = 430;
const CLOCK_X = 640;

/** Altura normalizada: 0 en el suelo, 1 arriba del todo. */
const height01 = (y: number) => clamp01((GROUND - y) / (GROUND - TOP));
/** Ritmo del flujo del tiempo (exagerado): más lento cerca del suelo. */
const flowSpeed = (y: number) => 55 + 470 * Math.pow(height01(y), 1.15);

interface Streak {
  x: number;
  y: number;
}

/**
 * Bloque 3 · Por qué cae una manzana: el tiempo pasa más despacio cerca de la Tierra.
 * Pasos: la pregunta → el flujo del tiempo → cabeza y pies → la manzana cae → datos → frase.
 */
export class AppleScene extends Scene {
  readonly id = 'manzana';
  readonly stepCount = 6;
  private cv!: Canvas2D;
  private streaks: Streak[] = [];
  private headCount!: HTMLElement;
  private feetCount!: HTMLElement;
  /** Momento en que arrancan los relojes (paso 2). */
  private clockT0 = 0;

  protected build() {
    this.html('div', 'bg bg-night');
    this.cv = this.canvas();

    this.fx(this.html('p', 'abs quote fx ap-question', '¿Por qué cae una manzana que está quieta?'), 0, 1);
    this.fx(this.html('p', 'abs caption fx ap-caption', 'Cerca de la Tierra, el tiempo pasa más despacio.'), 1, 3);
    this.fx(this.html('p', 'abs ap-gauge-top fx', 'más deprisa'), 1, 4);
    this.fx(this.html('p', 'abs ap-gauge-bottom fx', 'más despacio'), 1, 4);

    const head = this.fx(this.html('div', 'abs ap-counter fx ap-counter-head', '<span>cabeza</span><b>0</b>'), 2, 4);
    const feet = this.fx(this.html('div', 'abs ap-counter fx ap-counter-feet', '<span>pies</span><b>0</b>'), 2, 4);
    this.headCount = head.querySelector('b')!;
    this.feetCount = feet.querySelector('b')!;
    this.fx(this.html('p', 'abs ap-note fx', 'Diferencia exagerada<br>unos mil billones de veces'), 2, 3);

    this.fx(this.html('p', 'abs ap-lbl ap-lbl-a fx', 'avanza por el tiempo'), 3, 4);
    this.fx(this.html('p', 'abs ap-lbl ap-lbl-b fx', 'su camino se tuerce<br>hacia el tiempo lento'), 3, 4);
    this.fx(this.html('p', 'abs ap-lbl ap-lbl-c fx', '…y en el espacio,<br>eso es caer.'), 3, 4);

    this.fx(this.html('div', 'scrim fx'), 4);
    this.fx(
      this.html(
        'div',
        'abs fx ap-data',
        `<p class="ap-num">1&#8202;/&#8202;10&#8239;000&#8239;000&#8239;000&#8239;000&#8239;000</p>
         <p class="caption soft">Diferencia en el ritmo del tiempo por cada metro de altura.</p>
         <div class="ap-exp">
           <svg viewBox="0 0 160 300" aria-hidden="true">
             <circle cx="56" cy="46" r="34" fill="none" stroke="#9fb2ff" stroke-width="3"/>
             <line x1="56" y1="46" x2="56" y2="22" stroke="#9fb2ff" stroke-width="3" stroke-linecap="round"/>
             <circle cx="56" cy="254" r="34" fill="none" stroke="#f0b45a" stroke-width="3"/>
             <line x1="56" y1="254" x2="74" y2="240" stroke="#f0b45a" stroke-width="3" stroke-linecap="round"/>
             <path d="M126 46 V254 M116 46 H136 M116 254 H136" stroke="#aab3cc" stroke-width="2" fill="none"/>
           </svg>
           <div>
             <p class="ap-year">2010</p>
             <p class="caption">Dos relojes atómicos separados <b>33&nbsp;cm</b>. El de arriba iba más rápido.</p>
           </div>
         </div>`,
      ),
      4,
      5,
    );
    this.fx(
      this.html(
        'div',
        'abs fx ap-phrase',
        `<p class="phrase">La manzana no cae porque la Tierra tire de ella.</p>
         <p class="phrase ap-phrase-2">Cae porque, cerca de la Tierra, el tiempo pasa más despacio.</p>`,
      ),
      5,
    );

    const r = rng(8);
    for (let i = 0; i < 260; i++) this.streaks.push({ x: r() * 2000 - 40, y: TOP + Math.pow(r(), 0.9) * (GROUND - TOP - 20) });
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step >= 2 && (prev < 2 || instant)) this.clockT0 = this.now;
  }

  protected render(dt: number) {
    const { ctx } = this.cv;
    this.cv.clear();
    this.drawEarth(ctx);
    this.drawFlow(ctx, dt, this.p(1, 1.6));
    this.drawGauge(ctx, this.p(1, 1.2, 0.4) * (1 - this.p(4, 0.6)));
    this.drawPerson(ctx, this.p(2, 1.2));
    this.drawTree(ctx);
    this.drawAppleAndFall(ctx);
  }

  private drawEarth(ctx: CanvasRenderingContext2D) {
    const R = 5200;
    const cx = 960;
    const cy = GROUND + R;
    const atm = ctx.createRadialGradient(cx, cy, R - 6, cx, cy, R + 150);
    atm.addColorStop(0, 'rgba(120,150,255,0.30)');
    atm.addColorStop(1, 'rgba(120,150,255,0)');
    ctx.fillStyle = atm;
    ctx.fillRect(0, GROUND - 160, 1920, 220);
    const land = ctx.createLinearGradient(0, GROUND, 0, 1080);
    land.addColorStop(0, '#16223f');
    land.addColorStop(1, '#070b18');
    ctx.fillStyle = land;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(159,178,255,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 1.3, Math.PI * 1.7);
    ctx.stroke();
  }

  /** Estelas que fluyen hacia la derecha: el paso del tiempo, más lento cerca del suelo. */
  private drawFlow(ctx: CanvasRenderingContext2D, dt: number, vis: number) {
    for (const s of this.streaks) {
      s.x += flowSpeed(s.y) * dt;
      if (s.x > 1990) s.x = -60 - Math.random() * 80;
    }
    if (vis <= 0) return;
    ctx.lineCap = 'round';
    for (const s of this.streaks) {
      const u = height01(s.y);
      const v = flowSpeed(s.y);
      const len = 14 + v * 0.17;
      const c = mixRgb(rgb.time, [214, 226, 255], u);
      const g = ctx.createLinearGradient(s.x - len, 0, s.x, 0);
      g.addColorStop(0, rgba(c, 0));
      g.addColorStop(1, rgba(c, 0.55 * vis));
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(s.x - len, s.y);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
  }

  private drawGauge(ctx: CanvasRenderingContext2D, a: number) {
    if (a <= 0) return;
    const g = ctx.createLinearGradient(0, 300, 0, 890);
    g.addColorStop(0, 'rgba(214,226,255,0.9)');
    g.addColorStop(1, 'rgba(240,180,90,0.95)');
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(92, 300, 8, 590, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawPerson(ctx: CanvasRenderingContext2D, a: number) {
    if (a <= 0) return;
    const x = PERSON_X;
    const g = GROUND;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#121c3a';
    ctx.strokeStyle = 'rgba(159,178,255,0.55)';
    ctx.lineWidth = 2;
    const parts: [number, number, number, number, number][] = [
      [x - 52, g - 388, 104, 190, 34],
      [x - 40, g - 214, 35, 212, 15],
      [x + 5, g - 214, 35, 212, 15],
      [x - 78, g - 378, 25, 176, 12],
      [x + 53, g - 378, 25, 176, 12],
    ];
    for (const [px, py, w, h, r] of parts) {
      ctx.beginPath();
      ctx.roundRect(px, py, w, h, r);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, g - 434, 37, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Relojes de cabeza y pies (el de los pies va más lento, exagerado)
    const el = this.step >= 2 ? Math.max(0, this.now - this.clockT0) : 0;
    const headY = g - 440;
    const feetY = g - 66;
    this.dotted(ctx, x + 44, g - 434, CLOCK_X - 62, headY);
    this.dotted(ctx, x + 44, g - 14, CLOCK_X - 62, feetY);
    this.clock(ctx, CLOCK_X, headY, el * 0.26, hex.starlight);
    this.clock(ctx, CLOCK_X, feetY, el * 0.26 * 0.5, hex.time);
    ctx.restore();
    this.headCount.textContent = String(Math.floor(el * 12));
    this.feetCount.textContent = String(Math.floor(el * 6));
  }

  private dotted(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.save();
    ctx.setLineDash([3, 7]);
    ctx.strokeStyle = 'rgba(170,179,204,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  private clock(ctx: CanvasRenderingContext2D, x: number, y: number, rev: number, color: string) {
    const r = 58;
    ctx.save();
    ctx.fillStyle = 'rgba(8,13,32,0.92)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (TAU * i) / 12;
      const r1 = i % 3 ? r - 9 : r - 15;
      ctx.lineWidth = i % 3 ? 2 : 3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.lineTo(x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4));
      ctx.stroke();
    }
    const a = -Math.PI / 2 + TAU * rev;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(a) * 10, y - Math.sin(a) * 10);
    ctx.lineTo(x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14));
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawTree(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#0e1730';
    ctx.strokeStyle = 'rgba(159,178,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1790, GROUND + 4);
    ctx.bezierCurveTo(1800, 700, 1770, 480, 1792, 250);
    ctx.lineTo(1846, 250);
    ctx.bezierCurveTo(1850, 480, 1880, 700, 1885, GROUND + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Rama
    ctx.beginPath();
    ctx.moveTo(1800, 360);
    ctx.bezierCurveTo(1660, 330, 1520, 328, 1360, 352);
    ctx.lineTo(1362, 340);
    ctx.bezierCurveTo(1520, 312, 1660, 312, 1802, 330);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Hojas
    const leaves: [number, number, number, number, number][] = [
      [1560, 316, 46, 20, -0.4],
      [1640, 352, 40, 17, 0.5],
      [1470, 330, 38, 16, -0.2],
      [1700, 300, 44, 18, -0.6],
      [1395, 334, 30, 13, 0.4],
    ];
    for (const [x, y, rx, ry, rot] of leaves) {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
      ctx.fillStyle = '#163a35';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,210,190,0.35)';
      ctx.stroke();
    }
    // Copa
    const crown: [number, number, number][] = [
      [1810, 180, 150],
      [1700, 150, 110],
      [1900, 260, 120],
    ];
    for (const [x, y, r] of crown) {
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 10, x, y, r);
      g.addColorStop(0, '#1b3f3a');
      g.addColorStop(1, '#0f2424');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private apple(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, alpha = 1) {
    const r = APPLE.r;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 3, 0, 0, r * 1.1);
    g.addColorStop(0, '#ff8a6b');
    g.addColorStop(0.55, hex.apple);
    g.addColorStop(1, '#7d1f1f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.72);
    ctx.bezierCurveTo(r * 0.9, -r * 1.25, r * 1.35, r * 0.2, r * 0.45, r * 0.95);
    ctx.bezierCurveTo(r * 0.2, r * 1.1, -r * 0.2, r * 1.1, -r * 0.45, r * 0.95);
    ctx.bezierCurveTo(-r * 1.35, r * 0.2, -r * 0.9, -r * 1.25, 0, -r * 0.72);
    ctx.fill();
    ctx.strokeStyle = '#3b2a1a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.quadraticCurveTo(2, -r * 1.2, 6, -r * 1.55);
    ctx.stroke();
    ctx.restore();
  }

  /** La pieza clave: el "frente" de la manzana en el tiempo se inclina y su camino se tuerce. */
  private drawAppleAndFall(ctx: CanvasRenderingContext2D) {
    const T = this.since(3);
    const sway = Math.sin(this.now * 1.4) * 0.05;
    const { x, y } = APPLE;

    if (T < 0) {
      this.stem(ctx, x, y);
      this.apple(ctx, x, y, sway);
      return;
    }

    const show = phase(T, 0, 0.8) * (1 - phase(T, 3.8, 4.4));
    const k = easeInOutCubic(phase(T, 1.0, 3.6));
    const offTop = 230 * k;
    const offBot = 230 * k * 0.32;
    const tx = x + offTop;
    const bx = x + offBot;
    const ty = y - 92;
    const by = y + 92;

    if (show > 0) {
      ctx.save();
      ctx.globalAlpha = show;
      // Recorrido de la parte de arriba (rápida) y la de abajo (lenta)
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(214,226,255,0.85)';
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(240,180,90,0.9)';
      ctx.beginPath();
      ctx.moveTo(x, by);
      ctx.lineTo(bx, by);
      ctx.stroke();
      // El frente: une ambas partes
      ctx.setLineDash([8, 9]);
      ctx.strokeStyle = 'rgba(233,237,247,0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const [px, py, c] of [
        [tx, ty, 'rgb(214,226,255)'],
        [bx, by, hex.time],
      ] as const) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, TAU);
        ctx.fill();
      }
      // Flecha perpendicular al frente: la dirección del camino
      const fx = bx - tx;
      const fy = by - ty;
      const nl = Math.hypot(fx, fy);
      const nx = fy / nl;
      const ny = -fx / nl;
      const cx = (tx + bx) / 2;
      const cy = (ty + by) / 2;
      const L = 210;
      const ex = cx + nx * L;
      const ey = cy + ny * L;
      ctx.strokeStyle = hex.ink;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      const ang = Math.atan2(ey - cy, ex - cx);
      ctx.fillStyle = hex.ink;
      ctx.beginPath();
      ctx.moveTo(ex + Math.cos(ang) * 8, ey + Math.sin(ang) * 8);
      ctx.lineTo(ex + Math.cos(ang + 2.5) * 26, ey + Math.sin(ang + 2.5) * 26);
      ctx.lineTo(ex + Math.cos(ang - 2.5) * 26, ey + Math.sin(ang - 2.5) * 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // La caída, con fotografía estroboscópica como en los libros de física
    const fall = T - 4.0;
    const g = 540;
    const yMax = GROUND - APPLE.r + 2;
    const yAt = (tt: number) => Math.min(yMax, y + 0.5 * g * Math.max(0, tt) ** 2);
    this.stem(ctx, x, y);
    if (fall > 0) {
      for (let i = 5; i >= 1; i--) {
        const tt = fall - i * 0.17;
        if (tt <= 0) continue;
        const yy = yAt(tt);
        if (yy >= yMax && i > 1 && yAt(tt - 0.17) >= yMax) continue;
        this.apple(ctx, x, yy, 0, 0.14 + 0.05 * (5 - i));
      }
    }
    const yNow = yAt(fall);
    const landed = yNow >= yMax;
    const settle = landed ? easeOutCubic(clamp01((fall - Math.sqrt((2 * (yMax - y)) / g)) / 0.7)) : 0;
    this.apple(ctx, x + settle * 18, yNow - Math.sin(settle * Math.PI) * 14, fall > 0 ? settle * 0.5 : sway * (1 - show));
  }

  private stem(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.strokeStyle = '#3b2a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 4, 348);
    ctx.lineTo(x + 4, y - APPLE.r * 1.5);
    ctx.stroke();
    ctx.restore();
  }
}
