import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { Author, Album, Song } from '../types/canciones';

interface AuthorExplorerProps {
  authors: Author[];
  onSelectSong: (song: Song, authorName: string, albumTitle: string) => void;
  initialAuthor?: Author | null;
}

export const AuthorExplorer: React.FC<AuthorExplorerProps> = ({
  authors,
  onSelectSong,
  initialAuthor,
}) => {
  const [selectedAuthor, setSelectedAuthor] = useState<Author>(
    initialAuthor || authors[0] || null
  );
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(
    initialAuthor ? initialAuthor.albums[0] : authors[0]?.albums[0] || null
  );

  // When changing author, default to their first album
  const handleSelectAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setSelectedAlbum(author.albums[0] || null);
  };

  if (!selectedAuthor) {
    return <div className="p-8 text-center text-slate-400">No hay autores disponibles.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Icon icon="lucide:disc" className="w-4 h-4" />
          <span>Colección de Adoración y Alabanza</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Salmistas y Volúmenes Musicales
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-1">
          Cada ministerio agrupa sus alabanzas por producciones y álbumes. Explora sus repertorios y acordes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Author Selection Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 px-1">
            Seleccionar Salmista ({authors.length})
          </h3>

          <div className="space-y-2.5">
            {authors.map((author) => {
              const isSelected = selectedAuthor.id === author.id;
              const totalSongs = author.albums.reduce((s, a) => s + a.songs.length, 0);

              return (
                <button
                  key={author.id}
                  onClick={() => handleSelectAuthor(author)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group ${
                    isSelected
                      ? 'bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/20 text-[#212121]'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl ${author.avatarBg} p-0.5 shrink-0 flex items-center justify-center font-extrabold text-white shadow-md`}
                    >
                      <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                        {author.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className={`font-bold text-base truncate flex items-center gap-2 ${isSelected ? 'text-[#212121]' : 'text-white'}`}>
                        <span>{author.name}</span>
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${isSelected ? 'text-[#212121]/80 font-medium' : 'text-slate-300'}`}>
                        {author.subtitle}
                      </div>
                      <div className={`text-[11px] font-semibold mt-1 ${isSelected ? 'text-[#212121]' : 'text-amber-400'}`}>
                        {author.albums.length} {author.albums.length === 1 ? 'volumen' : 'volúmenes'} • {totalSongs} alabanzas
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#212121] text-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Volumes / Albums and Songs (8 cols) */}
        <div className="lg:col-span-8 space-y-8 bg-slate-800/95 border border-slate-700 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          {/* Selected Author Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-700">
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${selectedAuthor.avatarBg} p-0.5 shadow-xl shrink-0 flex items-center justify-center font-black text-white text-3xl`}
              >
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  {selectedAuthor.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedAuthor.name}
                </h3>
                <p className="text-amber-400 font-semibold text-sm sm:text-base mt-0.5">
                  {selectedAuthor.subtitle}
                </p>
                <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl">
                  {selectedAuthor.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Volumes / Albums Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Volúmenes del Salmista ({selectedAuthor.albums.length})
              </h4>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedAuthor.albums.map((album) => {
                const isAlbumSelected = selectedAlbum?.id === album.id;
                return (
                  <button
                    key={album.id}
                    onClick={() => setSelectedAlbum(album)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 ${
                      isAlbumSelected
                        ? 'bg-amber-400 text-[#212121] shadow-lg shadow-amber-400/30'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Icon icon="lucide:disc" className={`w-4 h-4 ${isAlbumSelected ? 'text-[#212121]' : 'text-amber-400'}`} />
                    <span>{album.title}</span>
                    <span className="text-xs font-normal opacity-80">({album.year})</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${isAlbumSelected ? 'bg-[#212121] text-amber-400' : 'bg-black/40 text-slate-300'}`}>
                      {album.songs.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tracklist of Selected Album */}
          {selectedAlbum && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    <Icon icon="lucide:list-music" className="w-5 h-5 text-amber-400" />
                    <span>Repertorio de {selectedAlbum.title}</span>
                  </h4>
                  {selectedAlbum.description && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      {selectedAlbum.description}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-amber-300 border border-slate-700">
                  {selectedAlbum.songs.length} Alabanzas
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedAlbum.songs.map((song, idx) => (
                  <div
                    key={song.id}
                    onClick={() => onSelectSong(song, selectedAuthor.name, selectedAlbum.title)}
                    className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-amber-400/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-lg w-full overflow-hidden"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 w-full sm:w-auto flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-sm shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1 w-full">
                        <h5 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors break-words leading-snug">
                          {song.title}
                        </h5>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {song.themes.map((theme, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              #{theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800 sm:border-none shrink-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 flex items-center gap-1">
                          <Icon icon="mdi:piano" className="w-3.5 h-3.5" />
                          <span>Tono: {song.originalKey}</span>
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                          {song.bpm} BPM
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                          {song.timeSignature}
                        </span>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-amber-400/20 group-hover:bg-amber-400 text-amber-300 group-hover:text-[#212121] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 ml-auto sm:ml-0">
                        <span>Ver Acordes</span>
                        <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
