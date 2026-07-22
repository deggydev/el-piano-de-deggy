const KEYS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEYS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeNote(note: string, semitones: number, useFlats = false): string {
  // Normalize input note
  let index = KEYS_SHARP.indexOf(note);
  if (index === -1) {
    index = KEYS_FLAT.indexOf(note);
  }
  if (index === -1) return note; // Not recognized, return as is

  const newIndex = (index + semitones + 24 * 10) % 12;
  return useFlats ? KEYS_FLAT[newIndex] : KEYS_SHARP[newIndex];
}

export function transposeChord(chordString?: string, semitones = 0): string {
  if (!chordString || semitones === 0) return chordString || '';

  // Regex to match root note and slash bass note (e.g. "F#m7/C#" -> root: "F#", suffix: "m7", slash: "/", bass: "C#")
  const regex = /^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/;
  const match = chordString.match(regex);
  if (!match) return chordString;

  const rootNote = match[1];
  const suffix = match[2] || '';
  const slash = match[3] || '';
  const bassNote = match[4] || '';

  const transposedRoot = transposeNote(rootNote, semitones);
  const transposedBass = bassNote ? transposeNote(bassNote, semitones) : '';

  return `${transposedRoot}${suffix}${transposedBass ? '/' + transposedBass : slash}`;
}

export function getChordNotes(chordString: string): string[] {
  // Comprehensive helper for piano keyboard visualizer with full worship/gospel chord formulas
  if (!chordString) return [];
  const regex = /^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/;
  const match = chordString.match(regex);
  if (!match) return [];

  const root = match[1];
  const suffix = match[2]?.toLowerCase() || '';

  let rootIndex = KEYS_SHARP.indexOf(root);
  if (rootIndex === -1) rootIndex = KEYS_FLAT.indexOf(root);
  if (rootIndex === -1) return [];

  // Determine interval profile (semitone offsets from root)
  let intervals = [0, 4, 7]; // Major triad by default

  if (suffix === 'm' || suffix === 'min') {
    intervals = [0, 3, 7];
  } else if (suffix === 'sus4' || suffix === 'sus') {
    intervals = [0, 5, 7];
  } else if (suffix === 'sus2') {
    intervals = [0, 2, 7];
  } else if (suffix === 'add9') {
    intervals = [0, 4, 7, 2];
  } else if (suffix === 'm(add9)' || suffix === 'madd9') {
    intervals = [0, 3, 7, 2];
  } else if (suffix === '7' || suffix === 'dom7') {
    intervals = [0, 4, 7, 10];
  } else if (suffix === 'maj7' || suffix === 'M7') {
    intervals = [0, 4, 7, 11];
  } else if (suffix === 'm7' || suffix === 'min7') {
    intervals = [0, 3, 7, 10];
  } else if (suffix === 'm7b5' || suffix === 'ø7') {
    intervals = [0, 3, 6, 10];
  } else if (suffix === 'dim7' || suffix === '°7') {
    intervals = [0, 3, 6, 9];
  } else if (suffix === 'dim' || suffix === '°') {
    intervals = [0, 3, 6];
  } else if (suffix === 'aug' || suffix === '+') {
    intervals = [0, 4, 8];
  } else if (suffix === '9') {
    intervals = [0, 4, 7, 10, 2];
  } else if (suffix === 'maj9') {
    intervals = [0, 4, 7, 11, 2];
  } else if (suffix === '6') {
    intervals = [0, 4, 7, 9];
  } else if (suffix === 'm6') {
    intervals = [0, 3, 7, 9];
  } else if (suffix.includes('m') && !suffix.includes('maj')) {
    intervals = [0, 3, 7];
  }

  return intervals.map(i => KEYS_SHARP[(rootIndex + i) % 12]);
}

/**
 * Returns chord notes rotated for different piano inversions.
 * @param notes Base note array (e.g. ['C', 'E', 'G'])
 * @param inversion 0 (Root), 1 (1st Inversion), 2 (2nd Inversion), 3 (3rd Inversion)
 */
export function getChordInversionNotes(notes: string[], inversion = 0): string[] {
  if (!notes || notes.length === 0) return [];
  const inv = inversion % notes.length;
  if (inv === 0) return [...notes];
  return [...notes.slice(inv), ...notes.slice(0, inv)];
}

/**
 * Returns notes for a given scale type starting on root note.
 */
export function getScaleNotes(root: string, scaleType: string): string[] {
  let rootIndex = KEYS_SHARP.indexOf(root);
  if (rootIndex === -1) rootIndex = KEYS_FLAT.indexOf(root);
  if (rootIndex === -1) return [];

  let intervals: number[] = [];
  switch (scaleType) {
    case 'mayor':
      intervals = [0, 2, 4, 5, 7, 9, 11];
      break;
    case 'menor_natural':
      intervals = [0, 2, 3, 5, 7, 8, 10];
      break;
    case 'pentatonica_mayor':
      intervals = [0, 2, 4, 7, 9];
      break;
    case 'pentatonica_menor':
      intervals = [0, 3, 5, 7, 10];
      break;
    case 'blues':
      intervals = [0, 3, 5, 6, 7, 10];
      break;
    case 'doriana_worship':
      intervals = [0, 2, 3, 5, 7, 9, 10];
      break;
    default:
      intervals = [0, 2, 4, 5, 7, 9, 11];
  }

  return intervals.map(i => KEYS_SHARP[(rootIndex + i) % 12]);
}

export interface NoteWithOctave {
  note: string;
  octave: number;
  fullNote: string;
}

/**
 * Assigns consecutive octaves to an array of note names so they form a single voicing across the keyboard without repeating.
 */
export function getNotesWithOctaves(notes: string[], baseOctave = 4): NoteWithOctave[] {
  if (!notes || notes.length === 0) return [];

  const CHROMATIC = ['C', 'C#', 'Db', 'D', 'Eb', 'D#', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'G#', 'A', 'Bb', 'A#', 'B'];
  let currentOctave = baseOctave;
  let lastValue = -1;

  return notes.map((note, idx) => {
    let noteValue = CHROMATIC.indexOf(note);
    if (noteValue === -1) noteValue = 0;

    // If note is lower in pitch than or equal to the previous note in the voicing (and not the first note), move to next octave
    if (idx > 0 && noteValue <= lastValue) {
      currentOctave += 1;
    }
    lastValue = noteValue;

    return {
      note,
      octave: currentOctave,
      fullNote: `${note}${currentOctave}`
    };
  });
}

export interface HarmonicChord {
  grade: string;
  chord: string;
  role: string;
  desc: string;
  isMain?: boolean;
  category?: 'diatonico' | 'complementario';
}

/**
 * Devuelve la familia completa de acordes (Campo Armónico / Círculo de Tonalidad)
 * para acompañar canciones, himnos y coros en una tonalidad dada (Mayor o Menor).
 */
export function getHarmonicField(root: string, mode: 'mayor' | 'menor' = 'mayor'): HarmonicChord[] {
  let rootIndex = KEYS_SHARP.indexOf(root);
  if (rootIndex === -1) rootIndex = KEYS_FLAT.indexOf(root);
  if (rootIndex === -1) return [];

  const getNote = (semitones: number) => KEYS_SHARP[(rootIndex + semitones) % 12];

  if (mode === 'mayor') {
    // Grados de la escala Mayor diatónica: I, ii, iii, IV, V, vi, vii°
    return [
      {
        grade: 'I',
        chord: `${getNote(0)}`,
        role: 'I • Tónica (Centro y Reposo)',
        desc: 'El acorde principal del himno o coro. Aquí empieza y termina la gran mayoría de canciones de alabanza.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'ii',
        chord: `${getNote(2)}m`,
        role: 'ii • Supertónica (Conexión Suave)',
        desc: 'Acorde menor muy suave. Se usa para enlazar fluidamente hacia el Dominante (V) o hacia el IV.',
        isMain: false,
        category: 'diatonico'
      },
      {
        grade: 'iii',
        chord: `${getNote(4)}m`,
        role: 'iii • Mediante (Toque Íntimo/Gospel)',
        desc: 'Acorde menor melancólico. Excelente para pasar hacia el Subdominante (IV) o el Relativo Menor (vi).',
        isMain: false,
        category: 'diatonico'
      },
      {
        grade: 'IV',
        chord: `${getNote(5)}`,
        role: 'IV • Subdominante (Apertura y Coro)',
        desc: '¡El segundo acorde más importante! Aporta energía, amplitud y emoción. Muy usado en los coros y puentes.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'V',
        chord: `${getNote(7)}`,
        role: 'V • Dominante (Empuje y Tensión)',
        desc: 'Genera expectación y fuerza. Pide a gritos resolver de vuelta a la Tónica (I) para dar alivio.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'vi',
        chord: `${getNote(9)}m`,
        role: 'vi • Relativo Menor (Profundidad)',
        desc: 'El hermano menor de la tonalidad. Se usa muchísimo para momentos de adoración profunda, clímax y quebrantamiento.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'vii° / Bajo',
        chord: `${getNote(7)}/${getNote(11)}`,
        role: 'V/vii • Bajo en 3ª (Paso Celestial)',
        desc: 'Voicing especial muy usado en teclados de iglesia (Dominante con bajo en la 3ª) para caminar hermosamente entre el I y el vi.',
        isMain: false,
        category: 'diatonico'
      },
      // Acordes Complementarios, Prestados y de Paso (Worship & Gospel)
      {
        grade: 'v',
        chord: `${getNote(7)}m`,
        role: 'v • Quinto Menor (2-V hacia el IV)',
        desc: 'Acorde menor que junto con el I7 prepara un puente o caída hermosa hacia el Subdominante (IV / Coro). Indispensable en worship.',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'I7',
        chord: `${getNote(0)}7`,
        role: 'I7 • Dominante del IV (Empuje al Coro)',
        desc: 'Séptima de dominante en la tónica para impulsar con gran fuerza y gloria la entrada del Subdominante (IV).',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'I/III',
        chord: `${getNote(0)}/${getNote(4)}`,
        role: 'I/III • Tónica con Bajo en 3ª (Ascenso)',
        desc: 'Voicing fundamental en teclados para ascender suave y elegantemente desde la tónica hacia el Subdominante (IV).',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'iv',
        chord: `${getNote(5)}m`,
        role: 'iv • Subdominante Menor (Toque Sublime)',
        desc: 'Acorde menor prestado. Aporta un sentimiento nostálgico y sublime al resolver de regreso a la Tónica (I).',
        isMain: false,
        category: 'complementario'
      },
      {
        grade: 'bVII',
        chord: `${getNote(10)}`,
        role: 'bVII • Subtónica Prestada (Fuerza Worship)',
        desc: 'Acorde mayor moderno tomado del modo menor. Aporta gran empuje, amplitud y épica (I - bVII - IV - I).',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'III7',
        chord: `${getNote(4)}7`,
        role: 'III7 • Dominante del vi (Paso Dramático)',
        desc: 'Acorde mayor/7ª usado como puente dramático para caer con fuerza y emotividad al Relativo Menor (vi).',
        isMain: false,
        category: 'complementario'
      },
      {
        grade: 'VI7',
        chord: `${getNote(9)}7`,
        role: 'VI7 • Dominante del ii (Enlace Elegante)',
        desc: 'Acorde mayor/7ª para preparar y embellecer el camino hacia la Supertónica (ii).',
        isMain: false,
        category: 'complementario'
      },
      {
        grade: 'Vsus4',
        chord: `${getNote(7)}sus4`,
        role: 'Vsus4 • Dominante Suspendido (Expectativa)',
        desc: 'Acorde flotante que crea expectativa celestial antes de resolver en el Dominante puro (V).',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'ii7',
        chord: `${getNote(2)}m7`,
        role: 'ii7 • Supertónica 7ª (Suavidad Gospel)',
        desc: 'Variante muy cálida del segundo grado, perfecta para coros e himnos de adoración íntima.',
        isMain: false,
        category: 'complementario'
      }
    ];
  } else {
    // Grados para tonalidad Menor (Menor Natural / Armónica combinada para iglesia)
    return [
      {
        grade: 'i',
        chord: `${getNote(0)}m`,
        role: 'i • Tónica Menor (Centro Solemnidad)',
        desc: 'Acorde principal en himnos de oración, quebrantamiento o coros rápidos de júbilo/avivamiento.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'ii° / ii',
        chord: `${getNote(2)}m7b5`,
        role: 'ii° • Semi-disminuido (Paso)',
        desc: 'Acorde de tensión intermedia que prepara la caída hacia el dominante (V).',
        isMain: false,
        category: 'diatonico'
      },
      {
        grade: 'III',
        chord: `${getNote(3)}`,
        role: 'III • Relativo Mayor (Luz)',
        desc: 'El hermano mayor del tono. Aporta esperanza y descanso dentro de una canción en tono menor.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'iv',
        chord: `${getNote(5)}m`,
        role: 'iv • Subdominante Menor (Intensidad)',
        desc: 'Acorde profundo y dramático, muy habitual antes de subir hacia la tensión mayor.',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'V / v',
        chord: `${getNote(7)}7`,
        role: 'V7 • Dominante Mayor (Fuerza)',
        desc: 'Se toca mayor con 7ª (armónica) para impulsar con mucha fuerza el regreso a la Tónica menor (i).',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'VI',
        chord: `${getNote(8)}`,
        role: 'VI • Submediante (Majestuoso)',
        desc: 'Acorde mayor glorioso, comúnmente usado al subir el ánimo en coros de avivamiento (VI - VII - i).',
        isMain: true,
        category: 'diatonico'
      },
      {
        grade: 'VII',
        chord: `${getNote(10)}`,
        role: 'VII • Subtónica (Ascenso Gospel)',
        desc: 'Acorde mayor firme que conecta el VI con la tónica menor (ej. C - D - Em).',
        isMain: false,
        category: 'diatonico'
      },
      // Acordes Complementarios y de Paso en Tono Menor
      {
        grade: 'v',
        chord: `${getNote(7)}m`,
        role: 'v • Dominante Menor Natural',
        desc: 'Acorde menor del quinto grado (sin la 7ª mayor del V7), usado en himnos solemnes, baladas y adoración suave.',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'IV',
        chord: `${getNote(5)}`,
        role: 'IV • Subdominante Mayor (Modo Doriano)',
        desc: 'Acorde mayor característico del modo Doriano, muy usado en worship moderno para dar luz y apertura en tono menor.',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'i/III',
        chord: `${getNote(0)}/${getNote(3)}`,
        role: 'i/III • Tónica con Bajo en 3ª (Caminar en Bajo)',
        desc: 'Voicing de paso con bajo en el tercer grado, excelente para descender gradualmente o conectar con el iv.',
        isMain: true,
        category: 'complementario'
      },
      {
        grade: 'III/v',
        chord: `${getNote(3)}/${getNote(7)}`,
        role: 'III/v • Relativo Mayor con Bajo en 5ª',
        desc: 'Voicing estable para sostener o hacer colchones armónicos cálidos mientras el canto avanza.',
        isMain: false,
        category: 'complementario'
      },
      {
        grade: 'i7',
        chord: `${getNote(0)}m7`,
        role: 'i7 • Tónica Menor 7ª (Cálido y Gospel)',
        desc: 'Sonido envolvente y gospel para estrofas, intros y momentos de ministración o intimidad.',
        isMain: false,
        category: 'complementario'
      },
      {
        grade: 'VImaj7',
        chord: `${getNote(8)}maj7`,
        role: 'VImaj7 • Submediante Mayor 7ª (Celestial)',
        desc: 'El acorde favorito en baladas lentas de adoración para crear un ambiente celestial y abierto.',
        isMain: false,
        category: 'complementario'
      }
    ];
  }
}

