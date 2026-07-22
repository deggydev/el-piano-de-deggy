import React from 'react';
import { Icon } from '@iconify/react';
import type { NoteWithOctave } from '../../utils/chordTransposer';
import { playNote } from '../../utils/pianoAudio';
import type { PianoMode } from './constants';

interface InteractiveKeyboardProps {
  activeVoicingNotes: NoteWithOctave[];
  displayNotes: string[];
  mode: PianoMode;
  selectedInversion: number;
  manualNote: string | null;
  onKeyClick: (noteName: string, octave: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  activeVoicingNotes,
  displayNotes,
  mode,
  selectedInversion,
  manualNote,
  onKeyClick,
  scrollContainerRef,
}) => {
  return (
    <div className="sticky top-24 z-30 bg-slate-800 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
      
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
                  onClick={() => onKeyClick(noteName, wk.oct)}
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
                    onClick={() => onKeyClick(bk.note, bk.oct)}
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
  );
};
