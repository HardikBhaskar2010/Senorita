import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Heart, Sparkles, Download, Play, Pause } from 'lucide-react';
import html2canvas from 'html2canvas';
import FireworksCanvas from './FireworksCanvas';
import ParticleMagic from './ParticleMagic';

interface ProposalMainSlidesProps {
  dayNumber: number;
}

const mainSlides = [
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

const ProposalMainSlides = ({ dayNumber }: ProposalMainSlidesProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  
  const celebrationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voice note if available
  useEffect(() => {
    fetchVoiceNote();
  }, []);

  const fetchVoiceNote = async () => {
    try {
      const { data, error } = await supabase
        .from('valentines_progress')
        .select('voice_message_url')
        .eq('user_name', 'Cookie')
        .eq('day_number', dayNumber)
        .single();

      if (data?.voice_message_url) {
        setVoiceNoteUrl(data.voice_message_url);
      }
    } catch (err) {
      console.error('Error fetching voice note:', err);
    }
  };

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

  const toggleVoiceNote = () => {
    if (!audioRef.current) return;
    
    if (isPlayingVoice) {
      audioRef.current.pause();
      setIsPlayingVoice(false);
      
      const bgMusic = document.querySelector('audio[data-bg-music]') as HTMLAudioElement;
      if (bgMusic) bgMusic.play();
    } else {
      const bgMusic = document.querySelector('audio[data-bg-music]') as HTMLAudioElement;
      if (bgMusic) bgMusic.pause();
      
      audioRef.current.play();
      setIsPlayingVoice(true);
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
            My heart is overflowing with joy 💖
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
                  {['❤️', '💕', '💖', '💗', '✨', '⭐'][Math.floor(Math.random() * 6)]}
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
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-white drop-shadow-lg px-4"
            >
              {slide.text}
            </motion.h2>

            {/* Voice Note Player */}
            {voiceNoteUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border-2 border-white/40">
                  <p className="text-sm text-white font-semibold mb-2 drop-shadow">
                    💌 Cookie's Voice Message
                  </p>
                  <Button
                    onClick={toggleVoiceNote}
                    className="bg-white text-pink-600 hover:bg-pink-50 font-semibold w-full sm:w-auto"
                  >
                    {isPlayingVoice ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play Voice Note
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
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

      {/* Hidden audio element */}
      {voiceNoteUrl && (
        <audio
          ref={audioRef}
          src={voiceNoteUrl}
          onEnded={() => {
            setIsPlayingVoice(false);
            const bgMusic = document.querySelector('audio[data-bg-music]') as HTMLAudioElement;
            if (bgMusic) bgMusic.play();
          }}
        />
      )}

      <FireworksCanvas active={showFireworks} duration={5000} />
    </>
  );
};

export default ProposalMainSlides;
