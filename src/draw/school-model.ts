/**
 * El Sistema Solar "de colegio", dibujado a tiza: el Sol, órbitas circulares
 * y planetas atados al Sol con hilos. Se reutiliza en varias escenas a distinta escala.
 */
import { clamp01, easeOutCubic, phase, rng, TAU } from '../core/math';
import { hex } from '../core/palette';
import { chalkArrow, chalkHatchCircle, chalkStroke, chalkText, circlePts, linePts, type Pt } from './chalk';

export interface Planet {
  orbit: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
}

export const PLANETS: Planet[] = [
  { orbit: 120, size: 13, speed: 0.62, phase: 0.6, color: '#ece8dc' },
  { orbit: 195, size: 19, speed: 0.38, phase: 2.6, color: '#f2c9a0' },
  { orbit: 280, size: 21, speed: 0.24, phase: 4.4, color: '#a9d0f5' },
  { orbit: 380, size: 31, speed: 0.15, phase: 1.3, color: '#f3d77e' },
];

export interface SchoolModelOpts {
  cx: number;
  cy: number;
  scale?: number;
  /** Tiempo en segundos (mueve los planetas). */
  t: number;
  /** 0..1: progreso del dibujo a mano. */
  draw?: number;
  alpha?: number;
  /** Mostrar etiquetas "F" con flechas hacia el Sol. */
  forces?: number;
  /** Opacidad de los hilos (0 = sin hilos). */
  threads?: number;
  /** Grosor extra de los hilos (resaltado). */
  threadGlow?: number;
}

export function planetPositions(o: SchoolModelOpts): Pt[] {
  const s = o.scale ?? 1;
  return PLANETS.map((p) => {
    const a = p.phase + o.t * p.speed;
    return [o.cx + Math.cos(a) * p.orbit * s, o.cy + Math.sin(a) * p.orbit * s];
  });
}

export function drawSchoolModel(ctx: CanvasRenderingContext2D, o: SchoolModelOpts) {
  const s = o.scale ?? 1;
  const d = o.draw ?? 1;
  const alpha = o.alpha ?? 1;
  if (alpha <= 0) return;
  const w = Math.max(1.6, 3.6 * s);

  // Órbitas
  PLANETS.forEach((p, i) => {
    const prog = easeOutCubic(phase(d, 0.05 + i * 0.08, 0.45 + i * 0.08));
    chalkStroke(ctx, circlePts(o.cx, o.cy, p.orbit * s, 40 + i, 1.8 * s, 140, -Math.PI / 2 + i), {
      width: w * 0.7,
      progress: prog,
      alpha: 0.55 * alpha,
    });
  });

  // Sol con rayos
  const sunP = easeOutCubic(phase(d, 0, 0.3));
  const sunR = 46 * s;
  chalkHatchCircle(ctx, o.cx, o.cy, sunR, { color: hex.chalkYellow, gap: 7 * s, width: 2.6 * s, progress: sunP, alpha, seed: 9 });
  chalkStroke(ctx, circlePts(o.cx, o.cy, sunR, 2, 1.5 * s), { width: w, color: hex.chalkYellow, progress: sunP, alpha });
  const rays = 12;
  for (let i = 0; i < rays; i++) {
    const a = (TAU * i) / rays + 0.12;
    const rp = clamp01((sunP - 0.4) / 0.6);
    const r1 = sunR + 12 * s;
    const r2 = sunR + (i % 2 ? 26 : 36) * s;
    chalkStroke(ctx, linePts(o.cx + Math.cos(a) * r1, o.cy + Math.sin(a) * r1, o.cx + Math.cos(a) * r2, o.cy + Math.sin(a) * r2, 70 + i, 0.6, 6), {
      width: w * 0.8,
      color: hex.chalkYellow,
      progress: rp,
      alpha,
    });
  }

  // Hilos Sol → planeta
  const pos = planetPositions(o);
  const th = (o.threads ?? 0) * alpha;
  if (th > 0) {
    pos.forEach(([x, y], i) => {
      const prog = easeOutCubic(phase(d, 0.55 + i * 0.06, 0.85 + i * 0.05));
      const ang = Math.atan2(y - o.cy, x - o.cx);
      const sx = o.cx + Math.cos(ang) * (sunR + 6 * s);
      const sy = o.cy + Math.sin(ang) * (sunR + 6 * s);
      const glow = o.threadGlow ?? 0;
      if (glow > 0) {
        chalkStroke(ctx, linePts(sx, sy, x, y, 90 + i, 1.2 * s, 24), {
          width: w * (1.2 + glow * 2.4),
          color: hex.chalkYellow,
          progress: prog,
          alpha: th * 0.35 * glow,
        });
      }
      chalkStroke(ctx, linePts(sx, sy, x, y, 90 + i, 1.2 * s, 24), {
        width: w * (0.8 + glow * 0.5),
        progress: prog,
        alpha: th,
      });
    });
  }

  // Planetas
  pos.forEach(([x, y], i) => {
    const p = PLANETS[i];
    const prog = easeOutCubic(phase(d, 0.35 + i * 0.08, 0.6 + i * 0.08));
    if (prog <= 0) return;
    const r = p.size * s * (0.6 + 0.4 * prog);
    chalkHatchCircle(ctx, x, y, r, { color: p.color, gap: 5 * s, width: 2 * s, alpha: alpha * prog, seed: 20 + i, angle: 0.9 });
    chalkStroke(ctx, circlePts(x, y, r, 30 + i, 0.8 * s, 40), { width: w * 0.8, color: p.color, alpha: alpha * prog });
  });

  // Fuerzas "F"
  const f = (o.forces ?? 0) * alpha;
  if (f > 0) {
    pos.forEach(([x, y], i) => {
      const ang = Math.atan2(o.cy - y, o.cx - x);
      const r0 = PLANETS[i].size * s + 8 * s;
      const len = 46 * s;
      chalkArrow(ctx, x + Math.cos(ang) * r0, y + Math.sin(ang) * r0, x + Math.cos(ang) * (r0 + len), y + Math.sin(ang) * (r0 + len), {
        width: w * 0.8,
        color: hex.chalkYellow,
        alpha: f,
        seed: 300 + i,
        head: 12 * s,
      });
      const nx = -Math.sin(ang) * 22 * s;
      const ny = Math.cos(ang) * 22 * s;
      chalkText(ctx, 'F', x + Math.cos(ang) * (r0 + len * 0.5) + nx, y + Math.sin(ang) * (r0 + len * 0.5) + ny, 30 * s, {
        color: hex.chalkYellow,
        alpha: f,
        align: 'center',
        weight: 700,
      });
    });
  }
}

/**
 * Los hilos se rompen: cada uno se parte por un punto, las mitades se recogen
 * y cae polvo de tiza. `bt` = segundos desde la rotura. Los planetas siguen girando.
 */
export function drawThreadBreak(ctx: CanvasRenderingContext2D, o: SchoolModelOpts, bt: number) {
  const s = o.scale ?? 1;
  const alphaAll = o.alpha ?? 1;
  const sunR = 46 * s;
  const k = easeOutCubic(Math.min(1, bt / 0.9));
  const pos = planetPositions(o);
  const posSnap = planetPositions({ ...o, t: o.t - bt });
  pos.forEach(([px, py], i) => {
    const f = 0.42 + ((i * 37) % 23) / 100;
    const ang = Math.atan2(py - o.cy, px - o.cx);
    const sx = o.cx + Math.cos(ang) * (sunR + 6 * s);
    const sy = o.cy + Math.sin(ang) * (sunR + 6 * s);
    const mx = sx + (px - sx) * f;
    const my = sy + (py - sy) * f;
    const a = (1 - k) * alphaAll;
    if (a > 0.01) {
      const sag = 22 * s * k;
      const w = Math.max(1.6, 3.6 * s) * 0.8;
      chalkStroke(ctx, linePts(sx, sy, sx + (mx - sx) * (1 - k), sy + (my - sy) * (1 - k) + sag, 90 + i, 1.2 * s, 14), { width: w, alpha: a });
      chalkStroke(ctx, linePts(px, py, px + (mx - px) * (1 - k), py + (my - py) * (1 - k) + sag, 95 + i, 1.2 * s, 14), { width: w, alpha: a });
    }
    // Polvo de tiza desde el punto de rotura
    const da = Math.max(0, 1 - bt / 2.2) * alphaAll;
    if (da <= 0) return;
    const [qx, qy] = posSnap[i];
    const qa = Math.atan2(qy - o.cy, qx - o.cx);
    const qsx = o.cx + Math.cos(qa) * (sunR + 6 * s);
    const qsy = o.cy + Math.sin(qa) * (sunR + 6 * s);
    const ox = qsx + (qx - qsx) * f;
    const oy = qsy + (qy - qsy) * f;
    const r = rng(500 + i);
    ctx.save();
    ctx.fillStyle = hex.chalk;
    ctx.globalAlpha = da * 0.8;
    for (let d = 0; d < 16; d++) {
      const vx = (r() - 0.5) * 90 * s;
      const vy = (-30 - r() * 70) * s;
      const size = 1 + r() * 2.4;
      ctx.fillRect(ox + vx * bt, oy + vy * bt + 0.5 * 260 * s * bt * bt, size, size);
    }
    ctx.restore();
  });
}
