import { Canvas2D, type Stage } from './stage';
import { clamp01, easeInOutCubic, type Ease } from './math';

export const clock = () => performance.now() / 1000;

type Fx = { el: Element; from: number; to: number };

/**
 * Una escena = un bloque del guion. Avanza por "pasos" (un clic del mando = un paso).
 *
 * - Las animaciones de fondo (órbitas, flujo del tiempo…) corren solas en `render`.
 * - Los cambios de idea solo ocurren al cambiar de paso.
 * - `p(k, dur)` devuelve el progreso 0..1 de la aparición del paso k, para animar en canvas.
 * - `fx(el, desde, hasta)` muestra un elemento HTML mientras el paso esté en [desde, hasta).
 */
export abstract class Scene {
  abstract readonly id: string;
  abstract readonly stepCount: number;
  readonly el: HTMLElement;
  protected stage!: Stage;
  protected step = 0;
  protected now = clock();
  private enteredAt: number[] = [];
  private fxs: Fx[] = [];
  private canvases: Canvas2D[] = [];

  constructor() {
    this.el = document.createElement('section');
    this.el.className = 'scene';
  }

  get stepIndex() {
    return this.step;
  }

  mount(stage: Stage, step: number, instant: boolean) {
    this.stage = stage;
    this.el.dataset.scene = this.id;
    this.build();
    this.setStep(step, instant, true);
  }

  /** Crea el DOM y los lienzos de la escena. */
  protected abstract build(): void;

  /** Dibuja un fotograma. `dt` en segundos. */
  protected abstract render(dt: number): void;

  /** Reacciona a un cambio de paso (programar tweens, etc.). */
  protected onStep(_step: number, _prev: number, _instant: boolean): void {}

  protected dispose(): void {}

  setStep(step: number, instant = false, fresh = false) {
    this.now = clock();
    const prev = fresh ? -1 : this.step;
    const s = Math.max(0, Math.min(this.stepCount - 1, step));
    for (let k = 0; k <= s; k++) {
      if (instant) this.enteredAt[k] = -1e9;
      else if (k > prev) this.enteredAt[k] = this.now;
    }
    this.enteredAt.length = s + 1;
    this.step = s;
    this.el.classList.toggle('instant', instant);
    for (const f of this.fxs) f.el.classList.toggle('on', s >= f.from && s < f.to);
    this.onStep(s, prev, instant);
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => this.el.classList.remove('instant')));
  }

  update(now: number, dt: number) {
    this.now = now;
    this.render(dt);
  }

  destroy() {
    this.dispose();
    this.canvases.forEach((c) => c.dispose());
    this.el.remove();
  }

  // ——— Ayudas para las escenas ———

  /** Progreso (0..1, con easing) de la aparición del paso `k`. */
  protected p(k: number, dur = 1, delay = 0, ease: Ease = easeInOutCubic) {
    if (this.step < k) return 0;
    const t0 = this.enteredAt[k] ?? -1e9;
    return ease(clamp01((this.now - t0 - delay) / dur));
  }

  /** Segundos desde que se entró en el paso `k` (o -1 si aún no se ha llegado). */
  protected since(k: number) {
    if (this.step < k) return -1;
    return this.now - (this.enteredAt[k] ?? -1e9);
  }

  protected fx<T extends Element>(el: T, from: number, to = Infinity): T {
    this.fxs.push({ el, from, to });
    el.classList.toggle('on', this.step >= from && this.step < to);
    return el;
  }

  protected html<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    inner = '',
    parent: HTMLElement = this.el,
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    el.className = className;
    if (inner) el.innerHTML = inner;
    parent.appendChild(el);
    return el;
  }

  protected canvas(className = '', parent: HTMLElement = this.el) {
    const c = new Canvas2D(this.stage, parent, className);
    this.canvases.push(c);
    return c;
  }
}
