import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { Song } from '../types/canciones';
import { transposeChord, getChordNotes } from '../utils/chordTransposer';
import { generateSongSheetImage } from '../utils/songImageExporter';

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

  // Estados para exportar en imagen / WhatsApp
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

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

  // Abrir Modal de Exportación y generar imagen
  const handleOpenExportModal = async () => {
    setIsExporting(true);
    setIsGenerating(true);
    setCopySuccess('');
    try {
      const dataUrl = await generateSongSheetImage({
        song,
        authorName,
        albumTitle,
        semitones,
        currentKey,
        showChords,
      });
      setExportedImageUrl(dataUrl);
    } catch (err) {
      console.error('Error generando imagen:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Descargar imagen PNG en computadora/móvil
  const handleDownloadImage = () => {
    if (!exportedImageUrl) return;
    const a = document.createElement('a');
    a.href = exportedImageUrl;
    a.download = `${song.title.replace(/\s+/g, '_')}_Acordes_Deggy.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Compartir por WhatsApp o Web Share API
  const handleShareWhatsApp = async () => {
    if (!exportedImageUrl) return;

    try {
      // Intentar compartir como archivo usando Web Share API en dispositivos móviles
      if (navigator.share) {
        const res = await fetch(exportedImageUrl);
        const blob = await res.blob();
        const file = new File([blob], `${song.title}_Acordes.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${song.title} - Acordes para Piano`,
            text: `🎵 *${song.title}* (${authorName})\nTono: *${currentKey}* • Ritmo: *${song.bpm} BPM*\nCompartido desde El Piano de Deggy`,
          });
          return;
        }
      }
    } catch (err) {
      console.log('Fallo o cancelación en share:', err);
    }

    // Fallback multiplataforma: abrir WhatsApp con el texto del cancionero listo y avisar
    const whatsappText = encodeURIComponent(
      `🎵 *${song.title.toUpperCase()}*\nSalmista: *${authorName}* (${albumTitle})\n🎹 Tono Transpuesto: *${currentKey}* | Tiempo: *${song.bpm} BPM (${song.timeSignature})*\n\n` +
        song.sections
          .map(
            (sec) =>
              `📍 *${sec.title.toUpperCase()}*\n` +
              sec.lines
                .map((l) =>
                  l.tokens
                    .map((t) => {
                      const chord = t.chord ? `[${transposeChord(t.chord, semitones)}] ` : '';
                      return `${chord}${t.lyric}`;
                    })
                    .join('')
                )
                .join('\n')
          )
          .join('\n\n') +
        `\n\n✨ _Generado en El Piano de Deggy_`
    );

    window.open(`https://api.whatsapp.com/send?text=${whatsappText}`, '_blank');
  };

  // Copiar imagen al portapapeles
  const handleCopyImageToClipboard = async () => {
    if (!exportedImageUrl) return;
    try {
      const res = await fetch(exportedImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopySuccess('¡Imagen copiada! Pégala en WhatsApp (Ctrl+V)');
      setTimeout(() => setCopySuccess(''), 4000);
    } catch (err) {
      console.error('No se pudo copiar la imagen al portapapeles:', err);
      setCopySuccess('Tu navegador no soporta copiado directo de imágenes');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn pb-32">
      {/* 1. Cabecera Superior: Volver, Breadcrumb y Botón de Exportar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all shadow-md group cursor-pointer"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Catálogo</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenExportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#212121] font-black text-sm transition-all shadow-lg shadow-amber-400/20 cursor-pointer transform hover:-translate-y-0.5"
              title="Exportar en hoja blanca (imagen PNG) y compartir por WhatsApp"
            >
              <Icon icon="lucide:image" className="w-4 h-4" />
              <span>Exportar / WhatsApp</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>{authorName}</span>
              <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400">{albumTitle}</span>
            </div>
          </div>
        </div>

        {/* Título de la Alabanza (Compacto e impactante sin robar espacio vertical) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Icon icon="mdi:piano" className="w-3.5 h-3.5 text-amber-400" />
                <span>Acordes para Piano</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-200 border border-slate-700 text-[11px] font-bold">
                {song.difficulty}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words leading-tight">
              {song.title}
            </h1>

            <p className="text-sm sm:text-base font-semibold text-amber-400">
              {authorName} <span className="text-slate-400 font-normal">({albumTitle})</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-700/80">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tono</span>
              <span className="font-mono font-black text-amber-400 text-lg">{currentKey}</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ritmo</span>
              <span className="font-semibold text-slate-200 text-sm">{song.bpm} BPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Piano Chord Modal / Tooltip cuando el usuario inspecciona un acorde */}
      {inspectedChord && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-900/95 border border-amber-400/60 rounded-2xl p-5 shadow-2xl backdrop-blur-xl max-w-xs animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:piano" className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-white text-base">
                Acorde: <span className="text-amber-400 font-mono">{inspectedChord}</span>
              </span>
            </div>
            <button
              onClick={() => setInspectedChord(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p>Notas que forman el acorde en el piano:</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {getChordNotes(inspectedChord).map((note, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-amber-400 text-[#212121] font-mono font-black shadow"
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

      {/* 2. EN PRIMERA INSTANCIA: Las Letras con sus respectivos Acordes */}
      <div
        className="space-y-4 sm:space-y-6"
        style={{ fontSize: `${fontSize}px` }}
      >
        {song.sections.map((section, secIndex) => {
          const isCoro = section.type === 'coro';
          const isPuente = section.type === 'puente';
          const isIntro = section.type === 'intro' || section.type === 'outro';

          return (
            <div
              key={secIndex}
              className={`rounded-3xl p-5 sm:p-8 border transition-all ${
                isCoro
                  ? 'bg-slate-800 border-amber-400/60 shadow-xl shadow-amber-950/20'
                  : isPuente
                  ? 'bg-slate-800 border-teal-400/60 shadow-lg'
                  : isIntro
                  ? 'bg-slate-800/80 border-slate-700 border-dashed'
                  : 'bg-slate-800 border-slate-700 shadow-md'
              }`}
            >
              {/* Insignia de la sección (Estrofa, Coro, Puente) */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span
                  className={`px-3.5 py-1 rounded-xl font-black text-xs uppercase tracking-wider ${
                    isCoro
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : isPuente
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : isIntro
                      ? 'bg-slate-900 text-slate-300 border border-slate-700'
                      : 'bg-slate-900 text-amber-300 border border-slate-700'
                  }`}
                >
                  {section.title}
                </span>
              </div>

              {/* Líneas de Letra y Acordes */}
              <div className="space-y-3 sm:space-y-5 leading-snug">
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
                                {/* Acorde encima de la sílaba/letra */}
                                {showChords && transposedTokenChord && (
                                  <button
                                    onClick={() => setInspectedChord(transposedTokenChord)}
                                    className="font-mono font-black text-amber-400 sm:text-amber-300 hover:text-[#212121] bg-amber-400/10 sm:bg-transparent hover:bg-amber-400 px-1 py-0.5 rounded transition-all text-sm sm:text-base cursor-pointer self-start mb-0.5 leading-none shrink-0"
                                    title={`Ver teclas para acorde ${transposedTokenChord}`}
                                  >
                                    {transposedTokenChord}
                                  </button>
                                )}

                                {/* Segmento de Letra */}
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

      {/* 3. DEBAJO DE LAS LETRAS: Todas las opciones y herramientas del pianista */}
      <div className="bg-slate-800/95 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Icon icon="lucide:sliders-horizontal" className="w-4 h-4" />
            </div>
            <h3 className="font-black text-white text-lg tracking-wide">
              Herramientas y Controles de la Alabanza
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Ajusta la transposición, tamaño y visualización a tu gusto
          </span>
        </div>

        {/* Tarjetas informativas de Tono y Tiempo debajo de la letra */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Tono Original</span>
              <span className="text-sm font-semibold text-slate-200">Como fue grabada</span>
            </div>
            <span className="font-mono font-extrabold text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-base">
              {song.originalKey}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-amber-400/40 p-4 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs text-amber-400 block font-bold">Tono Actual</span>
              <span className="text-sm font-semibold text-slate-200">Transpuesto para piano</span>
            </div>
            <span className="font-mono font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/30 text-lg">
              {currentKey}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Tiempo y Compás</span>
              <span className="text-sm font-semibold text-slate-200">{song.timeSignature}</span>
            </div>
            <span className="font-bold text-slate-100 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-sm">
              {song.bpm} BPM
            </span>
          </div>
        </div>

        {/* Controles interactivos: Transposición, Letras y Auto-Scroll */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Transponedor */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-700 flex-wrap">
            <span className="text-xs font-bold text-slate-300 px-2">
              Cambiar Tono:
            </span>

            <button
              onClick={() => setSemitones(semitones - 1)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-colors shadow cursor-pointer"
              title="Bajar 1 semitono"
            >
              -0.5
            </button>

            <div className="px-3 text-center min-w-[70px]">
              <span className="text-[11px] text-slate-400 block font-semibold">Tono</span>
              <span className="font-mono font-black text-amber-400 text-base block">
                {currentKey}
              </span>
            </div>

            <button
              onClick={() => setSemitones(semitones + 1)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-colors shadow cursor-pointer"
              title="Subir 1 semitono"
            >
              +0.5
            </button>

            {semitones !== 0 && (
              <button
                onClick={() => setSemitones(0)}
                className="px-3 py-2 rounded-xl bg-amber-400 text-[#212121] hover:bg-amber-500 text-xs font-black transition-all ml-1 shadow cursor-pointer"
                title="Volver al tono original"
              >
                Reset ({song.originalKey})
              </button>
            )}
          </div>

          {/* Toggle Acordes */}
          <button
            onClick={() => setShowChords(!showChords)}
            className={`px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-2.5 transition-all cursor-pointer ${
              showChords
                ? 'bg-amber-400 text-[#212121] shadow-lg shadow-amber-400/20 hover:bg-amber-500'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            <Icon icon={showChords ? 'mdi:piano' : 'lucide:eye-off'} className="w-5 h-5" />
            <span>{showChords ? 'Acordes Visibles' : 'Solo Letras'}</span>
          </button>

          {/* Tamaño de Letra & Auto-Scroll */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-slate-900 rounded-2xl border border-slate-700 p-1.5">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-3 py-1.5 text-slate-200 hover:text-white font-bold text-xs cursor-pointer"
                title="Disminuir tamaño de letra"
              >
                A-
              </button>
              <span className="text-xs font-mono px-2 text-amber-400 font-bold">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="px-3 py-1.5 text-slate-200 hover:text-white font-bold text-sm cursor-pointer"
                title="Aumentar tamaño de letra"
              >
                A+
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsScrolling(!isScrolling)}
                className={`px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-2.5 transition-all cursor-pointer ${
                  isScrolling
                    ? 'bg-amber-400 text-[#212121] animate-pulse shadow-lg shadow-amber-400/30'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Icon icon={isScrolling ? 'lucide:pause' : 'lucide:play'} className="w-4 h-4" />
                <span>Auto-Scroll</span>
              </button>

              {isScrolling && (
                <button
                  onClick={() => setScrollSpeed(scrollSpeed === 3 ? 1 : scrollSpeed + 1)}
                  className="px-3 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-black text-amber-400 cursor-pointer"
                  title="Cambiar velocidad del auto-scroll"
                >
                  {scrollSpeed === 1 ? '1x' : scrollSpeed === 2 ? '2x' : '3x'}
                </button>
              )}
            </div>

            <button
              onClick={handleOpenExportModal}
              className="px-5 py-3 rounded-2xl bg-amber-400 text-[#212121] hover:bg-amber-500 font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20"
              title="Exportar como imagen blanca para imprimir o compartir"
            >
              <Icon icon="lucide:image" className="w-5 h-5" />
              <span>Exportar en Imagen (PNG)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Barra Flotante Compacta Inferior (Dock Rápido para cambiar tono/auto-scroll mientras se lee arriba) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700/90 rounded-full px-4 py-2 shadow-2xl backdrop-blur-xl flex items-center gap-3 sm:gap-4 max-w-[95vw] overflow-x-auto">
        <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          <button
            onClick={() => setSemitones(semitones - 1)}
            className="w-7 h-7 rounded-full hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer"
            title="Bajar 0.5"
          >
            -
          </button>
          <span className="font-mono font-black text-amber-400 text-xs px-1 min-w-[32px] text-center">
            {currentKey}
          </span>
          <button
            onClick={() => setSemitones(semitones + 1)}
            className="w-7 h-7 rounded-full hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer"
            title="Subir 0.5"
          >
            +
          </button>
        </div>

        <button
          onClick={() => setShowChords(!showChords)}
          className={`p-2 rounded-full transition-all cursor-pointer ${
            showChords ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
          }`}
          title={showChords ? 'Ocultar acordes' : 'Mostrar acordes'}
        >
          <Icon icon={showChords ? 'mdi:piano' : 'lucide:eye-off'} className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsScrolling(!isScrolling)}
          className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            isScrolling ? 'bg-amber-400 text-[#212121]' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <Icon icon={isScrolling ? 'lucide:pause' : 'lucide:play'} className="w-3.5 h-3.5" />
          <span>{isScrolling ? 'Scroll ON' : 'Scroll'}</span>
        </button>

        <button
          onClick={handleOpenExportModal}
          className="p-2 rounded-full bg-amber-400 text-[#212121] hover:bg-amber-500 transition-all cursor-pointer shrink-0"
          title="Exportar Imagen / WhatsApp"
        >
          <Icon icon="lucide:image" className="w-4 h-4" />
        </button>
      </div>

      {/* 5. MODAL DE EXPORTACIÓN Y VISTA PREVIA DE HOJA BLANCA */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Icon icon="lucide:image" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    Exportar Hoja de Acordes
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formato de hoja blanca limpio y optimizado para imprimir o compartir
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExporting(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Vista Previa de la Imagen */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center relative max-h-[60vh] overflow-y-auto flex flex-col items-center justify-center">
              {isGenerating ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-amber-400">
                  <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
                  <span className="font-bold text-sm">Generando hoja de acordes en alta resolución...</span>
                </div>
              ) : exportedImageUrl ? (
                <div className="space-y-3 w-full">
                  <img
                    src={exportedImageUrl}
                    alt={`Hoja de acordes para ${song.title}`}
                    className="max-h-[50vh] w-auto mx-auto rounded-xl shadow-2xl border border-slate-700 bg-white object-contain"
                  />
                  <p className="text-xs text-slate-400 italic">
                    Vista previa de la hoja generada en tono de <strong className="text-amber-400 font-mono">{currentKey}</strong> ({song.bpm} BPM)
                  </p>
                </div>
              ) : (
                <div className="py-12 text-rose-400 font-bold text-sm">
                  Error al generar la imagen. Intenta de nuevo.
                </div>
              )}
            </div>

            {/* Alerta si copió al portapapeles */}
            {copySuccess && (
              <div className="bg-amber-400/15 border border-amber-400/40 text-amber-300 px-4 py-2.5 rounded-xl text-center font-bold text-xs animate-bounce">
                {copySuccess}
              </div>
            )}

            {/* Botones de Acción */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleDownloadImage}
                disabled={isGenerating || !exportedImageUrl}
                className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-[#212121] font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-amber-400/25"
              >
                <Icon icon="lucide:download" className="w-5 h-5" />
                <span>Descargar Imagen</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                disabled={isGenerating || !exportedImageUrl}
                className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
              >
                <Icon icon="ic:baseline-whatsapp" className="w-5 h-5" />
                <span>Enviar por WhatsApp</span>
              </button>

              <button
                onClick={handleCopyImageToClipboard}
                disabled={isGenerating || !exportedImageUrl}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-slate-700"
              >
                <Icon icon="lucide:copy" className="w-4 h-4 text-amber-400" />
                <span>Copiar Imagen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
