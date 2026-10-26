import { Scene } from '../core/scene';
import { ElectronCloud } from '../draw/electron-cloud';

/**
 * Bloque 4e · Cierre de la reconstrucción: ninguna animación es un adorno (detalles seductores)
 * y la erótica de la enseñanza (Recalcati). La nube sigue latiendo al fondo.
 */
export class RecFinalScene extends Scene {
  readonly id = 'rec-final';
  readonly stepCount = 2;
  private cloud!: ElectronCloud;

  protected build() {
    this.html('div', 'bg bg-night');
    this.cloud = new ElectronCloud(this.stage, this.el, 1420);
    this.cloud.reveal = 1;
    this.cloud.morph = 1;
    this.fx(
      this.html(
        'div',
        'abs fx rf-adorno',
        `<p class="phrase">Ninguna de estas animaciones es un adorno.</p>
         <p class="rf-note">Los <b>detalles seductores</b>, llamativos pero irrelevantes, distraen y empeoran el aprendizaje. La sorpresa tiene que estar en el concepto.</p>
         <p class="fr-kicker">Harp y Mayer, <i>Journal of Educational Psychology</i>, 1998</p>`,
      ),
      0,
      1,
    );
    this.fx(
      this.html(
        'div',
        'abs fx rf-eros',
        `<p class="rf-eros-title">La erótica de la enseñanza</p>
         <p class="rf-eros-sub">No transmitimos solo información.<br>Transmitimos el deseo de saber.</p>
         <p class="fr-kicker">Massimo Recalcati, <i>La hora de clase</i></p>`,
      ),
      1,
    );
  }

  protected render() {
    this.cloud.alpha = (0.32 + 0.3 * this.p(1, 2)) * this.p(0, 1.6);
    this.cloud.render(this.now);
  }

  protected dispose() {
    this.cloud.dispose();
  }
}
