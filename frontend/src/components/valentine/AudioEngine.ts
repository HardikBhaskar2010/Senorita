// Cosmic Kiss Symphony - Audio Engine
// Web Audio API system for generating musical notes

export type Instrument = 'violin' | 'piano' | 'harp';
export type Note = 'C4' | 'D4' | 'E4' | 'G4' | 'A4' | 'C5' | 'D5' | 'E5' | 'G5' | 'A5';

// Pentatonic scale frequencies (sounds good together no matter what)
const noteFrequencies: Record<Note, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.00,
};

// Map Y position (0-100) to notes
export const mapYToNote = (y: number): Note => {
  const notes: Note[] = ['A5', 'G5', 'E5', 'D5', 'C5', 'A4', 'G4', 'E4', 'D4', 'C4'];
  const index = Math.floor((y / 100) * notes.length);
  return notes[Math.min(index, notes.length - 1)];
};

// Map Y position to instrument
export const mapYToInstrument = (y: number): Instrument => {
  if (y < 33.33) return 'violin';
  if (y < 66.66) return 'piano';
  return 'harp';
};

class AudioEngineClass {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Master volume
    }
  }

  playNote(note: Note, instrument: Instrument, duration: number = 0.5) {
    if (!this.audioContext || !this.masterGain) {
      this.initialize();
    }

    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Set waveform based on instrument
    switch (instrument) {
      case 'violin':
        oscillator.type = 'sawtooth'; // Bright, stringy
        break;
      case 'piano':
        oscillator.type = 'triangle'; // Clear, balanced
        break;
      case 'harp':
        oscillator.type = 'sine'; // Pure, soft
        break;
    }

    oscillator.frequency.value = noteFrequencies[note];
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    // ADSR envelope (Attack, Decay, Sustain, Release)
    const attack = instrument === 'harp' ? 0.02 : instrument === 'violin' ? 0.05 : 0.01;
    const decay = 0.1;
    const sustain = 0.6;
    const release = instrument === 'harp' ? 0.5 : instrument === 'violin' ? 0.3 : 0.2;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain * 0.3, now + attack + decay);
    gainNode.gain.setValueAtTime(sustain * 0.3, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    // Cleanup
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  // Play a sequence of notes (for constellation playback)
  playSequence(notes: Array<{ note: Note; instrument: Instrument }>, tempo: number = 500) {
    notes.forEach((noteData, index) => {
      setTimeout(() => {
        this.playNote(noteData.note, noteData.instrument, 0.6);
      }, index * tempo);
    });
  }

  // Stop all sounds
  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

// Singleton instance
export const AudioEngine = new AudioEngineClass();
