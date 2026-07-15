import React from 'react';
import { Icon } from '@iconify/react';

interface HeaderProps {
  activeTab: 'portada' | 'autores' | 'catalogo' | 'acordes';
  setActiveTab: (tab: 'portada' | 'autores' | 'catalogo' | 'acordes') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-700/60 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('portada')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400 p-[2px] shadow-lg shadow-amber-400/20 group-hover:shadow-amber-400/40 transition-all duration-300 transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-800 rounded-[14px] flex items-center justify-center">
              <Icon icon="mdi:piano" className="w-7 h-7 text-amber-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                El Piano de Deggy
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 tracking-wider uppercase">
                Alabanza
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Cancionero de Acordes para Piano
            </p>
          </div>
        </div>

        {/* Search Bar (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon icon="lucide:search" className="w-4 h-4 text-amber-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por canción, salmista, álbum o letra..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <Icon icon="lucide:x-circle" className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('portada')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'portada'
                ? 'bg-amber-400 text-[#212121] font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Icon icon="lucide:home" className="w-4 h-4" />
            <span>Portada</span>
          </button>

          <button
            onClick={() => setActiveTab('autores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'autores'
                ? 'bg-amber-400 text-[#212121] font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Icon icon="lucide:users" className="w-4 h-4" />
            <span>Salmistas y Volúmenes</span>
          </button>

          <button
            onClick={() => setActiveTab('catalogo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'catalogo'
                ? 'bg-amber-400 text-[#212121] font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Icon icon="lucide:music" className="w-4 h-4" />
            <span>Todas las Canciones</span>
          </button>

          <button
            onClick={() => setActiveTab('acordes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'acordes'
                ? 'bg-amber-400 text-[#212121] font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Icon icon="lucide:book-open" className="w-4 h-4" />
            <span>Guía de Piano</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white focus:outline-none"
          aria-label="Abrir menú"
        >
          <Icon
            icon={mobileMenuOpen ? 'lucide:x' : 'lucide:menu'}
            className="w-6 h-6 text-amber-400"
          />
        </button>
      </div>

      {/* Mobile Search Bar & Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-700 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon icon="lucide:search" className="w-4 h-4 text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por canción, salmista o letra..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
              >
                <Icon icon="lucide:x-circle" className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab('portada');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === 'portada'
                  ? 'bg-amber-400 text-[#212121] font-bold'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <Icon icon="lucide:home" className="w-5 h-5 text-amber-400" />
              <span>Portada</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('autores');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === 'autores'
                  ? 'bg-amber-400 text-[#212121] font-bold'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <Icon icon="lucide:users" className="w-5 h-5 text-amber-400" />
              <span>Salmistas</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('catalogo');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === 'catalogo'
                  ? 'bg-amber-400 text-[#212121] font-bold'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <Icon icon="lucide:music" className="w-5 h-5 text-amber-400" />
              <span>Canciones</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('acordes');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold ${
                activeTab === 'acordes'
                  ? 'bg-amber-400 text-[#212121] font-bold'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <Icon icon="lucide:book-open" className="w-5 h-5 text-amber-400" />
              <span>Guía Piano</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
