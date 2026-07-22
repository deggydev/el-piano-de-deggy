import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import {
  getChordNotes,
  getChordInversionNotes,
  getScaleNotes,
  getNotesWithOctaves,
  getHarmonicField,
  type NoteWithOctave,
} from '../../utils/chordTransposer';
import { playNote, playChord } from '../../utils/pianoAudio';
import { SCALES_INFO, PROGRESSIONS, type PianoMode } from './constants';
import { ModeTabs } from './ModeTabs';
import { DictionaryPanel } from './DictionaryPanel';
import { ScalesPanel } from './ScalesPanel';
import { ProgressionsPanel } from './ProgressionsPanel';
import { FamilyCirclePanel } from './FamilyCirclePanel';
import { AudioToolbar } from './AudioToolbar';
import { InteractiveKeyboard } from './InteractiveKeyboard';

export const PianoChordGuide: React.FC = () => {
  // Mode: 'diccionario' | 'escalas' | 'progresiones' | 'familias'
  const [mode, setMode] = useState<PianoMode>('diccionario');

  // Diccionario state
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedInversion, setSelectedInversion] = useState<number>(0);

  // Escalas state
  const [scaleRoot, setScaleRoot] = useState<string>('C');
  const [scaleType, setScaleType] = useState<string>('mayor');

  // Progresiones state
  const [progRoot, setProgRoot] = useState<string>('C');
  const [activeProgId, setActiveProgId] = useState<string>('intima');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isPlayingProg, setIsPlayingProg] = useState<boolean>(false);

  // Familias por Tono state
  const [familyRoot, setFamilyRoot] = useState<string>('E');
  const [familyMode, setFamilyMode] = useState<'mayor' | 'menor'>('mayor');
  const [selectedFamilyChord, setSelectedFamilyChord] = useState<string>('E');
  const [isPlayingFamilyCircle, setIsPlayingFamilyCircle] = useState<boolean>(false);

  // Active note feedback when clicked manually
  const [manualNote, setManualNote] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectMode = (newMode: PianoMode) => {
    setMode(newMode);
    if (newMode !== 'progresiones') setIsPlayingProg(false);
    if (newMode !== 'familias') setIsPlayingFamilyCircle(false);
  };

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10 overflow-x-clip">
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
        <ModeTabs mode={mode} onSelectMode={handleSelectMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-sm">
          {mode === 'diccionario' && (
            <DictionaryPanel
              selectedRoot={selectedRoot}
              onSelectRoot={setSelectedRoot}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              selectedInversion={selectedInversion}
              onSelectInversion={setSelectedInversion}
            />
          )}

          {mode === 'escalas' && (
            <ScalesPanel
              scaleRoot={scaleRoot}
              onSelectScaleRoot={setScaleRoot}
              scaleType={scaleType}
              onSelectScaleType={setScaleType}
            />
          )}

          {mode === 'progresiones' && (
            <ProgressionsPanel
              progRoot={progRoot}
              onSelectProgRoot={(root) => { setProgRoot(root); setActiveStepIdx(0); }}
              activeProgId={activeProgId}
              onSelectProgId={(id) => { setActiveProgId(id); setActiveStepIdx(0); }}
              activeStepIdx={activeStepIdx}
              onSelectStepIdx={(idx) => { setActiveStepIdx(idx); setIsPlayingProg(false); }}
              isPlayingProg={isPlayingProg}
              onTogglePlayProg={() => setIsPlayingProg(!isPlayingProg)}
            />
          )}

          {mode === 'familias' && (
            <FamilyCirclePanel
              familyRoot={familyRoot}
              onSelectFamilyRoot={setFamilyRoot}
              familyMode={familyMode}
              onSelectFamilyMode={setFamilyMode}
              selectedFamilyChord={selectedFamilyChord}
              onSelectFamilyChord={(chord) => { setSelectedFamilyChord(chord); setIsPlayingFamilyCircle(false); }}
              isPlayingFamilyCircle={isPlayingFamilyCircle}
              onTogglePlayFamilyCircle={() => setIsPlayingFamilyCircle(!isPlayingFamilyCircle)}
            />
          )}

          <AudioToolbar
            mode={mode}
            titleLabel={titleLabel}
            subLabel={subLabel}
            displayNotes={displayNotes}
          />
        </div>

        {/* Right Piano Keyboard Visualizer & Interactive Studio (7 cols) */}
        <InteractiveKeyboard
          activeVoicingNotes={activeVoicingNotes}
          displayNotes={displayNotes}
          mode={mode}
          selectedInversion={selectedInversion}
          manualNote={manualNote}
          onKeyClick={handleKeyClick}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
    </div>
  );
};
