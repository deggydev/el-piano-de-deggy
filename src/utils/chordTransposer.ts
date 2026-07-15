const KEYS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEYS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeNote(note: string, semitones: number, useFlats = false): string {
  // Normalize input note
  let index = KEYS_SHARP.indexOf(note);
  if (index === -1) {
    index = KEYS_FLAT.indexOf(note);
  }
  if (index === -1) return note; // Not recognized, return as is

  const newIndex = (index + semitones + 24 * 10) % 12;
  return useFlats ? KEYS_FLAT[newIndex] : KEYS_SHARP[newIndex];
}

export function transposeChord(chordString?: string, semitones = 0): string {
  if (!chordString || semitones === 0) return chordString || '';

  // Regex to match root note and slash bass note (e.g. "F#m7/C#" -> root: "F#", suffix: "m7", slash: "/", bass: "C#")
  const regex = /^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/;
  const match = chordString.match(regex);
  if (!match) return chordString;

  const rootNote = match[1];
  const suffix = match[2] || '';
  const slash = match[3] || '';
  const bassNote = match[4] || '';

  const transposedRoot = transposeNote(rootNote, semitones);
  const transposedBass = bassNote ? transposeNote(bassNote, semitones) : '';

  return `${transposedRoot}${suffix}${transposedBass ? '/' + transposedBass : slash}`;
}

export function getChordNotes(chordString: string): string[] {
  // Simple helper for mini-piano keyboard visualizer
  if (!chordString) return [];
  const regex = /^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/;
  const match = chordString.match(regex);
  if (!match) return [];

  const root = match[1];
  const suffix = match[2]?.toLowerCase() || '';

  let rootIndex = KEYS_SHARP.indexOf(root);
  if (rootIndex === -1) rootIndex = KEYS_FLAT.indexOf(root);
  if (rootIndex === -1) return [];

  // Determine interval profile
  let intervals = [0, 4, 7]; // Major triad
  if (suffix.includes('m') && !suffix.includes('maj')) {
    intervals = [0, 3, 7]; // Minor triad
  } else if (suffix.includes('dim')) {
    intervals = [0, 3, 6];
  } else if (suffix.includes('aug')) {
    intervals = [0, 4, 8];
  } else if (suffix.includes('sus4')) {
    intervals = [0, 5, 7];
  } else if (suffix.includes('sus2')) {
    intervals = [0, 2, 7];
  }

  return intervals.map(i => KEYS_SHARP[(rootIndex + i) % 12]);
}
