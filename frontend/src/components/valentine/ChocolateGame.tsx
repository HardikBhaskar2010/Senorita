import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ChocolateGameProps {
  dayNumber: number;
}

type ChocolateDesign = {
  filling: string;
  drizzle: string;
  topping: string;
};

const fillings = [
  { name: 'Caramel', emoji: '🍯', color: '#D2691E' },
  { name: 'Nuts', emoji: '🥜', color: '#8B4513' },
  { name: 'Cream', emoji: '🍦', color: '#FFF8DC' },
  { name: 'Strawberry', emoji: '🍓', color: '#FF69B4' },
];

const drizzles = [
  { name: 'White', emoji: '⭕', color: '#FFFFFF' },
  { name: 'Dark', emoji: '🟤', color: '#3E2723' },
  { name: 'Milk', emoji: '🟠', color: '#D2691E' },
];

const toppings = [
  { name: 'Sprinkles', emoji: '✨' },
  { name: 'Hearts', emoji: '💕' },
  { name: 'Stars', emoji: '⭐' },
  { name: 'Flowers', emoji: '🌸' },
];

const ChocolateGame = ({ dayNumber }: ChocolateGameProps) => {
  const [design, setDesign] = useState<ChocolateDesign>({
    filling: '',
    drizzle: '',
    topping: ''
  });
  const [isComplete, setIsComplete] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const dessertPlaylist = [
    { title: "Sugar", artist: "Maroon 5", emoji: "🍬" },
    { title: "Candy", artist: "Doja Cat", emoji: "🍭" },
    { title: "Chocolate", artist: "The 1975", emoji: "🍫" },
    { title: "Cake By The Ocean", artist: "DNCE", emoji: "🎂" },
    { title: "Ice Cream", artist: "BLACKPINK & Selena Gomez", emoji: "🍦" },
    { title: "Strawberry Fields Forever", artist: "The Beatles", emoji: "🍓" },
    { title: "Brown Sugar", artist: "The Rolling Stones", emoji: "🍯" },
    { title: "Honey", artist: "Kehlani", emoji: "🍯" }
  ];

  useEffect(() => {
    // Load saved design
    const loadDesign = async () => {
      const { data } = await supabase
        .from('valentines_progress')
        .select('chocolate_design')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      if (data?.chocolate_design && Object.keys(data.chocolate_design).length > 0) {
        setDesign(data.chocolate_design as ChocolateDesign);
        setIsComplete(true);
      }
    };
    loadDesign();
  }, [dayNumber]);

  const selectOption = (category: keyof ChocolateDesign, value: string) => {
    setDesign(prev => ({ ...prev, [category]: value }));
  };

  const completeDesign = async () => {
    if (!design.filling || !design.drizzle || !design.topping) {
      toast({
        title: 'Almost there! 🍫',
        description: 'Please select all options to complete your chocolate.',
        variant: 'default'
      });
      return;
    }

    // Save to database
    await supabase
      .from('valentines_progress')
      .update({ chocolate_design: design })
      .eq('user_name', 'Senorita')
      .eq('day_number', dayNumber);

    setIsComplete(true);
    toast({
      title: '🍫 Chocolate Created!',
      description: 'Your personalized chocolate is ready!',
      variant: 'default'
    });
  };

  const downloadCoupon = () => {
    toast({
      title: '🎫 Coupon Downloaded!',
      description: 'Redeemable for real chocolate anytime!',
      variant: 'default'
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Chocolate Preview */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative w-48 h-48 bg-amber-900 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden"
      >
        {/* Filling */}
        {design.filling && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              backgroundColor: fillings.find(f => f.name === design.filling)?.color,
              opacity: 0.6
            }}
          />
        )}
        
        {/* Drizzle */}
        {design.drizzle && (
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full">
              <path
                d="M 20 20 Q 50 60 80 40 T 140 60 Q 160 80 180 60"
                stroke={drizzles.find(d => d.name === design.drizzle)?.color}
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </motion.div>
        )}

        {/* Topping */}
        {design.topping && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 flex-wrap p-4">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-3xl"
              >
                {toppings.find(t => t.name === design.topping)?.emoji}
              </motion.span>
            ))}
          </div>
        )}

        <div className="absolute text-6xl z-10">🍫</div>
      </motion.div>

      {!isComplete ? (
        <>
          {/* Filling Selection */}
          <div className="w-full">
            <h3 className="text-xl font-bold mb-3 text-center">Choose Your Filling:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fillings.map(filling => (
                <motion.button
                  key={filling.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectOption('filling', filling.name)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${design.filling === filling.name 
                      ? 'border-white bg-white/20 shadow-lg' 
                      : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{filling.emoji}</div>
                  <div className="text-sm font-medium">{filling.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Drizzle Selection */}
          <div className="w-full">
            <h3 className="text-xl font-bold mb-3 text-center">Add Drizzle:</h3>
            <div className="grid grid-cols-3 gap-3">
              {drizzles.map(drizzle => (
                <motion.button
                  key={drizzle.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectOption('drizzle', drizzle.name)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${design.drizzle === drizzle.name 
                      ? 'border-white bg-white/20 shadow-lg' 
                      : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{drizzle.emoji}</div>
                  <div className="text-sm font-medium">{drizzle.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Topping Selection */}
          <div className="w-full">
            <h3 className="text-xl font-bold mb-3 text-center">Pick Toppings:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {toppings.map(topping => (
                <motion.button
                  key={topping.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectOption('topping', topping.name)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${design.topping === topping.name 
                      ? 'border-white bg-white/20 shadow-lg' 
                      : 'border-white/30 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{topping.emoji}</div>
                  <div className="text-sm font-medium">{topping.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            onClick={completeDesign}
            className="w-full py-6 text-lg bg-white/20 hover:bg-white/30 text-white mt-4"
            disabled={!design.filling || !design.drizzle || !design.topping}
          >
            Complete My Chocolate! 🍫
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
            <h3 className="text-2xl font-bold mb-4">Your Chocolate is Ready! 🎉</h3>
            <p className="mb-4">Filling: {design.filling} | Drizzle: {design.drizzle} | Topping: {design.topping}</p>
            <Button
              onClick={downloadCoupon}
              className="w-full bg-white/20 hover:bg-white/30 text-white mb-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Chocolate Coupon
            </Button>
            <Button
              onClick={() => setShowPlaylist(!showPlaylist)}
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              🎵 {showPlaylist ? 'Hide' : 'Reveal'} Dessert Playlist
            </Button>
          </div>

          {/* Playlist */}
          {showPlaylist && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h4 className="text-xl font-bold mb-4 text-center">🍰 Sweet Treats Playlist 🍰</h4>
              <div className="space-y-3">
                {dessertPlaylist.map((song, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all"
                  >
                    <span className="text-2xl">{song.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm opacity-70">{song.artist}</div>
                    </div>
                    <span className="text-sm opacity-50">#{index + 1}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm mt-4 opacity-70 text-center">💕 Enjoy these sweet songs with your sweet chocolate!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ChocolateGame;