/**
 * El guion, bloque a bloque y clic a clic. Es la fuente de la vista de presentador.
 *  - cue:  qué ocurre en pantalla al llegar a ese paso.
 *  - say:  lo que dices mientras estás en ese paso. Entre corchetes, indicaciones de actuación.
 * Hay una entrada por escena; el bloque 4 del guion (la reconstrucción) ocupa cinco escenas.
 */
export interface Beat {
  cue: string;
  say: string;
}

export interface Block {
  title: string;
  /** Ventana de tiempo objetivo, en segundos desde el inicio. */
  start: number;
  end: number;
  anchors: string[];
  beats: Beat[];
}

export const TITLE = 'Enseñanzas con fecha de caducidad';
export const THESIS = 'Simplificar no es engañar. Engañar es quitar la etiqueta.';

export const BLOCKS: Block[] = [
  {
    title: 'El átomo dibujado en el aire',
    start: 0,
    end: 40,
    anchors: ['dedo en el aire', '1926', '¿os engañaron?'],
    beats: [
      {
        cue: 'Pizarra vacía: «Dibujad un átomo en el aire»',
        say: '[Sin saludar. Mira al público. Tres segundos de silencio.] Antes de empezar, os pido una cosa. Levantad un dedo… y dibujad en el aire un átomo. [Dibújalo tú también, con órbitas. Espera.]',
      },
      { cue: 'Aparece a tiza el átomo de siempre', say: 'Casi todos habéis dibujado lo mismo: un núcleo en el centro y electrones dando vueltas, como planetas alrededor del Sol.' },
      { cue: 'Sello: «Descartado en 1926»', say: 'Pues acabáis de dibujar algo que la física descartó en 1926. Hace casi cien años. Y aun así, es lo que os sale.' },
      { cue: '«¿Os engañaron?» y el título', say: '[Pausa.] Así que os pregunto: ¿os engañaron?' },
    ],
  },
  {
    title: 'Reglas que caducan',
    start: 40,
    end: 110,
    anchors: ['trece reglas', '5 − 7', 'cuerda del Sol', 'ingredientes: no consta', 'el problema es otro'],
    beats: [
      { cue: '«Trece reglas que caducan»', say: 'En didáctica de las matemáticas hay un artículo muy citado que se titula «Trece reglas que caducan». Seguro que os suenan.' },
      { cue: 'Caso 1: «No se puede restar 7 a 5»', say: '«No se puede restar siete a cinco.»' },
      { cue: 'Etiqueta: antes de 1º de ESO', say: 'En Primaria, esa respuesta era un diez. En 1º de ESO, la misma respuesta es un cero.' },
      { cue: 'Caso 2: el Sol y la cuerda invisible', say: 'En ciencias pasa lo mismo. «El Sol atrae a los planetas como si los atara con una cuerda invisible.»' },
      { cue: 'Etiqueta: antes de leer a Einstein', say: '[Deja que se rían.]' },
      {
        cue: 'Caso 3: impurezas y conduce mejor',
        say: 'Y a veces ni siquiera se simplifica: directamente no se explica. En Tecnología se cuenta que a los semiconductores se les añaden impurezas y que así conducen mejor. ¿Por qué?',
      },
      { cue: 'Etiqueta: «Ingredientes: no consta»', say: 'Hay que creérselo.' },
      { cue: '«Todo caduca. El problema es otro.»', say: '[Pausa.] Pero ojo: que una regla caduque no es el problema. Todo lo que enseñamos caduca. El problema es otro.' },
    ],
  },
  {
    title: 'Lo caducado se queda en la nevera',
    start: 110,
    end: 180,
    anchors: ['Taber', 'culpable de aprender lo que le enseñaron', '150 universitarios', 'doctores en física', 'la nevera'],
    beats: [
      {
        cue: 'Taber: «culpable de aprender lo que le enseñaron»',
        say: 'Keith Taber, uno de los grandes de la didáctica de las ciencias, le ha puesto nombre: impedimento pedagógico. Son errores que no vienen de la intuición del alumno, sino de cómo se lo enseñamos. Y dice algo demoledor: en esos casos, el alumno solo es culpable de haber aprendido lo que le enseñaron.',
      },
      {
        cue: 'Shtulman y Valcarcel: 150 universitarios',
        say: '¿Y se arregla después? No del todo. En 2012, Shtulman y Valcarcel pusieron a ciento cincuenta universitarios de ciencias a contestar «verdadero o falso» a toda velocidad. Cuando la ciencia contradecía la idea de siempre, tardaban más y fallaban más. La idea vieja seguía ahí.',
      },
      { cue: 'El cerebro de los doctores en física', say: 'En 2021, otro equipo lo repitió con doctores en física dentro de un escáner. Su cerebro tenía que frenar activamente la idea ingenua. [Pausa.] Doctores en física.' },
      { cue: 'La nevera se abre', say: 'Lo caducado no se tira solo. Se queda en la nevera.' },
      { cue: 'Ausubel', say: 'Y como decía Ausubel, lo que el alumno ya sabe es lo que más condiciona todo lo que aprenderá después.' },
    ],
  },
  {
    title: 'Poner la etiqueta',
    start: 180,
    end: 230,
    anchors: ['Chevallard', 'vigilancia', 'la etiqueta en tres líneas', 'Bruner', 'espiral'],
    beats: [
      {
        cue: 'Chevallard: transposición didáctica',
        say: 'En didáctica, esto también tiene nombre. Yves Chevallard lo llamó transposición didáctica: todo profesor transforma el saber de la ciencia en algo que se pueda enseñar. Es inevitable, y es legítimo. Pero exige vigilancia epistemológica.',
      },
      { cue: 'La etiqueta del profesor', say: 'Traducido al aula, es poner la etiqueta. Decir «esto es un modelo». Decir hasta dónde vale. Y decir que hay más.' },
      {
        cue: 'La espiral de Bruner',
        say: 'Bruner lo completó hace más de sesenta años: cualquier materia puede enseñarse a cualquier edad de una forma intelectualmente honesta. En espiral. Volviendo a la misma idea cada vez más a fondo, sin tener que desmentir la anterior.',
      },
    ],
  },
  {
    title: 'Reconstruir el átomo',
    start: 230,
    end: 290,
    anchors: ['más allá de la etiqueta', 'fotos', 'nube', '«ese pequeño oh»', 'dopamina'],
    beats: [
      {
        cue: '«La reconstrucción»: el átomo de tiza',
        say: 'Pero hoy podemos ir más allá de la etiqueta. Bohr dibujaba con tiza. Nosotros tenemos animaciones. Así que vamos a reconstruir todo lo de antes, como se lo contaríamos hoy a un alumno de 3º de ESO.',
      },
      {
        cue: 'La nube se forma, foto a foto',
        say: 'El átomo. El electrón no da vueltas como un planeta. Si pudiéramos fotografiarlo, cada foto lo pillaría en un sitio distinto. Juntad miles de fotos… y aparece una nube. Esa nube es el átomo.',
      },
      { cue: 'La nube toma forma de lóbulos + etiqueta', say: 'Y tiene formas preciosas.' },
      {
        cue: 'Gruber: curiosidad y dopamina',
        say: '[Pausa.] ¿Habéis notado ese pequeño «oh»? Eso es curiosidad, y no es un detalle menor. En 2014, Gruber y su equipo comprobaron que, cuando sentimos curiosidad, se activa el circuito de la dopamina y recordamos mejor. Incluso lo que viene justo después.',
      },
    ],
  },
  {
    title: 'Reconstruir la resta',
    start: 290,
    end: 310,
    anchors: ['el garaje', 'planta cinco', 'menos dos'],
    beats: [
      { cue: 'El ascensor baja siete plantas', say: 'La resta. Los números no se acaban en el cero. Como en el ascensor de un garaje: desde la planta cinco, bajas siete y llegas a la menos dos.' },
      { cue: 'Etiqueta: números enteros', say: '[Breve pausa y sigue.]' },
    ],
  },
  {
    title: 'Reconstruir el Sol',
    start: 310,
    end: 335,
    anchors: ['no hay cuerda', 'curva', 'sábana', 'también es un modelo'],
    beats: [
      { cue: 'El Sistema Solar del colegio, con sus hilos', say: 'El Sol.' },
      { cue: 'Los hilos se rompen y el espacio se curva', say: 'No hay cuerda. El Sol curva el espacio a su alrededor y los planetas siguen esa curva, como canicas en una sábana hundida.' },
      { cue: 'Etiqueta: también es un modelo', say: 'Con su etiqueta, porque la sábana también es un modelo.' },
    ],
  },
  {
    title: 'Reconstruir los semiconductores',
    start: 335,
    end: 365,
    anchors: ['cuatro manos', 'fósforo: sobra una', 'boro: hueco', 'el cine'],
    beats: [
      { cue: 'La red de silicio', say: 'Los semiconductores. Cada átomo de silicio se da la mano con cuatro vecinos.' },
      { cue: 'Fósforo: un electrón libre', say: 'Si metemos uno de fósforo, que tiene cinco manos, le sobra una: un electrón libre para moverse.' },
      {
        cue: 'Boro: el hueco que se mueve (y el cine)',
        say: 'Si metemos uno de boro, que solo tiene tres, queda un hueco. Y el hueco se mueve, como un asiento libre en el cine cuando la gente se va cambiando de sitio.',
      },
      { cue: 'Etiqueta: modelo de las manos', say: '[Pausa breve.]' },
    ],
  },
  {
    title: 'Ni adorno ni truco',
    start: 365,
    end: 385,
    anchors: ['no es adorno', 'detalles seductores', 'Recalcati', 'deseo de saber'],
    beats: [
      {
        cue: '«Ninguna de estas animaciones es un adorno»',
        say: 'Fijaos en que ninguna de estas animaciones es un adorno. Y eso importa: las anécdotas llamativas pero irrelevantes, los detalles seductores, distraen y empeoran el aprendizaje. La sorpresa tiene que estar en el concepto.',
      },
      { cue: 'Recalcati: la erótica de la enseñanza', say: 'Massimo Recalcati lo llama la erótica de la enseñanza: no transmitir solo información, sino el deseo de saber.' },
    ],
  },
  {
    title: 'Cierre',
    start: 385,
    end: 420,
    anchors: ['todo caducará', 'también la nube', '¿sin etiqueta?', 'frase final'],
    beats: [
      {
        cue: 'Los cuatro casos, cada uno con su etiqueta',
        say: 'Todo lo que enseñamos caducará algún día. También la nube, también la sábana. Eso no lo podemos evitar. Lo que sí está en nuestras manos es que nuestros alumnos lo sepan.',
      },
      { cue: '«¿Qué estáis enseñando vosotros sin etiqueta?»', say: '[Pausa. Mira al público.] Así que os dejo con una pregunta: ¿qué estáis enseñando vosotros sin etiqueta?' },
      { cue: 'La frase final', say: '[Pausa larga.] Simplificar no es engañar. Engañar es quitar la etiqueta.' },
      { cue: 'Gracias', say: 'Gracias. [Sonríe. Quédate quieto dos segundos.]' },
    ],
  },
];
