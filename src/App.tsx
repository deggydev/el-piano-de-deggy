import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { Author, Song } from './types/canciones';
import cancionesDataRaw from './data/canciones.json';
import { Header } from './components/Header';
import { Portada } from './components/Portada';
import { AuthorExplorer } from './components/AuthorExplorer';
import { SongCatalog } from './components/SongCatalog';
import { PianoChordGuide } from './components/PianoChordGuide';
import { SongViewer } from './components/SongViewer';

const autores: Author[] = cancionesDataRaw as Author[];

export function App() {
  const [activeTab, setActiveTab] = useState<'portada' | 'autores' | 'catalogo' | 'acordes'>('portada');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State when viewing a specific song
  const [activeSongInfo, setActiveSongInfo] = useState<{
    song: Song;
    authorName: string;
    albumTitle: string;
  } | null>(null);

  // State when drilling down into an author from Portada
  const [initialSelectedAuthor, setInitialSelectedAuthor] = useState<Author | null>(null);

  const handleSelectSong = (song: Song, authorName: string, albumTitle: string) => {
    setActiveSongInfo({ song, authorName, albumTitle });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthorFromPortada = (author: Author) => {
    setInitialSelectedAuthor(author);
    setActiveTab('autores');
    setActiveSongInfo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: 'portada' | 'autores' | 'catalogo' | 'acordes') => {
    setActiveTab(tab);
    setActiveSongInfo(null);
    if (tab !== 'autores') {
      setInitialSelectedAuthor(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q && activeTab === 'portada') {
            setActiveTab('catalogo');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeSongInfo ? (
          <SongViewer
            song={activeSongInfo.song}
            authorName={activeSongInfo.authorName}
            albumTitle={activeSongInfo.albumTitle}
            onBack={() => setActiveSongInfo(null)}
          />
        ) : (
          <>
            {activeTab === 'portada' && (
              <Portada
                authors={autores}
                onSelectSong={handleSelectSong}
                onSelectAuthor={handleSelectAuthorFromPortada}
                onNavigateToTab={handleTabChange}
              />
            )}

            {activeTab === 'autores' && (
              <AuthorExplorer
                authors={autores}
                onSelectSong={handleSelectSong}
                initialAuthor={initialSelectedAuthor}
              />
            )}

            {activeTab === 'catalogo' && (
              <SongCatalog
                authors={autores}
                onSelectSong={handleSelectSong}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'acordes' && (
              <PianoChordGuide />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Icon icon="mdi:piano" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">El Piano de Deggy</h4>
              <p className="text-xs text-slate-400">Cancionero de Alabanzas Cristianas para Piano</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>Hecho con excelencia para adoradores, salmistas y ministerios de alabanza.</p>
            <p className="text-slate-500">
              © {new Date().getFullYear()} El Piano de Deggy • Todos los derechos reservados.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Soli Deo Gloria
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
