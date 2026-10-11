import { Deck, type DeckState } from './core/deck';
import { bindKeys, toggleFullscreen } from './core/input';
import { Stage } from './core/stage';
import { Link, type Msg } from './core/sync';
import { SCENES } from './scenes';

/** La ventana del proyector: las escenas a pantalla completa. */
export function startAudience() {
  document.body.classList.add('audience');
  const app = document.getElementById('app')!;
  const stage = new Stage(app);

  const blackout = document.createElement('div');
  blackout.className = 'blackout';
  document.body.appendChild(blackout);

  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.innerHTML = '<kbd>P</kbd> vista de presentador &nbsp; <kbd>F</kbd> pantalla completa &nbsp; <kbd>→</kbd> avanzar &nbsp; <kbd>H</kbd> ayuda';
  document.body.appendChild(hint);
  const hideHint = () => hint.classList.add('gone');
  setTimeout(hideHint, 6000);

  const help = document.createElement('div');
  help.className = 'help';
  help.hidden = true;
  help.innerHTML = `<div>
      <h2>Controles</h2>
      <dl>
        <dt><kbd>→</kbd> <kbd>AvPág</kbd> <kbd>Espacio</kbd> o clic</dt><dd>Siguiente paso</dd>
        <dt><kbd>←</kbd> <kbd>RePág</kbd> o clic derecho</dt><dd>Paso anterior</dd>
        <dt><kbd>B</kbd> o <kbd>.</kbd></dt><dd>Pantalla en negro</dd>
        <dt><kbd>P</kbd></dt><dd>Abrir la vista de presentador</dd>
        <dt><kbd>F</kbd></dt><dd>Pantalla completa</dd>
        <dt><kbd>R</kbd></dt><dd>Reiniciar el cronómetro</dd>
        <dt><kbd>Inicio</kbd></dt><dd>Volver al principio</dd>
        <dt><kbd>H</kbd></dt><dd>Mostrar u ocultar esta ayuda</dd>
      </dl>
    </div>`;
  document.body.appendChild(help);

  const link = new Link(onMsg);
  const deck = new Deck(stage, SCENES, (s: DeckState) => {
    blackout.classList.toggle('on', s.blackout);
    link.send({ type: 'state', state: s });
    history.replaceState(null, '', `#${s.scene + 1}.${s.step + 1}`);
  });

  // Permite recargar o ensayar desde un punto concreto: index.html#4.2 = bloque 4, paso 2.
  const m = /^#(\d+)(?:\.(\d+))?$/.exec(location.hash);
  if (m) deck.goTo(Number(m[1]) - 1, Number(m[2] ?? 1) - 1, true);
  else deck.goTo(0, 0, true);

  function onMsg(msg: Msg) {
    if (msg.type === 'nav') {
      if (msg.action === 'next') deck.next();
      else if (msg.action === 'prev') deck.prev();
      else if (msg.action === 'blackout') deck.toggleBlackout();
      else if (msg.action === 'reset-timer') deck.resetTimer();
      else if (msg.action === 'hello') link.send({ type: 'state', state: deck.state });
    } else if (msg.type === 'goto') {
      deck.goTo(msg.scene, msg.step, true);
    }
  }

  function openPresenter() {
    const url = location.href.split('#')[0] + '#presenter';
    const w = window.open(url, 'ensenanzas-presentador', 'popup,width=1280,height=800');
    link.addPeer(w);
  }

  bindKeys((a) => {
    hideHint();
    switch (a) {
      case 'next':
        deck.next();
        break;
      case 'prev':
        deck.prev();
        break;
      case 'blackout':
        deck.toggleBlackout();
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
      case 'presenter':
        openPresenter();
        break;
      case 'reset-timer':
        deck.resetTimer();
        break;
      case 'first':
        deck.goTo(0, 0, true);
        break;
      case 'help':
        help.hidden = !help.hidden;
        break;
    }
  });

  window.addEventListener('click', (e) => {
    if (!help.hidden) {
      help.hidden = true;
      return;
    }
    if (e.button === 0) {
      hideHint();
      deck.next();
    }
  });
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    deck.prev();
  });

  let cursorTimer = 0;
  window.addEventListener('mousemove', () => {
    document.body.classList.add('show-cursor');
    clearTimeout(cursorTimer);
    cursorTimer = window.setTimeout(() => document.body.classList.remove('show-cursor'), 1800);
  });

  // Acceso para pruebas automáticas y ensayos desde la consola.
  (window as unknown as { deck: Deck }).deck = deck;
}
