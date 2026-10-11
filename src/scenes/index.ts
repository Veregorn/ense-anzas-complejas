import type { SceneFactory } from '../core/deck';
import { TitleScene } from './s0-title';
import { SchoolScene } from './s1-school';
import { SpacetimeScene } from './s2-spacetime';
import { AppleScene } from './s3-apple';
import { MapsScene } from './s4-maps';
import { LifeScene } from './s5-life';
import { SpiralScene } from './s6-spiral';
import { ClosingScene } from './s7-closing';

/** Una escena por bloque del guion, en orden (ver content/script.ts). */
export const SCENES: SceneFactory[] = [
  () => new TitleScene(),
  () => new SchoolScene(),
  () => new SpacetimeScene(),
  () => new AppleScene(),
  () => new MapsScene(),
  () => new LifeScene(),
  () => new SpiralScene(),
  () => new ClosingScene(),
];
