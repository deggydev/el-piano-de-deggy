// Web Audio API Polyphonic Piano Synthesizer for El Piano de Deggy
// Synthesizes warm acoustic piano tones using layered oscillators, exponential decay, and subtle harmonics.

const NOTE_FREQUENCIES: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'Db2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'Gb2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'Ab2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a single acoustic-style piano note with harmonics and decay.
 * @param noteName Name of the note with octave (e.g. 'C4', 'E4', 'G4') or without octave (will default to octave 4)
 * @param startTimeOffset Time in seconds from audio context current time
 * @param duration Duration in seconds before full decay
 */
export function playNote(noteName: string, startTimeOffset = 0, duration = 2.0): void {
  try {
    const ctx = getAudioContext();
    const formattedNote = /^[A-G][b#]?\d$/.test(noteName) ? noteName : `${noteName}4`;
    const freq = NOTE_FREQUENCIES[formattedNote] || NOTE_FREQUENCIES['C4'];

    const now = ctx.currentTime + startTimeOffset;

    // Master gain node for this note
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.015); // Fast attack like a piano hammer
    masterGain.gain.exponentialRampToValueAtTime(0.08, now + 0.4); // Initial decay after hammer strike
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Long tail sustain decay

    // Fundamental oscillator (Triangle gives warm piano body)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.connect(masterGain);

    // 2nd Harmonic (Sine slightly detuned for acoustic warmth/richness)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.001, now);
    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.6));
    osc2.connect(gain2);
    gain2.connect(masterGain);

    // 3rd Harmonic (Subtle brightness of piano strings)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3.002, now);
    gain3.gain.setValueAtTime(0.06, now);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.3));
    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
    osc3.stop(now + duration + 0.1);
  } catch (err) {
    console.error('AudioContext error:', err);
  }
}

/**
 * Plays a chord (simultaneously or as an arpeggio)
 * @param notes Array of note names (e.g., ['C', 'E', 'G'])
 * @param arpeggio If true, plays note by note with a slight delay
 * @param baseOctave Octave for root note (default 4)
 */
export function playChord(notes: string[], arpeggio = false, baseOctave = 4): void {
  if (!notes || notes.length === 0) return;

  const CHROMATIC = ['C', 'C#', 'Db', 'D', 'Eb', 'D#', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'G#', 'A', 'Bb', 'A#', 'B'];

  let currentOctave = baseOctave;
  let lastValue = -1;

  notes.forEach((note, idx) => {
    let noteValue = CHROMATIC.indexOf(note);
    if (noteValue === -1) noteValue = 0;

    // If note is lower in pitch than the previous note in the voicing, move to next octave
    if (idx > 0 && noteValue <= lastValue) {
      currentOctave += 1;
    }
    lastValue = noteValue;

    const fullNoteName = `${note}${currentOctave}`;
    const delay = arpeggio ? idx * 0.15 : 0;
    playNote(fullNoteName, delay, arpeggio ? 2.5 : 2.2);
  });
}
