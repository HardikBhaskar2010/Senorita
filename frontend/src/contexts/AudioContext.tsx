import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSfx: (type: 'hug' | 'kiss' | 'notification' | 'pop') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// ── Generative Ambient Music Engine ──────────────────────────────────────────
// Creates a soft romantic lo-fi ambient soundscape using Web Audio API only.
// No files needed. Uses oscillators, filters, LFO modulation & sparkle notes.

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private sparkleTimer: ReturnType<typeof setInterval> | null = null;

  // Romantic lo-fi chord in A minor (Am - F - C - G)
  private readonly chordSets = [
    [220, 261.63, 329.63, 440],   // Am: A3 C4 E4 A4
    [174.61, 261.63, 349.23, 523.25], // F:  F3 C4 F4 C5
    [130.81, 261.63, 329.63, 392], // C:  C3 C4 E4 G4
    [196, 246.94, 392, 493.88],   // G:  G3 B3 G4 B4
  ];
  private chordIndex = 0;

  init() {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime); // starts silent
    this.masterGain.connect(this.ctx.destination);
    this.buildLayers();
  }

  private buildLayers() {
    if (!this.ctx || !this.masterGain) return;

    // Low-pass filter for warmth
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(1200, this.ctx.currentTime);
    lpf.Q.setValueAtTime(0.5, this.ctx.currentTime);
    lpf.connect(this.masterGain);
    this.nodes.push(lpf);

    // ── 1. Drone bass pad (very soft sub) ──
    const droneFreqs = [55, 110]; // A1, A2
    droneFreqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      g.gain.setValueAtTime(0.025 - i * 0.008, this.ctx!.currentTime);
      osc.connect(g);
      g.connect(lpf);
      osc.start();
      this.nodes.push(osc, g);
    });

    // ── 2. Chord pad layer (triangle waves, very quiet) ──
    this.playChordPad(lpf);

    // ── 3. LFO tremolo on a warm pad ──
    this.addTremoloLayer(lpf);

    // ── 4. Soft noise breath ──
    this.addNoise(lpf);

    // ── 5. Chord progression every 8s ──
    setInterval(() => {
      this.chordIndex = (this.chordIndex + 1) % this.chordSets.length;
    }, 8000);

    // ── 6. Random sparkle notes ──
    this.sparkleTimer = setInterval(() => {
      if (this.ctx && this.masterGain) this.playSparkle(lpf);
    }, 3000 + Math.random() * 4000);
  }

  private playChordPad(dest: AudioNode) {
    if (!this.ctx) return;
    const chord = this.chordSets[this.chordIndex];
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      // Gentle detune for warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx!.currentTime);
      g.gain.setValueAtTime(0, this.ctx!.currentTime);
      g.gain.linearRampToValueAtTime(0.012, this.ctx!.currentTime + 2);
      osc.connect(g);
      g.connect(dest);
      osc.start();
      this.nodes.push(osc, g);
    });
  }

  private addTremoloLayer(dest: AudioNode) {
    if (!this.ctx) return;
    // A warm oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, this.ctx.currentTime); // E4
    oscGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start();

    // LFO for tremolo
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.6, this.ctx.currentTime); // slow wobble
    lfoGain.gain.setValueAtTime(0.008, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscGain.gain);
    lfo.start();

    this.nodes.push(osc, oscGain, lfo, lfoGain);
  }

  private addNoise(dest: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.001; // whisper-quiet noise
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // High-pass to make it a soft hiss/breath
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'bandpass';
    hpf.frequency.setValueAtTime(800, this.ctx.currentTime);
    hpf.Q.setValueAtTime(0.3, this.ctx.currentTime);

    source.connect(hpf);
    hpf.connect(dest);
    source.start();
    this.nodes.push(source, hpf);
  }

  private playSparkle(dest: AudioNode) {
    if (!this.ctx) return;
    // Pick a note from current chord + upper octave
    const chord = this.chordSets[this.chordIndex];
    const freq = chord[Math.floor(Math.random() * chord.length)] * 2;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.012, this.ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
    osc.connect(g);
    g.connect(dest);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 1.5);
  }

  fadeIn() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 2.5);
  }

  fadeOut() {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
  }

  playSfx(type: string) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const sfxCtx = new Ctor();
    const osc = sfxCtx.createOscillator();
    const gain = sfxCtx.createGain();
    osc.connect(gain);
    gain.connect(sfxCtx.destination);

    if (type === 'hug') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, sfxCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, sfxCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, sfxCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sfxCtx.currentTime + 0.4);
      osc.start(); osc.stop(sfxCtx.currentTime + 0.4);
    } else if (type === 'kiss') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, sfxCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, sfxCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.07, sfxCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, sfxCtx.currentTime + 0.25);
      osc.start(); osc.stop(sfxCtx.currentTime + 0.25);
    } else if (type === 'notification') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, sfxCtx.currentTime);
      osc.frequency.setValueAtTime(880, sfxCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, sfxCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sfxCtx.currentTime + 0.35);
      osc.start(); osc.stop(sfxCtx.currentTime + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, sfxCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, sfxCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.1, sfxCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sfxCtx.currentTime + 0.12);
      osc.start(); osc.stop(sfxCtx.currentTime + 0.12);
    }
  }

  destroy() {
    if (this.sparkleTimer) clearInterval(this.sparkleTimer);
    this.nodes.forEach(n => { try { (n as OscillatorNode).stop?.(); } catch (_) {} });
    this.nodes = [];
    this.ctx?.close();
    this.ctx = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const engineRef = useRef<AmbientEngine | null>(null);

  useEffect(() => {
    engineRef.current = new AmbientEngine();
    engineRef.current.init();
    return () => { engineRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    if (isMuted) {
      engineRef.current.fadeOut();
    } else {
      engineRef.current.fadeIn();
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

  const playSfx = (type: 'hug' | 'kiss' | 'notification' | 'pop') => {
    if (isMuted) return;
    engineRef.current?.playSfx(type);
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playSfx }}>
      {children}
      {/* Floating Music Button — sits above the notification bell */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="fixed bottom-40 right-6 z-50 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white hover:bg-black/60 transition-colors"
        aria-label={isMuted ? 'Play ambient music' : 'Pause ambient music'}
        title={isMuted ? '🎵 Play ambient music' : '🔇 Pause music'}
      >
        {isMuted
          ? <VolumeX className="w-5 h-5 opacity-60" />
          : <Volume2 className="w-5 h-5 text-pink-400 animate-pulse" />
        }
      </motion.button>
    </AudioContext.Provider>
  );
};
