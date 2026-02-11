import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecretVaultAccessProps {
  onUnlock: () => void;
}

const SecretVaultAccess = ({ onUnlock }: SecretVaultAccessProps) => {
  const [touchCount, setTouchCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState<'touch' | 'keyboard'>('touch');
  const touchStartTime = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const touchCountRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());

  const HOLD_DURATION = 5000; // 5 seconds
  const REQUIRED_TOUCHES = 2; // 2 fingers

  useEffect(() => {
    // ============================================
    // TOUCH EVENTS (Mobile - 2 fingers)
    // ============================================
    const handleTouchStart = (e: TouchEvent) => {
      const touches = e.touches.length;
      touchCountRef.current = touches;
      setTouchCount(touches);

      if (touches === REQUIRED_TOUCHES) {
        setUnlockMethod('touch');
        setIsHolding(true);
        touchStartTime.current = Date.now();
        setShowHint(true);
        
        // Start progress animation
        const animate = () => {
          if (touchStartTime.current && touchCountRef.current === REQUIRED_TOUCHES) {
            const elapsed = Date.now() - touchStartTime.current;
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setHoldProgress(progress);

            if (progress >= 100) {
              // Unlock!
              onUnlock();
              setIsHolding(false);
              setShowHint(false);
              return;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touches = e.touches.length;
      touchCountRef.current = touches;
      setTouchCount(touches);

      if (touches < REQUIRED_TOUCHES) {
        setIsHolding(false);
        setHoldProgress(0);
        touchStartTime.current = null;
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Hide hint after 2 seconds
        setTimeout(() => setShowHint(false), 2000);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touches = e.touches.length;
      if (touches !== touchCountRef.current) {
        touchCountRef.current = touches;
        setTouchCount(touches);
        
        if (touches < REQUIRED_TOUCHES) {
          setIsHolding(false);
          setHoldProgress(0);
          touchStartTime.current = null;
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }
      }
    };

    // ============================================
    // KEYBOARD EVENTS (Laptop - Ctrl + .)
    // ============================================
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add key to set
      keysPressed.current.add(e.key);
      
      // Check if Ctrl + . is pressed
      const isCtrlPressed = keysPressed.current.has('Control');
      const isPeriodPressed = keysPressed.current.has('.') || keysPressed.current.has('>'); // '>' is shift+.
      
      if (isCtrlPressed && isPeriodPressed && !isHolding) {
        setUnlockMethod('keyboard');
        setIsHolding(true);
        touchStartTime.current = Date.now();
        setShowHint(true);
        
        // Start progress animation
        const animate = () => {
          if (touchStartTime.current && keysPressed.current.has('Control') && (keysPressed.current.has('.') || keysPressed.current.has('>'))) {
            const elapsed = Date.now() - touchStartTime.current;
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setHoldProgress(progress);

            if (progress >= 100) {
              // Unlock!
              onUnlock();
              setIsHolding(false);
              setShowHint(false);
              keysPressed.current.clear();
              return;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            // Keys released before completion
            setIsHolding(false);
            setHoldProgress(0);
            touchStartTime.current = null;
            
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove key from set
      keysPressed.current.delete(e.key);
      
      // If either Ctrl or . is released, stop the progress
      if (e.key === 'Control' || e.key === '.' || e.key === '>') {
        if (isHolding && unlockMethod === 'keyboard') {
          setIsHolding(false);
          setHoldProgress(0);
          touchStartTime.current = null;
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }

          // Hide hint after 2 seconds
          setTimeout(() => setShowHint(false), 2000);
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      // Remove event listeners
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clear keys
      keysPressed.current.clear();
    };
  }, [onUnlock, isHolding, unlockMethod]);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
      />

      {/* Main Modal - Perfectly Centered */}
      <AnimatePresence>
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md"
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 backdrop-blur-2xl border-2 border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
              
              {/* Circular Progress Indicator */}
              {isHolding && (
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  {/* Background Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.1)"
                    strokeWidth="3"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    strokeDashoffset={1000 - (holdProgress / 100) * 1000}
                    style={{ 
                      filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.6))'
                    }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* Glowing Corner Accents */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-pink-500/40 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyan-500/40 rounded-br-3xl" />

              {/* Matrix-style background */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20 }}
                    animate={{ y: '120%' }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute text-cyan-400 text-[10px] font-mono"
                    style={{ left: `${(i * 12) % 100}%` }}
                  >
                    {Math.random().toString(2).substring(2, 12)}
                  </motion.div>
                ))}
              </div>

              {/* Content Container */}
              <div className="relative z-20 p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ 
                      rotate: isHolding ? 360 : [0, 5, -5, 0],
                      scale: isHolding ? 1 : [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: isHolding ? 20 : 2, 
                      repeat: Infinity,
                      ease: isHolding ? "linear" : "easeInOut"
                    }}
                    className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-pink-500 p-0.5 mb-6"
                  >
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      {isHolding ? (
                        <Shield className="w-10 h-10 text-cyan-400" />
                      ) : (
                        <Lock className="w-10 h-10 text-pink-400" />
                      )}
                    </div>
                  </motion.div>

                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-3 font-mono">
                    {isHolding ? '> DECRYPTING...' : '> SECRET VAULT'}
                  </h2>
                  
                  <p className="text-gray-400 text-sm md:text-base font-mono">
                    {isHolding ? 'Hold steady to unlock' : 'Protected digital sanctuary'}
                  </p>
                </div>

                {/* Progress Bar (when holding) */}
                {isHolding && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                  >
                    <div className="w-full h-3 bg-gray-800/80 rounded-full overflow-hidden border border-cyan-500/30 shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 shadow-lg shadow-cyan-500/50"
                        style={{ width: `${holdProgress}%` }}
                        initial={{ width: 0 }}
                      />
                    </div>
                    <p className="text-cyan-400 font-mono text-xs text-center mt-3">
                      {Math.floor(holdProgress)}% • Hold {unlockMethod === 'touch' ? `${REQUIRED_TOUCHES} fingers` : 'Ctrl + .'}
                    </p>
                  </motion.div>
                )}

                {/* Instructions (when not holding) */}
                {!isHolding && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 mb-6"
                  >
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                      <p className="text-cyan-400 font-mono text-sm mb-1">
                        📱 Mobile
                      </p>
                      <p className="text-gray-400 text-xs font-mono">
                        Hold {REQUIRED_TOUCHES} fingers for {HOLD_DURATION / 1000}s
                      </p>
                    </div>
                    
                    <div className="p-4 bg-pink-500/5 border border-pink-500/20 rounded-xl">
                      <p className="text-pink-400 font-mono text-sm mb-1">
                        💻 Desktop
                      </p>
                      <p className="text-gray-400 text-xs font-mono">
                        Hold Ctrl + . for {HOLD_DURATION / 1000}s
                      </p>
                    </div>

                    {unlockMethod === 'touch' && touchCount > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-cyan-500/70 font-mono text-xs text-center"
                      >
                        {touchCount}/{REQUIRED_TOUCHES} fingers detected
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Quick Access Button */}
                {!isHolding && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnlock();
                      }}
                      className="w-full py-6 text-base font-mono bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 hover:from-cyan-600 hover:via-blue-600 hover:to-pink-600 text-white border-0 shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/40"
                    >
                      <Unlock className="w-5 h-5 mr-2" />
                      CLICK TO UNLOCK
                    </Button>
                    
                    <p className="text-gray-500 text-xs mt-3 font-mono text-center">
                      Or use the hold methods above
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Pulsing Border Effect */}
              <motion.div
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 border-2 border-cyan-500/20 rounded-3xl pointer-events-none"
              />
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default SecretVaultAccess;
