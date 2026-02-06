import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  active?: boolean;
  duration?: number;
  particleCount?: number;
}

const ConfettiSystem = ({ active = false, duration = 3000, particleCount = 50 }: ConfettiProps) => {
  const [show, setShow] = useState(active);

  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!show) return null;

  const confettiElements = ['❤️', '💕', '💖', '💗', '💝', '✨', '⭐', '🌟', '💫', '🎉'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(particleCount)].map((_, i) => {
        const randomEmoji = confettiElements[Math.floor(Math.random() * confettiElements.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 2;
        const randomRotation = Math.random() * 720 - 360;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}vw`,
              y: -50,
              rotate: 0,
              opacity: 1,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{
              y: '110vh',
              rotate: randomRotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'linear'
            }}
            className="absolute text-3xl"
          >
            {randomEmoji}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ConfettiSystem;
