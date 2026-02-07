import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceNoteVisualizerProps {
  audioUrl: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const VoiceNoteVisualizer = ({ audioUrl, onPlayStateChange }: VoiceNoteVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl);
    audio.volume = 1.0;
    audioRef.current = audio;

    // Set up audio context and analyser
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    // Connect audio element to analyser
    const source = audioContext.createMediaElementSource(audio);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      
      // Resume background music
      const bgMusic = document.querySelector('audio[data-bg-music]') as HTMLAudioElement;
      if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.play();
      }
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audio.pause();
      audioContext.close();
    };
  }, [audioUrl, onPlayStateChange]);

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    }
  }, [isPlaying]);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = analyser.frequencyBinCount;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw circular waveform
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;

      // Background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Circular bars
      const barCount = 64;
      const angleStep = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight = (dataArray[dataIndex] / 255) * 60;
        const angle = i * angleStep;

        const x1 = centerX + Math.cos(angle) * (radius + 5);
        const y1 = centerY + Math.sin(angle) * (radius + 5);
        const x2 = centerX + Math.cos(angle) * (radius + 5 + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + 5 + barHeight);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(0.5, '#f43f5e');
        gradient.addColorStop(1, '#ef4444');

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Particle effects
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const dataIndex = Math.floor((i / particleCount) * bufferLength);
        const intensity = dataArray[dataIndex] / 255;
        
        if (intensity > 0.5) {
          const angle = Math.random() * Math.PI * 2;
          const distance = radius + 70 + Math.random() * 40;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const size = 2 + intensity * 4;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(236, 72, 153, ${intensity})`;
          ctx.fill();
        }
      }

      // Center pulse
      const avgIntensity = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
      const pulseRadius = 30 + avgIntensity * 30;
      
      const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
      pulseGradient.addColorStop(0, `rgba(236, 72, 153, ${avgIntensity * 0.8})`);
      pulseGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = pulseGradient;
      ctx.fill();
    };

    draw();
  };

  const togglePlay = async () => {
    if (!audioRef.current || !audioContextRef.current) return;

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      
      // Resume background music
      const bgMusic = document.querySelector('audio[data-bg-music]') as HTMLAudioElement;
      if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.play();
      }
    } else {
      // Pause background music and reduce volume
      const bgMusic = document.querySelector('audio[data-bg-music]') as HTMLAudioElement;
      if (bgMusic) {
        bgMusic.volume = 0.1; // Drop to 10%
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
      onPlayStateChange?.(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/30 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl mb-2"
          >
            💌
          </motion.div>
          <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">
            Cookie's Voice Message
          </h3>
          <p className="text-sm text-white/80 drop-shadow">
            Listen to my heart speaking...
          </p>
        </div>

        {/* Visualizer Canvas */}
        <div className="relative mb-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20"
          />
          
          {/* Play/Pause Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Button
              onClick={togglePlay}
              className="pointer-events-auto w-16 h-16 rounded-full bg-white/90 hover:bg-white text-pink-600 shadow-xl transform hover:scale-110 transition-all"
              size="icon"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/70 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-red-400"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
          <Volume2 className="w-4 h-4" />
          <span className="drop-shadow">
            {isPlaying ? 'Playing...' : 'Click play to hear my voice'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceNoteVisualizer;
