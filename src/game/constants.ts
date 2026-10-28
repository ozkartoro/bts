import { StarInfo, WorldId, Mission, GameProgress } from '../types/game';

export const STAR_LIST: StarInfo[] = [
  {
    id: 1,
    worldId: 'rm',
    member: 'RM',
    name: 'Estrella del Conocimiento',
    color: '#60A5FA',
    symbol: '📖',
    description: 'Representa la sabiduría, la introspección y la magia oculta en las palabras.',
    collected: false
  },
  {
    id: 2,
    worldId: 'jin',
    member: 'Jin',
    name: 'Estrella de la Creatividad',
    color: '#F472B6',
    symbol: '🍓',
    description: 'Ilumina la alegría, el sazón culinario y el amor que une a todos.',
    collected: false
  },
  {
    id: 3,
    worldId: 'suga',
    member: 'SUGA',
    name: 'Estrella de la Música',
    color: '#FBBF24',
    symbol: '🎹',
    description: 'Guarda los acordes sinceros que resuenan desde el alma y la pasión de componer.',
    collected: false
  },
  {
    id: 4,
    worldId: 'jhope',
    member: 'j-hope',
    name: 'Estrella de la Energía',
    color: '#34D399',
    symbol: '✨',
    description: 'Brilla con el ritmo del baile, el sol eterno y la esperanza inagotable.',
    collected: false
  },
  {
    id: 5,
    worldId: 'jimin',
    member: 'Jimin',
    name: 'Estrella de la Armonía',
    color: '#FB7185',
    symbol: '🌸',
    description: 'Evoca la delicadeza, la danza etérea y la dulzura incondicional.',
    collected: false
  },
  {
    id: 6,
    worldId: 'v',
    member: 'V',
    name: 'Estrella de la Imaginación',
    color: '#A78BFA',
    symbol: '🎨',
    description: 'Refleja la visión poética, los cuadros surrealistas y la belleza única.',
    collected: false
  },
  {
    id: 7,
    worldId: 'jungkook',
    member: 'Jung Kook',
    name: 'Estrella del Valor',
    color: '#F87171',
    symbol: '⚡',
    description: 'Simboliza la fuerza, la precisión inquebrantable y el espíritu del Golden Maknae.',
    collected: false
  }
];

export const WORLD_PORTALS: {
  id: WorldId;
  starId: number;
  name: string;
  member: string;
  color: string;
  angle: number; // Angle in radians around central plaza
  worldTitle: string;
  theme: string;
}[] = [
  {
    id: 'rm',
    starId: 1,
    name: 'Puerta del Conocimiento',
    member: 'RM',
    color: '#60A5FA',
    angle: 0,
    worldTitle: 'La Biblioteca Encantada',
    theme: 'Conocimiento y misterio'
  },
  {
    id: 'jin',
    starId: 2,
    name: 'Puerta de los Sabores',
    member: 'Jin',
    color: '#F472B6',
    angle: (Math.PI * 2) * (1 / 7),
    worldTitle: 'El Reino de los Sabores',
    theme: 'Cocina y creatividad'
  },
  {
    id: 'suga',
    starId: 3,
    name: 'Puerta de las Melodías',
    member: 'SUGA',
    color: '#FBBF24',
    angle: (Math.PI * 2) * (2 / 7),
    worldTitle: 'El Estudio de las Melodías',
    theme: 'Producción musical'
  },
  {
    id: 'jhope',
    starId: 4,
    name: 'Puerta del Baile',
    member: 'j-hope',
    color: '#34D399',
    angle: (Math.PI * 2) * (3 / 7),
    worldTitle: 'La Ciudad del Baile',
    theme: 'Danza y energía'
  },
  {
    id: 'jimin',
    starId: 5,
    name: 'Puerta de las Estrellas',
    member: 'Jimin',
    color: '#FB7185',
    angle: (Math.PI * 2) * (4 / 7),
    worldTitle: 'El Jardín de las Estrellas',
    theme: 'Belleza, equilibrio y precisión'
  },
  {
    id: 'v',
    starId: 6,
    name: 'Puerta de los Sueños',
    member: 'V',
    color: '#A78BFA',
    angle: (Math.PI * 2) * (5 / 7),
    worldTitle: 'La Galería de los Sueños',
    theme: 'Arte y misterio'
  },
  {
    id: 'jungkook',
    starId: 7,
    name: 'Puerta de los Campeones',
    member: 'Jung Kook',
    color: '#F87171',
    angle: (Math.PI * 2) * (6 / 7),
    worldTitle: 'La Arena de los Campeones',
    theme: 'Habilidad y superación'
  }
];

export const WORLD_MISSIONS: Record<WorldId, Mission[]> = {
  hub: [
    {
      id: 'hub_explore',
      name: 'Exploración de la Plaza Mágica',
      objective: 'Familiarízate con los controles y examina la fuente mística central.',
      mechanic: 'Navegación 3D',
      completed: false,
      hint: 'Usa WASD o la palanca táctil para mover a Mari hacia la fuente de agua púrpura.'
    },
    {
      id: 'hub_enter_portal',
      name: 'Elige tu Primer Portal',
      objective: 'Acércate a uno de los 7 portales luminosos y presiona [E] o el botón de interactuar.',
      mechanic: 'Interacción de portal',
      completed: false,
      hint: 'Cada portal representa a un integrante de BTS y custodia una estrella perdida.'
    }
  ],
  rm: [
    {
      id: 'rm_1',
      name: 'Los libros perdidos',
      objective: 'Encuentra los tomos antiguos flotantes escondidos entre los libreros de RM.',
      mechanic: 'Exploración y búsqueda',
      completed: false,
      hint: 'Busca los brillos azules entre las estanterías de la biblioteca.'
    },
    {
      id: 'rm_2',
      name: 'El código secreto',
      objective: 'Descifra la palabra clave que inspiró el viaje de Mari: ARMY.',
      mechanic: 'Puzzle lógico de runas',
      completed: false,
      hint: 'Ordena las letras para formar el nombre del fandom más leal del universo.'
    },
    {
      id: 'rm_3',
      name: 'La puerta del conocimiento',
      objective: 'Activa los 4 pilares en el orden correcto para revelar la Estrella del Conocimiento.',
      mechanic: 'Secuencia interactiva',
      completed: false,
      hint: 'Presiona los símbolos en orden: Libro ➔ Brújula ➔ Pluma ➔ Corazón.'
    }
  ],
  jin: [
    {
      id: 'jin_1',
      name: 'La receta misteriosa',
      objective: 'Encuentra los tres ingredientes mágicos: Fresa Silvestre, Especias Dulces y Arroz Dorado.',
      mechanic: 'Búsqueda en el castillo',
      completed: false,
      hint: 'Explora los mostradores y las mesas de banquetes coloridas.'
    },
    {
      id: 'jin_2',
      name: 'Chef Mari',
      objective: 'Sigue los pasos culinarios de Jin para preparar el plato especial con amor y toque secreto.',
      mechanic: 'Minijuego de cocina',
      completed: false,
      hint: 'Pica, saltea y decora con la técnica Worldwide Handsome.'
    },
    {
      id: 'jin_3',
      name: 'El banquete mágico',
      objective: 'Sirve los 3 platillos mágicos a los pedestales antes de que se enfríen.',
      mechanic: 'Desafío interactivo',
      completed: false,
      hint: 'Coloca cada plato en su mesa correspondiente para despertar la Estrella de la Creatividad.'
    }
  ],
  suga: [
    {
      id: 'suga_1',
      name: 'Las notas perdidas',
      objective: 'Encuentra las 3 claves de sol brillantes flotando cerca de los sintetizadores de SUGA.',
      mechanic: 'Exploración de estudio',
      completed: false,
      hint: 'Las notas resuenan con un tenue eco dorado cerca de los teclados.'
    },
    {
      id: 'suga_2',
      name: 'Crea tu melodía',
      objective: 'Reproduce la secuencia de 4 notas en el sintetizador Min PD.',
      mechanic: 'Memoria auditiva (Simon)',
      completed: false,
      hint: 'Escucha con atención y presiona los pads luminosos en el mismo orden.'
    },
    {
      id: 'suga_3',
      name: 'El ritmo secreto',
      objective: 'Sincroniza el compás maestro para liberar la Estrella de la Música.',
      mechanic: 'Sincronización rítmica',
      completed: false,
      hint: 'Presiona el pad central cuando el dial cruce la zona dorada.'
    }
  ],
  jhope: [
    {
      id: 'jhope_1',
      name: 'Aprende los movimientos',
      objective: 'Observa la rutina de baile de Hobi y memoriza la dirección de los pasos.',
      mechanic: 'Juego de memoria cinestésica',
      completed: false,
      hint: 'Izquierda, Arriba, Derecha, Giro radiante.'
    },
    {
      id: 'jhope_2',
      name: 'Dance Battle',
      objective: 'Acierta 5 compases al compás de las luces del escenario urbano.',
      mechanic: 'Desafío rítmico de flechas',
      completed: false,
      hint: 'Presiona la flecha indicada cuando brille con máxima intensidad.'
    },
    {
      id: 'jhope_3',
      name: 'El escenario final',
      objective: 'Ejecuta el paso final en el centro de la pista para desatar la Estrella de la Energía.',
      mechanic: 'Coreografía interactiva',
      completed: false,
      hint: '¡Baila con pura alegría como j-hope!'
    }
  ],
  jimin: [
    {
      id: 'jimin_1',
      name: 'El camino de las flores',
      objective: 'Navega por el laberinto floral bioluminiscente hasta la glorieta flotante.',
      mechanic: 'Laberinto visual',
      completed: false,
      hint: 'Sigue el rastro de los pétalos rosas que levitan en el aire.'
    },
    {
      id: 'jimin_2',
      name: 'Las plataformas mágicas',
      objective: 'Salta a través de las 3 plataformas flotantes con gracia y equilibrio.',
      mechanic: 'Desafío de plataformas',
      completed: false,
      hint: 'Calcula tus saltos con calma; las plataformas se estabilizan al pisarlas.'
    },
    {
      id: 'jimin_3',
      name: 'La estrella escondida',
      objective: 'Armoniza la constelación de Serendipity alineando los 3 prismas de luz.',
      mechanic: 'Puzzle visual de alineación',
      completed: false,
      hint: 'Gira los prismas para que los haces de luz converjan en el orbe central.'
    }
  ],
  v: [
    {
      id: 'v_1',
      name: 'El cuadro desaparecido',
      objective: 'Localiza los 3 lienzos impresionistas ocultos en la galería surrealista de V.',
      mechanic: 'Búsqueda de arte',
      completed: false,
      hint: 'Los marcos emiten un aura morada entre los pilares de mármol.'
    },
    {
      id: 'v_2',
      name: 'El rompecabezas artístico',
      objective: 'Recompón el mural de "Scenery / Bosque Púrpura" ordenando las 4 piezas del puzzle.',
      mechanic: 'Rompecabezas deslizante / ensamble',
      completed: false,
      hint: 'Coloca cada cuadrante en su posición para recrear la obra completa.'
    },
    {
      id: 'v_3',
      name: 'La habitación invisible',
      objective: 'Toca el cuadro del espejo misterioso para revelar la Estrella de la Imaginación.',
      mechanic: 'Exploración y revelación',
      completed: false,
      hint: 'Mira a través del marco dorado al final del salón.'
    }
  ],
  jungkook: [
    {
      id: 'jungkook_1',
      name: 'Carrera de obstáculos',
      objective: 'Supera el circuito de agilidad del Golden Maknae esquivando las barreras de energía.',
      mechanic: 'Recorrido con salto',
      completed: false,
      hint: 'Salta sobre las barras de luz y alcanza el podio intermedio.'
    },
    {
      id: 'jungkook_2',
      name: 'Desafío de precisión',
      objective: 'Apunta e impacta en las 3 dianas giratorias de la arena con lanzamientos de luz.',
      mechanic: 'Desafío de puntería',
      completed: false,
      hint: 'Espera a que el anillo de la diana se torne rojo para acertar el blanco.'
    },
    {
      id: 'jungkook_3',
      name: 'La prueba final',
      objective: 'Reclama la copa de los campeones en la cima de la torre para obtener la Estrella del Valor.',
      mechanic: 'Ascenso final',
      completed: false,
      hint: 'Sube las escaleras de la arena y reclama la séptima estrella.'
    }
  ],
  concert: [
    {
      id: 'concert_1',
      name: 'El Altar de las Siete Estrellas',
      objective: 'Coloca las 7 estrellas recuperadas en el pedestal del centro del escenario.',
      mechanic: 'Activación cósmica',
      completed: false,
      hint: 'Acércate al pedestal central donde convergen las constelaciones.'
    },
    {
      id: 'concert_2',
      name: 'El Concierto de las Estrellas',
      objective: 'Enciende las luces púrpuras y desata los fuegos artificiales junto a ARMY.',
      mechanic: 'Celebración final',
      completed: false,
      hint: '¡Presiona el botón de inicio del show y celebra la victoria de Mari!'
    }
  ]
};

export const INITIAL_PROGRESS: GameProgress = {
  stars: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false
  },
  completedMissions: {},
  inventory: [
    {
      id: 'army_box',
      name: 'Caja Púrpura Misteriosa',
      category: 'Coleccionables',
      description: 'La reliquia mágica que transportó a Mari a la Plaza de las Siete Puertas.',
      icon: '🎁'
    },
    {
      id: 'army_letter',
      name: 'Carta de las Siete Puertas',
      category: 'Objetos de misión',
      description: '"Siete estrellas selladas, un único corazón ARMY capaz de iluminarlas de nuevo."',
      icon: '📜'
    }
  ],
  currentWorld: 'hub',
  hasSeenIntro: false,
  customization: {
    hairColor: '#4A2810',
    hairStyle: 'ponytail',
    shirtColor: '#8B5CF6',
    shirtLogo: 'ARMY',
    pantsColor: '#1E293B',
    backpackColor: '#EC4899',
    skinTone: '#FCD34D',
    shoesColor: '#FFFFFF'
  },
  gameCompleted: false,
  stats: {
    puzzlesSolved: 0,
    stepsWalked: 0,
    notesPlayed: 0,
    dishesCooked: 0,
    danceScore: 0
  }
};
