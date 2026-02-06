import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Heart, Sparkles, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ProposalSlideshowProps {
  dayNumber: number;
}

const slides = [
  {
    text: "From the moment I met you...",
    emoji: "✨",
    color: "from-pink-400 to-rose-500"
  },
  {
    text: "Every day with you is magical",
    emoji: "💫",
    color: "from-purple-400 to-pink-500"
  },
  {
    text: "You make my heart skip a beat",
    emoji: "💓",
    color: "from-red-400 to-pink-500"
  },
  {
    text: "Will you be mine forever?",
    emoji: "💍",
    color: "from-rose-400 to-red-500",
    choices: ["Yes, Forever! 💕", "Always & Forever! ❤️"]
  }
];

const ProposalSlideshow = ({ dayNumber }: ProposalSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const celebrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple animation on slide change - using Framer Motion instead
  }, [currentSlide]);

  const handleChoice = async (choice: string) => {
    setSelectedChoice(choice);
    setShowConfetti(true);

    // Save choice to database
    await supabase
      .from('valentines_progress')
      .update({ proposal_choice: choice })
      .eq('user_name', 'Senorita')
      .eq('day_number', dayNumber);

    // Show final slide after delay
    setTimeout(() => {
      setIsComplete(true);
    }, 2000);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const downloadImage = async () => {
    if (!celebrationRef.current) return;
    
    try {
      const canvas = await html2canvas(celebrationRef.current, {
        backgroundColor: 'transparent',
        scale: 2
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `proposal-moment-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (isComplete) {
    return (
      <motion.div
        ref={celebrationRef}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center py-12 relative"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          💕
        </motion.div>
        <h2 className="text-4xl font-bold mb-4">You said {selectedChoice}!</h2>
        <p className="text-xl opacity-90 mb-6">My heart is overflowing with joy 💖</p>
        
        <Button
          onClick={downloadImage}
          className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 mt-4"
        >
          <Download className="w-4 h-4 mr-2" />
          Save This Moment
        </Button>
        
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 50,
                  rotate: 360
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear"
                }}
                className="absolute text-3xl"
              >
                {['❤️', '💕', '💖', '💗', '✨', '⭐'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center max-w-2xl px-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-8xl mb-8"
          >
            {slide.emoji}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className={`text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r ${slide.color} bg-clip-text text-transparent`}
          >
            {slide.text}
          </motion.h2>

          {slide.choices ? (
            <div className="flex flex-col gap-4 mt-8">
              {slide.choices.map((choice, index) => (
                <Button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="py-6 text-xl bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50"
                >
                  {choice}
                </Button>
              ))}
            </div>
          ) : (
            <Button
              onClick={nextSlide}
              className="mt-8 py-6 px-12 text-lg bg-white/20 hover:bg-white/30 text-white"
            >
              Continue <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : index < currentSlide 
                ? 'bg-white/60' 
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProposalSlideshow;