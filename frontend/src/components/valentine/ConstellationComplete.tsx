import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ConstellationCompleteProps {
  name: string;
  onClose: () => void;
}

export default function ConstellationComplete({ name, onClose }: ConstellationCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      {/* Sparkles around */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50vw',
            y: '50vh',
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 80}vw`,
            y: `${50 + (Math.random() - 0.5) * 80}vh`,
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
          className="absolute pointer-events-none"
        >
          <Sparkles className="w-6 h-6 text-yellow-300" fill="currentColor" />
        </motion.div>
      ))}

      {/* Center content */}
      <motion.div
        initial={{ scale: 0.5, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: 0.3,
        }}
        className="relative z-10 text-center"
      >
        {/* Stars burst */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: [0, 1.5, 1], rotate: 360 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="text-9xl mb-8"
        >
          ✨
        </motion.div>

        {/* Constellation name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.h2
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            {name}
          </motion.h2>
          <p className="text-2xl text-white/80 mb-8">Constellation Complete! 🌟</p>
        </motion.div>

        {/* Glow effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-purple-500/30 to-transparent rounded-full blur-3xl pointer-events-none"
        />

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-semibold shadow-lg hover:shadow-2xl transition-shadow"
        >
          Continue ✨
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
