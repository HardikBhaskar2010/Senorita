import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Shield, Eye, EyeOff } from 'lucide-react';

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
      {/* Touch Indicator */}
      <AnimatePresence>
        {(showHint || isHolding) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            style={{ pointerEvents: isHolding ? 'none' : 'auto' }}
          >
            <div className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-8 shadow-2xl">
              {/* Circular Progress Indicator */}
              {isHolding && (
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  {/* Background Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.2)"
                    strokeWidth="4"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    strokeDashoffset={1000 - (holdProgress / 100) * 1000}
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))'
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

              {/* Hacker Theme Container */}
              <div className="relative">
                {/* Matrix-style background */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20 }}
                      animate={{ y: 100 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="text-cyan-500 text-xs font-mono"
                      style={{ position: 'absolute', left: `${i * 20}%` }}
                    >
                      {Math.random().toString(2).substring(2, 10)}
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <div className="relative z-10 text-center min-w-[280px]">
                  {isHolding ? (
                    <>
                      <div className="mx-auto mb-4 flex items-center justify-center">
                        <Shield className="w-16 h-16 text-cyan-400" />
                      </div>
                      <p className="text-cyan-400 font-mono text-sm mb-3">
                        {'>'} DECRYPTING VAULT...
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-64 h-3 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500"
                          style={{ width: `${holdProgress}%` }}
                          initial={{ width: 0 }}
                        />
                      </div>
                      
                      <p className="text-cyan-400/70 font-mono text-xs mt-3">
                        {Math.floor(holdProgress)}% • Hold {unlockMethod === 'touch' ? `${REQUIRED_TOUCHES} fingers` : 'Ctrl + .'}
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center justify-center"
                      >
                        <Lock className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-pink-400 font-mono text-sm mb-2">
                        {'>'} SECRET VAULT DETECTED
                      </p>
                      <p className="text-gray-400 font-mono text-xs mb-1">
                        📱 Mobile: Hold {REQUIRED_TOUCHES} fingers for {HOLD_DURATION / 1000}s
                      </p>
                      <p className="text-gray-400 font-mono text-xs">
                        💻 Laptop: Hold Ctrl + . for {HOLD_DURATION / 1000}s
                      </p>
                      {unlockMethod === 'touch' && touchCount > 0 && (
                        <p className="text-cyan-500/50 font-mono text-xs mt-2">
                          {touchCount}/{REQUIRED_TOUCHES} fingers detected
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Matrix Effect in corner (always visible hint) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="fixed bottom-4 right-4 z-40 pointer-events-none"
      >
        <motion.div
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-cyan-500/30"
        >
          <Lock className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </>
  );
};

export default SecretVaultAccess;
