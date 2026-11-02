/**
 * El guion, bloque a bloque y clic a clic. Es la fuente de la vista de presentador.
 *  - cue:  qué ocurre en pantalla al llegar a ese paso.
 *  - say:  lo que dices mientras estás en ese paso. Entre corchetes, indicaciones de actuación.
 *           Entre llaves, frases opcionales: se pueden quitar si vas justo de tiempo.
 * Hay una entrada por escena; la reconstrucción ocupa cuatro escenas.
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
    end: 55,
    anchors: ['dedo en el aire', '1926', '¿os engañaron?', 'nadie os dijo la fecha', 'el título'],
    beats: [
      {
        cue: 'Pizarra vacía: «Dibujad un átomo en el aire»',
        say: '[Sin saludar. Mira al público. Tres segundos de silencio.] Antes de empezar, os pido una cosa. Levantad un dedo… y dibujad en el aire un átomo. [Dibújalo tú también, con órbitas. Espera.]',
      },
      { cue: 'Aparece a tiza el átomo de siempre', say: 'Casi todos habéis dibujado lo mismo: un núcleo en el centro y electrones dando vueltas, como planetas alrededor del Sol.' },
      { cue: 'Sello: «Descartado en 1926»', say: 'Pues acabáis de dibujar algo que la física descartó en 1926. Hace casi cien años. Y aun así, es lo que os sale.' },
      {
        cue: '«¿Os engañaron?»',
        say: '[Pausa.] Así que os pregunto: ¿os engañaron? [Deja que piensen.] Bueno… no exactamente. Era un buen modelo… con fecha de caducidad. Lo que pasa es que nadie os dijo la fecha.',
      },
      { cue: 'El título: «Enseñanzas con fecha de caducidad»', say: '[Señala el título.] De eso va esto: de las enseñanzas con fecha de caducidad.' },
    ],
  },
  {
    title: 'Reglas que caducan',
    start: 55,
    end: 130,
    anchors: ['trece reglas', '«os leo una»', 'regla nº 3', 'cuerda del Sol', 'ingredientes: no consta', 'el problema es otro'],
    beats: [
      {
        cue: '«Trece reglas que caducan»',
        say: 'En didáctica de las matemáticas hay un artículo muy citado que se titula «Trece reglas que caducan». Son reglas de Primaria que, unos cursos después, dejan de ser verdad. Os leo una.',
      },
      {
        cue: 'Regla nº 3: «No se puede restar un número grande de uno pequeño»',
        say: '[Con tono de maestro muy convencido.] «No se puede restar un número grande de uno pequeño.» Cinco menos siete… no se puede.',
      },
      { cue: 'Etiqueta: antes de 1º de ESO', say: 'En Primaria, esa respuesta era un diez. En 1º de ESO, la misma respuesta es un cero.' },
      { cue: 'Caso 2: el Sol y la cuerda invisible', say: 'En ciencias pasa lo mismo. «El Sol atrae a los planetas como si los atara con una cuerda invisible.»' },
      { cue: 'Etiqueta: antes de leer a Einstein', say: '[Deja que se rían.]' },
      {
        cue: 'Caso 3: impurezas y conduce mejor',
        say: 'Y a veces, directamente, no se explica. En Tecnología se cuenta que al silicio se le añaden impurezas y así conduce mejor. ¿Por qué?',
      },
      { cue: 'Etiqueta: «Ingredientes: no consta»', say: 'Hay que creérselo.' },
      { cue: '«Todo caduca. El problema es otro.»', say: '[Pausa.] Que una regla caduque no es el problema. Todo caduca. El problema es otro.' },
    ],
  },
  {
    title: 'Lo caducado se queda en la nevera',
    start: 130,
    end: 175,
    anchors: ['Taber', 'culpable de aprender lo que le enseñaron', '¿se arregla después?', 'doctores en física', 'la nevera'],
    beats: [
      {
        cue: 'Taber · «No nace de la intuición del alumno. Nace de cómo se lo enseñamos» · «culpable de aprender lo que le enseñaron»',
        say: 'Keith Taber le ha puesto nombre: impedimento pedagógico. Son errores que no vienen de la intuición del alumno, sino de cómo se lo enseñamos. Y dice algo demoledor: en esos casos, el alumno solo es culpable de haber aprendido lo que le enseñaron.',
      },
      {
        cue: '«¿Se arregla después?» · el cerebro de los doctores en física',
        say: '¿Y se arregla después? No del todo. En 2021 metieron a veinticinco doctores en física en un escáner. Ante una idea previa, su cerebro tenía que frenarla activamente. [Pausa.] Doctores en física.',
      },
      { cue: 'La nevera se abre', say: 'Lo caducado no se tira solo. Se queda en la nevera.' },
    ],
  },
  {
    title: 'Poner la etiqueta',
    start: 175,
    end: 215,
    anchors: ['¿dejamos de simplificar?', 'imposible', 'Chevallard', 'vigilancia', 'la etiqueta en tres líneas', 'Bruner', 'espiral'],
    beats: [
      { cue: '«Entonces… ¿dejamos de simplificar?»', say: 'Entonces, ¿qué hacemos? ¿Dejamos de simplificar? [Pausa.]' },
      {
        cue: 'Chevallard: transposición didáctica',
        say: 'Imposible. Chevallard lo llamó transposición didáctica: simplificar es inevitable, y es legítimo. Pero exige vigilancia.',
      },
      { cue: 'La etiqueta del profesor', say: 'Traducido al aula, es poner la etiqueta. Decir «esto es un modelo». Decir hasta dónde vale. Y decir que hay más.' },
      {
        cue: 'La espiral de Bruner',
        say: 'Y Bruner añade que cualquier materia puede enseñarse a cualquier edad de una forma intelectualmente honesta. En espiral, sin desmentir lo anterior.',
      },
    ],
  },
  {
    title: 'Reconstruir el átomo',
    start: 215,
    end: 285,
    anchors: ['más fácil que nunca', 'no solo tiza', 'sin rebajas', 'fotos', 'nube', '¿por qué esa forma?', 'Gruber', 'despertarla antes'],
    beats: [
      {
        cue: '«La reconstrucción» · «Ya no tenemos solo tiza» · etiqueta «Sin rebajas»',
        say: '[Pausa.] Y hoy eso es más fácil que nunca, porque ya no tenemos solo tiza. Vamos a hacer la prueba: los casos del principio, como se los contaríamos hoy a un alumno de 3º de ESO. Con su etiqueta… y sin rebajas.',
      },
      {
        cue: 'La nube se forma, foto a foto',
        say: 'El átomo. El electrón no da vueltas como un planeta. Si pudiéramos fotografiarlo, cada foto lo pillaría en un sitio distinto. Juntad miles de fotos… y aparece una nube. Esa nube es el átomo.',
      },
      { cue: 'La nube toma forma de lóbulos + etiqueta', say: 'Y tiene formas preciosas.' },
      {
        cue: '«¿Y por qué tiene esa forma?» · Gruber',
        say: '[Pausa.] Si un alumno de 3º ve esto, es fácil que pregunte: «¿y por qué tiene esa forma?». Esa pregunta es oro. Gruber y su equipo comprobaron en 2014 que la curiosidad activa el circuito de la dopamina y nos hace recordar mejor. Por eso merece la pena despertarla antes de explicar.',
      },
    ],
  },
  {
    title: 'Reconstruir la resta',
    start: 285,
    end: 310,
    anchors: ['el garaje', 'planta cinco', 'menos dos', 'una palabra', 'todavía'],
    beats: [
      { cue: 'El ascensor baja siete plantas', say: 'La resta. Los números no se acaban en el cero. Como en el ascensor de un garaje: desde la planta cinco, bajas siete y llegas a la menos dos.' },
      { cue: 'Etiqueta: números enteros · «Con los números que conocéis, no se puede…»', say: 'Y en Primaria bastaba con una palabra. «Con los números que conocéis, no se puede…»' },
      { cue: '«…todavía.»', say: '[Pausa.] …todavía.' },
    ],
  },
  {
    title: 'Reconstruir el Sol',
    start: 310,
    end: 330,
    anchors: ['no hay cuerda', 'espacio-tiempo', 'sábana', 'también es un modelo'],
    beats: [
      { cue: 'El Sistema Solar del colegio, con sus hilos', say: 'El Sol.' },
      { cue: 'Los hilos se rompen y el espacio-tiempo se curva', say: 'No hay cuerda. El Sol curva el espacio-tiempo a su alrededor y los planetas siguen esa curva, como canicas en una sábana hundida.' },
      { cue: 'Etiqueta: «Le falta el tiempo»', say: 'Con su etiqueta, porque la sábana también es un modelo.' },
    ],
  },
  {
    title: 'Reconstruir los semiconductores',
    start: 330,
    end: 390,
    anchors: ['«vamos a ver por qué»', 'cuatro manos', 'apenas conduce', 'fósforo: sobra una', 'hay corriente', 'boro: hueco', 'el cine', 'ahí están los ingredientes'],
    beats: [
      {
        cue: 'La red de silicio · «Ingredientes: no consta» · bombilla apagada',
        say: 'Los semiconductores. «Se le añaden impurezas y conduce mejor.» Vamos a ver por qué. Cada átomo de silicio se da la mano con cuatro vecinos. Todas las manos ocupadas: nada se mueve, y por eso el silicio puro apenas conduce.',
      },
      { cue: 'Fósforo: un electrón libre · la bombilla se enciende', say: 'Si metemos uno de fósforo, que tiene cinco manos, le sobra una: un electrón libre para moverse. Y si algo se mueve, hay corriente.' },
      {
        cue: 'Otro cristal, ahora con boro: el hueco que se mueve (y el cine)',
        say: 'Y si, en otro trozo de silicio, metemos uno de boro, que solo tiene tres, queda un hueco. Y el hueco se mueve, como un asiento libre en el cine cuando la gente se corre.',
      },
      { cue: '«No consta» se tacha · etiqueta «Ingredientes: Si + P · Si + B»', say: 'Ahí están los ingredientes.' },
    ],
  },
  {
    title: 'Cierre',
    start: 390,
    end: 420,
    anchors: ['todo caducará', 'también la nube', '¿sin etiqueta?', 'frase final'],
    beats: [
      {
        cue: 'Los cuatro casos, cada uno con su etiqueta',
        say: 'Todo lo que enseñamos caducará algún día. También la nube, también la sábana. Lo que sí está en nuestras manos es que nuestros alumnos lo sepan.',
      },
      { cue: '«¿Qué estáis enseñando vosotros sin etiqueta?»', say: '[Pausa. Mira al público.] Así que os dejo con una pregunta: ¿qué estáis enseñando vosotros sin etiqueta?' },
      { cue: 'La frase final', say: '[Pausa larga.] Simplificar no es engañar. Engañar es quitar la etiqueta.' },
      { cue: 'Gracias', say: 'Gracias. [Sonríe. Quédate quieto dos segundos.]' },
    ],
  },
];
