import { clamp01, easeInOutCubic, lerp, type Ease } from './math';

/** Un número que se anima hacia un objetivo. Se consulta con `value(now)` en cada fotograma. */
export class Tween {
  private from: number;
  private to: number;
  private t0 = -1e9;
  private dur = 1;
  private ease: Ease = easeInOutCubic;

  constructor(initial: number) {
    this.from = initial;
    this.to = initial;
  }

  set(target: number, now: number, dur = 1, ease: Ease = easeInOutCubic) {
    if (target === this.to) return;
    this.from = this.value(now);
    this.to = target;
    this.t0 = now;
    this.dur = dur;
    this.ease = ease;
  }

  snap(target: number) {
    this.from = this.to = target;
    this.t0 = -1e9;
  }

  /** Va al objetivo animando, o de golpe si `instant`. */
  go(target: number, now: number, instant: boolean, dur = 1, ease: Ease = easeInOutCubic) {
    if (instant) this.snap(target);
    else this.set(target, now, dur, ease);
  }

  value(now: number) {
    const k = clamp01((now - this.t0) / this.dur);
    return lerp(this.from, this.to, this.ease(k));
  }

  get target() {
    return this.to;
  }
}
