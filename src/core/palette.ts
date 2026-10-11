/**
 * Paleta: dos mundos visuales.
 *  - La pizarra (el modelo del colegio): verde pizarra y tiza.
 *  - El cosmos (el modelo de Einstein): noche profunda, luz de estrellas, Sol y el ámbar del tiempo.
 * Los mismos valores viven como variables CSS en styles/tokens.css.
 */
import { hexToRgb } from './math';

export const hex = {
  board: '#22382f',
  chalk: '#ece8dc',
  chalkYellow: '#f3d77e',
  night: '#060a19',
  nightUp: '#101a3d',
  ink: '#e9edf7',
  starlight: '#9fb2ff',
  sun: '#ffb347',
  sunCore: '#fff1c9',
  time: '#f0b45a',
  earth: '#4f9dff',
  apple: '#d8473a',
} as const;

export const rgb = Object.fromEntries(Object.entries(hex).map(([k, v]) => [k, hexToRgb(v)])) as {
  [K in keyof typeof hex]: ReturnType<typeof hexToRgb>;
};
