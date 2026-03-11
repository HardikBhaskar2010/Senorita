import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Particle {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'sparkle' | 'star';
  color: string;
}

const colors = [
  'text-pink-400',
  'text-rose-400',
  'text-purple-400',
  'text-fuchsia-400',
];

export const VibeEngine = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const location = useLocation();
  const [isActive, setIsActive] = useState(true);

  // Disable on certain pages if needed, or if user prefers reduced motion
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    // On mobile, maybe we just want on click, not move, to save performance. But we can keep it subtle.
    const handleAddParticle = (e: MouseEvent | TouchEvent) => {
      if (!isActive) return;
      
      // Throttle particle creation a bit (e.g. 1 in 3 events to save DOM elements)
      if (Math.random() > 0.4) return;

      let x = 0;
      let y = 0;
      
      if ('touches' in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ('clientX' in e) {
        x = e.clientX;
        y = e.clientY;
      } else {
        return;
      }

      const typeRando = Math.random();
      const type = typeRando > 0.6 ? 'heart' : typeRando > 0.3 ? 'sparkle' : 'star';
      
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x,
        y,
        type,
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      setParticles(prev => [...prev.slice(-15), newParticle]); // keep max 15 particles
      
      // Auto cleanup just in case (framer motion exit usually handles it too)
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1500);
    };

    window.addEventListener('mousemove', handleAddParticle, { passive: true });
    window.addEventListener('touchmove', handleAddParticle, { passive: true });
    window.addEventListener('click', handleAddParticle, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleAddParticle);
      window.removeEventListener('touchmove', handleAddParticle);
      window.removeEventListener('click', handleAddParticle);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0, x: particle.x, y: particle.y }}
            animate={{ 
              opacity: 0, 
              scale: Math.random() * 1.5 + 0.5, 
              y: particle.y - (Math.random() * 50 + 20),
              x: particle.x + (Math.random() * 40 - 20)
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 + Math.random() * 0.5, ease: "easeOut" }}
            className={`absolute will-change-transform ${particle.color}`}
            style={{ left: -10, top: -10 }} // offset centering
          >
            {particle.type === 'heart' && <Heart className="w-4 h-4 fill-current" />}
            {particle.type === 'sparkle' && <Sparkles className="w-4 h-4" />}
            {particle.type === 'star' && <Star className="w-4 h-4 fill-current" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
