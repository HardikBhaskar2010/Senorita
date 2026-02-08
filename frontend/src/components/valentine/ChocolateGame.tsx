import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Gift, Sparkles } from 'lucide-react';

interface ChocolateGameProps {
  dayNumber: number;
}

interface Chocolate {
  id: number;
  name: string;
  emoji: string;
  message: string;
  color: string;
  gradient: string;
  isSpecial?: boolean;
}

const chocolates: Chocolate[] = [
  {
    id: 1,
    name: 'Dairy Milk Silk Mousse',
    emoji: '🍫',
    message: "I Love How You Still Have Every Single Wrap of the Chocolates I Gave you",
    color: '#8B4513',
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    isSpecial: true
  },
  {
    id: 2,
    name: 'Dairy Milk Silk Oreo',
    emoji: '🍪',
    message: "I think That Day I thought You Were a Sweet Chocolate. Thats Why You Got Those Marks Maybe😶‍🌫️😶‍🌫️",
    color: '#3E2723',
    gradient: 'from-stone-800 via-stone-700 to-stone-900',
    isSpecial: true
  },
  {
    id: 3,
    name: 'Sweet Life',
    emoji: '✨',
    message: "Khao Pio Aes Karo - Eat Everything and Live a 'Mast' life! You deserve all the sweetness in the world, my love! 💕",
    color: '#FF69B4',
    gradient: 'from-pink-500 via-rose-500 to-pink-600',
    isSpecial: false
  },
  {
    id: 4,
    name: 'Heart Chocolate',
    emoji: '💝',
    message: "You make every moment sweeter than the sweetest chocolate. Life with you is the best treat! 🍬",
    color: '#E91E63',
    gradient: 'from-rose-500 via-pink-500 to-rose-600',
    isSpecial: false
  },
  {
    id: 5,
    name: 'Golden Truffle',
    emoji: '🌟',
    message: "Just like chocolate melts in your mouth, I melt every time I see your smile. You're my sweet addiction! 😊",
    color: '#FFD700',
    gradient: 'from-yellow-600 via-amber-500 to-yellow-700',
    isSpecial: false
  },
  {
    id: 6,
    name: 'Love Bonbon',
    emoji: '💖',
    message: "You're the chocolate to my Valentine's Day - essential, sweet, and impossible to resist! 🥰",
    color: '#FF1493',
    gradient: 'from-pink-600 via-rose-600 to-pink-700',
    isSpecial: false
  },
  {
    id: 7,
    name: 'Caramel Kiss',
    emoji: '💋',
    message: "Every day with you is like unwrapping a new chocolate - full of sweetness and delightful surprises! 🎁",
    color: '#CD853F',
    gradient: 'from-orange-700 via-amber-700 to-orange-800',
    isSpecial: false
  },
  {
    id: 8,
    name: 'Forever Sweet',
    emoji: '♾️',
    message: "My love for you is sweeter than all the chocolates in the world combined. You're my forever sweetness! 🍯",
    color: '#8B008B',
    gradient: 'from-purple-700 via-fuchsia-600 to-purple-800',
    isSpecial: false
  }
];

const ChocolateGame = ({ dayNumber }: ChocolateGameProps) => {
  const [openedChocolates, setOpenedChocolates] = useState<Set<number>>(new Set());
  const [selectedChocolate, setSelectedChocolate] = useState<Chocolate | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Load opened chocolates from database
    const loadProgress = async () => {
      const { data } = await supabase
        .from('valentines_progress')
        .select('chocolate_opened')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      if (data?.chocolate_opened && Array.isArray(data.chocolate_opened)) {
        setOpenedChocolates(new Set(data.chocolate_opened));
      }
    };
    loadProgress();
  }, [dayNumber]);

  const openChocolate = async (chocolate: Chocolate) => {
    const newOpened = new Set(openedChocolates);
    const wasAlreadyOpened = newOpened.has(chocolate.id);
    
    if (!wasAlreadyOpened) {
      newOpened.add(chocolate.id);
      setOpenedChocolates(newOpened);

      // Save to database
      await supabase
        .from('valentines_progress')
        .update({ chocolate_opened: Array.from(newOpened) })
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber);

      // Show confetti for new chocolate
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      toast({
        title: '🍫 Chocolate Opened!',
        description: `You found a ${chocolate.name}!`,
        variant: 'default'
      });
    }

    setSelectedChocolate(chocolate);
  };

  const allOpened = openedChocolates.size === chocolates.length;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 400 - 200,
                y: -50,
                rotate: 0,
                scale: 1
              }}
              animate={{ 
                y: 600,
                rotate: 360,
                scale: 0
              }}
              transition={{ 
                duration: 2 + Math.random(),
                delay: Math.random() * 0.3
              }}
              className="absolute text-2xl"
              style={{ left: '50%' }}
            >
              {['🍫', '🍬', '💝', '✨', '💕'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <Gift className="w-16 h-16 mx-auto mb-4 text-amber-300" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Virtual Chocolate Box</h2>
        <p className="text-lg opacity-90">Open each chocolate to reveal a sweet message 💝</p>
        <p className="text-sm opacity-70 mt-2">
          {openedChocolates.size} / {chocolates.length} chocolates opened
        </p>
      </motion.div>

      {/* Chocolate Box Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl">
        {chocolates.map((chocolate, index) => {
          const isOpened = openedChocolates.has(chocolate.id);
          
          return (
            <motion.div
              key={chocolate.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openChocolate(chocolate)}
              className="relative cursor-pointer group"
              style={{ perspective: '1000px' }}
            >
              {/* Chocolate Card */}
              <div
                className={`
                  relative w-full min-h-[280px]
                  bg-gradient-to-br ${chocolate.gradient}
                  rounded-3xl p-6 md:p-8
                  border-3 ${isOpened ? 'border-yellow-400/70' : 'border-white/40'}
                  shadow-xl hover:shadow-2xl
                  transition-all duration-300
                  ${chocolate.isSpecial ? 'ring-4 ring-yellow-400/50' : ''}
                  flex flex-col items-center justify-center
                `}
                style={{
                  clipPath: isOpened 
                    ? 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 18%)' 
                    : 'none',
                  borderWidth: '3px'
                }}
              >
                {/* Bite Mark Shadow & Texture (only when opened) */}
                {isOpened && (
                  <>
                    {/* Bite shadow overlay */}
                    <div 
                      className="absolute top-0 left-0 w-24 h-24 pointer-events-none z-0"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.1) 60%, transparent 80%)',
                        clipPath: 'polygon(0% 0%, 35% 0%, 0% 35%)'
                      }}
                    />
                    
                    {/* Bite texture marks */}
                    <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none opacity-40 z-0">
                      <svg width="100%" height="100%" viewBox="0 0 80 80">
                        {/* Bite indentations */}
                        <circle cx="12" cy="8" r="3" fill="rgba(0,0,0,0.3)" />
                        <circle cx="8" cy="12" r="2.5" fill="rgba(0,0,0,0.25)" />
                        <circle cx="16" cy="12" r="2" fill="rgba(0,0,0,0.2)" />
                        <circle cx="12" cy="16" r="2" fill="rgba(0,0,0,0.2)" />
                        <circle cx="20" cy="16" r="1.5" fill="rgba(0,0,0,0.15)" />
                      </svg>
                    </div>
                  </>
                )}

                {/* Special Badge */}
                {chocolate.isSpecial && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg z-10 flex items-center gap-1"
                  >
                    ⭐ FAV
                  </motion.div>
                )}

                {/* Opened Badge */}
                {isOpened && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute top-3 left-20 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg font-bold text-lg z-10"
                  >
                    ✓
                  </motion.div>
                )}

                {/* Chocolate Icon */}
                <motion.div
                  animate={isOpened ? { 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-7xl md:text-8xl mb-4 text-center drop-shadow-2xl relative z-5"
                >
                  {chocolate.emoji}
                </motion.div>

                {/* Chocolate Name */}
                <h3 className="text-base md:text-lg font-bold text-center text-white drop-shadow-md leading-tight relative z-5">
                  {chocolate.name}
                </h3>

                {/* Sparkle Effect for unopened */}
                {!isOpened && (
                  <motion.div
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      rotate: [0, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-3 right-3 z-10"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
                  </motion.div>
                )}

                {/* Glossy shine effect */}
                <div 
                  className="absolute inset-0 rounded-3xl pointer-events-none z-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
                    clipPath: isOpened 
                      ? 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 18%)' 
                      : 'none'
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All Opened Message */}
      {allOpened && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-5xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">All Chocolates Opened! 🍫</h3>
          <p className="text-lg opacity-90">
            You've discovered all the sweet messages! Hope you enjoyed every single one, my love! 💕
          </p>
        </motion.div>
      )}

      {/* Message Modal */}
      <AnimatePresence>
        {selectedChocolate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedChocolate(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                bg-gradient-to-br ${selectedChocolate.gradient}
                rounded-3xl p-8 md:p-12 max-w-lg w-full
                shadow-2xl border-2 border-white/30
              `}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedChocolate(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>

              {/* Chocolate Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-8xl text-center mb-6"
              >
                {selectedChocolate.emoji}
              </motion.div>

              {/* Chocolate Name */}
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white">
                {selectedChocolate.name}
              </h3>

              {/* Special Badge */}
              {selectedChocolate.isSpecial && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                    ⭐ Your Favorite!
                  </span>
                </div>
              )}

              {/* Message */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-lg md:text-xl text-white text-center leading-relaxed italic">
                  "{selectedChocolate.message}"
                </p>
              </div>

              {/* Footer */}
              <p className="text-center mt-6 text-white/70 text-sm">
                💕 From Your Cookie
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChocolateGame;
