import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface RosePetalsProps {
  dayNumber: number;
}

const reasons = [
  "Your laugh makes my day brighter ☀️",
  "The way you care for everyone around you 💕",
  "Your beautiful smile that lights up the room 😊",
  "How you always know how to make me feel better 🤗",
  "Your passion and dedication to everything you do ⭐",
  "The way you make ordinary moments extraordinary ✨",
  "Your kindness and gentle heart 💖",
  "How you believe in me even when I don't 🌟"
];

const RosePetals = ({ dayNumber }: RosePetalsProps) => {
  const [revealedPetals, setRevealedPetals] = useState<number[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');

  useEffect(() => {
    // Load revealed petals from database
    const loadProgress = async () => {
      const { data } = await supabase
        .from('valentines_progress')
        .select('revealed_petals')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      if (data?.revealed_petals) {
        setRevealedPetals(data.revealed_petals as number[]);
      }
    };
    loadProgress();
  }, [dayNumber]);

  const handlePetalClick = async (index: number) => {
    if (revealedPetals.includes(index)) {
      // Already revealed, just show it
      setSelectedReason(reasons[index]);
      return;
    }

    // Reveal new petal
    const newRevealed = [...revealedPetals, index];
    setRevealedPetals(newRevealed);
    setSelectedReason(reasons[index]);

    // Save to database
    try {
      await supabase
        .from('valentines_progress')
        .update({ revealed_petals: newRevealed })
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber);

      toast({
        title: '🌹 Petal Revealed!',
        description: 'A new reason to love you...',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving petal:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Rose Center */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        {/* Center of rose */}
        <div className="absolute text-6xl z-10">🌹</div>
        
        {/* Petals arranged in a circle */}
        {reasons.map((_, index) => {
          const angle = (index * 360) / reasons.length;
          const radius = 80;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const isRevealed = revealedPetals.includes(index);

          return (
            <motion.button
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePetalClick(index)}
              className={`
                absolute text-4xl cursor-pointer
                transition-all duration-300
                ${isRevealed ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
              `}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🌸
            </motion.button>
          );
        })}
      </motion.div>

      {/* Reason Display */}
      {selectedReason && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md text-center"
        >
          <p className="text-lg font-medium italic">"{selectedReason}"</p>
        </motion.div>
      )}

      {/* Progress */}
      <p className="text-sm opacity-70">
        {revealedPetals.length} / {reasons.length} petals revealed
      </p>
    </div>
  );
};

export default RosePetals;