import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface KissRipplesProps {
  dayNumber: number;
}

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type Kiss = {
  memory: string;
  emoji: string;
};

const memories: Kiss[] = [
  { memory: "Our first date under the stars", emoji: "⭐" },
  { memory: "When you first held my hand", emoji: "🤝" },
  { memory: "That beautiful sunset we watched together", emoji: "🌅" },
  { memory: "Our first kiss that took my breath away", emoji: "💋" },
  { memory: "The way you look at me with those eyes", emoji: "👀" },
  { memory: "Dancing in the rain together", emoji: "🌧️" },
  { memory: "Your laugh that makes everything better", emoji: "😂" },
  { memory: "Cooking together and making a mess", emoji: "🍳" },
  { memory: "Late night conversations about everything", emoji: "🌙" },
  { memory: "The day you said 'I love you' back", emoji: "💖" }
];

const KissRipples = ({ dayNumber }: KissRipplesProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [currentMemory, setCurrentMemory] = useState<Kiss | null>(null);
  const [collectedKisses, setCollectedKisses] = useState<Kiss[]>([]);
  const [rippleId, setRippleId] = useState(0);

  useEffect(() => {
    // Load collected kisses
    const loadKisses = async () => {
      const { data } = await supabase
        .from('valentines_progress')
        .select('collected_kisses')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      if (data?.collected_kisses) {
        setCollectedKisses(data.collected_kisses as Kiss[]);
      }
    };
    loadKisses();
  }, [dayNumber]);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple
    const newRipple = { id: rippleId, x, y };
    setRipples(prev => [...prev, newRipple]);
    setRippleId(prev => prev + 1);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    // Show random memory
    const randomMemory = memories[Math.floor(Math.random() * memories.length)];
    setCurrentMemory(randomMemory);

    // Add to collected kisses if not already collected
    if (!collectedKisses.find(k => k.memory === randomMemory.memory)) {
      const newCollected = [...collectedKisses, randomMemory];
      setCollectedKisses(newCollected);

      // Save to database
      await supabase
        .from('valentines_progress')
        .update({ collected_kisses: newCollected })
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber);

      toast({
        title: '💋 Kiss Collected!',
        description: `${collectedKisses.length + 1} kisses in your jar`,
        variant: 'default'
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <h3 className="text-2xl font-bold text-center">Tap Anywhere for Kisses 💋</h3>

      {/* Interactive Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClick}
        className="relative w-full h-[400px] bg-white/5 rounded-2xl border-2 border-dashed border-white/30 cursor-pointer overflow-hidden flex items-center justify-center"
      >
        <p className="text-lg opacity-50 pointer-events-none">Tap anywhere 💆</p>

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute w-24 h-24 rounded-full border-4 border-pink-400 pointer-events-none"
              style={{
                left: ripple.x - 48,
                top: ripple.y - 48
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                💋
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Current Memory */}
      <AnimatePresence mode="wait">
        {currentMemory && (
          <motion.div
            key={currentMemory.memory}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md text-center"
          >
            <div className="text-5xl mb-3">{currentMemory.emoji}</div>
            <p className="text-lg font-medium italic">"{currentMemory.memory}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kiss Jar */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🏺</div>
        <h4 className="text-xl font-bold mb-2">Your Kiss Jar</h4>
        <p className="text-3xl font-bold text-pink-300 mb-4">
          {collectedKisses.length} / {memories.length}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {memories.map((kiss, index) => (
            <div
              key={index}
              className={`text-3xl transition-all ${
                collectedKisses.find(k => k.memory === kiss.memory)
                  ? 'opacity-100 scale-100'
                  : 'opacity-20 scale-75'
              }`}
              title={kiss.memory}
            >
              💋
            </div>
          ))}
        </div>
        {collectedKisses.length === memories.length && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm mt-4 text-green-300 font-medium"
          >
            ✨ All kisses collected! You're amazing! ✨
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default KissRipples;