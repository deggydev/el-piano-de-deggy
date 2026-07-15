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
    // Para worship agregamos comúnmente el V/vii (Bajo en 3ª) en vez del disminuido puro
    return [
      {
        grade: 'I',
        chord: `${getNote(0)}`,
        role: 'I • Tónica (Centro y Reposo)',
        desc: 'El acorde principal del himno o coro. Aquí empieza y termina la gran mayoría de canciones de alabanza.',
        isMain: true
      },
      {
        grade: 'ii',
        chord: `${getNote(2)}m`,
        role: 'ii • Supertónica (Conexión Suave)',
        desc: 'Acorde menor muy suave. Se usa para enlazar fluidamente hacia el Dominante (V) o hacia el IV.',
        isMain: false
      },
      {
        grade: 'iii',
        chord: `${getNote(4)}m`,
        role: 'iii • Mediante (Toque Íntimo/Gospel)',
        desc: 'Acorde menor melancólico. Excelente para pasar hacia el Subdominante (IV) o el Relativo Menor (vi).',
        isMain: false
      },
      {
        grade: 'IV',
        chord: `${getNote(5)}`,
        role: 'IV • Subdominante (Apertura y Coro)',
        desc: '¡El segundo acorde más importante! Aporta energía, amplitud y emoción. Muy usado en los coros y puentes.',
        isMain: true
      },
      {
        grade: 'V',
        chord: `${getNote(7)}`,
        role: 'V • Dominante (Empuje y Tensión)',
        desc: 'Genera expectación y fuerza. Pide a gritos resolver de vuelta a la Tónica (I) para dar alivio.',
        isMain: true
      },
      {
        grade: 'vi',
        chord: `${getNote(9)}m`,
        role: 'vi • Relativo Menor (Profundidad)',
        desc: 'El hermano menor de la tonalidad. Se usa muchísimo para momentos de adoración profunda, clímax y quebrantamiento.',
        isMain: true
      },
      {
        grade: 'vii° / Bajo',
        chord: `${getNote(7)}/${getNote(11)}`,
        role: 'V/vii • Bajo en 3ª (Paso Celestial)',
        desc: 'Voicing especial muy usado en teclados de iglesia (Dominante con bajo en la 3ª) para caminar hermosamente entre el I y el vi.',
        isMain: false
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
        isMain: true
      },
      {
        grade: 'ii° / ii',
        chord: `${getNote(2)}m7b5`,
        role: 'ii° • Semi-disminuido (Paso)',
        desc: 'Acorde de tensión intermedia que prepara la caída hacia el dominante (V).',
        isMain: false
      },
      {
        grade: 'III',
        chord: `${getNote(3)}`,
        role: 'III • Relativo Mayor (Luz)',
        desc: 'El hermano mayor del tono. Aporta esperanza y descanso dentro de una canción en tono menor.',
        isMain: true
      },
      {
        grade: 'iv',
        chord: `${getNote(5)}m`,
        role: 'iv • Subdominante Menor (Intensidad)',
        desc: 'Acorde profundo y dramático, muy habitual antes de subir hacia la tensión mayor.',
        isMain: true
      },
      {
        grade: 'V / v',
        chord: `${getNote(7)}7`,
        role: 'V7 • Dominante Mayor (Fuerza)',
        desc: 'Se toca mayor con 7ª (armónica) para impulsar con mucha fuerza el regreso a la Tónica menor (i).',
        isMain: true
      },
      {
        grade: 'VI',
        chord: `${getNote(8)}`,
        role: 'VI • Submediante (Majestuoso)',
        desc: 'Acorde mayor glorioso, comúnmente usado al subir el ánimo en coros de avivamiento (VI - VII - i).',
        isMain: true
      },
      {
        grade: 'VII',
        chord: `${getNote(10)}`,
        role: 'VII • Subtónica (Ascenso Gospel)',
        desc: 'Acorde mayor firme que conecta el VI con la tónica menor (ej. C - D - Em).',
        isMain: false
      }
    ];
  }
}

