import React from 'react';
import { Icon } from '@iconify/react';
import { ROOTS, MINOR_ROOTS, CHORD_CATEGORIES } from './constants';
import { getChordNotes } from '../../utils/chordTransposer';

interface DictionaryPanelProps {
  selectedRoot: string;
  onSelectRoot: (root: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  selectedInversion: number;
  onSelectInversion: (inv: number) => void;
  isPlayingDict?: boolean;
  onTogglePlayDict?: () => void;
}

export const DictionaryPanel: React.FC<DictionaryPanelProps> = ({
  selectedRoot,
  onSelectRoot,
  selectedType,
  onSelectType,
  selectedInversion,
  onSelectInversion,
  isPlayingDict,
  onTogglePlayDict,
}) => {
  const currentChord = `${selectedRoot}${selectedType}`;
  const notes = getChordNotes(currentChord);
  const currentNotesCount = notes.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon icon="lucide:book-open" className="w-5 h-5 text-amber-400" />
            <span>Diccionario de Acordes Cristianos</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Encuentra al instante cualquier acorde para himnos clásicos o adoración contemporánea.
          </p>
        </div>

        <button
          onClick={onTogglePlayDict}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
            isPlayingDict
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-amber-400 hover:bg-amber-300 text-[#212121]'
          }`}
        >
          <Icon icon={isPlayingDict ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
          <span>{isPlayingDict ? 'Detener Arpegio' : 'Oír Acorde'}</span>
        </button>
      </div>

      {/* 1. Root Note (Mayores y Menores) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
          <span>1. Tónica / Nota Raíz</span>
          <span className="text-amber-400 font-mono text-sm">{selectedRoot}{selectedType}</span>
        </label>
        
        <div className="space-y-2">
          {/* Tonos Mayores */}
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400/80 block mb-1">Tonos Mayores:</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {ROOTS.map((root) => {
                const active = selectedRoot === root && (selectedType === '' || selectedType === 'maj7' || selectedType === 'sus4' || selectedType === 'add9');
                return (
                  <button
                    key={`maj-${root}`}
                    onClick={() => {
                      onSelectRoot(root);
                      if (selectedType === 'm' || selectedType === 'm7' || selectedType === 'm9') {
                        onSelectType('');
                      }
                    }}
                    className={`py-2 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      active
                        ? 'bg-amber-400 text-[#212121] font-black shadow-md shadow-amber-400/30 transform scale-105'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {root}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tonos Menores */}
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400/80 block mb-1">Tonos Menores:</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {MINOR_ROOTS.map((mRoot, idx) => {
                const baseRoot = ROOTS[idx];
                const active = selectedRoot === baseRoot && (selectedType === 'm' || selectedType === 'm7' || selectedType === 'm9');
                return (
                  <button
                    key={`min-${mRoot}`}
                    onClick={() => {
                      onSelectRoot(baseRoot);
                      if (selectedType !== 'm' && selectedType !== 'm7' && selectedType !== 'm9') {
                        onSelectType('m');
                      }
                    }}
                    className={`py-2 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      active
                        ? 'bg-emerald-400 text-[#212121] font-black shadow-md shadow-emerald-400/30 transform scale-105'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {mRoot}
                  </button>
                );
              })}
            </div>
          </div>
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
                    onClick={() => onSelectType(type.suffix)}
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
      {currentNotesCount >= 3 && (
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
              .slice(0, currentNotesCount)
              .map((item) => (
                <button
                  key={item.inv}
                  onClick={() => onSelectInversion(item.inv)}
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
  );
};
