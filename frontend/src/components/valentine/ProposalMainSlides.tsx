import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Heart, Sparkles, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import FireworksCanvas from './FireworksCanvas';
import ParticleMagic from './ParticleMagic';
import VoiceNoteVisualizer from './VoiceNoteVisualizer';

interface ProposalMainSlidesProps {
  dayNumber: number;
}

const mainSlides = [
  {
    text: "From the moment I met you, My Jaan...",
    subtext: "My world changed forever ✨",
    emoji: "✨",
    color: "from-pink-400 to-rose-500"
  },
  {
    text: "Your smile, Senorita, lights up my entire universe",
    subtext: "Every single day with you is a blessing 🌟",
    emoji: "😊",
    color: "from-purple-400 to-pink-500"
  },
  {
    text: "You are my safe place, Reina",
    subtext: "In your arms, I found my home 🏡",
    emoji: "🤗",
    color: "from-rose-400 to-pink-400"
  },
  {
    type: 'photo',
    photoIndex: 1,
    text: "This moment... when I realized you were everything",
    emoji: "📸",
    color: "from-amber-400 to-pink-500"
  },
  {
    type: 'photo',
    photoIndex: 2,
    text: "Every memory with you is a treasure I hold close to my heart",
    emoji: "💝",
    color: "from-pink-500 to-rose-600"
  },
  {
    type: 'voice',
    text: "I have something special to tell you...",
    subtext: "Listen to my heart, Darling 💕",
    emoji: "💌",
    color: "from-red-400 to-pink-500"
  },
  {
    type: 'photo',
    photoIndex: 3,
    text: "Your laughter is the most beautiful sound in the world, Honey",
    emoji: "🎵",
    color: "from-purple-500 to-pink-500"
  },
  {
    type: 'photo',
    photoIndex: 4,
    text: "With you, every moment becomes a cherished memory, My Jaan",
    emoji: "⭐",
    color: "from-pink-400 to-red-400"
  },
  {
    text: "You make my heart skip a beat, Senorita",
    subtext: "Every single time I see you 💓",
    emoji: "💓",
    color: "from-red-400 to-pink-500"
  },
  {
    text: "I promise to love you more each day, Reina",
    subtext: "Through every sunrise and sunset 🌅",
    emoji: "🌅",
    color: "from-orange-400 to-pink-500"
  },
  {
    text: "You are my forever, Honey",
    subtext: "My today, my tomorrow, my always 💫",
    emoji: "♾️",
    color: "from-purple-400 to-rose-500"
  },
  {
    text: "Will you marry me, My Senorita?",
    subtext: "Make me the happiest person alive 💍",
    emoji: "💍",
    color: "from-rose-400 to-red-500",
    choices: ["Yes, Forever! 💕", "Always & Forever! ❤️", "A Thousand Times Yes! 💖"]
  }
];

const ProposalMainSlides = ({ dayNumber }: ProposalMainSlidesProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string>('/audio/proposal-voice-note.mp3');
  
  const celebrationRef = useRef<HTMLDivElement>(null);

  const handleChoice = async (choice: string) => {
    setSelectedChoice(choice);
    setShowFireworks(true);

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
    if (currentSlide < mainSlides.length - 1) {
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

  // Completion slide
  if (isComplete) {
    return (
      <>
        <motion.div
          ref={celebrationRef}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-12 relative z-20"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            💕
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-lg">
            You said {selectedChoice}!
          </h2>
          <p className="text-xl opacity-90 mb-6 text-white drop-shadow-md">
            My heart is overflowing with joy, My Senorita 💖
          </p>
          <p className="text-lg opacity-80 mb-6 text-white drop-shadow-md italic">
            "You've made me the happiest Cookie in the world!" 🍪✨
          </p>
          
          <Button
            onClick={downloadImage}
            className="bg-white/90 hover:bg-white text-pink-600 border-2 border-white mt-4 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Save This Moment
          </Button>
          
          {showFireworks && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                    y: -50,
                    rotate: 0
                  }}
                  animate={{ 
                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "linear"
                  }}
                  className="absolute text-3xl"
                >
                  {['❤️', '💕', '💖', '💗', '✨', '⭐', '💍', '🌹'][Math.floor(Math.random() * 8)]}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        <FireworksCanvas active={showFireworks} duration={10000} />
        <ParticleMagic intensity="high" />
      </>
    );
  }

  const slide = mainSlides[currentSlide];

  // Render photo slide
  if (slide.type === 'photo') {
    return (
      <>
        <ParticleMagic intensity="low" />
        
        <div className="flex flex-col items-center justify-center min-h-[500px] relative z-20 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl w-full"
            >
              {/* Polaroid-style photo frame */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: [2, -2, 2] }}
                transition={{ 
                  scale: { duration: 0.5 },
                  rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="bg-white p-4 rounded-lg shadow-2xl mb-6 mx-auto max-w-md"
                style={{
                  transform: `rotate(${(slide.photoIndex || 0) % 2 === 0 ? '2deg' : '-2deg'})`
                }}
              >
                <div className="relative aspect-square mb-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded overflow-hidden">
                  <img
                    src={`/images/senorita/photo${slide.photoIndex}.jpg`}
                    alt={`Memory ${slide.photoIndex}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image not found
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full">
                            <div class="text-center">
                              <p class="text-6xl mb-4">📸</p>
                              <p class="text-gray-600 text-sm">Photo ${slide.photoIndex}</p>
                              <p class="text-gray-500 text-xs mt-2">Place photo${slide.photoIndex}.jpg in /images/senorita/</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <p className="text-gray-700 text-sm font-handwriting italic">
                  Memory #{slide.photoIndex}
                </p>
              </motion.div>

              {/* Text below photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {slide.emoji}
                </motion.div>
                
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-white drop-shadow-lg px-4">
                  {slide.text}
                </h2>

                <Button
                  onClick={nextSlide}
                  className="mt-6 py-4 sm:py-6 px-8 sm:px-12 text-base sm:text-lg font-bold bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 transition-all shadow-xl"
                >
                  Continue <Sparkles className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-2 mt-8">
            {mainSlides.map((_, index) => (
              <div
                key={index}
                className={`h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-8 shadow-lg' 
                    : index < currentSlide 
                    ? 'bg-white/70 w-3' 
                    : 'bg-white/30 w-3'
                }`}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Render voice note slide
  if (slide.type === 'voice') {
    return (
      <>
        <ParticleMagic intensity="medium" />
        
        <div className="flex flex-col items-center justify-center min-h-[500px] relative z-20 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl w-full"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {slide.emoji}
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white drop-shadow-lg px-4">
                {slide.text}
              </h2>
              
              <p className="text-lg sm:text-xl text-white/90 mb-8 drop-shadow-md">
                {slide.subtext}
              </p>

              {/* Voice Note Visualizer */}
              <VoiceNoteVisualizer audioUrl={voiceNoteUrl} />

              <Button
                onClick={nextSlide}
                className="mt-8 py-4 sm:py-6 px-8 sm:px-12 text-base sm:text-lg font-bold bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 transition-all shadow-xl"
              >
                Continue <Sparkles className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-2 mt-8">
            {mainSlides.map((_, index) => (
              <div
                key={index}
                className={`h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-8 shadow-lg' 
                    : index < currentSlide 
                    ? 'bg-white/70 w-3' 
                    : 'bg-white/30 w-3'
                }`}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Render regular text slide
  return (
    <>
      <ParticleMagic intensity="low" />
      
      <div className="flex flex-col items-center justify-center min-h-[500px] relative z-20 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl w-full"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl sm:text-7xl md:text-8xl mb-8"
            >
              {slide.emoji}
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-lg px-4"
            >
              {slide.text}
            </motion.h2>

            {slide.subtext && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl text-white/90 mb-8 drop-shadow-md"
              >
                {slide.subtext}
              </motion.p>
            )}

            {slide.choices ? (
              <div className="flex flex-col gap-4 mt-8">
                {slide.choices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="py-4 sm:py-6 text-lg sm:text-xl font-bold bg-white text-pink-600 hover:bg-pink-50 border-2 border-white transform hover:scale-105 transition-all shadow-xl"
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            ) : (
              <Button
                onClick={nextSlide}
                className="mt-8 py-4 sm:py-6 px-8 sm:px-12 text-base sm:text-lg font-bold bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 transition-all shadow-xl"
              >
                Continue <Sparkles className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {mainSlides.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-8 shadow-lg' 
                  : index < currentSlide 
                  ? 'bg-white/70 w-3' 
                  : 'bg-white/30 w-3'
              }`}
            />
          ))}
        </div>
      </div>

      <FireworksCanvas active={showFireworks} duration={5000} />
    </>
  );
};

export default ProposalMainSlides;
