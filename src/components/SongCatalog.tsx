import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { Author, Song } from '../types/canciones';

interface SongCatalogProps {
  authors: Author[];
  onSelectSong: (song: Song, authorName: string, albumTitle: string) => void;
  searchQuery: string;
}

export const SongCatalog: React.FC<SongCatalogProps> = ({
  authors,
  onSelectSong,
  searchQuery,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string>('all');

  // Flatten songs
  const allSongs: Array<{ song: Song; authorName: string; albumTitle: string; avatarBg: string }> = [];
  authors.forEach((author) => {
    author.albums.forEach((album) => {
      album.songs.forEach((song) => {
        allSongs.push({
          song,
          authorName: author.name,
          albumTitle: album.title,
          avatarBg: author.avatarBg,
        });
      });
    });
  });

  const keys = Array.from(new Set(allSongs.map((s) => s.song.originalKey))).sort();

  const filteredSongs = allSongs.filter(({ song, authorName, albumTitle }) => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchAuthor = authorName.toLowerCase().includes(q);
      const matchAlbum = albumTitle.toLowerCase().includes(q);
      const matchTheme = song.themes.some((t) => t.toLowerCase().includes(q));
      const matchLyric = song.sections.some((sec) =>
        sec.lines.some((l) =>
          l.tokens.some((tok) => tok.lyric.toLowerCase().includes(q)) ||
          (l.rawLyric && l.rawLyric.toLowerCase().includes(q))
        )
      );
      if (!matchTitle && !matchAuthor && !matchAlbum && !matchTheme && !matchLyric) {
        return false;
      }
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all' && song.difficulty !== selectedDifficulty) {
      return false;
    }

    // Key filter
    if (selectedKey !== 'all' && song.originalKey !== selectedKey) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Icon icon="lucide:music" className="w-4 h-4" />
          <span>Repertorio Completo</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Catálogo de Alabanzas para Piano
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-1">
          Filtra por tono, dificultad del piano o busca por estrofas y coros.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Nivel Piano:
            </span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos los niveles</option>
              <option value="Fácil">Fácil</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          {/* Key Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tono Original:
            </span>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos los tonos ({keys.length})</option>
              {keys.map((k) => (
                <option key={k} value={k}>
                  Tono {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs sm:text-sm font-bold text-amber-300 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
          Mostrando {filteredSongs.length} de {allSongs.length} canciones
        </div>
      </div>

      {/* Song List */}
      {filteredSongs.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center space-y-3 shadow-lg">
          <Icon icon="lucide:search-x" className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="text-lg font-bold text-white">No se encontraron alabanzas</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Intenta buscar con otros términos o cambia los filtros seleccionados de tono y nivel de dificultad.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSongs.map(({ song, authorName, albumTitle, avatarBg }) => (
            <div
              key={song.id}
              onClick={() => onSelectSong(song, authorName, albumTitle)}
              className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 flex flex-col justify-between shadow-md"
            >
              <div className={`w-full h-1.5 rounded-full ${avatarBg} mb-4 opacity-75 group-hover:opacity-100 transition-opacity`} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 flex items-center gap-1">
                    <Icon icon="mdi:piano" className="w-3.5 h-3.5" />
                    <span>Tono: {song.originalKey}</span>
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      song.difficulty === 'Fácil'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : song.difficulty === 'Intermedio'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {song.difficulty}
                  </span>
                </div>

                <h4 className="font-extrabold text-white text-lg group-hover:text-amber-300 transition-colors break-words leading-snug">
                  {song.title}
                </h4>
                <p className="text-xs text-slate-300 font-semibold mt-1 break-words">
                  {authorName} • <span className="text-slate-400">{albumTitle}</span>
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {song.themes.map((theme, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-300"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-2 text-slate-400">
                  <span>{song.bpm} BPM</span>
                  <span>•</span>
                  <span>{song.timeSignature}</span>
                </span>
                <span className="text-amber-400 group-hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-all">
                  <span>Abrir Acordes</span>
                  <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
