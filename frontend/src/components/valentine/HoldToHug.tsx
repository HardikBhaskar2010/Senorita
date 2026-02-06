import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const HoldToHug = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopHeartbeat();
    };
  }, []);

  const startHeartbeat = () => {
    // Create Web Audio API heartbeat sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 80; // Low frequency for heartbeat
    gainNode.gain.value = 0.3;

    oscillator.start();

    // Pulse the heartbeat
    const pulse = () => {
      if (gainNode && audioContext) {
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      }
    };

    const heartbeatInterval = setInterval(pulse, 800);

    audioContextRef.current = audioContext;
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    return () => clearInterval(heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleStart = () => {
    setIsHolding(true);
    setHoldDuration(0);
    startHeartbeat();

    intervalRef.current = setInterval(() => {
      setHoldDuration(prev => {
        const newDuration = prev + 0.1;
        if (newDuration >= 3) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsComplete(true);
          stopHeartbeat();
        }
        return newDuration;
      });
    }, 100);
  };

  const handleEnd = () => {
    setIsHolding(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopHeartbeat();

    if (holdDuration < 3) {
      setHoldDuration(0);
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center gap-6 text-center max-w-md mx-auto"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl"
        >
          🤗
        </motion.div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold mb-4">You held on! 💕</h3>
          <p className="text-xl mb-4">
            "A hug from you feels like home.
            <br />Warm, safe, and full of love."
          </p>
          <p className="text-lg opacity-90 italic">
            Every moment in your arms is precious to me 💖
          </p>
        </div>

        <p className="text-sm opacity-70">
          You held for {holdDuration.toFixed(1)} seconds ❤️
        </p>
      </motion.div>
    );
  }

  const progress = Math.min((holdDuration / 3) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-8">
      <h3 className="text-2xl font-bold text-center">Hold for a Virtual Hug 🤗</h3>
      <p className="text-center opacity-80">Press and hold for 3 seconds</p>

      {/* Hug Button */}
      <motion.button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        animate={{
          scale: isHolding ? [1, 1.1, 1] : 1,
          boxShadow: isHolding 
            ? [
                '0 0 20px rgba(255, 182, 193, 0.5)',
                '0 0 60px rgba(255, 182, 193, 0.8)',
                '0 0 20px rgba(255, 182, 193, 0.5)'
              ]
            : '0 0 20px rgba(255, 182, 193, 0.3)'
        }}
        transition={{ duration: 0.5, repeat: isHolding ? Infinity : 0 }}
        className="relative w-64 h-64 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-8xl cursor-pointer select-none"
        style={{
          background: `radial-gradient(circle, rgba(255, 182, 193, ${0.3 + progress / 100}) 0%, rgba(255, 105, 180, ${0.5 + progress / 100}) 100%)`
        }}
      >
        🤗
        
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            opacity="0.8"
            className="transition-all duration-100"
          />
        </svg>
      </motion.button>

      {/* Progress Text */}
      <div className="text-center">
        <div className="text-2xl font-bold">
          {holdDuration.toFixed(1)}s / 3.0s
        </div>
        <div className="text-sm opacity-70 mt-2">
          {progress < 100 ? 'Keep holding...' : 'Release now!'}
        </div>
      </div>

      {/* Hearts Animation */}
      {isHolding && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                scale: 0
              }}
              animate={{ 
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2 - 200,
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity
              }}
              className="absolute text-4xl"
            >
              💕
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HoldToHug;