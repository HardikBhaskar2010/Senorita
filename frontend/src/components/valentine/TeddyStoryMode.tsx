import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward, Volume2, VolumeX, Play } from 'lucide-react';

interface StoryScene {
  sceneNumber: number;
  title: string;
  emoji: string;
  text: string;
  teddyPose: 'happy' | 'shy' | 'love' | 'hug' | 'promise' | 'future';
  gradient: string;
}

// Story scenes - text will be filled from template later
const storyScenes: StoryScene[] = [
  {
    sceneNumber: 1,
    title: "The Beginning",
    emoji: "🌟",
    text: "It was August 12, 2024, when our paths first crossed. I saw you and something in my heart whispered, 'This is special.' Little did I know that this was the beginning of the most beautiful chapter of my life.",
    teddyPose: 'happy',
    gradient: 'from-blue-500 via-purple-500 to-pink-500'
  },
  {
    sceneNumber: 2,
    title: "Growing Closer",
    emoji: "💭",
    text: "Every conversation brought us closer. Every laugh we shared made my heart skip a beat. I found myself thinking about you all the time, wanting to know everything about you, your dreams, your fears, your favorite things.",
    teddyPose: 'shy',
    gradient: 'from-pink-400 via-rose-400 to-red-400'
  },
  {
    sceneNumber: 3,
    title: "The Realization",
    emoji: "💕",
    text: "And then it hit me - I was falling for you. Not just your smile or your laugh, but your soul. The way you see the world, the way you care, the way you make me want to be better. I was completely, utterly in love.",
    teddyPose: 'love',
    gradient: 'from-red-400 via-pink-500 to-rose-400'
  },
  {
    sceneNumber: 4,
    title: "The Commitment",
    emoji: "💍",
    text: "May 14, 2025 - the day we chose each other forever. I promised to stand by your side through every sunrise and sunset, through every joy and challenge. You are my forever, my always, my home.",
    teddyPose: 'promise',
    gradient: 'from-purple-500 via-pink-500 to-red-500'
  },
  {
    sceneNumber: 5,
    title: "Teddy's Promise",
    emoji: "🧸",
    text: "This teddy represents everything I feel for you - soft, warm, comforting, and constant. Just like this teddy will always be here, I will always be here for you. Through every hug, every tear, every smile. Forever yours.",
    teddyPose: 'hug',
    gradient: 'from-amber-400 via-orange-400 to-yellow-500'
  },
  {
    sceneNumber: 6,
    title: "Forever Together",
    emoji: "♾️",
    text: "When I look at our future, I see endless possibilities. Adventures to take, memories to create, dreams to chase - all with you by my side. You are my today, my tomorrow, and all my forevers. I love you, Senorita. Always and forever. 💕",
    teddyPose: 'future',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500'
  }
];

const TeddyStoryMode = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasWatchedBefore, setHasWatchedBefore] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user has watched before
    const watched = localStorage.getItem('teddy-story-watched');
    if (watched === 'true') {
      setHasWatchedBefore(true);
    }
  }, []);

  // Play typing sound using Web Audio API
  const playTypingSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Create typing sound (short beep)
      oscillator.frequency.value = 800 + Math.random() * 200; // Vary pitch slightly
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Quiet volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (err) {
      console.log('Audio not available');
    }
  };

  // Typing animation effect
  useEffect(() => {
    if (!hasStarted || currentScene >= storyScenes.length) return;

    const scene = storyScenes[currentScene];
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const text = scene.text;
    
    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.substring(0, charIndex + 1));
        
        // Play sound every 3rd character for performance
        if (charIndex % 3 === 0) {
          playTypingSound();
        }
        
        charIndex++;
      } else {
        setIsTyping(false);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 50); // 50ms per character

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [currentScene, hasStarted, soundEnabled]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentScene(0);
    localStorage.setItem('teddy-story-watched', 'true');
  };

  const handleNext = () => {
    if (currentScene < storyScenes.length - 1) {
      setCurrentScene(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentScene > 0) {
      setCurrentScene(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setHasStarted(false);
    setCurrentScene(0);
    setDisplayedText('');
  };

  const skipToEnd = () => {
    if (isTyping && currentScene < storyScenes.length) {
      const scene = storyScenes[currentScene];
      setDisplayedText(scene.text);
      setIsTyping(false);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Teddy characters based on pose
  const renderTeddyCharacters = (pose: StoryScene['teddyPose']) => {
    const teddyConfigs = {
      happy: { cookie: '🍪🧸', senorita: '💃🧸', animation: 'bounce' },
      shy: { cookie: '🍪🧸', senorita: '💃🧸😊', animation: 'sway' },
      love: { cookie: '🍪🧸😍', senorita: '💃🧸😍', animation: 'heartbeat' },
      hug: { cookie: '🍪🧸', senorita: '💃🧸', animation: 'hug', together: '🤗' },
      promise: { cookie: '🍪🧸🤝', senorita: '💃🧸🤝', animation: 'promise' },
      future: { cookie: '🍪🧸✨', senorita: '💃🧸✨', animation: 'float' }
    };

    const config = teddyConfigs[pose];

    if (pose === 'hug') {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-0 text-8xl"
        >
          <motion.div
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {config.cookie}
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mx-4"
          >
            {config.together}
          </motion.div>
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {config.senorita}
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center gap-12 text-8xl"
      >
        <motion.div
          animate={
            config.animation === 'bounce' ? { y: [0, -20, 0] } :
            config.animation === 'sway' ? { rotate: [-5, 5, -5] } :
            config.animation === 'heartbeat' ? { scale: [1, 1.2, 1] } :
            config.animation === 'float' ? { y: [0, -15, 0] } :
            {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          {config.cookie}
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl"
        >
          💕
        </motion.div>
        
        <motion.div
          animate={
            config.animation === 'bounce' ? { y: [0, -20, 0] } :
            config.animation === 'sway' ? { rotate: [5, -5, 5] } :
            config.animation === 'heartbeat' ? { scale: [1, 1.2, 1] } :
            config.animation === 'float' ? { y: [0, -15, 0] } :
            {}
          }
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        >
          {config.senorita}
        </motion.div>
      </motion.div>
    );
  };

  // Start screen
  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-amber-400 via-orange-300 to-yellow-400 rounded-3xl p-8 text-center relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ 
                y: '-20%', 
                x: `${Math.random() * 100}%`,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'linear'
              }}
              className="absolute text-4xl"
            >
              {['🧸', '💕', '✨', '💖', '🌟'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 1 }}
          className="text-9xl mb-8 relative z-10"
        >
          🎬
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold mb-4 text-amber-900 relative z-10"
        >
          Our Love Story
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-amber-800 mb-12 max-w-2xl relative z-10"
        >
          A cinematic journey through Cookie 🍪 & Senorita's 💃 beautiful moments together
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 relative z-10"
        >
          <Button
            onClick={handleStart}
            size="lg"
            className="text-2xl py-8 px-12 bg-white text-amber-600 hover:bg-amber-50 rounded-2xl shadow-2xl font-bold"
          >
            <Play className="w-8 h-8 mr-3" />
            {hasWatchedBefore ? 'Watch Again' : 'Start Story'}
          </Button>

          <p className="text-amber-700 text-sm">
            🎧 Best experienced with sound • 6 scenes • ~3 minutes
          </p>
        </motion.div>
      </motion.div>
    );
  }

  const scene = storyScenes[currentScene];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScene}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative min-h-[700px] bg-gradient-to-br ${scene.gradient} rounded-3xl overflow-hidden`}
      >
        {/* Cinematic letterbox borders */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-sm z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-sm z-20" />

        {/* Content container */}
        <div className="relative z-10 px-8 py-24 flex flex-col items-center justify-between min-h-[700px]">
          
          {/* Scene header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-7xl mb-4">{scene.emoji}</div>
            <h2 className="text-4xl font-bold text-white mb-2">{scene.title}</h2>
            <div className="text-white/70 text-sm">Scene {scene.sceneNumber} of {storyScenes.length}</div>
          </motion.div>

          {/* Teddy characters */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="my-8"
          >
            {renderTeddyCharacters(scene.teddyPose)}
          </motion.div>

          {/* Story text with typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="max-w-3xl mx-auto"
            onClick={skipToEnd}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 min-h-[200px] flex items-center justify-center">
              <p className="text-xl md:text-2xl text-white leading-relaxed text-center">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1 h-6 bg-white ml-1 align-middle"
                  />
                )}
              </p>
            </div>
            {isTyping && (
              <p className="text-center text-white/60 text-sm mt-3">
                Click text to skip typing animation
              </p>
            )}
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/20 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentScene + 1) / storyScenes.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Navigation controls - Fixed at bottom */}
        <div className="absolute bottom-20 left-0 right-0 z-30 px-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            
            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              disabled={currentScene === 0}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Previous
            </Button>

            {/* Center controls */}
            <div className="flex items-center gap-4">
              {/* Sound toggle */}
              <Button
                onClick={toggleSound}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>

              {/* Skip story */}
              <Button
                onClick={handleSkip}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/20"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Exit Story
              </Button>
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={currentScene === storyScenes.length - 1}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>

        {/* Floating particles decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ 
                y: '-20%', 
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: 6 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'linear'
              }}
              className="absolute text-3xl"
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* Completion overlay */}
        {currentScene === storyScenes.length - 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-32 z-40"
          >
            <Button
              onClick={handleSkip}
              size="lg"
              className="text-xl py-6 px-10 bg-white text-pink-600 hover:bg-pink-50 rounded-2xl shadow-2xl font-bold"
            >
              ❤️ The End
            </Button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TeddyStoryMode;
