export interface ChordToken {
  chord?: string;
  lyric: string;
}

export interface SongLine {
  tokens: ChordToken[];
  rawChord?: string;
  rawLyric?: string;
}

export interface SongSection {
  title: string;
  type: 'estrofa' | 'coro' | 'puente' | 'pre-coro' | 'intro' | 'outro';
  lines: SongLine[];
}

export interface Song {
  id: string;
  title: string;
  originalKey: string;
  bpm: number;
  timeSignature: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  themes: string[];
  sections: SongSection[];
}

export interface Album {
  id: string;
  title: string;
  year: number;
  coverGradient: string;
  description?: string;
  songs: Song[];
}

export interface Author {
  id: string;
  name: string;
  subtitle: string;
  bio: string;
  avatarBg: string;
  albums: Album[];
}
