import { Scene } from '../core/scene';
import { hex } from '../core/palette';
import { SpacetimeView } from '../draw/spacetime3d';

/**
 * Bloque 7 · Cierre. El Sistema Solar del principio, ahora sin hilos, sobre el espacio-tiempo.
 * Vuelve la pizarra con tres compromisos. Una puerta de luz se abre. Gracias.
 */
export class ClosingScene extends Scene {
  readonly id = 'cierre';
  readonly stepCount = 6;
  private view!: SpacetimeView;

  protected build() {
    this.html('div', 'bg bg-night');
    this.view = new SpacetimeView(this.stage, this.el, [
      { orbit: 2.1, size: 0.12, color: '#c9b8a6', speed: 0.95, phase: 0.4 },
      { orbit: 3.0, size: 0.19, color: '#f2c58a', speed: 0.66, phase: 2.0 },
      { orbit: 4.1, size: 0.21, color: hex.earth, speed: 0.46, phase: 4.1, trail: 1.6 },
      { orbit: 5.2, size: 0.16, color: '#e07a55', speed: 0.34, phase: 1.1 },
      { orbit: 6.6, size: 0.4, color: '#e8c9a0', speed: 0.19, phase: 5.2, trail: 0.7 },
    ]);
    this.view.cosmic = 1;
    this.view.well = 1;
    this.view.tilt = 1;
    this.view.rings = 1;

    this.fx(this.html('div', 'bg bg-board fade'), 1, 4);
    const list = this.html('ol', 'abs close-list');
    [
      'Decid “esto es un modelo”.',
      'Enseñad dónde se rompe.',
      'Dejad siempre la puerta abierta.',
    ].forEach((t, i) => {
      const li = this.html('li', 'chalk write', `<span class="chalk yellow">${i + 1}</span>${t}`, list);
      this.fx(li, i + 1, 4);
    });

    this.fx(this.html('div', 'bg bg-night fade'), 4);
    this.fx(
      this.html(
        'div',
        'abs door fx',
        `<div class="door-light"></div><div class="door-panel"></div><div class="door-spill"></div>`,
      ),
      4,
    );
    this.fx(
      this.html(
        'div',
        'abs close-final',
        `<p class="phrase fx c1">Al niño que yo fui no le hacía falta que le contaran toda la verdad.</p>
         <p class="phrase fx c2">Le hacía falta que alguien le dijera que había más.</p>`,
      ),
      4,
      5,
    );
    this.el.querySelectorAll('.close-final .fx').forEach((el) => this.fx(el, 4, 5));
    this.fx(
      this.html(
        'div',
        'abs close-thanks',
        `<p class="close-gracias fx">Gracias.</p>
         <p class="chalk fx close-thesis">Simplificar no es engañar.<br>Lo que engaña es ocultar que estás simplificando.</p>`,
      ),
      5,
    );
    this.el.querySelectorAll('.close-thanks .fx').forEach((el) => this.fx(el, 5));
  }

  protected render() {
    // La escena 3D deja de dibujarse cuando ya está tapada (ahorra batería y ventilador).
    if (this.step >= 4 && this.since(4) > 2) return;
    if (this.step >= 1 && this.step < 4 && this.since(1) > 2) return;
    this.view.spin = this.now * 0.05;
    this.view.render(this.now);
  }

  protected dispose() {
    this.view.dispose();
  }
}
