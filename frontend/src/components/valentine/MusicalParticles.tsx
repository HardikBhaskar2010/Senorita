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

// Color mapping for instruments
const instrumentColors = {
  violin: {
    primary: '#ff6b9d',
    secondary: '#ffa8c5',
    glow: 'rgba(255, 107, 157, 0.6)',
  },
  piano: {
    primary: '#4facfe',
    secondary: '#00f2fe',
    glow: 'rgba(79, 172, 254, 0.6)',
  },
  harp: {
    primary: '#f093fb',
    secondary: '#f5576c',
    glow: 'rgba(240, 147, 251, 0.6)',
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
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: particleId + i,
        x: lastNote.x,
        y: lastNote.y,
        instrument: lastNote.instrument,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    setParticleId((prev) => prev + 8);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 2000);
  }, [lastNote]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => {
          const colors = instrumentColors[particle.instrument];
          const randomAngle = Math.random() * Math.PI * 2;
          const randomDistance = 50 + Math.random() * 100;

          return (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: particle.x + Math.cos(randomAngle) * randomDistance,
                y: particle.y + Math.sin(randomAngle) * randomDistance,
                scale: [0, 1.5, 0],
                opacity: [1, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                left: 0,
                top: 0,
              }}
            >
              {/* Particle with glow */}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
                  boxShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Show instrument icon on last note */}
      <AnimatePresence>
        {lastNote && (
          <motion.div
            key={`icon-${particleId}`}
            initial={{ x: lastNote.x, y: lastNote.y, scale: 0, opacity: 0 }}
            animate={{ 
              x: lastNote.x, 
              y: lastNote.y - 50, 
              scale: [0, 1.5, 1], 
              opacity: [0, 1, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute text-4xl"
            style={{ left: 0, top: 0 }}
          >
            {instrumentIcons[lastNote.instrument]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
