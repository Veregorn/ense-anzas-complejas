import { clock, type Scene } from './scene';
import type { Stage } from './stage';

export interface DeckState {
  scene: number;
  step: number;
  stepCount: number;
  blackout: boolean;
  /** Momento (Date.now) en que empezó la charla: el primer clic. */
  startedAt: number | null;
}

export type SceneFactory = () => Scene;

/** Orquesta las escenas: navegación, fundidos entre bloques y el bucle de animación. */
export class Deck {
  private index = -1;
  private current: Scene | null = null;
  private leaving: { scene: Scene; until: number }[] = [];
  private last = clock();
  blackout = false;
  startedAt: number | null = null;

  constructor(
    private stage: Stage,
    private factories: SceneFactory[],
    private onChange: (s: DeckState) => void,
  ) {
    requestAnimationFrame(this.loop);
  }

  get count() {
    return this.factories.length;
  }

  get state(): DeckState {
    return {
      scene: this.index,
      step: this.current?.stepIndex ?? 0,
      stepCount: this.current?.stepCount ?? 1,
      blackout: this.blackout,
      startedAt: this.startedAt,
    };
  }

  goTo(index: number, step = 0, instant = false) {
    const i = Math.max(0, Math.min(this.count - 1, index));
    if (i === this.index && this.current) {
      this.current.setStep(step, instant);
      this.emit();
      return;
    }
    if (this.current) {
      const old = this.current;
      old.el.classList.add('leaving');
      this.leaving.push({ scene: old, until: clock() + 1.2 });
    }
    const scene = this.factories[i]();
    scene.el.classList.add('entering');
    this.stage.root.appendChild(scene.el);
    scene.mount(this.stage, step, instant);
    // Doble rAF: garantiza que el navegador pinta el estado inicial antes del fundido.
    requestAnimationFrame(() => requestAnimationFrame(() => scene.el.classList.remove('entering')));
    this.current = scene;
    this.index = i;
    this.emit();
  }

  next() {
    if (!this.current) return;
    if (this.startedAt === null) this.startedAt = Date.now();
    if (this.current.stepIndex < this.current.stepCount - 1) {
      this.current.setStep(this.current.stepIndex + 1);
      this.emit();
    } else if (this.index < this.count - 1) {
      this.goTo(this.index + 1, 0);
    }
  }

  prev() {
    if (!this.current) return;
    if (this.current.stepIndex > 0) {
      this.current.setStep(this.current.stepIndex - 1);
      this.emit();
    } else if (this.index > 0) {
      const target = this.index - 1;
      this.goTo(target, Number.MAX_SAFE_INTEGER, true);
    }
  }

  toggleBlackout(force?: boolean) {
    this.blackout = force ?? !this.blackout;
    this.emit();
  }

  resetTimer() {
    this.startedAt = Date.now();
    this.emit();
  }

  private emit() {
    this.onChange(this.state);
  }

  private loop = () => {
    const now = clock();
    const dt = Math.min(0.1, now - this.last);
    this.last = now;
    this.current?.update(now, dt);
    this.leaving = this.leaving.filter((l) => {
      if (now > l.until) {
        l.scene.destroy();
        return false;
      }
      l.scene.update(now, dt);
      return true;
    });
    requestAnimationFrame(this.loop);
  };
}
