import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Instrument } from './AudioEngine';

interface Particle {
  id: number;
  x: number;
  y: number;
  instrument: Instrument;
}

interface MusicalParticlesProps {
  lastNote: { x: number; y: number; instrument: Instrument } | null;
}

// Color mapping for instruments with cosmic theme
const instrumentColors = {
  violin: {
    primary: '#ff6b9d',
    secondary: '#ffa8c5',
    glow: 'rgba(255, 107, 157, 0.8)',
  },
  piano: {
    primary: '#4facfe',
    secondary: '#00f2fe',
    glow: 'rgba(79, 172, 254, 0.8)',
  },
  harp: {
    primary: '#f093fb',
    secondary: '#f5576c',
    glow: 'rgba(240, 147, 251, 0.8)',
  },
};

// Instrument icons
const instrumentIcons = {
  violin: '🎻',
  piano: '🎹',
  harp: '🪕',
};

export default function MusicalParticles({ lastNote }: MusicalParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleId, setParticleId] = useState(0);

  useEffect(() => {
    if (!lastNote) return;

    // Create multiple particles for more visual impact
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: particleId + i,
        x: lastNote.x,
        y: lastNote.y,
        instrument: lastNote.instrument,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    setParticleId((prev) => prev + 12);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 2500);
  }, [lastNote]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => {
          const colors = instrumentColors[particle.instrument];
          const randomAngle = Math.random() * Math.PI * 2;
          const randomDistance = 60 + Math.random() * 120;

          return (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: particle.x + Math.cos(randomAngle) * randomDistance,
                y: particle.y + Math.sin(randomAngle) * randomDistance,
                scale: [0, 2, 0],
                opacity: [1, 0.9, 0],
                rotate: 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                left: 0,
                top: 0,
              }}
            >
              {/* Star-shaped particle with cosmic glow */}
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
                {/* Outer glow */}
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill={colors.glow}
                  opacity="0.3"
                  filter="blur(4px)"
                />
                
                {/* Star shape */}
                <path
                  d="M12 2 L14.5 9 L22 9.5 L16.5 14.5 L18.5 22 L12 17.5 L5.5 22 L7.5 14.5 L2 9.5 L9.5 9 Z"
                  fill={colors.primary}
                  stroke={colors.secondary}
                  strokeWidth="1"
                  filter="url(#particleGlow)"
                />
                
                {/* Inner sparkle */}
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Show instrument icon on last note with cosmic animation */}
      <AnimatePresence>
        {lastNote && (
          <>
            {/* Main icon */}
            <motion.div
              key={`icon-${particleId}`}
              initial={{ x: lastNote.x, y: lastNote.y, scale: 0, opacity: 0 }}
              animate={{ 
                x: lastNote.x, 
                y: lastNote.y - 60, 
                scale: [0, 2, 1.5], 
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute text-5xl"
              style={{ 
                left: 0, 
                top: 0,
                filter: `drop-shadow(0 0 12px ${instrumentColors[lastNote.instrument].glow})`,
              }}
            >
              {instrumentIcons[lastNote.instrument]}
            </motion.div>
            
            {/* Expanding ring effect */}
            <motion.div
              key={`ring-${particleId}`}
              initial={{ x: lastNote.x, y: lastNote.y, scale: 0, opacity: 0.8 }}
              animate={{ 
                scale: 4,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute"
              style={{ left: 0, top: 0 }}
            >
              <div
                className="w-16 h-16 rounded-full border-4"
                style={{
                  borderColor: instrumentColors[lastNote.instrument].primary,
                  boxShadow: `0 0 20px ${instrumentColors[lastNote.instrument].glow}`,
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* SVG filter definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
