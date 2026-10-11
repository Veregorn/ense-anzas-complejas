import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { lerp, smoothstep } from '../core/math';
import { hex } from '../core/palette';
import { applyGrain } from '../draw/chalk';
import { drawSchoolModel } from '../draw/school-model';

const AXIS_Y = 700;
const X0 = 190;
const X1 = 1730;

const STAGES: { from: number; to: number; label: string; color: string; dashed?: boolean }[] = [
  { from: 6, to: 12, label: 'Primaria', color: hex.time },
  { from: 12, to: 16, label: 'ESO', color: hex.starlight },
  { from: 16, to: 18, label: 'Bachillerato', color: '#aab3cc', dashed: true },
];

/**
 * Bloque 5 · Una vida. Primero solo vemos los años de colegio, ocupando toda la pantalla.
 * Después la línea se aleja hasta los 80 años: el colegio queda en un rincón… y la idea
 * aprendida allí (los hilos) viaja con la persona hasta el final.
 */
export class LifeScene extends Scene {
  readonly id = 'vida';
  readonly stepCount = 4;
  private line!: Canvas2D;
  private chalk!: Canvas2D;

  protected build() {
    this.html('div', 'bg bg-night');
    this.line = this.canvas();
    this.chalk = this.canvas();
    this.fx(this.html('p', 'abs quote fx life-c1', 'Lo que aprendemos en el aula…'), 0, 2);
    this.fx(this.html('p', 'abs quote fx life-c2', '…suele ser la versión definitiva.'), 1, 2);
    this.fx(this.html('p', 'abs caption soft fx life-c3', 'La mayoría nunca vuelve a estudiar física.'), 1, 2);
    this.fx(this.html('div', 'scrim fx'), 2);
    this.fx(
      this.html(
        'blockquote',
        'abs fx life-ausubel',
        `<p class="quote">El factor más importante que influye en el aprendizaje es lo que el alumno ya sabe.</p>
         <p class="quote-author">David Ausubel, <i>Psicología educativa</i>, 1968</p>
         <p class="caption soft life-ausubel-note">Si lo que ya sabe es un modelo cerrado, todo lo nuevo se construye encima.</p>`,
      ),
      2,
      3,
    );
    this.fx(
      this.html(
        'div',
        'abs fx life-lies',
        `<p class="life-lies-en">lies-to-children</p>
         <p class="chalk life-lies-es">mentiras para niños</p>
         <p class="caption soft">Lo que se aprende mal de pequeño es de lo más difícil de desaprender.</p>`,
      ),
      3,
    );
  }

  protected render() {
    // Zoom de la línea: de 6–18 años (paso 0) a 6–80 años (paso 1)
    const zoomOut = this.p(1, 2.6, 0.2);
    const view = lerp(18.6, 80, zoomOut);
    const ageX = (age: number) => X0 + ((age - 6) / (view - 6)) * (X1 - X0);
    const draw = this.p(0, 1.8, 0.2);
    const end = lerp(6, view, draw);
    const dim = 1 - 0.65 * this.p(2, 1);

    const ctx = this.line.ctx;
    this.line.clear();
    ctx.save();
    ctx.globalAlpha = dim;
    ctx.strokeStyle = 'rgba(233,237,247,0.75)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ageX(6), AXIS_Y);
    ctx.lineTo(ageX(end), AXIS_Y);
    ctx.stroke();

    // Etapas escolares
    for (const s of STAGES) {
      const to = Math.min(s.to, end);
      if (to <= s.from) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'butt';
      ctx.setLineDash(s.dashed ? [12, 8] : []);
      ctx.beginPath();
      ctx.moveTo(ageX(s.from) + 2, AXIS_Y);
      ctx.lineTo(ageX(to) - 2, AXIS_Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '500 32px Newsreader, serif';
      const width = ageX(s.to) - ageX(s.from);
      const a = smoothstep(0, 1, (width - ctx.measureText(s.label).width - 16) / 40) * smoothstep(s.to - 0.5, s.to, end);
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = s.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, (ageX(s.from) + ageX(s.to)) / 2, AXIS_Y + 34);
        ctx.restore();
      }
    }

    // Marcas de edad: cada año al principio, cada década al alejarse
    ctx.font = '400 28px Newsreader, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let age = 6; age <= 80; age++) {
      if (age > end + 0.01) break;
      const yearly = 1 - zoomOut;
      const decade = age % 10 === 0 ? smoothstep(0.3, 0.8, zoomOut) : 0;
      const a = Math.max(age % 2 === 0 && age <= 18 ? yearly : 0, decade, age === 6 ? 1 : 0);
      if (a <= 0.01) continue;
      const x = ageX(age);
      ctx.globalAlpha = dim * a;
      ctx.strokeStyle = 'rgba(233,237,247,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, AXIS_Y - 12);
      ctx.lineTo(x, AXIS_Y + 12);
      ctx.stroke();
      ctx.fillStyle = '#aab3cc';
      if (age !== 6 && (age > 18 || zoomOut < 0.5)) ctx.fillText(`${age}`, x, AXIS_Y + 82);
    }
    ctx.globalAlpha = dim;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#aab3cc';
    ctx.fillText('6 años', ageX(6) - 8, AXIS_Y + 82);
    ctx.restore();

    // La idea del colegio, a tiza, viajando con la persona
    const cc = this.chalk.ctx;
    this.chalk.clear();
    const age = lerp(10, 80, this.p(1, 4.6, 2.4));
    const scale = lerp(0.55, 0.3, zoomOut);
    const cy = AXIS_Y - lerp(250, 165, zoomOut);
    for (const stamp of [25, 40, 55, 70]) {
      if (age < stamp) continue;
      drawSchoolModel(cc, { cx: ageX(stamp), cy, scale: 0.26, t: this.now, threads: 1, alpha: 0.22 * dim });
    }
    const x = ageX(age);
    const appear = this.p(0, 2.2, 1.0);
    drawSchoolModel(cc, { cx: x, cy, scale, t: this.now, draw: appear, threads: 1, forces: 0.6, alpha: dim });
    cc.save();
    cc.globalAlpha = Math.min(1, appear * 2) * dim;
    cc.fillStyle = hex.chalk;
    cc.beginPath();
    cc.arc(x, AXIS_Y, 11, 0, Math.PI * 2);
    cc.fill();
    cc.restore();
    applyGrain(cc, 0.6);
  }
}
