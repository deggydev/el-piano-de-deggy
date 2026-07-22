import React from 'react';
import { Icon } from '@iconify/react';
import type { PianoMode } from './constants';

interface ModeTabsProps {
  mode: PianoMode;
  onSelectMode: (mode: PianoMode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ mode, onSelectMode }) => {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-700 shadow-lg w-full md:w-auto shrink-0">
      <button
        onClick={() => onSelectMode('diccionario')}
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
        onClick={() => onSelectMode('escalas')}
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
        onClick={() => onSelectMode('progresiones')}
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
        onClick={() => onSelectMode('familias')}
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
  );
};
