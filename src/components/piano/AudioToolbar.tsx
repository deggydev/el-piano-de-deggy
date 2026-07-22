import React from 'react';
import { Icon } from '@iconify/react';
import type { PianoMode } from './constants';
import { playChord } from '../../utils/pianoAudio';

interface AudioToolbarProps {
  mode: PianoMode;
  titleLabel: string;
  subLabel: string;
  displayNotes: string[];
}

export const AudioToolbar: React.FC<AudioToolbarProps> = ({
  mode,
  titleLabel,
  subLabel,
  displayNotes,
}) => {
  return (
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
  );
};
