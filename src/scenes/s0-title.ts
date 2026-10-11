import { Scene } from '../core/scene';
import { applyGrain, chalkStroke, linePts } from '../draw/chalk';
import type { Canvas2D } from '../core/stage';

/** Bloque 0 · Negro → el título aparece escrito a tiza en la pizarra. */
export class TitleScene extends Scene {
  readonly id = 'titulo';
  readonly stepCount = 2;
  private cv!: Canvas2D;

  protected build() {
    this.el.style.background = '#000';
    this.fx(this.html('div', 'bg bg-board fade'), 1);
    this.cv = this.canvas();
    this.fx(this.html('h1', 'chalk write abs title-main', 'Enseñanzas complejas'), 1);
    this.fx(this.html('p', 'chalk yellow write abs title-sub', '¿simplificación o engaño?'), 1);
    this.fx(this.html('p', 'chalk write abs title-foot', 'Oratoria y liderazgo pedagógico en el aula<br>Máster del Profesorado'), 1);
  }

  protected render() {
    const { ctx } = this.cv;
    this.cv.clear();
    chalkStroke(ctx, linePts(178, 640, 1390, 628, 4, 3, 60), { width: 5, color: '#f3d77e', progress: this.p(1, 1.1, 3.4), alpha: 0.9 });
    applyGrain(ctx, 0.8);
  }
}
