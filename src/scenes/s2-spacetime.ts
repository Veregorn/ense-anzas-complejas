import { Scene } from '../core/scene';
import { hex } from '../core/palette';
import { SpacetimeView } from '../draw/spacetime3d';

/**
 * Bloque 2 · La pizarra se convierte en una malla, la malla se hunde: el espacio-tiempo.
 * La Tierra recorre la curva sin que nada la sujete. Después, la cita de Wheeler.
 */
export class SpacetimeScene extends Scene {
  readonly id = 'espaciotiempo';
  readonly stepCount = 3;
  private view!: SpacetimeView;
  private board!: HTMLElement;

  protected build() {
    this.html('div', 'bg bg-night');
    this.board = this.html('div', 'bg bg-board');
    this.board.style.transition = 'none';
    this.view = new SpacetimeView(this.stage, this.el, [
      { orbit: 4.6, size: 0.26, color: hex.earth, speed: 0.42, phase: 2.2, trail: 2.1 },
    ]);
    this.fx(this.html('p', 'abs caption fx st-caption', 'No es una fuerza.<br>Es la forma del <span class="nw">espacio-tiempo</span>.'), 1, 2);
    this.fx(this.html('div', 'scrim fx'), 2);
    this.fx(
      this.html(
        'blockquote',
        'abs fx st-quote',
        `<p class="quote">La materia le dice al <span class="nw">espacio-tiempo</span> cómo curvarse.<br>El <span class="nw">espacio-tiempo</span> le dice a la materia cómo moverse.</p>
         <p class="quote-author">John A. Wheeler</p>`,
      ),
      2,
    );
  }

  protected render() {
    const cosmic = this.p(1, 2.6, 0);
    this.view.cosmic = cosmic;
    this.view.tilt = this.p(1, 4.4, 0.3);
    this.view.well = this.p(1, 3.8, 1.0);
    this.view.spin = Math.sin(this.now * 0.09) * 0.22 * this.view.tilt;
    this.board.style.opacity = String(1 - cosmic);
    this.view.render(this.now);
  }

  protected dispose() {
    this.view.dispose();
  }
}
