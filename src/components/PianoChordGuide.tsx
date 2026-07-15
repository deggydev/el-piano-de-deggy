import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { getChordNotes } from '../utils/chordTransposer';

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const TYPES = [
  { label: 'Mayor', suffix: '' },
  { label: 'Menor', suffix: 'm' },
  { label: 'Suspensión 4', suffix: 'sus4' },
  { label: 'Suspensión 2', suffix: 'sus2' },
  { label: 'Aumentado', suffix: 'aug' },
  { label: 'Disminuido', suffix: 'dim' },
];

const PIANO_KEYS_DISPLAY = [
  { note: 'C', isBlack: false },
  { note: 'C#', isBlack: true, offset: 1 },
  { note: 'D', isBlack: false },
  { note: 'Eb', isBlack: true, offset: 2 },
  { note: 'E', isBlack: false },
  { note: 'F', isBlack: false },
  { note: 'F#', isBlack: true, offset: 4 },
  { note: 'G', isBlack: false },
  { note: 'Ab', isBlack: true, offset: 5 },
  { note: 'A', isBlack: false },
  { note: 'Bb', isBlack: true, offset: 6 },
  { note: 'B', isBlack: false },
];

export const PianoChordGuide: React.FC = () => {
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<string>('');

  const currentChord = `${selectedRoot}${selectedType}`;
  const notesInChord = getChordNotes(currentChord);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Icon icon="mdi:piano" className="w-4 h-4" />
          <span>Herramienta para Tecladistas</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Guía Visual de Acordes en el Teclado
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-1">
          Selecciona la nota raíz y el tipo de acorde para visualizar las teclas en un piano virtual y aprender sus notas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon icon="lucide:sliders" className="w-5 h-5 text-purple-400" />
            <span>Configurar Acorde</span>
          </h3>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. Nota Raíz (Tónica)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ROOTS.map((root) => (
                <button
                  key={root}
                  onClick={() => setSelectedRoot(root)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                    selectedRoot === root
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {root}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              2. Tipo de Acorde (Cualidad)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {TYPES.map((type) => (
                <button
                  key={type.suffix}
                  onClick={() => setSelectedType(type.suffix)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between ${
                    selectedType === type.suffix
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{type.label}</span>
                  <span className="font-mono text-xs opacity-80">
                    {selectedRoot}{type.suffix}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-800/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider block">
                Acorde Seleccionado
              </span>
              <span className="text-3xl font-black text-white mt-1 block">
                {currentChord}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Notas que lo forman
              </span>
              <div className="flex items-center gap-1.5 mt-1 justify-end">
                {notesInChord.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 font-mono font-bold text-white text-sm shadow"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Piano Keyboard Visualizer */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center">
          <div className="text-center space-y-2">
            <h4 className="text-2xl font-black text-white">
              Teclado de Piano Interactivo
            </h4>
            <p className="text-sm text-slate-400">
              Las teclas iluminadas en color púrpura representan las notas que conforman el acorde <strong className="text-purple-300 font-mono">{currentChord}</strong>.
            </p>
          </div>

          {/* Render 2 Octaves for clear visual */}
          <div className="relative inline-flex justify-center bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-x-auto max-w-full">
            <div className="flex relative h-56 sm:h-64 select-none">
              {/* Render White Keys */}
              {[...PIANO_KEYS_DISPLAY, ...PIANO_KEYS_DISPLAY].filter(k => !k.isBlack).map((keyObj, index) => {
                const noteName = keyObj.note;
                const isHighlighted = notesInChord.includes(noteName) || 
                  (noteName === 'C#' && notesInChord.includes('Db')) ||
                  (noteName === 'Eb' && notesInChord.includes('D#')) ||
                  (noteName === 'F#' && notesInChord.includes('Gb')) ||
                  (noteName === 'Ab' && notesInChord.includes('G#')) ||
                  (noteName === 'Bb' && notesInChord.includes('A#'));

                return (
                  <div
                    key={`white-${index}`}
                    className={`w-12 sm:w-14 h-full rounded-b-xl border-r border-slate-300 flex flex-col justify-end pb-4 items-center relative transition-all duration-300 ${
                      isHighlighted
                        ? 'bg-purple-600 shadow-lg shadow-purple-500/50 text-white font-extrabold translate-y-0.5'
                        : 'piano-key-white text-slate-700 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-mono">{noteName}</span>
                  </div>
                );
              })}

              {/* Render Black Keys overlay */}
              <div className="absolute top-0 left-0 right-0 h-36 sm:h-40 pointer-events-none flex">
                {/* Octave 1 & 2 layout offsets */}
                <div className="relative w-full h-full">
                  {/* Black keys positioning relative to white keys width (14 white keys total across 2 octaves) */}
                  {[
                    { note: 'C#', left: '6%' },
                    { note: 'Eb', left: '13.2%' },
                    { note: 'F#', left: '27.5%' },
                    { note: 'Ab', left: '34.7%' },
                    { note: 'Bb', left: '41.8%' },
                    { note: 'C#', left: '56%' },
                    { note: 'Eb', left: '63.2%' },
                    { note: 'F#', left: '77.5%' },
                    { note: 'Ab', left: '84.7%' },
                    { note: 'Bb', left: '91.8%' },
                  ].map((bk, i) => {
                    const isHighlighted = notesInChord.includes(bk.note) ||
                      (bk.note === 'C#' && notesInChord.includes('Db')) ||
                      (bk.note === 'Eb' && notesInChord.includes('D#')) ||
                      (bk.note === 'F#' && notesInChord.includes('Gb')) ||
                      (bk.note === 'Ab' && notesInChord.includes('G#')) ||
                      (bk.note === 'Bb' && notesInChord.includes('A#'));

                    return (
                      <div
                        key={`black-${i}`}
                        style={{ left: bk.left }}
                        className={`absolute top-0 w-8 sm:w-9 h-full rounded-b-xl flex flex-col justify-end pb-3 items-center pointer-events-auto transition-all duration-300 z-10 ${
                          isHighlighted
                            ? 'bg-purple-600 shadow-xl shadow-purple-500/80 text-white font-extrabold border border-purple-300/40'
                            : 'piano-key-black text-slate-300 font-bold hover:brightness-125'
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs font-mono">{bk.note}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 max-w-lg text-center flex items-center justify-center gap-2">
            <Icon icon="lucide:info" className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Tip para Piano: En la mano izquierda (bajo), toca la nota raíz (Tónica) en octavas, mientras con la mano derecha construyes el acorde en la región central del teclado.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
