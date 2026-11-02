import { Scene } from '../core/scene';
import { ElectronCloud } from '../draw/electron-cloud';

/**
 * Bloque 4e · Cierre de la reconstrucción: la erótica de la enseñanza (Recalcati), con su matiz:
 * erótica no es espectáculo. La nube sigue latiendo al fondo.
 */
export class RecFinalScene extends Scene {
  readonly id = 'rec-final';
  readonly stepCount = 1;
  private cloud!: ElectronCloud;

  protected build() {
    this.html('div', 'bg bg-night');
    this.cloud = new ElectronCloud(this.stage, this.el, 1420);
    this.cloud.reveal = 1;
    this.cloud.morph = 1;
    this.fx(
      this.html(
        'div',
        'abs fx rf-eros',
        `<p class="rf-eros-title">La erótica de la enseñanza</p>
         <p class="rf-eros-sub">No transmitimos solo información.<br>Transmitimos el deseo de saber.</p>
         <p class="rf-bridge">Erótica no es espectáculo. La sorpresa, en el concepto.</p>
         <p class="fr-kicker">Massimo Recalcati, <i>La hora de clase</i></p>`,
      ),
      0,
    );
  }

  protected render() {
    this.cloud.alpha = 0.62 * this.p(0, 1.6);
    this.cloud.render(this.now);
  }

  protected dispose() {
    this.cloud.dispose();
  }
}
