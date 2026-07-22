export type PianoMode = 'diccionario' | 'escalas' | 'progresiones' | 'familias';

export const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
export const MINOR_ROOTS = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'];

export interface ChordTypeInfo {
  label: string;
  suffix: string;
  desc: string;
}

export interface ChordCategory {
  category: string;
  types: ChordTypeInfo[];
}

export const CHORD_CATEGORIES: ChordCategory[] = [
  {
    category: 'Triadas y Básicos',
    types: [
      { label: 'Mayor', suffix: '', desc: 'Triada mayor alegre (1 - 3 - 5)' },
      { label: 'Menor', suffix: 'm', desc: 'Triada menor melancólica (1 - b3 - 5)' },
      { label: 'Aumentado', suffix: 'aug', desc: 'Tensión flotante (1 - 3 - #5)' },
      { label: 'Disminuido', suffix: 'dim', desc: 'Tensión de paso (1 - b3 - b5)' },
    ]
  },
  {
    category: 'Suspensiones y Adiciones (Worship Top)',
    types: [
      { label: 'Suspensión 4', suffix: 'sus4', desc: 'Resolución celestial hacia mayor (1 - 4 - 5)' },
      { label: 'Suspensión 2', suffix: 'sus2', desc: 'Sonido abierto y moderno (1 - 2 - 5)' },
      { label: 'Adición 9', suffix: 'add9', desc: 'Acorde rico y abierto sin 7ª (1 - 3 - 5 - 9)' },
      { label: 'Adición 2', suffix: 'add2', desc: 'Muy usado en intros de baladas cristianas' },
    ]
  },
  {
    category: 'Séptimas y Novenas (Adoración Íntima / Gospel)',
    types: [
      { label: 'Mayor 7ª', suffix: 'maj7', desc: 'Sonido celestial y sublime (1 - 3 - 5 - 7)' },
      { label: 'Menor 7ª', suffix: 'm7', desc: 'Cálido, suave e introspectivo (1 - b3 - 5 - b7)' },
      { label: 'Dominante 7ª', suffix: '7', desc: 'Tensión fuerte para resolver al 4to o 1er grado' },
      { label: 'Mayor 9ª', suffix: 'maj9', desc: 'Voicing de alta definición y paz (1 - 3 - 5 - 7 - 9)' },
      { label: 'Menor 9ª', suffix: 'm9', desc: 'Atmósfera profunda de oración' },
    ]
  }
];

export interface ScaleInfo {
  id: string;
  label: string;
  desc: string;
}

export const SCALES_INFO: ScaleInfo[] = [
  { id: 'mayor', label: 'Escala Mayor Diatónica', desc: 'La escala base para todas las alabanzas alegres e himnos clásicos.' },
  { id: 'menor', label: 'Escala Menor Natural', desc: 'Escala solemne y reflexiva, ideal para coros lentos de adoración e intros.' },
  { id: 'pentatonica_mayor', label: 'Pentatónica Mayor', desc: '¡La favorita para hacer adornos, fills y puentes rápidos sin chocar con ninguna nota!' },
  { id: 'pentatonica_menor', label: 'Pentatónica Menor', desc: 'Toque gospel/soul muy utilizado para improvisar en canciones rápidas de avivamiento.' },
  { id: 'blues', label: 'Escala Blues (Worship Gospel)', desc: 'Agrega la nota blues (b5) para giros expresivos en coros congregacionales con estilo.' },
];

export interface ProgressionStep {
  chord: string;
  role: string;
  desc: string;
}

export interface ProgressionInfo {
  id: string;
  title: string;
  formula: string;
  mode?: 'mayor' | 'menor';
  chordsByRoot: (root: string) => ProgressionStep[];
}

export const PROGRESSIONS: ProgressionInfo[] = [
  {
    id: 'intima',
    title: '1. Adoración Íntima y Quebrantamiento [Mayor]',
    formula: 'I - V - vi - IV',
    mode: 'mayor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(0, ''), role: 'I (Tónica)', desc: 'Inicio estable y pacífico' },
        { chord: get(7, ''), role: 'V (Dominante)', desc: 'Elevación y amplitud' },
        { chord: get(9, 'm'), role: 'vi (Relativo Menor)', desc: 'Profundidad emocional' },
        { chord: get(5, 'add9'), role: 'IV (Subdominante)', desc: 'Respiro y entrega' },
      ];
    }
  },
  {
    id: 'avivamiento',
    title: '2. Círculo de Avivamiento y Júbilo [Mayor]',
    formula: 'vi - IV - I - V',
    mode: 'mayor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(9, 'm'), role: 'vi (Inicio Fuerza)', desc: 'Arranque en tono menor' },
        { chord: get(5, ''), role: 'IV (Empuje)', desc: 'Apertura hacia la alabanza' },
        { chord: get(0, ''), role: 'I (Gloria)', desc: 'Llegada triunfante' },
        { chord: get(7, 'sus4'), role: 'V (Tensión)', desc: 'Preparación para repetir' },
      ];
    }
  },
  {
    id: 'puente',
    title: '3. Progresión de Clímax y Puente [Mayor]',
    formula: 'IV - V - vi - I/III',
    mode: 'mayor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(5, 'maj7'), role: 'IV (Expectativa)', desc: 'Acorde majestuoso de inicio' },
        { chord: get(7, ''), role: 'V (Ascenso)', desc: 'Subiendo la intensidad' },
        { chord: get(9, 'm7'), role: 'vi (Poder)', desc: 'Firmeza en el clímax' },
        { chord: `${get(0, '')}/${ROOTS[(idx + 4) % 12]}`, role: 'I/III (Bajo en 3ª)', desc: 'Voicing suave de regreso' },
      ];
    }
  },
  {
    id: 'gospel',
    title: '4. Círculo Gospel / Caída Suave [Mayor]',
    formula: 'ii7 - V7 - Imaj7 - vi7',
    mode: 'mayor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(2, 'm7'), role: 'ii7 (Preparación)', desc: 'Acorde menor cálido' },
        { chord: get(7, 'sus4'), role: 'V7 (Resolución)', desc: 'Dominante gospel' },
        { chord: get(0, 'add9'), role: 'I (Descanso)', desc: 'Centro tonal armónico' },
        { chord: get(9, 'm7'), role: 'vi7 (Conexión)', desc: 'Enlace para el ciclo' },
      ];
    }
  },
  {
    id: 'circulo_menor',
    title: '5. Círculo Menor Clásico de Oración [Menor]',
    formula: 'i - VI - III - VII',
    mode: 'menor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(0, 'm'), role: 'i (Tónica Menor)', desc: 'Centro de adoración o clamor' },
        { chord: get(8, ''), role: 'VI (Submediante)', desc: 'Respiro mayor y esperanza' },
        { chord: get(3, ''), role: 'III (Relativo Mayor)', desc: 'Apertura armónica luminosa' },
        { chord: get(10, ''), role: 'VII (Subtónica)', desc: 'Conexión para reiniciar la oración' },
      ];
    }
  },
  {
    id: 'avivamiento_menor',
    title: '6. Círculo de Avivamiento y Coros Rápidos [Menor]',
    formula: 'i - iv - V7 - i',
    mode: 'menor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(0, 'm'), role: 'i (Fuerza)', desc: 'Arranque del coro congregacional' },
        { chord: get(5, 'm'), role: 'iv (Intensidad)', desc: 'Subiendo la emoción' },
        { chord: get(7, '7'), role: 'V7 (Dominante)', desc: 'Tensión máxima para el salto' },
        { chord: get(0, 'm'), role: 'i (Resolución)', desc: 'Llegada con gloria y júbilo' },
      ];
    }
  },
  {
    id: 'descenso_menor',
    title: '7. Descenso Dramático / Progresión Andaluza [Menor]',
    formula: 'i - VII - VI - V7',
    mode: 'menor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(0, 'm'), role: 'i (Inicio Solemnidad)', desc: 'Acorde de partida' },
        { chord: get(10, ''), role: 'VII (Paso 1)', desc: 'Descenso en el bajo' },
        { chord: get(8, ''), role: 'VI (Paso 2)', desc: 'Momento de clímax y clamor' },
        { chord: get(7, 'sus4'), role: 'V7 (Expectativa)', desc: 'Dominante suspendido y resolución' },
      ];
    }
  },
  {
    id: 'gospel_menor',
    title: '8. Círculo Gospel Menor / Ministración [Menor]',
    formula: 'i - v - VI - iv',
    mode: 'menor',
    chordsByRoot: (root: string) => {
      const idx = ROOTS.indexOf(root) === -1 ? 0 : ROOTS.indexOf(root);
      const get = (offset: number, suffix: string) => `${ROOTS[(idx + offset) % 12]}${suffix}`;
      return [
        { chord: get(0, 'm7'), role: 'i7 (Atmósfera)', desc: 'Adoración envolvente con 7ª' },
        { chord: get(7, 'm'), role: 'v (Dominante Menor)', desc: 'Paso melancólico al sexto grado' },
        { chord: get(8, 'maj7'), role: 'VImaj7 (Luz)', desc: 'Voicing celestial y sublime' },
        { chord: get(5, 'm7'), role: 'iv7 (Entrega)', desc: 'Subdominante cálido para cerrar' },
      ];
    }
  }
];
