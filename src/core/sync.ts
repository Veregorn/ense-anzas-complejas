import type { DeckState } from './deck';

/**
 * Comunicación entre la ventana del proyector y la vista de presentador.
 * Usa BroadcastChannel y, como respaldo, postMessage entre ventanas (necesario
 * cuando se abre el archivo HTML directamente desde el disco).
 */
export type NavAction = 'next' | 'prev' | 'blackout' | 'reset-timer' | 'hello';

export type Msg =
  | { type: 'state'; state: DeckState }
  | { type: 'nav'; action: NavAction }
  | { type: 'goto'; scene: number; step: number };

type Envelope = { __ensenanzas: true; id: string; msg: Msg };

export class Link {
  private bc: BroadcastChannel | null = null;
  private peers = new Set<Window>();
  private seen: string[] = [];

  constructor(private onMsg: (m: Msg) => void) {
    try {
      this.bc = new BroadcastChannel('ensenanzas-complejas');
      this.bc.onmessage = (e) => this.receive(e.data);
    } catch {
      this.bc = null;
    }
    window.addEventListener('message', (e) => {
      if (e.source && e.source !== window) this.peers.add(e.source as Window);
      this.receive(e.data);
    });
    if (window.opener) this.peers.add(window.opener as Window);
  }

  addPeer(w: Window | null) {
    if (w) this.peers.add(w);
  }

  send(msg: Msg) {
    const env: Envelope = { __ensenanzas: true, id: Math.random().toString(36).slice(2), msg };
    this.remember(env.id);
    this.bc?.postMessage(env);
    for (const p of this.peers) {
      try {
        if (p.closed) this.peers.delete(p);
        else p.postMessage(env, '*');
      } catch {
        this.peers.delete(p);
      }
    }
  }

  private receive(data: unknown) {
    const env = data as Envelope;
    if (!env || env.__ensenanzas !== true || this.seen.includes(env.id)) return;
    this.remember(env.id);
    this.onMsg(env.msg);
  }

  private remember(id: string) {
    this.seen.push(id);
    if (this.seen.length > 64) this.seen.shift();
  }
}
