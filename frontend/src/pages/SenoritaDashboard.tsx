import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSpace } from "@/contexts/SpaceContext";
import { useCouple } from "@/contexts/CoupleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
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
import SecretVaultPassword from "@/components/SecretVaultPassword";
import TimeWeatherWidget from "@/components/TimeWeatherWidget";
import LoveQuoteOfDay from "@/components/LoveQuoteOfDay";
import ActivitySuggestions from "@/components/ActivitySuggestions";
import { Heart, Sparkles, LogOut, Settings, Shield, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import WarpOverlay from "@/components/valentine-future/WarpOverlay";
import { currentSeason } from "@/lib/seasonConfig";

const SenoritaDashboard = () => {
  const navigate = useNavigate();
  const { currentSpace, logout, displayName, partnerName } = useSpace();
  const { anniversaryDate, relationshipStart } = useCouple();
  const { dashboardBackgroundSenorita } = useTheme();
  const [unlockedDaysCount, setUnlockedDaysCount] = useState(0);
  const [hasNewUnlock, setHasNewUnlock] = useState(false);
  const [showVaultPassword, setShowVaultPassword] = useState(false);
  const [showWarpOverlay, setShowWarpOverlay] = useState(false);
  const season = currentSeason();

  const handleVaultPasswordSuccess = () => {
    setShowVaultPassword(false);
    navigate('/secret-vault');
  };

  const handleVaultAccessClick = () => {
    setShowVaultPassword(true);
  };

  const handleCloseWarp = () => {
    setShowWarpOverlay(false);
  };

  const dayNames: Record<number, string> = {
    1: "Rose Day", 2: "Propose Day", 3: "Chocolate Day", 4: "Teddy Day",
    5: "Promise Day", 6: "Hug Day", 7: "Kiss Day", 8: "Valentine's Day"
  };

  useEffect(() => {
    if (currentSpace !== 'senorita') return;
    const subscription = supabase
      .channel('cookie-thanks-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'valentines_answer_reads', filter: 'read_by=eq.Cookie' },
        (payload) => {
          const data = payload.new as any;
          if (data.thanked) {
            const dayName = dayNames[data.day_number] || `Day ${data.day_number}`;
            toast({ title: '💕 Cookie Sent a Thank You!', description: `Cookie read and loved your ${dayName} answer!`, variant: 'default', duration: 5000 });
          }
        })
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [currentSpace]);

  useEffect(() => {
    const checkValentineProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('valentines_progress')
          .select('day_number')
          .eq('user_name', 'Senorita');
        if (!error && data) {
          setUnlockedDaysCount(data.length);
          const now = new Date();
          const currentYear = 2025;
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
    const subscription = supabase
      .channel('valentine-dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'valentines_progress', filter: 'user_name=eq.Senorita' }, () => { checkValentineProgress(); })
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (currentSpace && currentSpace !== 'senorita') { navigate('/'); }
  }, [currentSpace, navigate]);

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

  if (currentSpace !== 'senorita') return null;

  const displayAnniversary = anniversaryDate || new Date(2025, 4, 14);
  const displayRelationshipStart = relationshipStart || new Date(2024, 7, 12);
  const partnerNames: [string, string] = ['Cookie', 'Senorita'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div
      className="min-h-screen bg-background relative overflow-x-hidden senorita-scrollbar"
      style={{
        background: dashboardBackgroundSenorita
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${dashboardBackgroundSenorita}) center/cover fixed`
          : undefined
      }}
    >
      {!dashboardBackgroundSenorita && <FloatingHearts />}
      <ThreeBackground variant="hearts" customBackground={dashboardBackgroundSenorita} />

      <HeroSection />

      <main className="relative z-10 px-4 py-8 max-w-7xl mx-auto -mt-16">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

          {/* ── Full-width: Days Counter ── */}
          <motion.div variants={itemVariants}>
            <DaysCounter anniversaryDate={displayAnniversary} partnerNames={partnerNames} relationshipStart={displayRelationshipStart} />
          </motion.div>

          {/* ── Full-width: Coming Soon seasonal banner ── */}
          <motion.div variants={itemVariants}>
            <div className="relative p-8 md:p-12 rounded-3xl border-2 border-dashed border-pink-500/40 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-sm overflow-hidden group">
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity }} className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex items-center gap-6">
                  <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} className="text-6xl md:text-8xl">🍳</motion.div>
                  <div>
                    <motion.h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-2">Something New is Cooking</motion.h3>
                    <p className="text-white/70 text-lg md:text-xl font-medium">for ya, Senorita ✨</p>
                    <p className="text-white/40 text-sm mt-1">A new season surprise is on its way — stay tuned 💌</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-2 h-2 bg-pink-400 rounded-full block" />
                    <span className="text-white font-bold text-lg">Coming Soon</span>
                  </motion.div>
                  <p className="text-white/40 text-xs">Next surprise drops soon 🎁</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Full-width: Senorita's Sanctuary header ── */}
          <motion.div variants={itemVariants}>
            <div className="p-8 md:p-10 bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-transparent rounded-3xl border border-pink-500/30 shadow-2xl shadow-pink-500/10 relative group overflow-hidden backdrop-blur-sm">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <Link to="/settings"><Button variant="ghost" size="icon" className="hover:bg-pink-500/20 transition-all hover:scale-110" data-testid="settings-button"><Settings className="w-4 h-4 text-pink-500" /></Button></Link>
                <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-red-500/20 transition-all hover:scale-110" data-testid="logout-button"><LogOut className="w-4 h-4 text-red-400" /></Button>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <motion.div className="p-5 bg-gradient-to-br from-pink-500/30 to-rose-500/20 rounded-2xl shadow-lg" whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: "spring" as const, stiffness: 300 }}>
                  <Sparkles className="w-14 h-14 text-pink-500" />
                </motion.div>
                <div className="flex-1 space-y-3">
                  <motion.h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 bg-clip-text text-transparent" animate={{ backgroundPosition: ['0%', '100%', '0%'] }} transition={{ duration: 5, repeat: Infinity }}>Senorita's Sanctuary 🌸</motion.h2>
                  <h3 className="text-xl font-medium text-pink-400">Hello, Beautiful {displayName}.</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{partnerName}'s world revolves around you. Explore the love he's left for you here.</p>
                  <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                    <motion.div className="px-4 py-2 bg-pink-500/15 rounded-full text-xs font-semibold text-pink-500 border border-pink-500/30 shadow-sm" whileHover={{ scale: 1.05 }}>💖 Mood: Adored</motion.div>
                    <motion.div className="px-4 py-2 bg-pink-500/15 rounded-full text-xs font-semibold text-pink-500 border border-pink-500/30 shadow-sm" whileHover={{ scale: 1.05 }}>✨ Daily Dose of Love: Ready</motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── True Masonry: 3 independent flex columns ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* LEFT column */}
            <div className="flex flex-col gap-6">
              <motion.div variants={itemVariants}><TimeWeatherWidget /></motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/letters" className="block group">
                  <div className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"><LoveLetters /></div>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/questions" className="block group">
                  <div className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"><DailyQuestion /></div>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}><SharedCalendar /></motion.div>
              <motion.div variants={itemVariants}>
                <motion.div
                  onClick={handleVaultAccessClick}
                  className="relative p-6 rounded-3xl border-2 border-pink-500/30 bg-gradient-to-br from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-xl cursor-pointer group overflow-hidden shadow-lg shadow-pink-500/10"
                  whileHover={{ scale: 1.05, y: -8, borderColor: 'rgba(236, 72, 153, 0.6)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                  <div className="relative z-10">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-pink-400 p-0.5 mb-4 shadow-lg shadow-pink-500/50">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center"><Shield className="w-7 h-7 text-pink-400 group-hover:text-pink-300 transition-colors" /></div>
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-300 bg-clip-text text-transparent font-mono">{'>'} SECRET VAULT</h3>
                    <p className="text-gray-400 text-sm font-mono mb-5 group-hover:text-gray-300 transition-colors">Your private digital sanctuary</p>
                    <div className="flex items-center justify-between pt-2 border-t border-pink-500/20">
                      <span className="text-xs text-pink-500/70 font-mono flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />Protected</span>
                      <motion.div className="text-pink-400 font-bold text-lg" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-pink-400/80 font-mono bg-pink-500/10 px-2 py-1 rounded-full border border-pink-500/30">CLICK</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* MIDDLE column */}
            <div className="flex flex-col gap-6">
              <motion.div variants={itemVariants}><CalendarDay /></motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/gallery" className="block group">
                  <div className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"><PhotoGallery /></div>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/milestones" className="block group">
                  <div className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"><MemoryTimeline /></div>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/valentines-special" className="block">
                  <motion.div whileHover={{ scale: 1.04, y: -6 }} className="relative p-6 rounded-3xl overflow-hidden border border-pink-500/30 bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-purple-500/10 backdrop-blur-sm cursor-pointer group shadow-lg shadow-pink-500/10">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }} />
                    <div className="relative z-10">
                      <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} className="text-4xl mb-3">💝</motion.div>
                      <h3 className="text-lg font-bold text-pink-300 mb-1">Valentine's Week Mystery</h3>
                      <p className="text-white/60 text-sm mb-4">Feb 7–14, 2026 · All unlocked ♾️</p>
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1">
                        <Archive className="w-3 h-3 text-rose-300" /><span className="text-rose-300 text-xs font-semibold">2026 Archive</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-pink-500/20">
                        <span className="text-[11px] text-pink-400/60">Click to relive 💕</span>
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-pink-400/60 text-sm">→</motion.span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* RIGHT column */}
            <div className="flex flex-col gap-6">
              <motion.div variants={itemVariants}><ActivitySuggestions /></motion.div>
              <motion.div variants={itemVariants}><VirtualHugKiss /></motion.div>
              <motion.div variants={itemVariants}><LoveQuoteOfDay /></motion.div>
              <motion.div variants={itemVariants}><CountdownTimer /></motion.div>
              <motion.div variants={itemVariants}><DailyAffirmation /></motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/mood" className="block group">
                  <div className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"><MoodSharing /></div>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* ── Full-width: Love Language Results ── */}
          <motion.div variants={itemVariants}><LoveLanguageResults /></motion.div>

        </motion.div>

        {/* Floating Components */}
        <QuickNotification />
        <ChatBubble />

        {/* Secret Vault Password Modal */}
        {showVaultPassword && (
          <SecretVaultPassword
            userName="Senorita"
            onSuccess={handleVaultPasswordSuccess}
            onCancel={() => setShowVaultPassword(false)}
          />
        )}

        {/* Warp Overlay for Valentine Future */}
        <WarpOverlay open={showWarpOverlay} onClose={handleCloseWarp} />

        {/* Footer */}
        <motion.footer className="text-center py-12 mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <motion.div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-500/10 backdrop-blur-md border border-pink-500/20 shadow-xl" whileHover={{ scale: 1.05 }} transition={{ type: "spring" as const, stiffness: 300 }}>
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            <p className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
              Made with <Heart className="w-5 h-5 text-pink-500 fill-current animate-pulse-heart" /> for us
            </p>
            <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
          </motion.div>
          <motion.p className="text-xs md:text-sm text-muted-foreground/60 mt-6 font-medium" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 4, repeat: Infinity }}>
            Cookie 💕 Senorita • Forever & Always
          </motion.p>
        </motion.footer>
      </main>
    </div>
  );
};

export default SenoritaDashboard;
