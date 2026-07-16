import type { Song } from '../types/canciones';
import { transposeChord } from './chordTransposer';

export interface ExportSongOptions {
  song: Song;
  authorName: string;
  albumTitle: string;
  semitones: number;
  currentKey: string;
  showChords: boolean;
}

interface WrappedToken {
  chord: string | null;
  lyric: string;
  x: number;
  width: number;
}

interface WrappedLine {
  tokens: WrappedToken[];
  hasChords: boolean;
}

interface PrecomputedSection {
  title: string;
  type: string;
  wrappedLines: WrappedLine[];
  cardHeight: number;
}

/**
 * Genera una imagen PNG en alta definición (1080x1920+ formato móvil vertical 9:16)
 * con fondo blanco, sin gradientes, con envoltura de texto en títulos largos y
 * las secciones en formato de tarjetas con letra grande y clara.
 */
export async function generateSongSheetImage({
  song,
  authorName,
  albumTitle,
  semitones,
  currentKey,
  showChords,
}: ExportSongOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  const width = 1080; // Mobile Full HD Story width (ratio 9:16)
  const marginX = 60;
  const cardWidth = width - marginX * 2; // 960px
  const cardPadX = 36;
  const cardPadY = 36;
  const maxTextRight = marginX + cardWidth - cardPadX; // Límite derecho para word wrap

  // Pre-configurar fuentes temporales para medir con exactitud
  const chordFont = 'bold 28px monospace, sans-serif';
  const lyricFont = '600 32px sans-serif, system-ui, -apple-system';
  const titleFont = '900 46px sans-serif, system-ui, -apple-system';

  // 1. PRE-CALCULAR WRAPPING DEL TÍTULO PRINCIPAL (para que nunca se salga por la derecha)
  ctx.font = titleFont;
  const titleWords = song.title.split(' ');
  const titleLines: string[] = [];
  let currentTitleLine = '';
  for (const word of titleWords) {
    const testLine = currentTitleLine ? `${currentTitleLine} ${word}` : word;
    if (ctx.measureText(testLine).width > cardWidth && currentTitleLine) {
      titleLines.push(currentTitleLine);
      currentTitleLine = word;
    } else {
      currentTitleLine = testLine;
    }
  }
  if (currentTitleLine) {
    titleLines.push(currentTitleLine);
  }

  // 2. PRE-CALCULAR SECCIONES Y WORD WRAP DE TOKENS
  const precomputedSections: PrecomputedSection[] = [];
  let totalLayoutY = 80; // Top margin

  // Altura dinámica del encabezado
  totalLayoutY += titleLines.length * 54; // Líneas de título envueltas
  totalLayoutY += 46; // Autor/Álbum
  totalLayoutY += 44; // Tono y Ritmo en texto simple
  totalLayoutY += 45; // Línea divisoria y espaciado

  for (const section of song.sections) {
    const wrappedLines: WrappedLine[] = [];

    for (const line of section.lines) {
      let currentLineTokens: WrappedToken[] = [];
      let currentX = marginX + cardPadX;

      for (const token of line.tokens) {
        const transposedChord = token.chord
          ? transposeChord(token.chord, semitones)
          : null;

        ctx.font = chordFont;
        const chordWidth = transposedChord ? ctx.measureText(transposedChord).width : 0;

        ctx.font = lyricFont;
        const lyricWidth = ctx.measureText(token.lyric).width;

        const tokenAdvance = Math.max(chordWidth, lyricWidth) + 10;

        // Si la palabra/acorde supera el margen derecho de la tarjeta y ya hay tokens en la línea,
        // hacemos SALTO DE LÍNEA VISUAL (Word Wrap) para mantener todo ordenado
        if (currentX + tokenAdvance > maxTextRight && currentLineTokens.length > 0) {
          const hasCh = showChords && currentLineTokens.some((t) => !!t.chord);
          wrappedLines.push({ tokens: currentLineTokens, hasChords: hasCh });
          currentLineTokens = [];
          currentX = marginX + cardPadX;
        }

        currentLineTokens.push({
          chord: transposedChord,
          lyric: token.lyric,
          x: currentX,
          width: tokenAdvance,
        });

        currentX += tokenAdvance;
      }

      if (currentLineTokens.length > 0) {
        const hasCh = showChords && currentLineTokens.some((t) => !!t.chord);
        wrappedLines.push({ tokens: currentLineTokens, hasChords: hasCh });
      }
    }

    // Calcular la altura que requerirá esta tarjeta
    const badgeHeight = 38;
    const badgeSpacingAfter = 22;
    let contentLinesHeight = 0;
    for (const wl of wrappedLines) {
      contentLinesHeight += wl.hasChords ? 95 : 52;
    }

    const cardHeight = cardPadY + badgeHeight + badgeSpacingAfter + contentLinesHeight + cardPadY - 10;
    precomputedSections.push({
      title: section.title,
      type: section.type,
      wrappedLines,
      cardHeight,
    });

    totalLayoutY += cardHeight + 32; // Espacio entre tarjetas
  }

  totalLayoutY += 120; // Footer margin & watermark
  // Formato móvil vertical (mínimo 1920px de alto para proporción 9:16 de celular)
  const totalHeight = Math.max(1920, totalLayoutY);

  // Asignar dimensiones definitivas al Canvas
  canvas.width = width;
  canvas.height = totalHeight;

  // 3. PINTAR FONDO BLANCO PURO
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, totalHeight);

  // Franja decorativa superior en color azul sólido plano (sin gradientes)
  ctx.fillStyle = '#1E293B'; // Slate 800 (azul marino puro de la interfaz)
  ctx.fillRect(0, 0, width, 14);

  let cursorY = 80;

  // 4. PINTAR ENCABEZADO (Título envuelto, Salmista y Tono como texto simple)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Título principal (puede ser varias líneas si es muy largo)
  ctx.fillStyle = '#111827'; // Gray 900
  ctx.font = titleFont;
  for (const tLine of titleLines) {
    ctx.fillText(tLine, marginX, cursorY);
    cursorY += 54;
  }
  cursorY += 8;

  // Salmista y Álbum
  ctx.fillStyle = '#4B5563'; // Gray 600
  ctx.font = '600 26px sans-serif, system-ui, -apple-system';
  ctx.fillText(`${authorName} — ${albumTitle}`, marginX, cursorY);
  cursorY += 46;

  // Tono y Ritmo impresos como texto limpio y elegante (similar al subtítulo, sin cuadritos)
  ctx.fillStyle = '#1F2937'; // Gray 800
  ctx.font = 'bold 24px sans-serif, system-ui, -apple-system';
  ctx.fillText(`Tono Transpuesto: ${currentKey}     •     Ritmo: ${song.bpm} BPM`, marginX, cursorY);
  cursorY += 46;

  // Línea divisoria elegante
  ctx.strokeStyle = '#E5E7EB'; // Gray 200
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(width - marginX, cursorY);
  ctx.stroke();
  cursorY += 35;

  // 5. PINTAR TARJETAS DE SECCIÓN CON TEXTO GRANDE Y WRAPPING
  for (const pSec of precomputedSections) {
    const isCoro = pSec.type === 'coro';
    const isPuente = pSec.type === 'puente';

    // Fondo de la tarjeta (recuadro redondeado suave, claro y profesional)
    ctx.fillStyle = isCoro ? '#FEFCE8' : isPuente ? '#F0FDFA' : '#F8FAFC'; // Yellow 50 / Teal 50 / Slate 50
    ctx.strokeStyle = isCoro ? '#FDE047' : isPuente ? '#99F6E4' : '#CBD5E1'; // Yellow 300 / Teal 300 / Slate 300
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(marginX, cursorY, cardWidth, pSec.cardHeight, 26);
    ctx.fill();
    ctx.stroke();

    // Píldora / Badge del Título de Sección (Estrofa / Coro)
    let cardCursorY = cursorY + cardPadY;
    ctx.font = 'bold 17px sans-serif, system-ui';
    const badgeText = pSec.title.toUpperCase();
    const badgeW = ctx.measureText(badgeText).width + 36;
    const badgeH = 36;

    ctx.fillStyle = isCoro ? '#FEF3C7' : isPuente ? '#CCFBF1' : '#F1F5F9';
    ctx.strokeStyle = isCoro ? '#F59E0B' : isPuente ? '#14B8A6' : '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(marginX + cardPadX, cardCursorY, badgeW, badgeH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isCoro ? '#92400E' : isPuente ? '#0F766E' : '#334155';
    ctx.fillText(badgeText, marginX + cardPadX + 18, cardCursorY + 9);
    cardCursorY += badgeH + 22;

    // Líneas con los acordes en ámbar/marrón encima de sus letras (Word Wrap activo)
    for (const wl of pSec.wrappedLines) {
      for (const token of wl.tokens) {
        // Pintar acorde arriba si existe
        if (showChords && token.chord) {
          ctx.font = chordFont;
          ctx.fillStyle = '#B45309'; // Ámbar oscuro/marrón de alto contraste
          ctx.fillText(token.chord, token.x, cardCursorY);
        }

        // Pintar sílaba / letra abajo
        ctx.font = lyricFont;
        ctx.fillStyle = '#1F2937'; // Gris carbón/negro nítido
        const lyricY = wl.hasChords ? cardCursorY + 36 : cardCursorY;
        ctx.fillText(token.lyric, token.x, lyricY);
      }

      cardCursorY += wl.hasChords ? 95 : 52;
    }

    cursorY += pSec.cardHeight + 32; // Siguiente tarjeta
  }

  // 6. PINTAR PIE DE PÁGINA Y MARCA DE AGUA
  const footerY = totalHeight - 75;
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginX, footerY - 25);
  ctx.lineTo(width - marginX, footerY - 25);
  ctx.stroke();

  ctx.fillStyle = '#4B5563'; // Gray 600
  ctx.font = 'bold 18px sans-serif, system-ui';
  ctx.fillText(
    '🎹 El Piano de Deggy • Acordes y Alabanzas para la Gloria de Dios',
    marginX,
    footerY
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#9CA3AF'; // Gray 400
  ctx.font = 'italic 16px sans-serif, system-ui';
  ctx.fillText('elpianodedeggy.com • Cancionero Oficial', width - marginX, footerY);

  return canvas.toDataURL('image/png');
}
