import type { SceneFactory } from '../core/deck';
import { AtomAirScene } from './c0-atom-air';
import { RulesScene } from './c1-rules';
import { FridgeScene } from './c2-fridge';
import { LabelScene } from './c3-label';
import { RecAtomScene } from './c4-rec-atom';
import { RecSubtractScene } from './c5-rec-subtract';
import { RecSunScene } from './c6-rec-sun';
import { RecSemisScene } from './c7-rec-semis';
import { ClosingScene } from './c9-closing';

/** Una escena por bloque del guion (ver content/script.ts). La reconstrucción se reparte en cuatro escenas. */
export const SCENES: SceneFactory[] = [
  () => new AtomAirScene(),
  () => new RulesScene(),
  () => new FridgeScene(),
  () => new LabelScene(),
  () => new RecAtomScene(),
  () => new RecSubtractScene(),
  () => new RecSunScene(),
  () => new RecSemisScene(),
  () => new ClosingScene(),
];
