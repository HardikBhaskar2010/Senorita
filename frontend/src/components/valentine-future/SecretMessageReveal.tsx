import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SecretMessageRevealProps {
  isUnlocked: boolean;
}

export default function SecretMessageReveal({ isUnlocked }: SecretMessageRevealProps) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isUnlocked) {
      // Delay message reveal for dramatic effect
      setTimeout(() => setShowMessage(true), 500);
    }
  }, [isUnlocked]);

  if (!isUnlocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,0,136,0.2) 0%, rgba(0,0,0,0.9) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          delay: 0.3 
        }}
        className="relative max-w-2xl w-full"
      >
        {/* Glowing background orbs */}
        <div className="absolute -inset-20 opacity-30">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 left-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"
          />
        </div>

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-12 border-2 border-pink-500/30 shadow-2xl">
          {/* Sparkles decoration */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-yellow-400" fill="currentColor" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Heart className="w-20 h-20 mx-auto text-pink-500 mb-4" fill="currentColor" />
            </motion.div>

            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="space-y-4"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-cyan-400">
                  Message from 2030
                </h2>
                
                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-xl md:text-2xl text-white/90 leading-relaxed font-light px-4"
                >
                  My dearest Senorita,
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-lg text-white/80 leading-relaxed px-4"
                >
                  If you're reading this, you've traveled through all our memories — 
                  past, present, and the ones we haven't lived yet. 
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.6 }}
                  className="text-lg text-white/80 leading-relaxed px-4"
                >
                  Every moment we share is a thread in the tapestry of our forever. 
                  From that first coffee in the rain to this very second, 
                  and to all the tomorrows waiting for us.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.0 }}
                  className="text-lg text-white/80 leading-relaxed px-4"
                >
                  I built this for you because I wanted you to see us the way I do — 
                  not just as we are, but as we will be. Growing, laughing, creating, 
                  and loving through every season of life.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.4 }}
                  className="pt-8"
                >
                  <p className="text-2xl font-semibold text-pink-400 mb-2">
                    Will you keep building this future with me?
                  </p>
                  <p className="text-lg text-cyan-400">
                    Forever yours, across all timelines,
                  </p>
                  <p className="text-xl font-bold text-white mt-2">
                    Your Cookie 🍪
                  </p>
                </motion.div>

                {/* Floating hearts decoration */}
                <div className="relative h-20">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -100, opacity: [0, 1, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.6 + 4,
                      }}
                      className="absolute text-2xl"
                      style={{ left: `${20 + i * 15}%` }}
                    >
                      ❤️
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}