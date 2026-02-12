import { useEffect, useState } from "react";
import { Sparkles, Coffee, Sunset, Moon, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface Activity {
  icon: string;
  title: string;
  description: string;
  emoji: string;
}

const ActivitySuggestions = () => {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const updateActivity = () => {
      const hour = new Date().getHours();
      let activity: Activity;

      if (hour >= 5 && hour < 8) {
        // Early Morning (5 AM - 8 AM)
        activity = {
          icon: "sunrise",
          title: "Morning Cuddles",
          description: "Start the day wrapped in each other's warmth with sweet morning kisses",
          emoji: "🌅"
        };
      } else if (hour >= 8 && hour < 12) {
        // Morning (8 AM - 12 PM)
        activity = {
          icon: "coffee",
          title: "Coffee Date at Home",
          description: "Brew some coffee together and share your dreams for the day ahead",
          emoji: "☕"
        };
      } else if (hour >= 12 && hour < 14) {
        // Lunch Time (12 PM - 2 PM)
        activity = {
          icon: "lunch",
          title: "Lunch Together",
          description: "Cook a meal together or order your favorite food - make it special!",
          emoji: "🍝"
        };
      } else if (hour >= 14 && hour < 17) {
        // Afternoon (2 PM - 5 PM)
        activity = {
          icon: "walk",
          title: "Afternoon Stroll",
          description: "Take a walk hand-in-hand, talk about everything and nothing",
          emoji: "🚶‍♂️"
        };
      } else if (hour >= 17 && hour < 19) {
        // Evening (5 PM - 7 PM)
        activity = {
          icon: "sunset",
          title: "Watch the Sunset",
          description: "Find a cozy spot and watch the sky paint itself in beautiful colors",
          emoji: "🌇"
        };
      } else if (hour >= 19 && hour < 21) {
        // Dinner Time (7 PM - 9 PM)
        activity = {
          icon: "dinner",
          title: "Candlelight Dinner",
          description: "Set up a romantic dinner with candles, music, and endless conversation",
          emoji: "🕯️"
        };
      } else if (hour >= 21 && hour < 23) {
        // Night (9 PM - 11 PM)
        activity = {
          icon: "movie",
          title: "Movie Night Cuddles",
          description: "Snuggle up with blankets, watch a movie, and share some popcorn",
          emoji: "🎬"
        };
      } else {
        // Late Night (11 PM - 5 AM)
        activity = {
          icon: "moon",
          title: "Stargazing or Sweet Dreams",
          description: "Either gaze at the stars together or drift off to sleep in each other's arms",
          emoji: "🌙"
        };
      }

      setCurrentActivity(activity);
    };

    updateActivity();
    // Update every minute to check for time changes
    const interval = setInterval(updateActivity, 60000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return <Coffee className="w-8 h-8 text-amber-500" />;
    } else if (hour >= 12 && hour < 17) {
      return <Sparkles className="w-8 h-8 text-yellow-500" />;
    } else if (hour >= 17 && hour < 21) {
      return <Sunset className="w-8 h-8 text-orange-500" />;
    } else {
      return <Moon className="w-8 h-8 text-blue-400" />;
    }
  };

  if (!currentActivity) return null;

  return (
    <motion.div
      className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background orb */}
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            {getIcon()}
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Activity Suggestion</h3>
            <p className="text-xs text-muted-foreground">Perfect for this moment</p>
          </div>
        </div>

        {/* Activity Card */}
        <motion.div
          key={currentActivity.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
        >
          <div className="flex items-start gap-3">
            <span className="text-4xl">{currentActivity.emoji}</span>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-foreground mb-2">
                {currentActivity.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentActivity.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Decorative hearts */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              <Heart className="w-3 h-3 text-rose-500/50 fill-current" />
            </motion.div>
          ))}
        </motion.div>

        {/* Time-based message */}
        <motion.p
          className="text-center text-xs text-muted-foreground italic"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Making every moment count together 💕
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ActivitySuggestions;
