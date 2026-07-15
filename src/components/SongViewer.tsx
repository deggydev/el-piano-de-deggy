import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { Song } from '../types/canciones';
import { transposeChord, getChordNotes } from '../utils/chordTransposer';

interface SongViewerProps {
  song: Song;
  authorName: string;
  albumTitle: string;
  onBack: () => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({
  song,
  authorName,
  albumTitle,
  onBack,
}) => {
  const [semitones, setSemitones] = useState<number>(0);
  const [showChords, setShowChords] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(
    typeof window !== 'undefined' && window.innerWidth < 640 ? 15 : 18
  ); // px
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1 = slow, 2 = normal, 3 = fast
  const [inspectedChord, setInspectedChord] = useState<string | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    let intervalId: any;
    if (isScrolling) {
      const delay = scrollSpeed === 1 ? 60 : scrollSpeed === 2 ? 35 : 20;
      intervalId = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
          setIsScrolling(false);
        }
      }, delay);
    }
    return () => clearInterval(intervalId);
  }, [isScrolling, scrollSpeed]);

  // Reset transposer when song changes
  useEffect(() => {
    setSemitones(0);
    setIsScrolling(false);
  }, [song.id]);

  // Calculate current key display
  const currentKey = transposeChord(song.originalKey, semitones);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all shadow-md group"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Catálogo</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>{authorName}</span>
          <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-purple-400">{albumTitle}</span>
        </div>
      </div>

      {/* Song Header Card */}
      <div className="relative bg-slate-900 border border-slate-800/80 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Icon icon="mdi:piano" className="w-4 h-4 text-amber-400" />
                <span>Acordes para Piano</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                {song.difficulty}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {song.title}
            </h1>

            <p className="text-base sm:text-lg font-semibold text-purple-300">
              {authorName} <span className="text-slate-400 font-normal">({albumTitle})</span>
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col justify-end gap-3 bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl md:min-w-[200px]">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-400 font-medium">Tono Original:</span>
              <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                {song.originalKey}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-400 font-medium">Tono Actual:</span>
              <span className="font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                {currentKey}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm border-t border-slate-800/80 pt-2">
              <span className="text-slate-400 font-medium">Tiempo:</span>
              <span className="font-semibold text-slate-200">
                {song.bpm} BPM ({song.timeSignature})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pianist Toolbar (Non-sticky as requested) */}
      <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Transposition Controls */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 px-2 hidden sm:inline">
            Transponer:
          </span>

          <button
            onClick={() => setSemitones(semitones - 1)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-colors shadow"
            title="Bajar 1 semitono"
          >
            -0.5
          </button>

          <div className="px-3 text-center min-w-[70px]">
            <span className="text-xs text-slate-400 block font-semibold">Tono</span>
            <span className="font-mono font-black text-amber-400 text-base block">
              {currentKey}
            </span>
          </div>

          <button
            onClick={() => setSemitones(semitones + 1)}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-colors shadow"
            title="Subir 1 semitono"
          >
            +0.5
          </button>

          {semitones !== 0 && (
            <button
              onClick={() => setSemitones(0)}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold transition-all ml-1"
              title="Volver al tono original"
            >
              Reset
            </button>
          )}
        </div>

        {/* Chords Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChords(!showChords)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              showChords
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Icon icon={showChords ? 'mdi:piano' : 'lucide:eye-off'} className="w-4 h-4" />
            <span>{showChords ? 'Acordes Visibles' : 'Solo Letra'}</span>
          </button>
        </div>

        {/* Font Size & Auto-Scroll Controls */}
        <div className="flex items-center gap-3">
          {/* Font size buttons */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white font-bold text-xs"
              title="Disminuir tamaño de letra"
            >
              A-
            </button>
            <span className="text-xs font-mono px-2 text-slate-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white font-bold text-sm"
              title="Aumentar tamaño de letra"
            >
              A+
            </button>
          </div>

          {/* Auto-Scroll */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                isScrolling
                  ? 'bg-amber-500 text-slate-950 animate-pulse shadow-lg shadow-amber-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Icon icon={isScrolling ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Scroll</span>
            </button>

            {isScrolling && (
              <button
                onClick={() => setScrollSpeed(scrollSpeed === 3 ? 1 : scrollSpeed + 1)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400"
                title="Cambiar velocidad del auto-scroll"
              >
                {scrollSpeed === 1 ? '1x' : scrollSpeed === 2 ? '2x' : '3x'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Piano Chord Modal / Tooltip when clicking a chord */}
      {inspectedChord && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-purple-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-xl max-w-xs animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:piano" className="w-5 h-5 text-purple-400" />
              <span className="font-extrabold text-white text-base">
                Acorde: <span className="text-amber-400 font-mono">{inspectedChord}</span>
              </span>
            </div>
            <button
              onClick={() => setInspectedChord(null)}
              className="text-slate-400 hover:text-white"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p>
              Notas que forman el acorde:
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {getChordNotes(inspectedChord).map((note, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-purple-600 text-white font-mono font-bold"
                >
                  {note}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Teclas para mano derecha en el piano. Mano izquierda toca la nota raíz en octava.
            </p>
          </div>
        </div>
      )}

      {/* Song Sections / Lyrics Display */}
      <div
        className="space-y-4 sm:space-y-6 pb-16"
        style={{ fontSize: `${fontSize}px` }}
      >
        {song.sections.map((section, secIndex) => {
          const isCoro = section.type === 'coro';
          const isPuente = section.type === 'puente';
          const isIntro = section.type === 'intro' || section.type === 'outro';

          return (
            <div
              key={secIndex}
              className={`rounded-3xl p-4 sm:p-8 border transition-all ${
                isCoro
                  ? 'bg-slate-900 border-amber-500/40 shadow-xl shadow-amber-950/20'
                  : isPuente
                  ? 'bg-slate-900 border-teal-500/40 shadow-lg'
                  : isIntro
                  ? 'bg-slate-900/40 border-slate-800/80 border-dashed'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              {/* Section Badge */}
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span
                  className={`px-3.5 py-1 rounded-xl font-black text-xs uppercase tracking-wider ${
                    isCoro
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isPuente
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : isIntro
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {section.title}
                </span>
              </div>

              {/* Lines inside Section */}
              <div className="space-y-2 sm:space-y-4 leading-snug">
                {section.lines.map((line, lineIndex) => {
                  const groupedTokens = line.tokens.reduce((acc, token) => {
                    if (acc.length === 0) {
                      acc.push([token]);
                    } else {
                      const prevGroup = acc[acc.length - 1];
                      const prevToken = prevGroup[prevGroup.length - 1];
                      if (/\s+$/.test(prevToken.lyric)) {
                        acc.push([token]);
                      } else {
                        prevGroup.push(token);
                      }
                    }
                    return acc;
                  }, [] as typeof line.tokens[]);

                  return (
                    <div key={lineIndex} className="flex flex-wrap items-end gap-y-2 sm:gap-y-4 w-full pb-0.5">
                      {groupedTokens.map((group, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="inline-flex flex-wrap sm:flex-nowrap items-end max-w-full"
                        >
                          {group.map((token, tokIndex) => {
                            const transposedTokenChord = token.chord
                              ? transposeChord(token.chord, semitones)
                              : null;

                            return (
                              <div
                                key={tokIndex}
                                className="inline-flex flex-col justify-end max-w-full shrink-0"
                              >
                                {/* Chord above lyric */}
                                {showChords && transposedTokenChord && (
                                  <button
                                    onClick={() => setInspectedChord(transposedTokenChord)}
                                    className="font-mono font-black text-amber-400 sm:text-amber-300 hover:text-white bg-amber-500/10 sm:bg-transparent hover:bg-purple-600 px-1 py-0.5 rounded transition-all text-sm sm:text-base cursor-pointer self-start mb-0.5 leading-none shrink-0"
                                    title={`Ver teclas para acorde ${transposedTokenChord}`}
                                  >
                                    {transposedTokenChord}
                                  </button>
                                )}

                                {/* Lyric Segment */}
                                <span className="text-slate-100 font-medium whitespace-pre-wrap break-words leading-tight max-w-full">
                                  {token.lyric}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
