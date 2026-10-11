/**
 * El escenario: un lienzo lógico de 1920×1080 que se escala para llenar la pantalla
 * (con bandas negras si la proporción no es 16:9). Todo se diseña en esas coordenadas.
 */
export const W = 1920;
export const H = 1080;

export class Stage {
  readonly root: HTMLElement;
  scale = 1;
  private listeners = new Set<() => void>();

  constructor(host: HTMLElement) {
    this.root = document.createElement('main');
    this.root.className = 'stage';
    host.appendChild(this.root);
    window.addEventListener('resize', () => this.fit());
    this.fit();
  }

  /** Densidad de píxeles real para los lienzos (limitada para no fundir proyectores 4K). */
  get pixelRatio() {
    return Math.min(2.5, this.scale * (window.devicePixelRatio || 1));
  }

  onResize(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private fit() {
    this.scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    this.root.style.transform = `translate(-50%, -50%) scale(${this.scale})`;
    this.listeners.forEach((fn) => fn());
  }
}

/** Lienzo 2D nítido en coordenadas lógicas 1920×1080. */
export class Canvas2D {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private off: () => void;

  constructor(
    private stage: Stage,
    parent: HTMLElement,
    className = '',
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = `layer ${className}`.trim();
    parent.appendChild(this.canvas);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D no disponible');
    this.ctx = ctx;
    this.off = stage.onResize(() => this.resize());
    this.resize();
  }

  resize() {
    const pr = this.stage.pixelRatio;
    this.canvas.width = Math.round(W * pr);
    this.canvas.height = Math.round(H * pr);
    this.ctx.setTransform(pr, 0, 0, pr, 0, 0);
  }

  clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  dispose() {
    this.off();
    this.canvas.remove();
  }
}
