import { Scene } from '../core/scene';
import type { Canvas2D } from '../core/stage';
import { TAU } from '../core/math';
import { tagHTML } from '../draw/tag';

const MINI_SUN = `<svg viewBox="0 0 120 120" aria-hidden="true">
  <g fill="none" stroke="#ece8dc" stroke-width="2" opacity="0.8">
    <circle cx="60" cy="60" r="24"/><circle cx="60" cy="60" r="40"/><circle cx="60" cy="60" r="54"/>
  </g>
  <g stroke="#ece8dc" stroke-width="2"><line x1="60" y1="60" x2="96" y2="42"/><line x1="60" y1="60" x2="30" y2="98"/><line x1="60" y1="60" x2="80" y2="80"/></g>
  <circle cx="60" cy="60" r="12" fill="#f3d77e"/><circle cx="96" cy="42" r="6" fill="#a9d0f5"/><circle cx="30" cy="98" r="7" fill="#f2c9a0"/><circle cx="80" cy="80" r="4" fill="#ece8dc"/>
</svg>`;

/**
 * Bloque 2 · Lo caducado se queda en la nevera.
 * Taber → Shtulman y Valcarcel → doctores en física en el escáner → la nevera → Ausubel.
 */
export class FridgeScene extends Scene {
  readonly id = 'nevera';
  readonly stepCount = 5;
  private cv!: Canvas2D;

  protected build() {
    this.html('div', 'bg bg-night');
    this.cv = this.canvas();

    this.fx(
      this.html(
        'blockquote',
        'abs fx fr-taber',
        `<p class="fr-kicker">Keith S. Taber, sobre el <i>impedimento pedagógico</i></p>
         <p class="fr-origin">No nace de la intuición del alumno. Nace de <em>cómo se lo enseñamos</em>.</p>
         <p class="quote fr-quote">“El alumno solo es culpable de aprender lo que le enseñaron.”</p>`,
      ),
      0,
      1,
    );

    this.fx(
      this.html(
        'div',
        'abs fx fr-study',
        `<p class="fr-kicker">Shtulman y Valcarcel, <i>Cognition</i>, 2012</p>
         <div class="fr-figures">
           <div><b>150</b><span>universitarios de ciencias</span></div>
           <div><b>200</b><span>afirmaciones de “verdadero o falso”, a toda velocidad</span></div>
         </div>
         <p class="fr-result">Cuando la ciencia contradice la idea de siempre, <em>tardan más y fallan más</em>.</p>
         <p class="fr-small">La idea vieja seguía ahí.</p>`,
      ),
      1,
      2,
    );

    this.fx(
      this.html(
        'div',
        'abs fx fr-brain-text',
        `<p class="fr-kicker">Allaire-Duquette y colaboradores, <i>npj Science of Learning</i>, 2021</p>
         <p class="fr-result"><b>25 doctores en física</b> dentro de un escáner.</p>
         <p class="fr-result">Ante una idea previa, su cerebro tiene que <em>frenarla</em>.</p>`,
      ),
      2,
      3,
    );
    this.fx(this.html('p', 'abs fx fr-brain-label', 'control inhibitorio'), 2, 3);

    // La nevera
    const fridge = this.html(
      'div',
      'abs fridge fx',
      `<div class="fridge-inner">
         <div class="fridge-light"></div>
         <div class="shelf s1"><div class="item yogurt"><span>5 − 7</span></div>${tagHTML({ head: 'Caduca', main: '1º ESO', rot: -6, seed: 11, className: 'tag-mini on' })}</div>
         <div class="shelf s2"><div class="item jar">${MINI_SUN}</div>${tagHTML({ head: 'Caduca', main: 'Einstein', rot: 5, seed: 23, className: 'tag-mini on' })}</div>
         <div class="shelf s3"><div class="item carton"><span>Si<br><small>+ impurezas</small></span></div>${tagHTML({ head: 'Ingredientes', main: 'No consta', rot: -3, tone: 'blue', seed: 37, className: 'tag-mini on' })}</div>
       </div>
       <div class="fridge-door"><div class="fridge-handle"></div><div class="fridge-logo">Didáctica</div></div>
       <div class="fridge-spill"></div>`,
    );
    this.fx(fridge, 3);
    this.fx(this.html('p', 'abs chalk write fr-fridge-cap', 'Lo caducado<br>no se tira solo.'), 3, 4);
    this.fx(this.html('p', 'abs chalk yellow write fr-fridge-cap2', 'Se queda en la nevera.'), 3, 4);

    this.fx(
      this.html(
        'blockquote',
        'abs fx fr-ausubel',
        `<p class="quote">“El factor más importante que influye en el aprendizaje es lo que el alumno ya sabe.”</p>
         <p class="quote-author">David Ausubel, 1968</p>`,
      ),
      4,
    );
  }

  protected render() {
    const ctx = this.cv.ctx;
    this.cv.clear();
    const a = this.step < 2 ? 0 : this.p(2, 1.2) * (1 - this.p(3, 0.5));
    if (a > 0) this.drawBrain(ctx, a);
  }

  /** Cerebro de perfil, a línea fina, con la corteza prefrontal encendida. */
  private drawBrain(ctx: CanvasRenderingContext2D, a: number) {
    const cx = 1330;
    const cy = 520;
    const t = this.now;
    ctx.save();
    ctx.globalAlpha = a;
    // Resplandor prefrontal (delante = izquierda)
    const pulse = 0.75 + 0.25 * Math.sin(t * 2.4);
    const g = ctx.createRadialGradient(cx - 230, cy - 60, 10, cx - 230, cy - 60, 260);
    g.addColorStop(0, `rgba(240,180,90,${0.75 * pulse})`);
    g.addColorStop(0.45, `rgba(240,140,70,${0.28 * pulse})`);
    g.addColorStop(1, 'rgba(240,140,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 520, cy - 340, 700, 640);

    // Contorno del cerebro
    const outline = (k: number) => {
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const th = (TAU * i) / 240;
        const rx = 330 + 18 * Math.sin(th * 14) * k;
        const ry = 230 + 14 * Math.sin(th * 17 + 1) * k;
        const flat = th > 0.3 && th < 2.6 ? 0.82 : 1; // base algo más plana
        const x = cx + Math.cos(th) * rx;
        const y = cy + Math.sin(th) * ry * (Math.sin(th) > 0 ? flat : 1);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };
    outline(0.35);
    ctx.fillStyle = 'rgba(18,28,58,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(159,178,255,0.75)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Circunvoluciones
    ctx.strokeStyle = 'rgba(159,178,255,0.35)';
    ctx.lineWidth = 2;
    for (let j = 0; j < 7; j++) {
      ctx.beginPath();
      const y0 = cy - 150 + j * 45;
      for (let x = cx - 280; x <= cx + 280; x += 8) {
        const edge = 1 - ((x - cx) / 300) ** 2;
        if (edge <= 0.15) continue;
        const y = y0 + 16 * Math.sin(x * 0.045 + j * 1.7) * edge;
        if (x === cx - 280) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Cerebelo y tronco
    ctx.beginPath();
    ctx.ellipse(cx + 230, cy + 175, 110, 70, -0.2, 0, TAU);
    ctx.fillStyle = 'rgba(18,28,58,0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(159,178,255,0.6)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 110, cy + 170);
    ctx.quadraticCurveTo(cx + 120, cy + 290, cx + 150, cy + 360);
    ctx.lineTo(cx + 210, cy + 360);
    ctx.quadraticCurveTo(cx + 190, cy + 270, cx + 200, cy + 200);
    ctx.stroke();
    // Línea guía a la etiqueta
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = 'rgba(240,180,90,0.8)';
    ctx.beginPath();
    ctx.moveTo(cx - 240, cy - 70);
    ctx.lineTo(cx - 300, cy - 300);
    ctx.stroke();
    ctx.restore();
  }
}
