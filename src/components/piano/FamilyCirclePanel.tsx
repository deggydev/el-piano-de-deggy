import React from 'react';
import { Icon } from '@iconify/react';
import { ROOTS, MINOR_ROOTS } from './constants';
import { getHarmonicField, getChordNotes } from '../../utils/chordTransposer';
import { playChord } from '../../utils/pianoAudio';

interface FamilyCirclePanelProps {
  familyRoot: string;
  onSelectFamilyRoot: (root: string) => void;
  familyMode: 'mayor' | 'menor';
  onSelectFamilyMode: (mode: 'mayor' | 'menor') => void;
  selectedFamilyChord: string;
  onSelectFamilyChord: (chord: string) => void;
  isPlayingFamilyCircle: boolean;
  onTogglePlayFamilyCircle: () => void;
}

export const FamilyCirclePanel: React.FC<FamilyCirclePanelProps> = ({
  familyRoot,
  onSelectFamilyRoot,
  familyMode,
  onSelectFamilyMode,
  selectedFamilyChord,
  onSelectFamilyChord,
  isPlayingFamilyCircle,
  onTogglePlayFamilyCircle,
}) => {
  const harmonicField = getHarmonicField(familyRoot, familyMode);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon icon="lucide:disc" className="w-5 h-5 text-amber-400" />
            <span>Círculo de Tonalidad (Familia Armónica)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Todos los acordes diatónicos y complementarios para acompañar en la iglesia.
          </p>
        </div>

        <button
          onClick={onTogglePlayFamilyCircle}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
            isPlayingFamilyCircle
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-amber-400 hover:bg-amber-300 text-[#212121]'
          }`}
        >
          <Icon icon={isPlayingFamilyCircle ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
          <span>{isPlayingFamilyCircle ? 'Detener Auto-Play' : 'Auto-Reproducir Círculo'}</span>
        </button>
      </div>

      {/* 1. Tono / Nota del Himno (Mayores y Menores) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
          <span>1. Tono / Nota Raíz de la Canción</span>
          <span className="text-amber-400 font-mono text-sm">{familyRoot} ({familyMode.toUpperCase()})</span>
        </label>
        
        <div className="space-y-2">
          {/* Tonos Mayores */}
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400/80 block mb-1">Tonos Mayores:</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {ROOTS.map((root) => {
                const active = familyRoot === root && familyMode === 'mayor';
                return (
                  <button
                    key={`maj-${root}`}
                    onClick={() => {
                      onSelectFamilyRoot(root);
                      onSelectFamilyMode('mayor');
                      const field = getHarmonicField(root, 'mayor');
                      onSelectFamilyChord(field[0]?.chord || root);
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
                const active = familyRoot === baseRoot && familyMode === 'menor';
                return (
                  <button
                    key={`min-${mRoot}`}
                    onClick={() => {
                      onSelectFamilyRoot(baseRoot);
                      onSelectFamilyMode('menor');
                      const field = getHarmonicField(baseRoot, 'menor');
                      onSelectFamilyChord(field[0]?.chord || mRoot);
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

      {/* 2. Tipo de Tono: Mayor o Menor */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
          2. Tipo de Tono (Cualidad de la Canción)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              onSelectFamilyMode('mayor');
              const field = getHarmonicField(familyRoot, 'mayor');
              onSelectFamilyChord(field[0]?.chord || familyRoot);
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
              onSelectFamilyMode('menor');
              const field = getHarmonicField(familyRoot, 'menor');
              onSelectFamilyChord(field[0]?.chord || `${familyRoot}m`);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            3. Acordes del Tono (Haz clic para tocar)
          </label>
          <span className="text-[10px] bg-slate-900 text-amber-400 font-mono px-2 py-0.5 rounded border border-amber-400/30 font-bold">
            Familia Completa ({harmonicField.length} Acordes)
          </span>
        </div>

        <div className="max-h-[420px] overflow-y-auto pr-1 space-y-5 scrollbar-thin">
          {/* Grupo 1: Diatónicos */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400/90 uppercase tracking-wider px-1">
              <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 text-amber-400" />
              <span>Grados Diatónicos Base (Escala Principal)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {harmonicField
                .filter((item) => item.category === 'diatonico' || !item.category)
                .map((item, idx) => {
                  const active = selectedFamilyChord === item.chord;
                  return (
                    <button
                      key={`dia-${idx}`}
                      onClick={() => {
                        onSelectFamilyChord(item.chord);
                        if (isPlayingFamilyCircle) onTogglePlayFamilyCircle();
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
                        {item.role.split('•')[1]?.trim() || item.role}
                      </span>
                      <span className={`text-[10px] leading-tight line-clamp-2 ${active ? 'text-[#212121]/80' : 'text-slate-400'}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Grupo 2: Complementarios y de Paso */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider px-1">
              <Icon icon="lucide:sparkles" className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acordes Complementarios, Prestados y de Paso (Worship & Gospel)</span>
            </div>
            <p className="text-[11px] text-slate-400 px-1">
              Acordes muy comunes como el 5to menor ({harmonicField.find(c => c.grade === 'v')?.chord}), inversiones con bajo o préstamos modales para coros y puentes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {harmonicField
                .filter((item) => item.category === 'complementario')
                .map((item, idx) => {
                  const active = selectedFamilyChord === item.chord;
                  return (
                    <button
                      key={`comp-${idx}`}
                      onClick={() => {
                        onSelectFamilyChord(item.chord);
                        if (isPlayingFamilyCircle) onTogglePlayFamilyCircle();
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
                      <span className={`text-[11px] font-bold ${active ? 'text-[#212121]' : 'text-emerald-400/90'}`}>
                        {item.role.split('•')[1]?.trim() || item.role}
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
      </div>
    </div>
  );
};
