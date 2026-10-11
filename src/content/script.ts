/**
 * El guion, bloque a bloque y clic a clic. Es la fuente de la vista de presentador.
 *  - cue:  qué ocurre en pantalla al llegar a ese paso.
 *  - say:  lo que dices mientras estás en ese paso. Entre corchetes, indicaciones de actuación.
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

export const TITLE = 'Enseñanzas complejas: ¿simplificación o engaño?';
export const THESIS = 'Simplificar no es engañar. Lo que engaña es ocultar que estás simplificando.';

export const BLOCKS: Block[] = [
  {
    title: 'Silencio inicial',
    start: 0,
    end: 15,
    anchors: ['silencio', '“algo que os enseñaron”'],
    beats: [
      { cue: 'Pantalla en negro', say: '[Colócate. Silencio de 3 segundos. Mira al público.]' },
      { cue: 'El título aparece escrito a tiza', say: 'Quiero empezar con algo que os enseñaron a todos.' },
    ],
  },
  {
    title: 'El modelo del colegio',
    start: 15,
    end: 60,
    anchors: ['cuerda invisible', 'buena nota', 'Hawking', '“no existe”'],
    beats: [
      {
        cue: 'Se dibuja el Sistema Solar del colegio',
        say: 'En el colegio nos pusieron delante esta imagen. El Sol en el centro, los planetas girando, y una explicación muy sencilla: el Sol atrae a los planetas con una fuerza, la gravedad, y por eso no se escapan.',
      },
      {
        cue: 'Se iluminan los hilos: «una cuerda invisible»',
        say: 'Como si cada planeta estuviera atado al Sol con una cuerda invisible. Me lo creí. Lo estudié. Lo puse en un examen. Y saqué buena nota.',
      },
      {
        cue: 'Aparece el libro de Hawking',
        say: 'Años después cayó en mis manos un libro: «Breve historia del tiempo», de Stephen Hawking. Y en el capítulo dos, Hawking me dijo algo que me dejó sin suelo bajo los pies.',
      },
      { cue: 'Los hilos se rompen… y los planetas siguen girando', say: '[Pausa.] Esa cuerda no existe.' },
    ],
  },
  {
    title: 'Lo que de verdad pasa',
    start: 60,
    end: 120,
    anchors: ['no es una fuerza', 'lo más recto posible', 'Wheeler'],
    beats: [
      { cue: 'La pizarra se convierte en una malla', say: 'Según Einstein, la gravedad no es una fuerza.' },
      {
        cue: 'La malla se hunde: aparece el espacio-tiempo',
        say: 'Una masa como el Sol curva el espacio-tiempo a su alrededor. Y la Tierra no está atada a nada: simplemente avanza lo más recto que puede… por un espacio que está curvado. Y ese «lo más recto posible», visto desde fuera, es una órbita.',
      },
      {
        cue: 'La cita de Wheeler',
        say: 'Un físico, John Wheeler, lo resumió en una frase: [lee despacio] «La materia le dice al espacio-tiempo cómo curvarse. El espacio-tiempo le dice a la materia cómo moverse.»',
      },
    ],
  },
  {
    title: 'La manzana',
    start: 120,
    end: 205,
    anchors: ['¿y la manzana?', 'el tiempo', 'vuestros pies', 'nada está quieto', 'coche en el barro', '10¹⁶ · 33 cm'],
    beats: [
      { cue: 'Una manzana quieta en su rama', say: 'Vale, eso con planetas. ¿Pero una manzana? ¿Por qué cae una manzana que está quieta en su rama?' },
      {
        cue: 'Aparece el flujo del tiempo: más lento abajo',
        say: 'Aquí viene lo más bonito. Lo que está curvado cerca de la Tierra no es tanto el espacio… es el tiempo. Cuanto más cerca estás de una masa, más despacio pasa el tiempo.',
      },
      { cue: 'Una persona con dos relojes: cabeza y pies', say: 'Vuestros pies, ahora mismo, viven un poquito más despacio que vuestra cabeza. [Pausa. Deja que reaccionen.]' },
      {
        cue: '«Nada está quieto»: la manzana avanza por el tiempo',
        say: 'Y ahora fijaos en una cosa: nada está realmente quieto. Aunque la manzana no se mueva, avanza por el tiempo, segundo a segundo. Todo avanza por el tiempo.',
      },
      {
        cue: 'Un coche con una rueda en tiempo lento: gira',
        say: 'Imaginad un coche que mete las ruedas de un lado en el barro. Esas ruedas avanzan más despacio… y el coche gira hacia ese lado, sin que nadie toque el volante.',
      },
      {
        cue: 'La manzana hace lo mismo… y cae',
        say: 'A la manzana le pasa lo mismo: su parte de abajo avanza por el tiempo un poquito más despacio que la de arriba. Así que su camino gira. Hacia abajo. [Pausa.] Eso es caer.',
      },
      {
        cue: 'Los datos: 1 entre 10¹⁶ y 33 cm',
        say: 'La diferencia es ridícula: una parte entre diez elevado a dieciséis, es decir, entre diez mil billones, por cada metro de altura. Y aun así, en 2010, en un laboratorio de Estados Unidos, la midieron con dos relojes separados solo treinta y tres centímetros.',
      },
      { cue: 'Frase: «La manzana no cae porque…»', say: 'La manzana no cae porque la Tierra tire de ella. Cae porque, cerca de la Tierra, el tiempo pasa más despacio.' },
    ],
  },
  {
    title: '¿Me engañaron?',
    start: 205,
    end: 255,
    anchors: ['¿me engañaron?', 'la Luna', 'mapas', 'LA FRASE'],
    beats: [
      { cue: 'Vuelve la pizarra: «¿Me engañaron?»', say: 'Así que la pregunta es inevitable: ¿me engañaron en el colegio?' },
      {
        cue: 'El mapa de Newton',
        say: 'La respuesta honesta es: no del todo. Newton no es mentira. Sus ecuaciones son tan buenas que con ellas llevamos al ser humano a la Luna. Newton es un mapa. Un mapa excelente… de una parte del territorio.',
      },
      { cue: 'Zoom: el mapa de Einstein lo contiene', say: 'Einstein es un mapa mejor.' },
      { cue: 'Zoom: el mapa que todavía no existe', say: 'Y probablemente algún día alguien dibujará uno mejor todavía.' },
      { cue: '«Nadie me dijo que era un mapa»', say: 'El problema no fue que me enseñaran un mapa. El problema es que nadie me dijo que era un mapa.' },
      {
        cue: 'LA FRASE',
        say: '[Pausa. Mira al público. Despacio.] Simplificar no es engañar. Lo que engaña es ocultar que estás simplificando. [Pausa larga: 3 segundos.]',
      },
    ],
  },
  {
    title: 'Los que nunca se enteran',
    start: 255,
    end: 315,
    anchors: ['tuve suerte', 'versión definitiva', 'toda la vida', 'mentiras para niños'],
    beats: [
      { cue: 'Una vida: la etapa escolar', say: 'Yo tuve suerte: me cayó un libro en las manos. Pero pensad en la mayoría de nuestros alumnos.' },
      {
        cue: 'La idea del colegio viaja hasta los 80 años',
        say: 'La inmensa mayoría nunca volverá a estudiar física. Para ellos, lo que les contemos en el aula no es una primera versión. Es la versión definitiva. La que se van a llevar toda la vida.',
      },
      {
        cue: '«Lies-to-children»',
        say: 'Y eso tiene un coste. La investigación educativa nos dice que las ideas erróneas que aprendemos de pequeños son de las más difíciles de desaprender. Incluso tiene nombre en inglés: lies-to-children. Mentiras para niños.',
      },
    ],
  },
  {
    title: 'La alternativa: la espiral',
    start: 315,
    end: 375,
    anchors: ['Bruner', 'honesta', 'Primaria → Universidad', 'nadie dice “olvidad”'],
    beats: [
      {
        cue: 'La cita de Bruner',
        say: '¿Hay alternativa? En 1960, el psicólogo Jerome Bruner escribió algo que parece escrito para esta charla: cualquier materia puede enseñarse a cualquier niño, en cualquier etapa, de una forma intelectualmente honesta.',
      },
      { cue: 'Espiral: Primaria', say: 'Imaginad la gravedad enseñada así. En Primaria: «las cosas con mucha masa deforman el espacio y el tiempo a su alrededor».' },
      { cue: 'Espiral: ESO', say: 'En la ESO: «el tiempo va más lento cerca de la Tierra, y por eso caen las cosas».' },
      { cue: 'Espiral: Bachillerato', say: 'En Bachillerato: Newton, presentado como lo que es, una aproximación brillante.' },
      { cue: 'Espiral: Universidad', say: 'Y en la universidad, las ecuaciones.' },
      { cue: '«Ninguno contradice al anterior»', say: 'Cada curso, más profundo. Ninguno contradice al anterior. Nadie tiene que decir nunca: «olvidad lo que os enseñaron».' },
    ],
  },
  {
    title: 'Cierre',
    start: 375,
    end: 420,
    anchors: ['ya no hay excusa', 'modelo · dónde se rompe · puerta abierta', '“había más”'],
    beats: [
      {
        cue: 'El Sistema Solar, ahora sin hilos',
        say: 'Hace treinta años, dibujar el tiempo curvándose en una pizarra era casi imposible. Hoy, todo lo que habéis visto en esta pantalla se puede preparar en unas horas. Ya no tenemos esa excusa.',
      },
      { cue: 'Pizarra: 1. «Esto es un modelo»', say: 'Así que os propongo tres cosas para cuando estéis en el aula: decid «esto es un modelo».' },
      { cue: '2. Enseñad dónde se rompe', say: 'Enseñad dónde se rompe.' },
      { cue: '3. Dejad la puerta abierta', say: 'Y dejad siempre la puerta abierta.' },
      {
        cue: 'Una puerta de luz y la frase final',
        say: '[Pausa.] Al niño que yo fui no le hacía falta que le contaran toda la verdad. Le hacía falta que alguien le dijera que había más.',
      },
      { cue: 'Gracias', say: 'Gracias. [Sonríe. Quédate quieto dos segundos antes de moverte.]' },
    ],
  },
];
