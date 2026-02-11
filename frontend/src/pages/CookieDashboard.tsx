import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSpace } from "@/contexts/SpaceContext";
import { useCouple } from "@/contexts/CoupleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import FloatingHearts from "@/components/FloatingHearts";
import ThreeBackground from "@/components/three/ThreeBackground";
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
import ValentineAnswersModal from "@/components/ValentineAnswersModal";
import ValentineViewerCard from "@/components/ValentineViewerCard";
import SecretVaultAccess from "@/components/SecretVaultAccess";
import SecretVaultPassword from "@/components/SecretVaultPassword";
import { Heart, Sparkles, LogOut, Settings, Cookie, Eye, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CookieDashboard = () => {
  const navigate = useNavigate();
  const { currentSpace, logout, displayName, partnerName } = useSpace();
  const { anniversaryDate, relationshipStart } = useCouple();
  const { dashboardBackgroundCookie } = useTheme();
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [hasCheckedAnswers, setHasCheckedAnswers] = useState(false);
  const [showVaultPassword, setShowVaultPassword] = useState(false);
  
  // Only redirect if space is explicitly set to something else (not null/loading)
  useEffect(() => {
    if (currentSpace && currentSpace !== 'cookie') {
      navigate('/');
    }
  }, [currentSpace, navigate]);

  // Handle vault password success
  const handleVaultPasswordSuccess = () => {
    setShowVaultPassword(false);
    navigate('/secret-vault');
  };

  // Handle vault access button click - directly open password modal
  const handleVaultAccessClick = () => {
    setShowVaultPassword(true);
  };

  // Check for unread Valentine's answers
  useEffect(() => {
    const checkUnreadAnswers = async () => {
      if (currentSpace !== 'cookie' || hasCheckedAnswers) return;

      try {
        // Get all answers from Senorita
        const { data: progressData, error: progressError } = await supabase
          .from('valentines_progress')
          .select('day_number, answer')
          .eq('user_name', 'Senorita')
          .not('answer', 'is', null);

        if (progressError) throw progressError;

        // Get already read answers
        const { data: readsData, error: readsError } = await supabase
          .from('valentines_answer_reads')
          .select('day_number')
          .eq('read_by', 'Cookie');

        if (readsError) throw readsError;

        // Check if there are unread answers
        const readDays = new Set(readsData?.map(r => r.day_number) || []);
        const hasUnread = progressData?.some(p => !readDays.has(p.day_number) && p.answer);

        if (hasUnread) {
          setShowAnswersModal(true);
        }
        
        setHasCheckedAnswers(true);
      } catch (err) {
        console.error('Error checking for unread answers:', err);
      }
    };

    checkUnreadAnswers();
  }, [currentSpace, hasCheckedAnswers]);

  // Subscribe to real-time answer updates
  useEffect(() => {
    if (currentSpace !== 'cookie') return;

    const subscription = supabase
      .channel('valentine-answers-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'valentines_progress',
          filter: 'user_name=eq.Senorita'
        },
        async (payload) => {
          // When Senorita adds/updates an answer, check if it's new
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new as any;
            
            if (data.answer) {
              // Check if Cookie has already read this answer
              const { data: readData } = await supabase
                .from('valentines_answer_reads')
                .select('day_number')
                .eq('read_by', 'Cookie')
                .eq('day_number', data.day_number)
                .single();

              if (!readData) {
                // New unread answer - show modal
                setShowAnswersModal(true);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSpace]);

  // Show loading state while space is being initialized
  if (currentSpace === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Cookie's Space...</p>
        </div>
      </div>
    );
  }

  if (currentSpace !== 'cookie') {
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
        background: dashboardBackgroundCookie 
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${dashboardBackgroundCookie}) center/cover fixed`
          : undefined
      }}
    >
      {!dashboardBackgroundCookie && <FloatingHearts />}
      <ThreeBackground variant="hearts" customBackground={dashboardBackgroundCookie} />
      
      {/* Valentine's Answers Modal */}
      {showAnswersModal && (
        <ValentineAnswersModal onClose={() => setShowAnswersModal(false)} />
      )}
      
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

          {/* Cookie's Dashboard Header - Full Width */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3"
            variants={itemVariants}
          >
            <div className="p-8 md:p-10 bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-transparent rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 relative group overflow-hidden backdrop-blur-sm">
              {/* Animated background orbs */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="hover:bg-blue-500/20 transition-all hover:scale-110" data-testid="settings-button">
                    <Settings className="w-4 h-4 text-blue-500" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-red-500/20 transition-all hover:scale-110" data-testid="logout-button">
                  <LogOut className="w-4 h-4 text-red-400" />
                </Button>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <motion.div 
                  className="p-5 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Cookie className="w-14 h-14 text-blue-500" />
                </motion.div>
                <div className="flex-1 space-y-3">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    Cookie's Command Center 👑
                  </motion.h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                    Welcome back, <span className="font-semibold text-blue-500">{displayName}</span>. {partnerName}'s heart is waiting for your touch today.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                    <motion.div 
                      className="px-4 py-2 bg-blue-500/15 rounded-full text-xs font-semibold text-blue-500 border border-blue-500/30 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      ✨ Status: Guardian
                    </motion.div>
                    <motion.div 
                      className="px-4 py-2 bg-blue-500/15 rounded-full text-xs font-semibold text-blue-500 border border-blue-500/30 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      💝 Mission: Make her smile
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

          {/* Valentine's Viewer - NEW! */}
          <motion.div variants={itemVariants}>
            <ValentineViewerCard />
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
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                <LoveLetters />
              </div>
            </Link>
          </motion.div>
          
          {/* Photo Gallery */}
          <motion.div variants={itemVariants}>
            <Link to="/gallery" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                <PhotoGallery />
              </div>
            </Link>
          </motion.div>

          {/* Mood Sharing */}
          <motion.div variants={itemVariants}>
            <Link to="/mood" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                <MoodSharing />
              </div>
            </Link>
          </motion.div>
          
          {/* Daily Question */}
          <motion.div variants={itemVariants}>
            <Link to="/questions" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                <DailyQuestion />
              </div>
            </Link>
          </motion.div>

          {/* Memory Timeline */}
          <motion.div variants={itemVariants}>
            <Link to="/milestones" className="block h-full group">
              <div className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
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

          {/* Secret Vault - NEW! */}
          <motion.div variants={itemVariants}>
            <motion.div
              onClick={handleVaultAccessClick}
              className="relative p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl cursor-pointer group overflow-hidden h-full"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Animated background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              
              {/* Matrix rain effect */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20 }}
                    animate={{ y: 100 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                    className="absolute text-cyan-500 text-xs font-mono"
                    style={{ left: `${i * 30}%` }}
                  >
                    {Math.random().toString(2).substring(2, 8)}
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5 mb-4"
                >
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
                  {'>'} SECRET VAULT
                </h3>
                <p className="text-gray-400 text-sm font-mono mb-4">
                  Your private digital sanctuary
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-500/70 font-mono">🔒 Protected</span>
                  <motion.div
                    className="text-cyan-400"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </motion.div>
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

        {/* Secret Vault Access (2-finger touch detector) */}
        {showVaultAccess && !showVaultPassword && (
          <SecretVaultAccess onUnlock={handleVaultUnlock} />
        )}

        {/* Secret Vault Password Modal */}
        {showVaultPassword && (
          <SecretVaultPassword 
            userName="Cookie"
            onSuccess={handleVaultPasswordSuccess}
            onCancel={() => setShowVaultPassword(false)}
          />
        )}

        {/* Footer */}
        <motion.footer 
          className="text-center py-12 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500/10 via-primary/10 to-pink-500/10 backdrop-blur-md border border-primary/20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <p className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
              Made with <Heart className="w-5 h-5 text-primary fill-current animate-pulse-heart" /> for us
            </p>
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
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

export default CookieDashboard;
