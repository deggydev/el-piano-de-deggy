import React from 'react';
import { Icon } from '@iconify/react';
import type { Author, Song } from '../types/canciones';

interface PortadaProps {
  authors: Author[];
  onSelectSong: (song: Song, authorName: string, albumTitle: string) => void;
  onSelectAuthor: (author: Author) => void;
  onNavigateToTab: (tab: 'autores' | 'catalogo' | 'acordes') => void;
}

export const Portada: React.FC<PortadaProps> = ({
  authors,
  onSelectSong,
  onSelectAuthor,
  onNavigateToTab,
}) => {
  // Collect all songs with author info for featured highlights
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

  const featuredSongs = allSongs.slice(0, 6);

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-semibold shadow-lg">
            <Icon icon="lucide:sparkles" className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Adoración Viva • Acordes para Piano de Alabanzas Cristianas</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white space-y-2 sm:space-y-3">
            <span className="block">Elevando Alabanzas en</span>
            <span className="block text-purple-400">
              El Piano de Deggy
            </span>
          </h1>

          {/* Description Quote / Salmo */}
          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-xl font-normal leading-relaxed">
            Un cancionero intuitivo diseñado para tecladistas, salmistas y ministerios de alabanza. 
            Explora por autores, volúmenes y canciones con transposición automática de acordes y lectura sin interrupciones.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigateToTab('autores')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <Icon icon="lucide:users" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Explorar Salmistas y Volúmenes</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateToTab('catalogo')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
            >
              <Icon icon="lucide:music-2" className="w-5 h-5 text-purple-400" />
              <span>Ver Catálogo de Alabanzas</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center transform hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 text-purple-400">
                <Icon icon="lucide:users" className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{authors.length}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Salmistas y Autores</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center transform hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                <Icon icon="lucide:disc" className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {authors.reduce((acc, a) => acc + a.albums.length, 0)}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Volúmenes / Álbumes</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center transform hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Icon icon="lucide:music" className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {allSongs.length}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Alabanzas con Acordes</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center transform hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3 text-teal-400">
                <Icon icon="mdi:piano" className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Transposición Rápida</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Authors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Icon icon="lucide:award" className="w-4 h-4" />
              <span>Ministerios de Adoración</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Salmistas y sus Volúmenes
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Selecciona un autor para explorar todas sus producciones y repertorio de piano.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('autores')}
            className="self-start sm:self-auto text-sm font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-colors group"
          >
            <span>Ver todos los salmistas</span>
            <Icon icon="lucide:chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map((author) => (
            <div
              key={author.id}
              onClick={() => onSelectAuthor(author)}
              className="group relative bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-900/30 flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${author.avatarBg} p-0.5 shadow-lg flex items-center justify-center text-white font-black text-2xl`}>
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                      {author.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {author.albums.length} {author.albums.length === 1 ? 'volumen' : 'volúmenes'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {author.name}
                </h3>
                <p className="text-xs text-purple-400 font-semibold mt-1">
                  {author.subtitle}
                </p>
                <p className="text-slate-400 text-xs mt-3 line-clamp-3 leading-relaxed">
                  {author.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span className="flex items-center gap-1.5">
                  <Icon icon="lucide:disc" className="w-4 h-4 text-purple-400" />
                  <span>{author.albums.reduce((s, a) => s + a.songs.length, 0)} canciones</span>
                </span>
                <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Explorar</span>
                  <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Songs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Icon icon="lucide:flame" className="w-4 h-4" />
              <span>Acordes Recomendados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Alabanzas Destacadas
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Haz clic para abrir el visor de acordes, transponer o reproducir el auto-scroll.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('catalogo')}
            className="self-start sm:self-auto text-sm font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-colors group"
          >
            <span>Ver todas las canciones</span>
            <Icon icon="lucide:chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredSongs.map(({ song, authorName, albumTitle, avatarBg }) => (
            <div
              key={song.id}
              onClick={() => onSelectSong(song, authorName, albumTitle)}
              className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-xl ${avatarBg} p-0.5 shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                    <Icon icon="mdi:piano" className="w-6 h-6 text-purple-300 group-hover:text-white" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-white text-base truncate group-hover:text-purple-300 transition-colors">
                    {song.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    {authorName} • <span className="text-slate-500">{albumTitle}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                      Tono: {song.originalKey}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {song.difficulty}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {song.timeSignature}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-purple-600/20 border border-slate-700 group-hover:border-purple-500/50 flex items-center justify-center text-slate-400 group-hover:text-purple-300 shrink-0 transition-all">
                <Icon icon="lucide:arrow-up-right" className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Worship Guidance / Salmo Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-900 p-8 sm:p-12 text-center shadow-2xl">
          <Icon icon="lucide:quote" className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
          <blockquote className="text-xl sm:text-2xl font-serif italic text-slate-200 max-w-3xl mx-auto leading-relaxed">
            &ldquo;Aclamen al Señor con arpa; cántenle alabanzas con salterio de diez cuerdas. 
            Cántele cántico nuevo; háganlo bien, tocando con júbilo.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-bold tracking-widest uppercase text-purple-300">
            Salmos 33:2-3
          </p>
        </div>
      </section>
    </div>
  );
};
