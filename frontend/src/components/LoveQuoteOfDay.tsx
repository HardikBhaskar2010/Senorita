import { useEffect, useState } from "react";
import { Heart, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

const loveQuotes = [
  {
    quote: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou"
  },
  {
    quote: "You are my today and all of my tomorrows.",
    author: "Leo Christopher"
  },
  {
    quote: "I love you not only for what you are, but for what I am when I am with you.",
    author: "Roy Croft"
  },
  {
    quote: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn"
  },
  {
    quote: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.",
    author: "Dr. Seuss"
  },
  {
    quote: "I would rather share one lifetime with you than face all the ages of this world alone.",
    author: "J.R.R. Tolkien"
  },
  {
    quote: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle"
  },
  {
    quote: "When I saw you I fell in love, and you smiled because you knew.",
    author: "Arrigo Boito"
  },
  {
    quote: "I love you more than I have ever found a way to say to you.",
    author: "Ben Folds"
  },
  {
    quote: "You are every reason, every hope, and every dream I've ever had.",
    author: "The Notebook"
  },
  {
    quote: "My heart is and always will be yours.",
    author: "Jane Austen"
  },
  {
    quote: "I wish I could turn back the clock. I'd find you sooner and love you longer.",
    author: "Unknown"
  },
  {
    quote: "You are my sun, my moon, and all of my stars.",
    author: "E.E. Cummings"
  },
  {
    quote: "I fell in love with you because of the million things you never knew you were doing.",
    author: "Unknown"
  },
  {
    quote: "Together is a wonderful place to be.",
    author: "Unknown"
  },
  {
    quote: "Your love shines in my heart as the sun that shines upon the earth.",
    author: "Eleanor Di Guillo"
  },
  {
    quote: "Every love story is beautiful, but ours is my favorite.",
    author: "Unknown"
  },
  {
    quote: "I want all of my lasts to be with you.",
    author: "Unknown"
  },
  {
    quote: "You make me want to be a better person.",
    author: "As Good as It Gets"
  },
  {
    quote: "I love you begins by I, but it ends up by you.",
    author: "Charles de Leusse"
  }
];

const LoveQuoteOfDay = () => {
  const [currentQuote, setCurrentQuote] = useState(loveQuotes[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get quote based on day of year (consistent daily quote)
  useEffect(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % loveQuotes.length;
    
    setCurrentQuote(loveQuotes[quoteIndex]);
  }, []);

  // Refresh quote manually
  const refreshQuote = () => {
    setIsRefreshing(true);
    const randomIndex = Math.floor(Math.random() * loveQuotes.length);
    
    setTimeout(() => {
      setCurrentQuote(loveQuotes[randomIndex]);
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <motion.div
      className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background hearts */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              y: [null, '-20%', '120%'],
              opacity: [0.5, 0.8, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 1.5
            }}
          >
            💕
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Heart className="w-6 h-6 text-rose-500 fill-current" />
            </motion.div>
            <h3 className="text-lg font-bold text-foreground">Love Quote of the Day</h3>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="hover:bg-rose-500/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-rose-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Quote */}
        <motion.div
          key={currentQuote.quote}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center"
        >
          <blockquote className="relative">
            <span className="text-6xl text-rose-500/20 absolute -top-4 -left-2">"</span>
            <p className="text-base md:text-lg font-medium text-foreground italic leading-relaxed pl-6 pr-2">
              {currentQuote.quote}
            </p>
            <span className="text-6xl text-rose-500/20 absolute -bottom-8 right-0">"</span>
          </blockquote>
          
          <p className="text-sm text-muted-foreground mt-6 text-right font-semibold">
            — {currentQuote.author}
          </p>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          className="mt-4 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent rounded-full"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
          }}
        />
      </div>
    </motion.div>
  );
};

export default LoveQuoteOfDay;
