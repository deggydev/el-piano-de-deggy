import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ROOTS, MINOR_ROOTS, PROGRESSIONS } from './constants';
import { getChordNotes } from '../../utils/chordTransposer';
import { playChord } from '../../utils/pianoAudio';

interface ProgressionsPanelProps {
  progRoot: string;
  onSelectProgRoot: (root: string) => void;
  activeProgId: string;
  onSelectProgId: (id: string) => void;
  activeStepIdx: number;
  onSelectStepIdx: (idx: number) => void;
  isPlayingProg: boolean;
  onTogglePlayProg: () => void;
}

export const ProgressionsPanel: React.FC<ProgressionsPanelProps> = ({
  progRoot,
  onSelectProgRoot,
  activeProgId,
  onSelectProgId,
  activeStepIdx,
  onSelectStepIdx,
  isPlayingProg,
  onTogglePlayProg,
}) => {
  const activeProg = PROGRESSIONS.find((p) => p.id === activeProgId) || PROGRESSIONS[0];
  const currentMode = activeProg.mode || 'mayor';
  const [filterMode, setFilterMode] = useState<'all' | 'mayor' | 'menor'>('all');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon icon="lucide:repeat" className="w-5 h-5 text-amber-400" />
            <span>Círculos Armónicos y Progresiones</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Las progresiones más tocadas en iglesias cristianas, tanto en tono mayor como menor.
          </p>
        </div>
        <button
          onClick={onTogglePlayProg}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
            isPlayingProg
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-amber-400 hover:bg-amber-300 text-[#212121]'
          }`}
        >
          <Icon icon={isPlayingProg ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
          <span>{isPlayingProg ? 'Detener Auto-Play' : 'Auto-Reproducir Círculo'}</span>
        </button>
      </div>

      {/* Root key for progression (Mayores y Menores) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
          <span>1. Tono de la Canción (Tónica)</span>
          <span className="text-amber-400 font-mono text-sm">{progRoot} ({currentMode.toUpperCase()})</span>
        </label>

        <div className="space-y-2">
          {/* Tonos Mayores */}
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400/80 block mb-1">Tonos Mayores:</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {ROOTS.map((root) => {
                const active = progRoot === root && currentMode === 'mayor';
                return (
                  <button
                    key={`maj-${root}`}
                    onClick={() => {
                      onSelectProgRoot(root);
                      if (currentMode === 'menor') {
                        onSelectProgId('intima');
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
                const active = progRoot === baseRoot && currentMode === 'menor';
                return (
                  <button
                    key={`min-${mRoot}`}
                    onClick={() => {
                      onSelectProgRoot(baseRoot);
                      if (currentMode !== 'menor') {
                        onSelectProgId('circulo_menor');
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

      {/* Filter and Progressions list */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            2. Selecciona Progresión / Círculo
          </label>
          
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterMode === 'all' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'}`}
            >
              Todos ({PROGRESSIONS.length})
            </button>
            <button
              onClick={() => setFilterMode('mayor')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterMode === 'mayor' ? 'bg-amber-400 text-[#212121]' : 'text-slate-400 hover:text-white'}`}
            >
              Mayores (4)
            </button>
            <button
              onClick={() => setFilterMode('menor')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterMode === 'menor' ? 'bg-emerald-400 text-[#212121]' : 'text-slate-400 hover:text-white'}`}
            >
              Menores (4)
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {PROGRESSIONS
            .filter((prog) => filterMode === 'all' || prog.mode === filterMode)
            .map((prog) => {
              const active = activeProgId === prog.id;
              const steps = prog.chordsByRoot(progRoot);
              const isMinor = prog.mode === 'menor';

              return (
                <div
                  key={prog.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    active
                      ? isMinor
                        ? 'bg-slate-900 border-emerald-400/80 shadow-xl'
                        : 'bg-slate-900 border-amber-400/80 shadow-xl'
                      : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div
                    onClick={() => onSelectProgId(prog.id)}
                    className="p-4 cursor-pointer flex items-center justify-between border-b border-slate-800/80"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          isMinor ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isMinor ? 'Menor' : 'Mayor'}
                        </span>
                        <h4 className={`font-bold text-sm sm:text-base ${active ? (isMinor ? 'text-emerald-400' : 'text-amber-400') : 'text-white'}`}>
                          {prog.title}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-1 block">
                        Fórmula: {prog.formula}
                      </span>
                    </div>
                    <Icon icon="lucide:chevron-right" className={`w-5 h-5 transition-transform ${active ? (isMinor ? 'text-emerald-400 rotate-90' : 'text-amber-400 rotate-90') : 'text-slate-500'}`} />
                  </div>

                  {active && (
                    <div className="p-4 bg-slate-950/60 space-y-3 animate-fadeIn">
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
                                onSelectStepIdx(sIdx);
                                playChord(getChordNotes(step.chord), false, 4);
                              }}
                              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                stepActive
                                  ? isMinor
                                    ? 'bg-emerald-400 text-[#212121] font-black border-emerald-300 shadow-lg scale-105'
                                    : 'bg-amber-400 text-[#212121] font-black border-amber-300 shadow-lg scale-105'
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
  );
};
