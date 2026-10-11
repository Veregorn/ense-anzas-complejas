import type { DeckState } from '../core/deck';
import { bindKeys, toggleFullscreen } from '../core/input';
import { Link, type Msg } from '../core/sync';
import { BLOCKS, TITLE } from '../content/script';

const fmt = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Convierte [corchetes] del guion en indicaciones de actuación destacadas. */
const stageDirections = (t: string) => t.replace(/\[([^\]]+)\]/g, '<em class="pz-dir">$1</em>');

/**
 * Vista de presentador: lo que tú ves en el portátil mientras el proyector muestra las escenas.
 * Anclas, guion del bloque con el paso actual resaltado, qué pasará en el siguiente clic y cronómetro.
 */
export function startPresenter() {
  document.body.classList.add('presenter');
  document.title = 'Presentador · Enseñanzas complejas';
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="pz">
      <header class="pz-head">
        <div>
          <p class="pz-kicker" data-k="block-n"></p>
          <h1 class="pz-title" data-k="block-title"></h1>
        </div>
        <div class="pz-window">
          <span>Objetivo de este bloque</span>
          <b data-k="block-window"></b>
        </div>
        <div class="pz-clock">
          <b data-k="elapsed">0:00</b>
          <span class="pz-pace" data-k="pace">El cronómetro arranca con el primer clic</span>
        </div>
      </header>

      <section class="pz-main">
        <div class="pz-left">
          <ul class="pz-anchors" data-k="anchors"></ul>
          <div class="pz-script" data-k="script"></div>
        </div>
        <aside class="pz-right">
          <div class="pz-next">
            <span>Siguiente clic</span>
            <p data-k="next"></p>
          </div>
          <div class="pz-now">
            <span>Ahora en pantalla</span>
            <p data-k="now"></p>
          </div>
          <nav class="pz-map" data-k="map" aria-label="Mapa de la charla"></nav>
        </aside>
      </section>

      <footer class="pz-foot">
        <button data-a="prev">← Anterior</button>
        <button data-a="next" class="primary">Siguiente →</button>
        <button data-a="blackout">Pantalla negra <kbd>B</kbd></button>
        <button data-a="reset-timer">Reiniciar cronómetro <kbd>R</kbd></button>
        <p class="pz-status" data-k="status">Buscando la pantalla de la presentación…</p>
      </footer>
    </div>`;

  const $ = (k: string) => app.querySelector<HTMLElement>(`[data-k="${k}"]`)!;
  let state: DeckState | null = null;
  let lastSeen = 0;

  // Mapa general: un grupo de puntos por bloque, clicables para saltar.
  const map = $('map');
  BLOCKS.forEach((b, bi) => {
    const row = document.createElement('div');
    row.className = 'pz-row';
    row.innerHTML = `<span class="pz-row-t">${fmt(b.start)}</span><span class="pz-row-n">${b.title}</span><span class="pz-dots"></span>`;
    const dots = row.querySelector('.pz-dots')!;
    b.beats.forEach((beat, si) => {
      const d = document.createElement('button');
      d.className = 'pz-dot';
      d.title = beat.cue;
      d.dataset.b = String(bi);
      d.dataset.s = String(si);
      d.addEventListener('click', () => link.send({ type: 'goto', scene: bi, step: si }));
      dots.appendChild(d);
    });
    map.appendChild(row);
  });

  const link = new Link((msg: Msg) => {
    if (msg.type === 'state') {
      state = msg.state;
      lastSeen = Date.now();
      render();
    }
  });
  link.send({ type: 'nav', action: 'hello' });
  setInterval(() => {
    if (Date.now() - lastSeen > 3000) link.send({ type: 'nav', action: 'hello' });
  }, 1500);

  function render() {
    if (!state) return;
    const b = BLOCKS[state.scene];
    const step = Math.min(state.step, b.beats.length - 1);
    document.title = `${state.scene + 1}.${step + 1} · Presentador`;
    $('block-n').textContent = `Bloque ${state.scene} de ${BLOCKS.length - 1}`;
    $('block-title').textContent = b.title;
    $('block-window').textContent = `${fmt(b.start)} – ${fmt(b.end)}`;
    $('anchors').innerHTML = b.anchors.map((a) => `<li>${a}</li>`).join('');
    $('script').innerHTML = b.beats
      .map((beat, i) => {
        const cls = i < step ? 'past' : i === step ? 'current' : 'future';
        return `<p class="pz-beat ${cls}"><span class="pz-cue">${beat.cue}</span>${stageDirections(beat.say)}</p>`;
      })
      .join('');
    $('script').querySelector('.current')?.scrollIntoView({ block: 'center', behavior: 'smooth' });

    const nextBeat = b.beats[step + 1];
    const nextBlock = BLOCKS[state.scene + 1];
    $('next').innerHTML = nextBeat
      ? nextBeat.cue
      : nextBlock
        ? `<small>Siguiente bloque: ${nextBlock.title}</small>${nextBlock.beats[0].cue}`
        : 'Fin de la presentación';
    $('now').textContent = b.beats[step].cue;

    map.querySelectorAll<HTMLElement>('.pz-dot').forEach((d) => {
      const bi = Number(d.dataset.b);
      const si = Number(d.dataset.s);
      d.classList.toggle('done', bi < state!.scene || (bi === state!.scene && si < step));
      d.classList.toggle('here', bi === state!.scene && si === step);
    });
    map.querySelectorAll('.pz-row').forEach((r, i) => r.classList.toggle('here', i === state!.scene));
    document.body.classList.toggle('is-black', state.blackout);
    tick();
  }

  function tick() {
    const connected = Date.now() - lastSeen < 4000;
    $('status').textContent = connected
      ? state?.blackout
        ? 'Conectado · la pantalla está en negro'
        : 'Conectado con la pantalla de la presentación'
      : 'Sin conexión: abre la presentación y pulsa P desde ella';
    $('status').classList.toggle('off', !connected);
    if (!state || state.startedAt === null) return;
    const elapsed = (Date.now() - state.startedAt) / 1000;
    const b = BLOCKS[state.scene];
    $('elapsed').textContent = fmt(elapsed);
    // Ritmo: se compara con la ventana objetivo del bloque actual (con margen).
    const ahead = Math.round(b.start - elapsed);
    const behind = Math.round(elapsed - b.end);
    const pace = $('pace');
    pace.className = 'pz-pace';
    if (behind > 0) {
      pace.textContent = `Vas ${behind} s por detrás: acelera un poco`;
      pace.classList.add(behind > 20 ? 'bad' : 'warn');
    } else if (ahead > 12) {
      pace.textContent = `Vas ${ahead} s por delante: respira, haz pausas`;
      pace.classList.add('warn');
    } else {
      pace.textContent = 'Vas a buen ritmo';
      pace.classList.add('ok');
    }
    $('elapsed').classList.toggle('over', elapsed > 420);
  }
  setInterval(tick, 250);

  const send = (action: 'next' | 'prev' | 'blackout' | 'reset-timer') => link.send({ type: 'nav', action });
  app.querySelectorAll<HTMLButtonElement>('[data-a]').forEach((btn) =>
    btn.addEventListener('click', () => send(btn.dataset.a as 'next' | 'prev' | 'blackout' | 'reset-timer')),
  );
  bindKeys((a) => {
    if (a === 'next' || a === 'prev' || a === 'blackout' || a === 'reset-timer') send(a);
    else if (a === 'fullscreen') toggleFullscreen();
  });

  console.info(TITLE);
}
