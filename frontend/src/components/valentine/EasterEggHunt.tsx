import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EasterEggHuntProps {
  dayNumber: number;
  onEggFound?: (eggId: string) => void;
}

const easterEggs = [
  { id: 'egg1', emoji: '🥚', message: 'You found a golden egg! Cookie loves you more than words can say 💛', position: 'top-4 right-4' },
  { id: 'egg2', emoji: '✨', message: 'Sparkle found! Every moment with you is magical ✨', position: 'bottom-4 left-4' },
  { id: 'egg3', emoji: '💝', message: 'Secret heart discovered! You are my everything 💝', position: 'top-1/2 left-4' },
  { id: 'egg4', emoji: '🌟', message: 'Shining star! You light up my life like no one else 🌟', position: 'bottom-8 right-8' },
];

const EasterEggHunt = ({ dayNumber, onEggFound }: EasterEggHuntProps) => {
  const [foundEggs, setFoundEggs] = useState<string[]>([]);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  // Load found eggs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`valentine-eggs-day${dayNumber}`);
    if (saved) {
      setFoundEggs(JSON.parse(saved));
    }
  }, [dayNumber]);

  const handleEggClick = (egg: typeof easterEggs[0]) => {
    if (foundEggs.includes(egg.id)) return;

    const newFound = [...foundEggs, egg.id];
    setFoundEggs(newFound);
    localStorage.setItem(`valentine-eggs-day${dayNumber}`, JSON.stringify(newFound));
    
    setShowMessage(egg.message);
    setTimeout(() => setShowMessage(null), 4000);

    if (onEggFound) {
      onEggFound(egg.id);
    }

    toast({
      title: '🎉 Easter Egg Found!',
      description: `${newFound.length} / ${easterEggs.length} discovered`,
      variant: 'default'
    });
  };

  // Secret click combo to reveal all eggs temporarily
  const handleSecretClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        toast({
          title: '🔍 Hint Mode Activated!',
          description: 'All hidden eggs are glowing for 10 seconds!',
          variant: 'default'
        });
        setTimeout(() => setClickCount(0), 10000);
      }
      return newCount;
    });
  };

  const allFound = foundEggs.length === easterEggs.length;

  return (
    <>
      {/* Hidden Easter Eggs */}
      {easterEggs.map((egg) => {
        const isFound = foundEggs.includes(egg.id);
        const showHint = clickCount >= 5;

        return (
          <motion.button
            key={egg.id}
            onClick={() => handleEggClick(egg)}
            className={`
              fixed ${egg.position} z-40 text-2xl cursor-pointer
              ${isFound ? 'opacity-30 pointer-events-none' : 'opacity-0 hover:opacity-100'}
              ${showHint && !isFound ? 'opacity-50 animate-pulse' : ''}
              transition-opacity duration-300
            `}
            whileHover={{ scale: 1.3, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            {egg.emoji}
          </motion.button>
        );
      })}

      {/* Secret Click Area for Hints */}
      <div
        onClick={handleSecretClick}
        className="fixed top-0 left-0 w-20 h-20 opacity-0 cursor-help z-30"
        title="Click 5 times for hints"
      />

      {/* Message Display */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md text-center"
          >
            <p className="font-medium">{showMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Badge */}
      {foundEggs.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed top-4 left-4 z-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">{foundEggs.length}/{easterEggs.length}</span>
          {allFound && <Star className="w-4 h-4 text-yellow-300 animate-pulse" />}
        </motion.div>
      )}

      {/* Completion Message */}
      {allFound && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span className="font-bold">All Easter Eggs Found! 🎉</span>
            <Heart className="w-5 h-5" />
          </div>
        </motion.div>
      )}
    </>
  );
};

export default EasterEggHunt;
