# Enseñanzas con fecha de caducidad

Presentación animada para una disertación de 7 minutos (asignatura *Oratoria y liderazgo pedagógico en el aula*, Máster del Profesorado, UC3M).

> **Simplificar no es engañar. Engañar es quitar la etiqueta.**

Todo lo que se enseña en la ESO acaba caducando: el átomo como un sistema solar, "no se puede restar 7 a 5", el Sol que sujeta a la Tierra con una cuerda, el dopaje de semiconductores que se cuenta sin explicar. Que caduque no es el problema. El problema es enseñarlo sin etiqueta, porque la idea vieja no se borra (Taber; Shtulman y Valcarcel; Allaire-Duquette y colaboradores). La charla propone simplificar con vigilancia (Chevallard), en espiral (Bruner) y avisando de que es un modelo. Después reconstruye cada caso con una animación de la versión real, pensada para alumnos de secundaria, porque la curiosidad y la sorpresa favorecen el aprendizaje (Gruber; Brod) y el asombro, bien puesto, es la erótica de la enseñanza (Recalcati).

El guion completo está en [`docs/guion.md`](docs/guion.md).

## Ver la presentación

**▶ [veregorn.github.io/ense-anzas-complejas](https://veregorn.github.io/ense-anzas-complejas/)**

Esta es la **versión 2**, más compacta (unos 6:40 de ensayo y un autor por idea). La versión 1 sigue disponible en [veregorn.github.io/ense-anzas-complejas/v1/](https://veregorn.github.io/ense-anzas-complejas/v1/) y en la rama `v1` del repositorio.

Una vez abierta, pulsa `F` para verla a pantalla completa y `P` para abrir la vista de presentador. También puedes empezar en un punto concreto: por ejemplo, [la reconstrucción del átomo (bloque 4, paso 2)](https://veregorn.github.io/ense-anzas-complejas/#4.2).

> Para la exposición en el aula es mejor el archivo `presentacion.html` (ver abajo): funciona sin internet. El enlace web sirve para ensayar desde cualquier equipo o compartirla.

---

## El día de la exposición

1. Conecta el portátil al proyector en modo **pantalla extendida**, no duplicada. En macOS: *Ajustes del Sistema → Pantallas → (proyector) → Usar como: Pantalla extendida*. Si duplicas pantalla, el público vería también tus notas.
2. Abre **`presentacion.html`** (el archivo único de `dist-single/`) en Chrome. Funciona **sin internet**.
3. Pulsa **P**: se abre la **vista de presentador** en una ventana nueva. Déjala en la pantalla del portátil.
4. Arrastra la ventana de la presentación a la pantalla del proyector, haz clic en ella y pulsa **F**. Se pone a pantalla completa en el proyector.
5. Avanza con el mando. **Cada clic es un paso**: nada cambia de idea hasta que tú pulsas. El mando actúa sobre la ventana que tenga el foco, y cualquiera de las dos sirve porque están sincronizadas.

La vista de presentador recuerda estos pasos hasta que das el primer clic.

| Tecla | Acción |
|---|---|
| `→` `AvPág` `Espacio` o clic | Siguiente paso |
| `←` `RePág` o clic derecho | Paso anterior |
| `B` o `.` | Pantalla en negro (otra vez para volver) |
| `P` | Abrir la vista de presentador |
| `F` | Pantalla completa |
| `R` | Reiniciar el cronómetro |
| `Inicio` | Volver al principio |
| `H` | Ayuda |

**Vista de presentador.** Muestra:
- las anclas del bloque (las palabras clave que tienes que recordar);
- el guion, con el paso actual resaltado;
- lo que ocurrirá en el **siguiente clic**;
- un cronómetro que te avisa si vas adelantado o retrasado respecto al tiempo previsto del bloque.

Puedes avanzar desde cualquiera de las dos ventanas. Si pulsas un punto del mapa de la derecha, saltas directamente a ese paso.

**Para ensayar** desde un punto concreto, añade `#bloque.paso` a la dirección. Por ejemplo, `presentacion.html#9.3` abre directamente la frase final.

---

## Estructura

```
src/
  content/script.ts      El guion clic a clic (fuente de la vista de presentador)
  core/                  Motor: escenario 1920×1080, escenas, navegación, sincronía, texturas
  draw/
    chalk.ts             Dibujo "a tiza" con temblor de mano y grano
    tag.ts               Etiquetas de supermercado, código de barras y sello
    electron-cloud.ts    La nube electrónica en 3D (densidades reales del hidrógeno)
    school-model.ts      El Sistema Solar del colegio (con hilos que se rompen)
    spacetime3d.ts       La malla del espacio-tiempo en 3D (Three.js)
  scenes/                Una escena por bloque del guion
    c0-atom-air.ts       "Dibujad un átomo en el aire" · sello "Descartado en 1926" · ¿os engañaron? · título
    c1-rules.ts          Trece reglas que caducan (la regla nº 3, el Sol con cuerda, el chip)
    c2-fridge.ts         Taber · el cerebro que frena · la nevera
    c3-label.ts          ¿Dejamos de simplificar? · Chevallard · la etiqueta del profesor · Bruner
    c4-rec-atom.ts       Sin rebajas · del átomo de tiza a la nube (1s → 2p) · Gruber
    c5-rec-subtract.ts   El ascensor baja al garaje (5 − 7 = −2) · «…todavía»
    c6-rec-sun.ts        Los hilos se rompen y el espacio se curva
    c7-rec-semis.ts      Red de silicio, fósforo y boro, el cine y la bombilla · los ingredientes
    c8-rec-final.ts      Recalcati · erótica no es espectáculo
    c9-closing.ts        Todo con etiqueta · la pregunta · la frase final · gracias
  presenter/             Vista de presentador
  styles/                Tokens, escenario, escenas, etiquetas y presentador
```

**Tres mundos visuales.** La **pizarra** (verde, tiza, letra Kalam) es lo que se enseña en clase. La **noche** (luz de estrellas, Newsreader) es la evidencia y la versión real. Las **etiquetas de supermercado** (IBM Plex Mono) marcan cada modelo con su fecha de caducidad.

**Cómo funciona una escena.** Cada escena extiende `Scene` y declara cuántos pasos tiene (`stepCount`).
- `p(k, dur)` da el progreso 0..1 de la animación de entrada del paso `k`. Se usa para animar en canvas.
- `fx(el, desde, hasta)` muestra un elemento HTML mientras el paso esté en ese rango.
- Las animaciones de fondo (órbitas, nube, red cristalina) corren en `render`. Los cambios de idea solo ocurren al cambiar de paso.

## Desarrollo

```bash
npm install
npm run dev            # servidor local con recarga
npm run build          # web en dist/ (la publica GitHub Pages)
npm run build:single   # un único HTML autónomo en dist-single/
```

Para editar el texto de la vista de presentador, cambia `src/content/script.ts`. Para cambiar lo que se ve en pantalla, cambia la escena correspondiente en `src/scenes/`.

### Publicar en GitHub Pages

El workflow `.github/workflows/pages.yml` compila y publica en [veregorn.github.io/ense-anzas-complejas](https://veregorn.github.io/ense-anzas-complejas/) en cada push a `main`. En **Settings → Pages**, la fuente debe ser **GitHub Actions** (no "Deploy from a branch", que publicaría el código sin compilar).

## Fuentes

- Taber, K. S. *Pedagogic learning impediment*: errores provocados por la enseñanza ("el alumno solo es culpable de aprender lo que le enseñaron").
- Karp, B., Bush, S. y Dougherty, B. (2014). "13 Rules That Expire". *Teaching Children Mathematics*, 21(1).
- Shtulman, A. y Valcarcel, J. (2012). "Scientific knowledge suppresses but does not supplant earlier intuitions". *Cognition*, 124(2).
- Allaire-Duquette, G. y colaboradores (2021). "An fMRI study of scientists with a Ph.D. in physics confronted with naive ideas in science". *npj Science of Learning*, 6.
- Ausubel, D. P. (1968). *Psicología educativa: un punto de vista cognoscitivo*.
- Chevallard, Y. (1985). *La transposición didáctica: del saber sabio al saber enseñado* (Aique, 1991).
- Bruner, J. (1960). *El proceso de la educación*. Currículo en espiral.
- Gruber, M. J., Gelman, B. D. y Ranganath, C. (2014). "States of curiosity modulate hippocampus-dependent learning via the dopaminergic circuit". *Neuron*, 84(2).
- Brod, G., Hasselhorn, M. y Bunge, S. A. (2018). "When generating a prediction boosts learning: The element of surprise". *Learning and Instruction*, 55.
- Harp, S. F. y Mayer, R. E. (1998). Detalles seductores. *Journal of Educational Psychology*, 90(3).
- Recalcati, M. (2016). *La hora de clase. Por una erótica de la enseñanza*. Anagrama.
- Física de las reconstrucciones: orbitales 1s y 2p del hidrógeno (Schrödinger, 1926); dopaje tipo n (fósforo, 5 electrones de valencia) y tipo p (boro, 3) del silicio; relatividad general.
