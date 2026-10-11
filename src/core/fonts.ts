/**
 * Fuentes incluidas en el propio proyecto: la presentación no depende de internet.
 *  - Newsreader: la voz del cosmos (serif editorial con tamaño óptico).
 *  - Kalam: la voz de la tiza (escritura a mano).
 */
import newsNormal from '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2?url';
import newsItalic from '@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2?url';
import kalam400 from '@fontsource/kalam/files/kalam-latin-400-normal.woff2?url';
import kalam700 from '@fontsource/kalam/files/kalam-latin-700-normal.woff2?url';

const FACES: [string, string, FontFaceDescriptors][] = [
  ['Newsreader', newsNormal, { weight: '200 800', style: 'normal' }],
  ['Newsreader', newsItalic, { weight: '200 800', style: 'italic' }],
  ['Kalam', kalam400, { weight: '400' }],
  ['Kalam', kalam700, { weight: '700' }],
];

export async function loadFonts() {
  await Promise.all(
    FACES.map(async ([family, url, desc]) => {
      try {
        const face = await new FontFace(family, `url(${url})`, desc).load();
        document.fonts.add(face);
      } catch {
        /* Si una fuente falla, el navegador usa la alternativa de la pila CSS. */
      }
    }),
  );
}
