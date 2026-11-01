import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { phase, smoothstep } from '../core/math';
import { hex } from '../core/palette';
import { applyGrain } from '../draw/chalk';
import { drawSchoolModel, drawThreadBreak } from '../draw/school-model';
import { SpacetimeView } from '../draw/spacetime3d';
import { tagHTML } from '../draw/tag';

/**
 * Bloque 4c · El Sol: los hilos del colegio se rompen, la pizarra se convierte en una malla
 * y la malla se hunde. Los planetas siguen la curva del espacio-tiempo.
 */
export class RecSunScene extends Scene {
  readonly id = 'rec-sol';
  readonly stepCount = 3;
  private chalk!: Canvas2D;
  private view!: SpacetimeView;
  private board!: HTMLElement;

  protected build() {
    this.html('div', 'bg bg-night');
    this.board = this.html('div', 'bg bg-board');
    this.board.style.transition = 'none';
    this.view = new SpacetimeView(this.stage, this.el, [
      { orbit: 2.1, size: 0.12, color: '#c9b8a6', speed: 0.95, phase: 0.4 },
      { orbit: 3.0, size: 0.19, color: '#f2c58a', speed: 0.66, phase: 2.0 },
      { orbit: 4.1, size: 0.21, color: hex.earth, speed: 0.46, phase: 4.1, trail: 1.6 },
      { orbit: 5.2, size: 0.16, color: '#e07a55', speed: 0.34, phase: 1.1 },
      { orbit: 6.6, size: 0.4, color: '#e8c9a0', speed: 0.19, phase: 5.2, trail: 0.7 },
    ]);
    this.view.rings = 1;
    this.chalk = this.canvas();
    this.fx(this.html('p', 'abs fx rsun-case chalk', 'El Sol'), 0, 1);
    this.fx(this.html('p', 'abs fx rsun-cap', 'No hay cuerda. El Sol curva el espacio-tiempo a su alrededor<br>y los planetas siguen esa curva.'), 1);
    const tag = this.html('div', 'abs rsun-tag', tagHTML({ head: 'Modelo de la sábana', main: 'También caduca', sub: 'Dibuja el espacio, le falta el tiempo. En la universidad: relatividad general', tone: 'green', rot: 3, seed: 83 }));
    this.fx(tag.firstElementChild!, 2);
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step === 2 && prev < 2 && !instant) this.shake(200);
  }

  protected render() {
    const T = this.since(1);
    const t = this.now;
    const ctx = this.chalk.ctx;
    this.chalk.clear();
    const model = { cx: 960, cy: 540, scale: 1.05, t, draw: this.p(0, 2.2), forces: 0 };
    const chalkA = T < 0 ? 1 : 1 - smoothstep(1.1, 2.1, T);
    if (chalkA > 0) {
      drawSchoolModel(ctx, { ...model, threads: T < 0 ? 1 : 0, alpha: chalkA });
      if (T >= 0) drawThreadBreak(ctx, { ...model, alpha: chalkA }, T);
      applyGrain(ctx, 0.8);
    }
    const show = T < 0 ? 0 : phase(T, 1.0, 2.0);
    this.view.canvas.style.opacity = String(show);
    const cosmic = T < 0 ? 0 : smoothstep(2.2, 4.4, T);
    this.board.style.opacity = String(1 - cosmic);
    this.view.cosmic = cosmic;
    this.view.tilt = T < 0 ? 0 : smoothstep(2.4, 6.4, T);
    this.view.well = T < 0 ? 0 : smoothstep(3.0, 6.8, T);
    this.view.spin = Math.sin(t * 0.08) * 0.25 * this.view.tilt;
    if (show > 0) this.view.render(t);
  }

  protected dispose() {
    this.view.dispose();
  }
}
