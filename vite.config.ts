import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Dos salidas:
 *  - `npm run build`        → dist/        (web normal, para GitHub Pages)
 *  - `npm run build:single` → dist-single/ (un único index.html que funciona sin internet)
 */
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: single ? [viteSingleFile()] : [],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? 100_000_000 : 4096,
      chunkSizeWarningLimit: 2000,
    },
  };
});
