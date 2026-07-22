import React from 'react';
import { Icon } from '@iconify/react';
import { ROOTS, MINOR_ROOTS, SCALES_INFO } from './constants';

interface ScalesPanelProps {
  scaleRoot: string;
  onSelectScaleRoot: (root: string) => void;
  scaleType: string;
  onSelectScaleType: (type: string) => void;
  isPlayingScale?: boolean;
  onTogglePlayScale?: () => void;
}

export const ScalesPanel: React.FC<ScalesPanelProps> = ({
  scaleRoot,
  onSelectScaleRoot,
  scaleType,
  onSelectScaleType,
  isPlayingScale,
  onTogglePlayScale,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon icon="lucide:music" className="w-5 h-5 text-amber-400" />
            <span>Escalas Clave para Melodías y Adornos</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Escalas esenciales para hacer adornos, introducciones e improvisar durante la adoración.
          </p>
        </div>

        <button
          onClick={onTogglePlayScale}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
            isPlayingScale
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-amber-400 hover:bg-amber-300 text-[#212121]'
          }`}
        >
          <Icon icon={isPlayingScale ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
          <span>{isPlayingScale ? 'Detener Escala' : 'Tocar Escala Ascendente'}</span>
        </button>
      </div>

      {/* 1. Root Note (Mayores y Menores) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center justify-between">
          <span>1. Tónica / Nota Raíz</span>
          <span className="text-amber-400 font-mono text-sm">{scaleRoot}</span>
        </label>
        
        <div className="space-y-2">
          {/* Tonos Mayores */}
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400/80 block mb-1">Tonos Mayores:</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {ROOTS.map((root) => {
                const active = scaleRoot === root && (scaleType === 'mayor' || scaleType === 'pentatonica_mayor' || scaleType === 'blues');
                return (
                  <button
                    key={`maj-${root}`}
                    onClick={() => {
                      onSelectScaleRoot(root);
                      if (scaleType === 'menor' || scaleType === 'pentatonica_menor') {
                        onSelectScaleType('mayor');
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
                const active = scaleRoot === baseRoot && (scaleType === 'menor' || scaleType === 'pentatonica_menor');
                return (
                  <button
                    key={`min-${mRoot}`}
                    onClick={() => {
                      onSelectScaleRoot(baseRoot);
                      if (scaleType !== 'menor' && scaleType !== 'pentatonica_menor') {
                        onSelectScaleType('menor');
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
                onClick={() => onSelectScaleType(scale.id)}
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
  );
};
