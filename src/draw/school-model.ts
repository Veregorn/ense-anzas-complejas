/**
 * El Sistema Solar "de colegio", dibujado a tiza: el Sol, órbitas circulares
 * y planetas atados al Sol con hilos. Se reutiliza en varias escenas a distinta escala.
 */
import { clamp01, easeOutCubic, phase, TAU } from '../core/math';
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
