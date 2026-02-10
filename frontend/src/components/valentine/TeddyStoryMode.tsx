import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward, Volume2, VolumeX, Play, Clock } from 'lucide-react';
import { animate, svg, createScope } from 'animejs';

// Function to control background music volume (audio ducking)
const setBackgroundMusicVolume = (volume: number) => {
  try {
    // Find the background audio player from Valentine's page
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      if (!audio.paused) {
        audio.volume = volume;
      }
    });
  } catch (err) {
    console.log('No background audio to control');
  }
};

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
    text: "It was August 12, 2024, When I First Saw You, Although I Heard Your Name a Few Days Ago and From There I was Curious to See You.. Then You Came in the Class.. Actually You Came In My Heart That Day. And I Knew That Now I Found 'Her'",
    teddyPose: 'happy',
    gradient: 'from-blue-500 via-purple-500 to-pink-500'
  },
  {
    sceneNumber: 2,
    title: "Growing Closer",
    emoji: "💭",
    text: "From The Day We Started Talking Online, I Was Always Filled With Curiosity.. To Know.. About You, About My Lovely Senorita, What You Like, Favorite Colour, Fav. Food.. Everything.",
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
    text: "May 14, 2025 - the day we chose each other forever. You Chose to Wear a Saree.. JUST FOR THIS MAN!! Ufff.. And That Day, I Devoted My Self To YOU, Senorita.",
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
    text: "When I look at our future, I see endless possibilities. Adventures to take, memories to create, dreams to chase - all with you by my side Senorita. You are my today, my tomorrow, and all my forevers. I love you, Senorita. Always and forever. 💕",
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
      // Duck background music to 5% when typing sound plays
      setBackgroundMusicVolume(0.05);
      
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
      
      // Restore background music after a short delay
      setTimeout(() => {
        setBackgroundMusicVolume(1.0);
      }, 100);
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
        className={`relative min-h-[800px] bg-gradient-to-br ${scene.gradient} rounded-3xl overflow-hidden`}
      >
        {/* Cinematic letterbox borders - more prominent */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-sm z-20 border-b border-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/95 to-transparent z-20" />

        {/* Content container */}
        <div className="relative z-10 px-6 md:px-8 py-28 flex flex-col items-center justify-between min-h-[800px] pb-48">
          
          {/* Scene header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center bg-black/30 backdrop-blur-sm rounded-2xl px-8 py-6 border-2 border-white/20"
          >
            <div className="text-7xl mb-4 drop-shadow-lg">{scene.emoji}</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{scene.title}</h2>
            <div className="text-white/90 text-base font-medium bg-white/20 px-4 py-1 rounded-full inline-block">
              Scene {scene.sceneNumber} of {storyScenes.length}
            </div>
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
            className="max-w-4xl mx-auto w-full"
            onClick={skipToEnd}
          >
            <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 md:p-10 border-2 border-white/30 min-h-[220px] flex items-center justify-center shadow-2xl">
              <p className="text-xl md:text-2xl text-white leading-relaxed text-center font-medium">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1 h-7 bg-white ml-1 align-middle"
                  />
                )}
              </p>
            </div>
            {isTyping && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/80 text-sm mt-3 bg-black/40 px-4 py-2 rounded-full inline-block w-full"
              >
                💡 Click text to skip typing animation
              </motion.p>
            )}
          </motion.div>

          {/* Progress bar - More visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="w-full max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white/30 h-3 rounded-full overflow-hidden border-2 border-white/40 shadow-lg">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentScene + 1) / storyScenes.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-white h-full rounded-full shadow-lg"
              />
            </div>
            <p className="text-center text-white/80 text-sm mt-2 font-medium">
              {Math.round(((currentScene + 1) / storyScenes.length) * 100)}% Complete
            </p>
          </motion.div>
        </div>

        {/* Navigation controls - Fixed at bottom with better visibility */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          {/* Control panel backdrop */}
          <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 px-4 md:px-8">
            <div className="flex items-center justify-between max-w-6xl mx-auto gap-4">
              
              {/* Previous Button */}
              <Button
                onClick={handlePrevious}
                disabled={currentScene === 0}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base px-6 py-6 rounded-xl shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </Button>

              {/* Center controls */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  {/* Sound toggle */}
                  <Button
                    onClick={toggleSound}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm rounded-full w-14 h-14 p-0 shadow-xl"
                  >
                    {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </Button>

                  {/* Skip story */}
                  <Button
                    onClick={handleSkip}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm font-bold px-6 py-6 rounded-xl shadow-xl"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    Exit Story
                  </Button>
                </div>
                
                {/* Progress indicator text */}
                <div className="text-white font-medium text-sm bg-black/40 px-4 py-1 rounded-full">
                  Scene {currentScene + 1} of {storyScenes.length}
                </div>
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={currentScene === storyScenes.length - 1}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base px-6 py-6 rounded-xl shadow-xl"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
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
