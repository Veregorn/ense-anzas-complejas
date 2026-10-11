# Enseñanzas complejas: ¿simplificación o engaño?

Presentación animada para una disertación de 7 minutos (asignatura *Oratoria y liderazgo pedagógico en el aula*, Máster del Profesorado, UC3M).

> **Simplificar no es engañar. Lo que engaña es ocultar que estás simplificando.**

La charla usa la gravedad como ejemplo. Empieza con la Tierra "atada" al Sol del colegio y llega hasta Einstein: la masa curva el espacio-tiempo, y una manzana cae porque cerca de la Tierra el tiempo pasa más despacio. Con esa historia se defiende una forma más honesta de enseñar lo complejo.

El guion completo está en [`docs/guion.md`](docs/guion.md).

---

## El día de la exposición

1. Abre **`presentacion.html`** (el archivo único de `dist-single/`) en Chrome. Funciona **sin internet**.
2. Pulsa **F** para la pantalla completa en el proyector.
3. Pulsa **P** para abrir la **vista de presentador** y llévala a la pantalla del portátil.
4. Avanza con el mando. **Cada clic es un paso**: nada cambia de idea hasta que tú pulsas.

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

**Para ensayar** desde un punto concreto, añade `#bloque.paso` a la dirección. Por ejemplo, `presentacion.html#4.6` abre directamente LA FRASE.

---

## Estructura

```
src/
  content/script.ts      El guion clic a clic (fuente de la vista de presentador)
  core/                  Motor: escenario 1920×1080, escenas, navegación, sincronía, texturas
  draw/
    chalk.ts             Dibujo "a tiza" con temblor de mano y grano
    school-model.ts      El Sistema Solar del colegio (con hilos)
    spacetime3d.ts       La malla del espacio-tiempo en 3D (Three.js)
  scenes/                Una escena por bloque del guion
    s0-title.ts          Negro → título escrito a tiza
    s1-school.ts         El modelo del colegio; los hilos se rompen
    s2-spacetime.ts      La pizarra se convierte en espacio-tiempo; cita de Wheeler
    s3-apple.ts          El flujo del tiempo, cabeza y pies, la manzana cae
    s4-maps.ts           Newton ⊂ Einstein ⊂ ¿? · LA FRASE
    s5-life.ts           La idea del colegio viaja toda la vida · lies-to-children
    s6-spiral.ts         El currículo en espiral de Bruner
    s7-closing.ts        Tres compromisos, la puerta de luz, gracias
  presenter/             Vista de presentador
  styles/                Tokens, escenario, escenas y presentador
```

**Dos mundos visuales.** La **pizarra** (verde, tiza, letra Kalam) representa el modelo del colegio. El **cosmos** (noche profunda, luz de estrellas, Newsreader) representa el modelo de Einstein. Al final, la pizarra vuelve, pero esta vez para enseñar con honestidad.

**Cómo funciona una escena.** Cada escena extiende `Scene` y declara cuántos pasos tiene (`stepCount`).
- `p(k, dur)` da el progreso 0..1 de la animación de entrada del paso `k`. Se usa para animar en canvas.
- `fx(el, desde, hasta)` muestra un elemento HTML mientras el paso esté en ese rango.
- Las animaciones de fondo (órbitas, flujo del tiempo) corren en `render`. Los cambios de idea solo ocurren al cambiar de paso.

## Desarrollo

```bash
npm install
npm run dev            # servidor local con recarga
npm run build          # web en dist/ (la publica GitHub Pages)
npm run build:single   # un único HTML autónomo en dist-single/
```

Para editar el texto de la vista de presentador, cambia `src/content/script.ts`. Para cambiar lo que se ve en pantalla, cambia la escena correspondiente en `src/scenes/`.

### Publicar en GitHub Pages

El workflow `.github/workflows/pages.yml` compila y publica en cada push a `main`. Solo hay que activarlo una vez en **Settings → Pages → Source: GitHub Actions**.

## Fuentes de los datos

- Hawking, S. (1988). *Breve historia del tiempo*, cap. 2, "Espacio y tiempo".
- Wheeler, J. A.: "La materia le dice al espacio-tiempo cómo curvarse; el espacio-tiempo le dice a la materia cómo moverse".
- Diferencia de ritmo del tiempo cerca de la superficie terrestre: g·h/c² ≈ 1,1 × 10⁻¹⁶ por metro.
- Chou, C. W., Hume, D. B., Rosenband, T. y Wineland, D. J. (2010). "Optical Clocks and Relativity". *Science*, 329, 1630–1633 (relojes separados 33 cm).
- Bruner, J. (1960). *El proceso de la educación*: currículo en espiral.
- Posner, Strike, Hewson y Gertzog (1982): ideas previas y cambio conceptual.
- Stewart, I. y Cohen, J. (1999). *The Science of Discworld* (con T. Pratchett): *lies-to-children*.
