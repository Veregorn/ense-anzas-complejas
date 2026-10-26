/**
 * Las etiquetas de supermercado y el sello: la metáfora visual de la charla.
 * Son HTML (texto nítido a cualquier tamaño) y se animan con CSS al activarse (.on).
 */
import { rng } from '../core/math';

/** Código de barras falso pero creíble: barras de anchura variable con semilla. */
export function barcode(seed: number, width = 220, height = 46) {
  const r = rng(seed);
  let x = 0;
  let bars = '';
  while (x < width) {
    const w = 1 + Math.floor(r() * 4);
    if (r() > 0.45) bars += `<rect x="${x}" y="0" width="${w}" height="${height}"/>`;
    x += w + 1;
  }
  return `<svg class="tag-barcode" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

export interface TagOptions {
  /** Franja superior (tipo de etiqueta). */
  head: string;
  /** Texto principal, grande. */
  main: string;
  /** Línea pequeña opcional bajo el texto principal. */
  sub?: string;
  /** Inclinación en grados. */
  rot?: number;
  /** Variante de color de la franja. */
  tone?: 'red' | 'green' | 'blue';
  seed?: number;
  className?: string;
}

export function tagHTML(o: TagOptions) {
  return `<div class="tag tone-${o.tone ?? 'red'} ${o.className ?? ''}" style="--rot:${o.rot ?? -4}deg">
    <div class="tag-head">${o.head}</div>
    <div class="tag-body">
      <div class="tag-main">${o.main}</div>
      ${o.sub ? `<div class="tag-sub">${o.sub}</div>` : ''}
      ${barcode(o.seed ?? 7)}
    </div>
  </div>`;
}

/** Etiqueta de "ficha técnica" con varias líneas (la herramienta del profesor). */
export function specTagHTML(rows: [string, string][], head: string, seed = 3, rot = -2) {
  return `<div class="tag tag-spec tone-green" style="--rot:${rot}deg">
    <div class="tag-head">${head}</div>
    <div class="tag-body">
      ${rows.map(([k, v]) => `<div class="tag-row"><span>${k}</span><b>${v}</b></div>`).join('')}
      ${barcode(seed, 300, 40)}
    </div>
  </div>`;
}

export function stampHTML(text: string, sub = '', rot = -12) {
  return `<div class="stamp" style="--rot:${rot}deg"><span>${text}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
}
