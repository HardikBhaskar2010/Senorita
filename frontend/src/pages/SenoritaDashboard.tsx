import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSpace } from "@/contexts/SpaceContext";
import { useCouple } from "@/contexts/CoupleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import FloatingHearts from "@/components/FloatingHearts";
import HeroSection from "@/components/HeroSection";
import DaysCounter from "@/components/DaysCounter";
import LoveLetters from "@/components/LoveLetters";
import PhotoGallery from "@/components/PhotoGallery";
import MoodSharing from "@/components/MoodSharing";
import DailyQuestion from "@/components/DailyQuestion";
import VirtualHugKiss from "@/components/VirtualHugKiss";
import DailyAffirmation from "@/components/DailyAffirmation";
import CountdownTimer from "@/components/CountdownTimer";
import MemoryTimeline from "@/components/MemoryTimeline";
import SharedCalendar from "@/components/SharedCalendar";
import CalendarDay from "@/components/CalendarDay";
import LoveLanguageResults from "@/components/LoveLanguageResults";
import QuickNotification from "@/components/QuickNotification";
import ChatBubble from "@/components/ChatBubble";
import { Heart, Sparkles, LogOut, Settings, Gift, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const SenoritaDashboard = () => {
  const navigate = useNavigate();
  const { currentSpace, logout, displayName, partnerName } = useSpace();
  const { anniversaryDate, relationshipStart } = useCouple();
  const { dashboardBackgroundSenorita } = useTheme();
  const [unlockedDaysCount, setUnlockedDaysCount] = useState(0);
  const [hasNewUnlock, setHasNewUnlock] = useState(false);
  
  // Day names mapping for notifications
  const dayNames: Record<number, string> = {
    1: "Rose Day",
    2: "Propose Day",
    3: "Chocolate Day",
    4: "Teddy Day",
    5: "Promise Day",
    6: "Hug Day",
    7: "Kiss Day",
    8: "Valentine's Day"
  };

  // Listen for Cookie's "Thank You" responses
  useEffect(() => {
    if (currentSpace !== 'senorita') return;

    const subscription = supabase
      .channel('cookie-thanks-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'valentines_answer_reads',
          filter: 'read_by=eq.Cookie'
        },
        (payload) => {
          const data = payload.new as any;
          
          if (data.thanked) {
            const dayName = dayNames[data.day_number] || `Day ${data.day_number}`;
            
            toast({
              title: '💕 Cookie Sent a Thank You!',
              description: `Cookie read and loved your ${dayName} answer!`,
              variant: 'default',
              duration: 5000
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSpace]);
  
  // Check for new unlocked days
  useEffect(() => {
    const checkValentineProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('valentines_progress')
          .select('day_number')
          .eq('user_name', 'Senorita');

        if (!error && data) {
          setUnlockedDaysCount(data.length);
          
          // Check if there's a day available to unlock today
          const now = new Date();
          const currentYear = 2025;
          
          // Valentine's Week: Feb 7-14
          if (now >= new Date(currentYear, 1, 7) && now <= new Date(currentYear, 1, 14)) {
            const dayNumber = Math.floor((now.getTime() - new Date(currentYear, 1, 7).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const isUnlocked = data.some(d => d.day_number === dayNumber);
            setHasNewUnlock(!isUnlocked && dayNumber <= 8);
          }
        }
      } catch (err) {
        console.error('Error checking valentine progress:', err);
      }
    };

    checkValentineProgress();

    // Subscribe to updates
    const subscription = supabase
      .channel('valentine-dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'valentines_progress',
          filter: 'user_name=eq.Senorita'
        },
        () => {
          checkValentineProgress();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Only redirect if space is explicitly set to something else (not null/loading)
  useEffect(() => {
    if (currentSpace && currentSpace !== 'senorita') {
      navigate('/');
    }
  }, [currentSpace, navigate]);

  // Show loading state while space is being initialized
  if (currentSpace === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Senorita's Space...</p>
        </div>
      </div>
    );
  }

  if (currentSpace !== 'senorita') {
    return null; // Will redirect via useEffect
  }

  // Fallback dates if not set in profile
  const displayAnniversary = anniversaryDate || new Date(2025, 4, 14); // May 14th, 2025 (official commitment)
  const displayRelationshipStart = relationshipStart || new Date(2024, 7, 12); // Aug 12th, 2024 (first meeting)
  const partnerNames = ['Cookie', 'Senorita'];

  // Animation variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-background relative overflow-x-hidden"
      style={{
        background: dashboardBackgroundSenorita 
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${dashboardBackgroundSenorita}) center/cover fixed`
          : undefined
      }}
    >
      {!dashboardBackgroundSenorita && <FloatingHearts />}
      
      <HeroSection />
      
      <main className="relative z-10 px-4 py-8 max-w-7xl mx-auto -mt-16">
        <motion.div 
          className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Days Counter - Full Width */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3"
            variants={itemVariants}
          >
            <DaysCounter 
              anniversaryDate={displayAnniversary} 
              partnerNames={partnerNames}
              relationshipStart={displayRelationshipStart}
            />
          </motion.div>

          {/* Valentine's Special 2025 - BIG BUTTON (Full Width) */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/valentines-special" className="block">
              <div className="relative p-8 md:p-12 bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 dark:from-rose-600 dark:via-pink-600 dark:to-red-600 rounded-3xl border-4 border-white/30 shadow-2xl shadow-pink-500/50 overflow-hidden group cursor-pointer">
                {/* Animated background particles */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-2xl"
                      initial={{ 
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        opacity: 0.5
                      }}
                      animate={{
                        y: [null, '-100%'],
                        opacity: [0.5, 0]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3
                      }}
                    >
                      {['💕', '💖', '💗', '💝', '❤️', '🌹'][Math.floor(Math.random() * 6)]}
                    </motion.div>
                  ))}
                </div>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="text-6xl md:text-8xl"
                    >
                      💝
                    </motion.div>
                    
                    <div className="text-left">
                      <motion.h3 
                        className="text-3xl md:text-5xl font-bold text-white mb-2"
                        animate={{
                          textShadow: [
                            '0 0 20px rgba(255,255,255,0.5)',
                            '0 0 30px rgba(255,255,255,0.8)',
                            '0 0 20px rgba(255,255,255,0.5)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        Valentine's Week Mystery
                      </motion.h3>
                      <p className="text-white/90 text-lg md:text-xl font-medium">
                        ✨ Unlock love day by day • Feb 7-14, 2025
                      </p>
                      
                      {unlockedDaysCount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
                        >
                          <Gift className="w-5 h-5 text-white" />
                          <span className="text-white font-semibold">
                            {unlockedDaysCount}/8 Days Unlocked
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    {hasNewUnlock ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }}
                        className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-lg shadow-xl"
                      >
                        🎁 NEW UNLOCK!
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold text-lg border-2 border-white/30"
                      >
                        Click to Open 💕
                      </motion.div>
                    )}
                    
                    <p className="text-white/80 text-sm">
                      {unlockedDaysCount === 8 ? '🎉 All unlocked!' : '🔒 Daily unlocks at midnight'}
                    </p>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-4 right-4 opacity-50">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Senorita's Dashboard Header - Full Width */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3"
            variants={itemVariants}
          >
            <div className="p-8 md:p-10 bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-transparent rounded-3xl border border-pink-500/30 shadow-2xl shadow-pink-500/10 relative group overflow-hidden backdrop-blur-sm">
              {/* Animated background orbs */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="hover:bg-pink-500/20 transition-all hover:scale-110" data-testid="settings-button">
                    <Settings className="w-4 h-4 text-pink-500" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-red-500/20 transition-all hover:scale-110" data-testid="logout-button">
                  <LogOut className="w-4 h-4 text-red-400" />
                </Button>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <motion.div 
                  className="p-5 bg-gradient-to-br from-pink-500/30 to-rose-500/20 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="w-14 h-14 text-pink-500" />
                </motion.div>
                <div className="flex-1 space-y-3">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    Senorita's Sanctuary 🌸
                  </motion.h2>
                  <h3 className="text-xl font-medium text-pink-400">Hello, Beautiful {displayName}.</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {partnerName}'s world revolves around you. Explore the love he's left for you here.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                    <motion.div 
                      className="px-4 py-2 bg-pink-500/15 rounded-full text-xs font-semibold text-pink-500 border border-pink-500/30 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      💖 Mood: Adored
                    </motion.div>
                    <motion.div 
                      className="px-4 py-2 bg-pink-500/15 rounded-full text-xs font-semibold text-pink-500 border border-pink-500/30 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      ✨ Daily Dose of Love: Ready
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Calendar Day - Featured (2 columns on desktop) */}
          <motion.div 
            className="md:col-span-2"
            variants={itemVariants}
          >
            <CalendarDay />
          </motion.div>

          {/* Virtual Hug Kiss */}
          <motion.div variants={itemVariants}>
            <VirtualHugKiss />
          </motion.div>

          {/* Countdown Timer */}
          <motion.div variants={itemVariants}>
            <div className="h-full">
              <CountdownTimer />
            </div>
          </motion.div>
          
          {/* Daily Affirmation */}
          <motion.div variants={itemVariants}>
            <div className="h-full">
              <DailyAffirmation />
            </div>
          </motion.div>

          {/* Love Letters */}
          <motion.div variants={itemVariants}>
            <Link to="/letters" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <LoveLetters />
              </div>
            </Link>
          </motion.div>
          
          {/* Photo Gallery */}
          <motion.div variants={itemVariants}>
            <Link to="/gallery" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <PhotoGallery />
              </div>
            </Link>
          </motion.div>

          {/* Mood Sharing */}
          <motion.div variants={itemVariants}>
            <Link to="/mood" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <MoodSharing />
              </div>
            </Link>
          </motion.div>
          
          {/* Daily Question */}
          <motion.div variants={itemVariants}>
            <Link to="/questions" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <DailyQuestion />
              </div>
            </Link>
          </motion.div>

          {/* Memory Timeline */}
          <motion.div variants={itemVariants}>
            <Link to="/milestones" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <MemoryTimeline />
              </div>
            </Link>
          </motion.div>
          
          {/* Shared Calendar */}
          <motion.div variants={itemVariants}>
            <div className="h-full">
              <SharedCalendar />
            </div>
          </motion.div>

          {/* Love Language Results - Full Width */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3"
            variants={itemVariants}
          >
            <LoveLanguageResults />
          </motion.div>
        </motion.div>

        {/* Floating Components */}
        <QuickNotification />
        <ChatBubble />

        {/* Footer */}
        <motion.footer 
          className="text-center py-12 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-500/10 backdrop-blur-md border border-pink-500/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            <p className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
              Made with <Heart className="w-5 h-5 text-pink-500 fill-current animate-pulse-heart" /> for us
            </p>
            <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
          </motion.div>
          
          <motion.p 
            className="text-xs md:text-sm text-muted-foreground/60 mt-6 font-medium"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Cookie 💕 Senorita • Forever & Always
          </motion.p>
        </motion.footer>
      </main>
    </div>
  );
};

export default SenoritaDashboard;
