import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { easeInCubic, easeInOutCubic } from '../core/math';
import { applyGrain } from '../draw/chalk';
import { ElectronCloud } from '../draw/electron-cloud';
import { tagHTML } from '../draw/tag';
import { drawBohrAtom } from './c0-atom-air';

/**
 * Bloque 4a · La reconstrucción empieza: el átomo de tiza se borra y, foto a foto,
 * aparece la nube electrónica. Luego toma forma de lóbulos. Y la curiosidad (Gruber, 2014).
 */
export class RecAtomScene extends Scene {
  readonly id = 'rec-atomo';
  readonly stepCount = 4;
  private chalk!: Canvas2D;
  private cloud!: ElectronCloud;

  protected build() {
    this.html('div', 'bg bg-night');
    this.cloud = new ElectronCloud(this.stage, this.el, 1420);
    this.chalk = this.canvas();
    this.fx(
      this.html('div', 'abs fx ra-intro', `<h2 class="ra-title">La reconstrucción</h2><p class="ra-sub">Bohr dibujaba con tiza.<br>Nosotros tenemos animaciones.</p>`),
      0,
      1,
    );
    this.fx(
      this.html(
        'div',
        'abs fx ra-cap',
        `<p class="ra-case">El átomo</p><p class="ra-text">El electrón no da vueltas. Cada punto es una <em>foto</em> de dónde aparece.</p><p class="ra-text soft">Juntad miles de fotos… y aparece una nube.</p>`,
      ),
      1,
      3,
    );
    const tag = this.html('div', 'abs ra-tag', tagHTML({ head: 'Modelo de nube', main: 'Válido en la ESO', sub: 'En Bachillerato: orbitales', tone: 'green', rot: 3, seed: 61 }));
    this.fx(tag.firstElementChild!, 2);
    this.fx(
      this.html(
        'div',
        'abs fx ra-gruber',
        `<p class="ra-oh">¿Ese pequeño “oh”?</p>
         <p class="ra-text">Es curiosidad. Activa el circuito de la dopamina y <em>recordamos mejor</em>, incluso lo que viene justo después.</p>
         <p class="fr-kicker">Gruber, Gelman y Ranganath, <i>Neuron</i>, 2014</p>`,
      ),
      3,
    );
  }

  protected onStep(step: number, prev: number, instant: boolean) {
    if (step === 2 && prev < 2 && !instant) this.shake(2900);
  }

  protected render() {
    // Átomo de tiza que se borra al empezar las "fotos"
    const ctx = this.chalk.ctx;
    this.chalk.clear();
    const chalkA = this.p(0, 1.2) * (1 - this.p(1, 1.4));
    if (chalkA > 0) {
      drawBohrAtom(ctx, 1420, 540, 0.8, this.now, 1, chalkA);
      applyGrain(ctx, 0.7);
    }
    // Las fotos empiezan despacio y se aceleran; si se avanza antes de tiempo, la nube se completa.
    this.cloud.reveal = Math.max(easeInCubic(this.p(1, 7.5, 0.6, (x) => x)), this.p(2, 1.5));
    this.cloud.morph = this.p(2, 3.4, 0, easeInOutCubic);
    this.cloud.alpha = 1 - 0.35 * this.p(3, 1.2);
    this.cloud.render(this.now);
  }

  protected dispose() {
    this.cloud.dispose();
  }
}
