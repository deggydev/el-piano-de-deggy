import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { getChordNotes, getChordInversionNotes, getScaleNotes, getNotesWithOctaves, getHarmonicField, type NoteWithOctave } from '../utils/chordTransposer';
import { playNote, playChord } from '../utils/pianoAudio';

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const CHORD_CATEGORIES = [
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
      { label: 'Add9 (Mayor)', suffix: 'add9', desc: 'El acorde favorito en baladas de adoración (1 - 3 - 5 - 9)' },
      { label: 'Menor Add9', suffix: 'm(add9)', desc: 'Profundidad íntima en adoración (1 - b3 - 5 - 9)' },
    ]
  },
  {
    category: 'Séptimas y Novenas (Gospel & Jazz)',
    types: [
      { label: 'Dominante 7', suffix: '7', desc: 'Preparación y empuje armónico (1 - 3 - 5 - b7)' },
      { label: 'Mayor 7', suffix: 'maj7', desc: 'Dulzura y sofisticación (1 - 3 - 5 - 7)' },
      { label: 'Menor 7', suffix: 'm7', desc: 'Suave y cálido para coros (1 - b3 - 5 - b7)' },
      { label: 'Semi-disminuido', suffix: 'm7b5', desc: 'Puente hacia acordes menores (1 - b3 - b5 - b7)' },
      { label: 'Disminuido 7', suffix: 'dim7', desc: 'Paso dramático entre acordes (1 - b3 - b5 - bb7)' },
      { label: 'Novena Mayor', suffix: 'maj9', desc: 'Sonido gospel atmosférico (1 - 3 - 5 - 7 - 9)' },
    ]
  },
  {
    category: 'Sextas',
    types: [
      { label: 'Sexta Mayor', suffix: '6', desc: 'Estabilidad con color vintage (1 - 3 - 5 - 6)' },
      { label: 'Sexta Menor', suffix: 'm6', desc: 'Misterio y elegancia (1 - b3 - 5 - 6)' },
    ]
  }
];

const SCALES_INFO = [
  { id: 'mayor', label: 'Escala Mayor (Júbilo)', desc: 'La base de alabanzas alegres y festivas. Úsala para introducciones y solos.' },
  { id: 'pentatonica_mayor', label: 'Pentatónica Mayor (Riffs Worship)', desc: '¡La escala de oro! 5 notas sin semitonos ideales para adornos y arreglos entre frases vocales sin fallar.' },
  { id: 'menor_natural', label: 'Menor Natural (Adoración Íntima)', desc: 'Para momentos de quebrantamiento, oración profunda y alabanzas solemnes.' },
  { id: 'pentatonica_menor', label: 'Pentatónica Menor', desc: 'Aporta energía y fuerza rítmica en alabanzas de avivamiento y júbilo.' },
  { id: 'blues', label: 'Escala de Blues (Gospel Fills)', desc: 'Incluye la nota azul (b5) para giros expresivos al estilo Gospel o Iglesias Afroamericanas.' },
  { id: 'doriana_worship', label: 'Doriana (Worship Moderno)', desc: 'Escala menor con la 6ª mayor, muy utilizada por tecladistas en ministerios como Elevation y Bethel.' },
];

const PROGRESSIONS = [
  {
    id: 'intima',
    title: '1. Adoración Íntima y Quebrantamiento',
    formula: 'I - V - vi - IV',
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
    title: '2. Círculo de Avivamiento y Júbilo',
    formula: 'vi - IV - I - V',
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
    title: '3. Progresión de Clímax y Puente',
    formula: 'IV - V - vi - I/III',
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
    title: '4. Círculo Gospel / Caída Suave (ii - V - I)',
    formula: 'ii7 - V7 - Imaj7 - vi7',
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
  }
];


export const PianoChordGuide: React.FC = () => {
  // Mode: 'diccionario' | 'escalas' | 'progresiones' | 'familias'
  const [mode, setMode] = useState<'diccionario' | 'escalas' | 'progresiones' | 'familias'>('diccionario');

  // Diccionario state
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedInversion, setSelectedInversion] = useState<number>(0); // 0, 1, 2, 3

  // Escalas state
  const [scaleRoot, setScaleRoot] = useState<string>('C');
  const [scaleType, setScaleType] = useState<string>('mayor');

  // Progresiones state
  const [progRoot, setProgRoot] = useState<string>('C');
  const [activeProgId, setActiveProgId] = useState<string>('intima');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isPlayingProg, setIsPlayingProg] = useState<boolean>(false);

  // Familias por Tono state (Acompañamiento de coros e himnos)
  const [familyRoot, setFamilyRoot] = useState<string>('E');
  const [familyMode, setFamilyMode] = useState<'mayor' | 'menor'>('mayor');
  const [selectedFamilyChord, setSelectedFamilyChord] = useState<string>('E');
  const [isPlayingFamilyCircle, setIsPlayingFamilyCircle] = useState<boolean>(false);

  // Active note feedback when clicked manually
  const [manualNote, setManualNote] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Compute active chord and displayed notes based on mode
  let currentChordString = `${selectedRoot}${selectedType}`;
  let displayNotes: string[] = [];
  let titleLabel = '';
  let subLabel = '';

  if (mode === 'diccionario') {
    const rawNotes = getChordNotes(currentChordString);
    displayNotes = getChordInversionNotes(rawNotes, selectedInversion);
    const invNames = ['Estado Fundamental', '1ª Inversión (Bajo en 3ª)', '2ª Inversión (Bajo en 5ª)', '3ª Inversión (Bajo en 7ª)'];
    titleLabel = currentChordString;
    subLabel = invNames[selectedInversion % Math.max(1, rawNotes.length)] || 'Estado Fundamental';
  } else if (mode === 'escalas') {
    displayNotes = getScaleNotes(scaleRoot, scaleType);
    const scaleObj = SCALES_INFO.find(s => s.id === scaleType);
    titleLabel = `${scaleRoot} ${scaleObj?.label || ''}`;
    subLabel = `${displayNotes.length} notas que forman esta escala`;
  } else if (mode === 'progresiones') {
    const prog = PROGRESSIONS.find(p => p.id === activeProgId) || PROGRESSIONS[0];
    const steps = prog.chordsByRoot(progRoot);
    const stepObj = steps[activeStepIdx] || steps[0];
    currentChordString = stepObj.chord;
    displayNotes = getChordNotes(currentChordString);
    titleLabel = stepObj.chord;
    subLabel = `${stepObj.role} • ${stepObj.desc}`;
  } else if (mode === 'familias') {
    const field = getHarmonicField(familyRoot, familyMode);
    const currentObj = field.find(c => c.chord === selectedFamilyChord) || field[0];
    currentChordString = currentObj ? currentObj.chord : `${familyRoot}${familyMode === 'mayor' ? '' : 'm'}`;
    displayNotes = getChordNotes(currentChordString);
    titleLabel = currentChordString;
    subLabel = currentObj ? `${currentObj.role} • Tono de ${familyRoot} ${familyMode.toUpperCase()}` : `Familia de ${familyRoot}`;
  }

  // Assign consecutive octaves (Octave 4 & 5) so exactly 3 or 4 keys highlight across the keyboard without repeating!
  const activeVoicingNotes: NoteWithOctave[] = getNotesWithOctaves(displayNotes, 4);

  // Handle playing progression automatically
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlayingProg && mode === 'progresiones') {
      const prog = PROGRESSIONS.find(p => p.id === activeProgId) || PROGRESSIONS[0];
      const steps = prog.chordsByRoot(progRoot);
      
      timer = setInterval(() => {
        setActiveStepIdx(prev => {
          const next = (prev + 1) % steps.length;
          const nextChord = steps[next].chord;
          const notes = getChordNotes(nextChord);
          playChord(notes, false, 4);
          return next;
        });
      }, 2400);
    } else if (isPlayingFamilyCircle && mode === 'familias') {
      const field = getHarmonicField(familyRoot, familyMode);
      // Círculo tradicional y funcional de la iglesia: I - vi - IV - V (o i - VI - iv - V7)
      const circleIndices = familyMode === 'mayor' ? [0, 5, 3, 4] : [0, 5, 3, 4];
      let stepCount = 0;
      
      timer = setInterval(() => {
        const nextIdx = circleIndices[stepCount % circleIndices.length];
        const nextChordObj = field[nextIdx] || field[0];
        setSelectedFamilyChord(nextChordObj.chord);
        playChord(getChordNotes(nextChordObj.chord), false, 4);
        stepCount++;
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isPlayingProg, isPlayingFamilyCircle, mode, activeProgId, progRoot, familyRoot, familyMode]);

  // Ensure scroll container always starts at the far left (showing C4, C#4, D4 immediately) when changing selection
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [selectedRoot, selectedType, selectedInversion, mode, scaleRoot, scaleType, activeProgId, activeStepIdx]);

  // Handle clicking a piano key directly
  const handleKeyClick = (noteName: string, octave: number) => {
    const fullNote = `${noteName}${octave}`;
    playNote(fullNote, 0, 2.2);
    setManualNote(fullNote);
    setTimeout(() => setManualNote(null), 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10 overflow-x-hidden">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Icon icon="mdi:piano" className="w-4 h-4 animate-bounce" />
            <span>Centro de Optimización de Acordes y Teclado</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Guía Profesional del Piano
          </h2>
          <p className="text-slate-300 text-xs sm:text-base mt-2 max-w-3xl leading-relaxed">
            Explora acordes de adoración, inversiones con audio real, escalas para adornos y círculos armónicos de iglesias. Toca el teclado o reproduce el sonido de cada acorde.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-700 shadow-lg w-full md:w-auto shrink-0">
          <button
            onClick={() => { setMode('diccionario'); setIsPlayingProg(false); }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm text-center transition-all min-h-[44px] ${
              mode === 'diccionario'
                ? 'bg-amber-400 text-[#212121] shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon icon="lucide:book-open" className="w-4 h-4 shrink-0" />
            <span className="truncate">Acordes e Inversiones</span>
          </button>

          <button
            onClick={() => { setMode('escalas'); setIsPlayingProg(false); }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm text-center transition-all min-h-[44px] ${
              mode === 'escalas'
                ? 'bg-amber-400 text-[#212121] shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon icon="lucide:music" className="w-4 h-4 shrink-0" />
            <span className="truncate">Escalas y Adornos</span>
          </button>

          <button
            onClick={() => { setMode('progresiones'); setIsPlayingFamilyCircle(false); }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm text-center transition-all min-h-[44px] ${
              mode === 'progresiones'
                ? 'bg-amber-400 text-[#212121] shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon icon="lucide:repeat" className="w-4 h-4 shrink-0" />
            <span className="truncate">Círculos de Alabanza</span>
          </button>

          <button
            onClick={() => { setMode('familias'); setIsPlayingProg(false); }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm text-center transition-all min-h-[44px] ${
              mode === 'familias'
                ? 'bg-amber-400 text-[#212121] shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon icon="lucide:layers" className="w-4 h-4 shrink-0" />
            <span className="truncate">Familias por Tono</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-sm">
          
          {/* MODO 1: DICCIONARIO DE ACORDES */}
          {mode === 'diccionario' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon icon="lucide:sliders" className="w-5 h-5 text-amber-400" />
                  <span>Configurar Acorde</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {CHORD_CATEGORIES.reduce((acc, c) => acc + c.types.length, 0)} cualidad(es) disponibles
                </span>
              </div>

              {/* 1. Root Note */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
                  <span>1. Tónica / Nota Raíz</span>
                  <span className="text-amber-400 font-mono text-sm">{selectedRoot}</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                  {ROOTS.map((root) => (
                    <button
                      key={root}
                      onClick={() => setSelectedRoot(root)}
                      className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                        selectedRoot === root
                          ? 'bg-amber-400 text-[#212121] font-black shadow-md shadow-amber-400/30 transform scale-105'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {root}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chord Qualities Categorized */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 sm:pr-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  2. Cualidad del Acorde (Voicing)
                </label>
                {CHORD_CATEGORIES.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-2">
                    <div className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider px-1">
                      {cat.category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.types.map((type) => {
                        const active = selectedType === type.suffix;
                        return (
                          <button
                            key={type.suffix}
                            onClick={() => setSelectedType(type.suffix)}
                            className={`p-3 rounded-xl font-bold text-xs text-left transition-all flex flex-col justify-between gap-1 border ${
                              active
                                ? 'bg-amber-400 text-[#212121] font-black shadow-md border-amber-300'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-700/80'
                            }`}
                            title={type.desc}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{type.label}</span>
                              <span className={`font-mono text-xs font-black ${active ? 'text-[#212121]' : 'text-amber-400'}`}>
                                {selectedRoot}{type.suffix}
                              </span>
                            </div>
                            <span className={`text-[10px] font-normal truncate ${active ? 'text-[#212121]/80' : 'text-slate-400'}`}>
                              {type.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Inversion Selector */}
              {getChordNotes(`${selectedRoot}${selectedType}`).length >= 3 && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
                    <span>3. Inversión (Posición en el teclado)</span>
                    <span className="text-amber-400 text-xs">Mano derecha</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: 'Fundamental', desc: 'Bajo en Tónica', inv: 0 },
                      { label: '1ª Inversión', desc: 'Bajo en 3ª', inv: 1 },
                      { label: '2ª Inversión', desc: 'Bajo en 5ª', inv: 2 },
                      { label: '3ª Inversión', desc: 'Acordes 7ª/9ª', inv: 3 },
                    ]
                      .slice(0, getChordNotes(`${selectedRoot}${selectedType}`).length)
                      .map((item) => (
                        <button
                          key={item.inv}
                          onClick={() => setSelectedInversion(item.inv)}
                          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                            selectedInversion === item.inv
                              ? 'bg-amber-400 text-[#212121] font-black shadow'
                              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className={`text-[10px] ${selectedInversion === item.inv ? 'text-[#212121]/80' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODO 2: ESCALAS Y ADORNOS */}
          {mode === 'escalas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-700/80 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon icon="lucide:music" className="w-5 h-5 text-amber-400" />
                  <span>Escalas para Adornos y Fills</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Aprende qué notas usar para improvisar e introducir puentes en tus alabanzas.
                </p>
              </div>

              {/* 1. Scale Root */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  1. Tónica de la Escala
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                  {ROOTS.map((root) => (
                    <button
                      key={root}
                      onClick={() => setScaleRoot(root)}
                      className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                        scaleRoot === root
                          ? 'bg-amber-400 text-[#212121] font-black shadow-md'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {root}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Scale Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  2. Tipo de Escala Worship
                </label>
                <div className="space-y-2.5">
                  {SCALES_INFO.map((scale) => {
                    const active = scaleType === scale.id;
                    return (
                      <button
                        key={scale.id}
                        onClick={() => setScaleType(scale.id)}
                        className={`w-full p-3.5 rounded-xl font-bold text-left transition-all border flex flex-col gap-1 ${
                          active
                            ? 'bg-amber-400 text-[#212121] font-black shadow-md border-amber-300'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">{scale.label}</span>
                          <span className={`font-mono text-xs px-2 py-0.5 rounded ${active ? 'bg-[#212121] text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                            {scaleRoot}
                          </span>
                        </div>
                        <p className={`text-xs font-normal leading-relaxed ${active ? 'text-[#212121]/90' : 'text-slate-400'}`}>
                          {scale.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODO 3: PROGRESIONES Y CÍRCULOS */}
          {mode === 'progresiones' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-700/80 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icon icon="lucide:repeat" className="w-5 h-5 text-amber-400" />
                    <span>Círculos Armónicos</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Las progresiones más tocadas en iglesias cristianas.
                  </p>
                </div>
                <button
                  onClick={() => setIsPlayingProg(!isPlayingProg)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                    isPlayingProg
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-amber-400 hover:bg-amber-300 text-[#212121]'
                  }`}
                >
                  <Icon icon={isPlayingProg ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
                  <span>{isPlayingProg ? 'Detener Auto-Play' : 'Auto-Reproducir'}</span>
                </button>
              </div>

              {/* Root key for progression */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  1. Tono de la Canción (Tónica)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                  {ROOTS.map((root) => (
                    <button
                      key={root}
                      onClick={() => { setProgRoot(root); setActiveStepIdx(0); }}
                      className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                        progRoot === root
                          ? 'bg-amber-400 text-[#212121] font-black shadow-md'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {root}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progressions list */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  2. Selecciona Progresión / Círculo
                </label>
                <div className="space-y-3">
                  {PROGRESSIONS.map((prog) => {
                    const active = activeProgId === prog.id;
                    const steps = prog.chordsByRoot(progRoot);

                    return (
                      <div
                        key={prog.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          active
                            ? 'bg-slate-900 border-amber-400/80 shadow-xl'
                            : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div
                          onClick={() => { setActiveProgId(prog.id); setActiveStepIdx(0); }}
                          className="p-4 cursor-pointer flex items-center justify-between border-b border-slate-800/80"
                        >
                          <div>
                            <h4 className={`font-bold text-sm sm:text-base ${active ? 'text-amber-400' : 'text-white'}`}>
                              {prog.title}
                            </h4>
                            <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                              Fórmula: {prog.formula}
                            </span>
                          </div>
                          <Icon icon="lucide:chevron-right" className={`w-5 h-5 transition-transform ${active ? 'text-amber-400 rotate-90' : 'text-slate-500'}`} />
                        </div>

                        {active && (
                          <div className="p-4 bg-slate-950/60 space-y-3">
                            <div className="text-xs text-slate-300">
                              Haz clic en cualquier acorde para practicar o verlo en el teclado:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {steps.map((step, sIdx) => {
                                const stepActive = activeStepIdx === sIdx;
                                return (
                                  <button
                                    key={sIdx}
                                    onClick={() => {
                                      setActiveStepIdx(sIdx);
                                      setIsPlayingProg(false);
                                      playChord(getChordNotes(step.chord), false, 4);
                                    }}
                                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                      stepActive
                                        ? 'bg-amber-400 text-[#212121] font-black border-amber-300 shadow-lg scale-105'
                                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                                    }`}
                                  >
                                    <span className="text-xs font-mono font-bold opacity-80">{step.role}</span>
                                    <span className="text-lg font-black">{step.chord}</span>
                                    <span className={`text-[10px] font-normal truncate max-w-full ${stepActive ? 'text-[#212121]/80' : 'text-slate-400'}`}>
                                      {step.desc}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODO 4: FAMILIAS POR TONO (Acompañamiento de Coros e Himnos) */}
          {mode === 'familias' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icon icon="lucide:layers" className="w-5 h-5 text-amber-400" />
                    <span>Familia de Acordes del Tono</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Si el himno o cancionero dice <strong className="text-amber-300">"Tono de {familyRoot} {familyMode}"</strong>, estos son los acordes exactos con los que vas a acompañar.
                  </p>
                </div>
                <button
                  onClick={() => setIsPlayingFamilyCircle(!isPlayingFamilyCircle)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
                    isPlayingFamilyCircle
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-amber-400 hover:bg-amber-300 text-[#212121]'
                  }`}
                  title="Reproducir automáticamente el círculo clásico de esta tonalidad"
                >
                  <Icon icon={isPlayingFamilyCircle ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
                  <span>{isPlayingFamilyCircle ? 'Detener Círculo' : 'Oír Círculo del Tono'}</span>
                </button>
              </div>

              {/* 1. Tono / Nota del Himno */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
                  <span>1. Tono / Nota Raíz de la Canción</span>
                  <span className="text-amber-400 font-mono text-sm">{familyRoot} {familyMode.toUpperCase()}</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                  {ROOTS.map((root) => (
                    <button
                      key={root}
                      onClick={() => {
                        setFamilyRoot(root);
                        const field = getHarmonicField(root, familyMode);
                        setSelectedFamilyChord(field[0]?.chord || root);
                      }}
                      className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                        familyRoot === root
                          ? 'bg-amber-400 text-[#212121] font-black shadow-md shadow-amber-400/30 transform scale-105'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {root}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tipo de Tono: Mayor o Menor */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  2. Tipo de Tono (Cualidad de la Canción)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setFamilyMode('mayor');
                      const field = getHarmonicField(familyRoot, 'mayor');
                      setSelectedFamilyChord(field[0]?.chord || familyRoot);
                    }}
                    className={`p-3.5 rounded-2xl font-bold text-left transition-all border flex flex-col gap-1 ${
                      familyMode === 'mayor'
                        ? 'bg-amber-400 text-[#212121] font-black shadow-md border-amber-300'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-black">Tono Mayor (Alegría / Júbilo)</span>
                      <Icon icon="lucide:sun" className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-normal leading-relaxed ${familyMode === 'mayor' ? 'text-[#212121]/90' : 'text-slate-400'}`}>
                      Himnos de alabanza, júbilo festivo y adoración clásica.
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setFamilyMode('menor');
                      const field = getHarmonicField(familyRoot, 'menor');
                      setSelectedFamilyChord(field[0]?.chord || `${familyRoot}m`);
                    }}
                    className={`p-3.5 rounded-2xl font-bold text-left transition-all border flex flex-col gap-1 ${
                      familyMode === 'menor'
                        ? 'bg-amber-400 text-[#212121] font-black shadow-md border-amber-300'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-black">Tono Menor (Solemnidad / Avivamiento)</span>
                      <Icon icon="lucide:moon" className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-normal leading-relaxed ${familyMode === 'menor' ? 'text-[#212121]/90' : 'text-slate-400'}`}>
                      Coros de avivamiento rápidos, quebrantamiento o clamor profundo.
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Grid de los Acordes de la Familia */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    3. Acordes del Tono (Haz clic para tocar)
                  </label>
                  <span className="text-[10px] bg-slate-900 text-amber-400 font-mono px-2 py-0.5 rounded border border-amber-400/30">
                    7 Acordes Diatónicos
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {getHarmonicField(familyRoot, familyMode).map((item, idx) => {
                    const active = selectedFamilyChord === item.chord;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedFamilyChord(item.chord);
                          setIsPlayingFamilyCircle(false);
                          playChord(getChordNotes(item.chord), false, 4);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                          active
                            ? 'bg-amber-400 text-[#212121] font-black border-amber-300 shadow-xl transform scale-[1.02]'
                            : item.isMain
                            ? 'bg-slate-900/90 hover:bg-slate-850 text-slate-200 border-slate-600/80'
                            : 'bg-slate-900/50 hover:bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-lg font-black font-mono">{item.chord}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            active ? 'bg-[#212121] text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.grade}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold ${active ? 'text-[#212121]' : 'text-amber-300/90'}`}>
                          {item.role.split('•')[1] || item.role}
                        </span>
                        <span className={`text-[10px] leading-tight line-clamp-2 ${active ? 'text-[#212121]/80' : 'text-slate-400'}`}>
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Audio Action Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
            <div className="text-center sm:text-left min-w-0">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                {mode === 'escalas' ? 'Escala Seleccionada' : mode === 'familias' ? 'Acorde de la Familia' : 'Acorde en Teclado'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block truncate font-mono">
                {titleLabel}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate block mt-0.5">
                {subLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => playChord(displayNotes, false, 4)}
                className="w-full sm:flex-initial px-3 sm:px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#212121] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
                title="Escuchar acorde simultáneo con sonido real de piano"
              >
                <Icon icon="lucide:volume-2" className="w-4 h-4 shrink-0" />
                <span>Escuchar</span>
              </button>

              <button
                onClick={() => playChord(displayNotes, true, 4)}
                className="w-full sm:flex-initial px-3 sm:px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-all transform active:scale-95"
                title="Reproducir nota por nota (Arpegio)"
              >
                <Icon icon="lucide:music-2" className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Arpegio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Piano Keyboard Visualizer & Interactive Studio (7 cols) */}
        <div className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          
          <div className="text-center space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-bold mb-1">
              <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 text-amber-400" />
              <span>Teclado Interactivo con Web Audio API</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-white">
              Teclado de Piano (2 Octavas)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Las teclas en <strong className="text-amber-400 font-mono">amarillo</strong> representan las notas exactas de tu selección. <strong className="text-white underline decoration-amber-400">¡Haz clic en cualquier tecla blanca o negra para tocarla libremente!</strong>
            </p>
          </div>

          {/* Active Manual Note feedback pill */}
          <div className="h-6 flex items-center justify-center">
            {manualNote ? (
              <div className="px-4 py-1 rounded-full bg-amber-400 text-[#212121] font-black font-mono text-xs animate-bounce shadow-md">
                ♪ Tocando nota: {manualNote}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Haz clic o pulsa las teclas abajo para escuchar su sonido acústico.
              </div>
            )}
          </div>

          {/* Render 2 Octaves for clear visual */}
          <div className="w-full space-y-2">
            <div className="sm:hidden flex items-center justify-center gap-1.5 text-[11px] text-amber-300 bg-slate-900/90 py-1.5 px-3 rounded-xl border border-amber-400/30">
              <Icon icon="lucide:move-horizontal" className="w-4 h-4 animate-pulse shrink-0 text-amber-400" />
              <span>Desliza el teclado de lado a lado para tocar ambas octavas</span>
            </div>

            <div ref={scrollContainerRef} className="relative w-full flex justify-start sm:justify-center bg-slate-900 p-3 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl overflow-x-auto touch-pan-x scrollbar-thin">
              <div className="flex relative h-48 sm:h-64 select-none w-full min-w-[460px] sm:min-w-[540px] max-w-5xl">
                {/* Render 14 White Keys in a clean flex row */}
                {[
                  { note: 'C', oct: 4 }, { note: 'D', oct: 4 }, { note: 'E', oct: 4 }, { note: 'F', oct: 4 }, { note: 'G', oct: 4 }, { note: 'A', oct: 4 }, { note: 'B', oct: 4 },
                  { note: 'C', oct: 5 }, { note: 'D', oct: 5 }, { note: 'E', oct: 5 }, { note: 'F', oct: 5 }, { note: 'G', oct: 5 }, { note: 'A', oct: 5 }, { note: 'B', oct: 5 }
                ].map((wk, index) => {
                  const noteName = wk.note;
                  const whiteIndex = activeVoicingNotes.findIndex(item => 
                    item.octave === wk.oct && (
                      item.note === noteName ||
                      (noteName === 'C' && item.note === 'B#') ||
                      (noteName === 'E' && item.note === 'Fb') ||
                      (noteName === 'F' && item.note === 'E#') ||
                      (noteName === 'B' && item.note === 'Cb')
                    )
                  );
                  const isWhiteHighlighted = whiteIndex !== -1;

                  return (
                    <div
                      key={`white-${wk.oct}-${wk.note}-${index}`}
                      onClick={() => handleKeyClick(noteName, wk.oct)}
                      className={`flex-1 shrink-0 h-full rounded-b-lg sm:rounded-b-xl border-r border-slate-300 flex flex-col justify-end pb-3 sm:pb-4 items-center relative transition-all duration-200 cursor-pointer ${
                        isWhiteHighlighted
                          ? 'bg-amber-400 shadow-xl shadow-amber-400/50 text-[#212121] font-black translate-y-0.5 border-amber-300 ring-2 ring-amber-400/50'
                          : 'piano-key-white text-slate-700 font-bold hover:bg-slate-100 active:bg-amber-200'
                      }`}
                    >
                      {isWhiteHighlighted && (
                        <span className="absolute top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#212121] text-amber-400 flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow">
                          {whiteIndex + 1}
                        </span>
                      )}
                      <span className="text-[11px] sm:text-sm font-mono mt-auto">{noteName}</span>
                      <span className="text-[8px] sm:text-[9px] font-mono opacity-50">{wk.oct}</span>
                    </div>
                  );
                })}

                {/* Render 10 Black Keys centered exactly over the vertical seams between white keys */}
                <div className="absolute top-0 left-0 w-full h-32 sm:h-40 pointer-events-none z-30">
                  {[
                    { note: 'C#', oct: 4, seam: 1 },
                    { note: 'Eb', oct: 4, seam: 2 },
                    // seam 3 is empty (between E4 and F4)
                    { note: 'F#', oct: 4, seam: 4 },
                    { note: 'Ab', oct: 4, seam: 5 },
                    { note: 'Bb', oct: 4, seam: 6 },
                    // seam 7 is empty (between B4 and C5)
                    { note: 'C#', oct: 5, seam: 8 },
                    { note: 'Eb', oct: 5, seam: 9 },
                    // seam 10 is empty (between E5 and F5)
                    { note: 'F#', oct: 5, seam: 11 },
                    { note: 'Ab', oct: 5, seam: 12 },
                    { note: 'Bb', oct: 5, seam: 13 },
                  ].map((bk, i) => {
                    const blackIndex = activeVoicingNotes.findIndex(item => 
                      item.octave === bk.oct && (
                        item.note === bk.note ||
                        (bk.note === 'C#' && item.note === 'Db') ||
                        (bk.note === 'Eb' && item.note === 'D#') ||
                        (bk.note === 'F#' && item.note === 'Gb') ||
                        (bk.note === 'Ab' && item.note === 'G#') ||
                        (bk.note === 'Bb' && item.note === 'A#')
                      )
                    );
                    const isBlackHighlighted = blackIndex !== -1;
                    const seamPercent = (bk.seam / 14) * 100;

                    return (
                      <div
                        key={`black-${bk.oct}-${bk.note}-${i}`}
                        style={{ left: `${seamPercent}%`, transform: 'translateX(-50%)' }}
                        onClick={() => handleKeyClick(bk.note, bk.oct)}
                        className={`absolute top-0 w-6 sm:w-9 h-full rounded-b-lg sm:rounded-b-xl flex flex-col justify-end pb-2 sm:pb-3 items-center pointer-events-auto transition-all duration-200 cursor-pointer ${
                          isBlackHighlighted
                            ? 'bg-amber-400 shadow-2xl shadow-amber-400/80 text-[#212121] font-black border border-amber-300 ring-2 ring-amber-400'
                            : 'piano-key-black text-slate-300 font-bold hover:brightness-125 active:bg-amber-300 active:text-[#212121]'
                        }`}
                      >
                        {isBlackHighlighted && (
                          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#212121] text-amber-400 flex items-center justify-center text-[8px] sm:text-[9px] font-black mb-1 shadow">
                            {blackIndex + 1}
                          </span>
                        )}
                        <span className="text-[9px] sm:text-xs font-mono">{bk.note}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Breakdown Pills */}
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider gap-1 text-center sm:text-left">
              <span>Notas de esta selección ({displayNotes.length}):</span>
              <span className="text-amber-400">
                {mode === 'diccionario' ? `Fórmula Inversión #${selectedInversion}` : mode === 'escalas' ? 'Grados de la escala' : 'Acorde en Progresión'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {activeVoicingNotes.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => playNote(item.fullNote)}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 font-mono font-black text-[#212121] text-sm sm:text-base shadow-md cursor-pointer flex items-center gap-1.5 transition-transform hover:scale-105"
                  title={`Haz clic para escuchar la nota ${item.fullNote}`}
                >
                  <span className="text-[10px] sm:text-xs opacity-70">#{idx + 1}</span>
                  <span>{item.note}</span>
                  <span className="text-[9px] sm:text-[10px] opacity-60 font-mono">({item.octave})</span>
                  <Icon icon="lucide:volume-2" className="w-3 sm:w-3.5 h-3 sm:h-3.5 opacity-80" />
                </div>
              ))}
            </div>
          </div>

          {/* Pianist Worship Tips Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <Icon icon="lucide:lightbulb" className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">Mano Izquierda (Bajo y Octavas)</strong>
                En adoración, toca con la mano izquierda la nota raíz o el bajo indicado (ej. en <code className="text-amber-400 bg-slate-800 px-1 rounded">C/E</code> toca <code className="text-amber-400 bg-slate-800 px-1 rounded">Mi</code> en octavas bajas) mientras construyes el acorde arriba.
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <Icon icon="lucide:sparkles" className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">Inversiones y Conexión (Voice Leading)</strong>
                No saltes de un extremo al otro del teclado al cambiar de acorde. Usa la 1ª o 2ª inversión para que los acordes compartan notas cercanas y suenen como un mar en calma.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
