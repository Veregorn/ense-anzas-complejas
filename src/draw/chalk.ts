/**
 * Dibujo "a tiza" sobre canvas: trazos con pequeños temblores de mano, varias pasadas
 * superpuestas y grano. Todo es determinista (con semilla) para que no tiemble entre fotogramas.
 */
import { hash2, TAU } from '../core/math';
import { grainCanvas } from '../core/textures';

export type Pt = [number, number];

export interface ChalkStyle {
  color?: string;
  width?: number;
  /** 0..1: fracción del trazo ya dibujada (para animar "escribir"). */
  progress?: number;
  alpha?: number;
  seed?: number;
}

const CHALK = '#ece8dc';

/** Temblor de mano: desplazamiento suave y determinista. */
function wobble(seed: number, i: number, amp: number) {
  const a = hash2(seed, Math.floor(i / 6));
  const b = hash2(seed, Math.floor(i / 6) + 1);
  const f = (i % 6) / 6;
  return (a + (b - a) * f - 0.5) * 2 * amp;
}

export function linePts(x1: number, y1: number, x2: number, y2: number, seed = 1, amp = 1.6, n = 28): Pt[] {
  const pts: Pt[] = [];
  const nx = -(y2 - y1);
  const ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = wobble(seed, i, amp) * Math.sin(Math.PI * t);
    pts.push([x1 + (x2 - x1) * t + (nx / len) * w, y1 + (y2 - y1) * t + (ny / len) * w]);
  }
  return pts;
}

export function circlePts(cx: number, cy: number, r: number, seed = 1, amp = 2.2, n = 120, start = -Math.PI / 2, overshoot = 0.04): Pt[] {
  const pts: Pt[] = [];
  const total = TAU * (1 + overshoot);
  for (let i = 0; i <= n; i++) {
    const a = start + (total * i) / n;
    const rr = r + wobble(seed, i, amp);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/** Recorta una polilínea a la fracción `progress` de su longitud. */
function partial(pts: Pt[], progress: number): Pt[] {
  if (progress >= 1) return pts;
  if (progress <= 0 || pts.length < 2) return [];
  const lens = [0];
  for (let i = 1; i < pts.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const target = lens[lens.length - 1] * progress;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= target) out.push(pts[i]);
    else {
      const f = (target - lens[i - 1]) / (lens[i] - lens[i - 1]);
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]);
      break;
    }
  }
  return out;
}

function strokePoly(ctx: CanvasRenderingContext2D, pts: Pt[], dx: number, dy: number) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + dx, pts[0][1] + dy);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + dx, pts[i][1] + dy);
  ctx.stroke();
}

export function chalkStroke(ctx: CanvasRenderingContext2D, pts: Pt[], s: ChalkStyle = {}) {
  const p = partial(pts, s.progress ?? 1);
  if (p.length < 2) return;
  const w = s.width ?? 4;
  const a = s.alpha ?? 1;
  if (a <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = s.color ?? CHALK;
  // Tres pasadas ligeramente desplazadas: la tiza nunca deja una línea perfecta.
  ctx.globalAlpha = 0.85 * a;
  ctx.lineWidth = w;
  strokePoly(ctx, p, 0, 0);
  ctx.globalAlpha = 0.45 * a;
  ctx.lineWidth = w * 0.55;
  strokePoly(ctx, p, w * 0.28, -w * 0.22);
  ctx.globalAlpha = 0.35 * a;
  ctx.lineWidth = w * 0.4;
  strokePoly(ctx, p, -w * 0.3, w * 0.25);
  ctx.restore();
}

/** Relleno rayado (como se colorea con tiza) dentro de un círculo. */
export function chalkHatchCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, s: ChalkStyle & { gap?: number; angle?: number } = {}) {
  const a = s.alpha ?? 1;
  if (a <= 0 || r <= 0) return;
  const gap = s.gap ?? Math.max(5, r / 4);
  const ang = s.angle ?? -0.7;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.94, 0, TAU);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.lineCap = 'round';
  ctx.strokeStyle = s.color ?? CHALK;
  ctx.lineWidth = s.width ?? 2.4;
  ctx.globalAlpha = 0.55 * a * (s.progress ?? 1);
  ctx.beginPath();
  for (let y = -r; y <= r; y += gap) {
    const j = (hash2(s.seed ?? 3, Math.round(y)) - 0.5) * gap * 0.5;
    ctx.moveTo(-r, y + j);
    ctx.lineTo(r, y - j);
  }
  ctx.stroke();
  ctx.restore();
}

export function chalkText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, s: ChalkStyle & { align?: CanvasTextAlign; weight?: number } = {}) {
  const a = s.alpha ?? 1;
  if (a <= 0) return;
  ctx.save();
  ctx.font = `${s.weight ?? 400} ${size}px Kalam, cursive`;
  ctx.textAlign = s.align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = s.color ?? CHALK;
  ctx.globalAlpha = 0.92 * a;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 0.35 * a;
  ctx.fillText(text, x + 1.2, y - 0.8);
  ctx.restore();
}

/** Flecha a tiza de (x1,y1) a (x2,y2). */
export function chalkArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, s: ChalkStyle & { head?: number } = {}) {
  const seed = s.seed ?? 5;
  chalkStroke(ctx, linePts(x1, y1, x2, y2, seed, 1, 12), s);
  if ((s.progress ?? 1) < 0.9) return;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = s.head ?? 16;
  for (const side of [-1, 1]) {
    const a = ang + Math.PI - side * 0.45;
    chalkStroke(ctx, linePts(x2, y2, x2 + Math.cos(a) * h, y2 + Math.sin(a) * h, seed + side, 0.6, 6), { ...s, progress: 1 });
  }
}

/** Aplica el grano a todo lo dibujado hasta ahora en el canvas (llamar al final del fotograma). */
export function applyGrain(ctx: CanvasRenderingContext2D, strength = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = strength;
  const pat = ctx.createPattern(grainCanvas(), 'repeat');
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, 1920, 1080);
  }
  ctx.restore();
}
