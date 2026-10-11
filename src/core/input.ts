/**
 * Teclado y mandos de presentación. Los mandos envían normalmente AvPág/RePág o las flechas;
 * muchos tienen un botón de "pantalla negra" que envía B o el punto.
 */
export type Action = 'next' | 'prev' | 'blackout' | 'fullscreen' | 'presenter' | 'reset-timer' | 'help' | 'first';

const MAP: Record<string, Action> = {
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageDown: 'next',
  ' ': 'next',
  Enter: 'next',
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  PageUp: 'prev',
  Backspace: 'prev',
  b: 'blackout',
  B: 'blackout',
  '.': 'blackout',
  f: 'fullscreen',
  F: 'fullscreen',
  p: 'presenter',
  P: 'presenter',
  r: 'reset-timer',
  R: 'reset-timer',
  h: 'help',
  H: 'help',
  '?': 'help',
  Home: 'first',
};

export function bindKeys(handler: (a: Action) => void) {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    const action = MAP[e.key];
    if (!action) return;
    e.preventDefault();
    // Mantener pulsado un botón no debe saltarse media charla.
    if (e.repeat && (action === 'next' || action === 'prev')) return;
    handler(action);
  });
}

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}
