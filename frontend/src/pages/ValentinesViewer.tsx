import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Check, Lock, Gift, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import AudioPlayer from '@/components/valentine/AudioPlayer';
import AnimatedRose from '@/components/valentine/AnimatedRose';
import ProposalSlideshow from '@/components/valentine/ProposalSlideshow';
import ChocolateGame from '@/components/valentine/ChocolateGame';
import TeddyStoryMode from '@/components/valentine/TeddyStoryMode';
import PromiseTreeContainer from '@/components/valentine/PromiseTreeContainer';
import HoldToHug from '@/components/valentine/HoldToHug';
import CosmicKissSymphony from '@/components/valentine/CosmicKissSymphony';
import StorybookPDF from '@/components/valentine/StorybookPDF';
import EasterEggHunt from '@/components/valentine/EasterEggHunt';
import SaveToAlbum from '@/components/valentine/SaveToAlbum';
import ConfettiSystem from '@/components/valentine/ConfettiSystem';
import AnimatedHeartBg from '@/components/valentine/AnimatedHeartBg';

interface ValentineDay {
  dayNumber: number;
  date: string;
  name: string;
  emoji: string;
  theme: string;
  description: string;
  color: string;
  gradient: string;
}

const valentineDays: ValentineDay[] = [
  {
    dayNumber: 1,
    date: '02-07',
    name: 'Rose Day',
    emoji: '🌹',
    theme: 'Beauty & Admiration',
    description: 'Start of love. A symbol of admiration, beauty, and new beginnings.',
    color: 'rose',
    gradient: 'from-rose-400 via-pink-400 to-red-400'
  },
  {
    dayNumber: 2,
    date: '02-08',
    name: 'Propose Day',
    emoji: '💍',
    theme: 'Confession Time',
    description: 'The day to express your heart and take the leap of love.',
    color: 'pink',
    gradient: 'from-pink-400 via-rose-400 to-pink-500'
  },
  {
    dayNumber: 3,
    date: '02-09',
    name: 'Chocolate Day',
    emoji: '🍫',
    theme: 'Sweet Indulgence',
    description: 'Sweetness and joy wrapped in every moment together.',
    color: 'amber',
    gradient: 'from-amber-600 via-orange-500 to-amber-700'
  },
  {
    dayNumber: 4,
    date: '02-10',
    name: 'Teddy Day',
    emoji: '🧸',
    theme: 'Cuddles & Comfort',
    description: 'Soft, warm, and always there for you - just like us.',
    color: 'brown',
    gradient: 'from-amber-400 via-orange-300 to-yellow-400'
  },
  {
    dayNumber: 5,
    date: '02-11',
    name: 'Promise Day',
    emoji: '🤝',
    theme: 'Commitment & Trust',
    description: 'Promises that bind our hearts together forever.',
    color: 'blue',
    gradient: 'from-blue-400 via-cyan-400 to-blue-500'
  },
  {
    dayNumber: 6,
    date: '02-12',
    name: 'Hug Day',
    emoji: '🤗',
    theme: 'Warmth & Support',
    description: 'A warm embrace that says everything words cannot.',
    color: 'purple',
    gradient: 'from-purple-400 via-pink-400 to-purple-500'
  },
  {
    dayNumber: 7,
    date: '02-13',
    name: 'Kiss Day',
    emoji: '💋',
    theme: 'Passion & Closeness',
    description: 'A tender moment of pure connection and love.',
    color: 'red',
    gradient: 'from-red-400 via-rose-500 to-red-500'
  },
  {
    dayNumber: 8,
    date: '02-14',
    name: "Valentine's Day",
    emoji: '❤️',
    theme: 'Celebration of Love',
    description: 'The grand finale - celebrating our beautiful love story.',
    color: 'rose',
    gradient: 'from-rose-500 via-red-500 to-pink-600'
  }
];

const ValentinesViewer = () => {
  const navigate = useNavigate();
  const { dashboardBackgroundCookie, enable3DEffects } = useTheme();
  const [unlockedDays, setUnlockedDays] = useState<Set<number>>(new Set());
  const [selectedDay, setSelectedDay] = useState<ValentineDay | null>(null);
  const [customMessages, setCustomMessages] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [readDays, setReadDays] = useState<Set<number>>(new Set());
  const [easterEggsFound, setEasterEggsFound] = useState<Record<number, number>>({});
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const dayContentRef = useRef<HTMLDivElement>(null);

  // Fetch Senorita's progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('valentines_progress')
          .select('*')
          .eq('user_name', 'Senorita');

        if (error) throw error;

        if (data) {
          const unlocked = new Set<number>();
          const messages: Record<number, string> = {};
          const userAnswers: Record<number, string> = {};
          
          data.forEach(d => {
            unlocked.add(d.day_number);
            
            if (d.custom_message) {
              messages[d.day_number] = d.custom_message;
            }
            if (d.answer) {
              userAnswers[d.day_number] = d.answer;
            }
          });
          
          setUnlockedDays(unlocked);
          setCustomMessages(messages);
          setAnswers(userAnswers);
        }

        // Fetch read status
        const { data: readsData, error: readsError } = await supabase
          .from('valentines_answer_reads')
          .select('day_number')
          .eq('read_by', 'Cookie');

        if (!readsError && readsData) {
          setReadDays(new Set(readsData.map(r => r.day_number)));
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('valentines-viewer-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'valentines_progress',
          filter: 'user_name=eq.Senorita'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new as any;
            
            setUnlockedDays(prev => new Set([...prev, data.day_number]));
            
            if (data.custom_message) {
              setCustomMessages(prev => ({
                ...prev,
                [data.day_number]: data.custom_message
              }));
            }
            if (data.answer) {
              setAnswers(prev => ({
                ...prev,
                [data.day_number]: data.answer
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mark answer as read
  const markAsRead = async (dayNumber: number) => {
    if (readDays.has(dayNumber)) return;

    try {
      const { error } = await supabase
        .from('valentines_answer_reads')
        .insert({
          day_number: dayNumber,
          read_by: 'Cookie',
          read_at: new Date().toISOString()
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      setReadDays(prev => new Set([...prev, dayNumber]));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Handle day selection
  const handleViewDay = (day: ValentineDay) => {
    if (!unlockedDays.has(day.dayNumber)) {
      toast({
        title: '🔒 Not Yet Unlocked',
        description: `Senorita hasn't unlocked this day yet.`,
        variant: 'default'
      });
      return;
    }

    setSelectedDay(day);
    if (answers[day.dayNumber]) {
      markAsRead(day.dayNumber);
    }
  };

  // Render day content (read-only)
  const renderDayContent = (day: ValentineDay) => {
    const dayQuestions: Record<number, string> = {
      1: "What does love mean to you?",
      2: "Will You Marry Me Senorita?",
      3: "What's your favorite sweet memory of us?",
      4: "What makes you feel safe and comforted with me?",
      5: "What promise do you want to make to me?",
      6: "How do you feel when I hug you?",
      7: "What does my kiss mean to you?",
      8: "What do you love most about us?"
    };

    return (
      <div ref={dayContentRef}>
        {/* Easter Egg Hunt */}
        <EasterEggHunt
          dayNumber={day.dayNumber}
          onEggFound={(eggId) => {
            const count = (easterEggsFound[day.dayNumber] || 0) + 1;
            setEasterEggsFound(prev => ({ ...prev, [day.dayNumber]: count }));
          }}
        />

        {/* Interactive Component (read-only view) */}
        {(() => {
          switch (day.dayNumber) {
            case 1:
              return (
                <div>
                  <AnimatedRose />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 2:
              return (
                <div>
                  <ProposalSlideshow dayNumber={day.dayNumber} />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 3:
              return (
                <div>
                  <ChocolateGame dayNumber={day.dayNumber} />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 4:
              return (
                <div>
                  <TeddyStoryMode />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 5:
              return (
                <div>
                  <PromiseTreeContainer dayNumber={day.dayNumber} />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 6:
              return (
                <div>
                  <HoldToHug />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 7:
              return (
                <div className="h-screen relative">
                  <CosmicKissSymphony userName="Cookie" />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            case 8:
              return (
                <div>
                  <motion.div className="text-9xl mb-8 heart-burst">
                    ❤️
                  </motion.div>
                  <h2 className="text-4xl font-bold mb-4">Happy Valentine's Day! 💝</h2>
                  <StorybookPDF />
                  <SaveToAlbum dayNumber={day.dayNumber} dayName={day.name} contentRef={dayContentRef} />
                </div>
              );
            default:
              return <div className="text-8xl">{day.emoji}</div>;
          }
        })()}

        {/* Answer Display */}
        {answers[day.dayNumber] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <Eye className="w-6 h-6 mx-auto mb-3 text-blue-300" />
            <p className="text-lg font-medium mb-4">{dayQuestions[day.dayNumber]}</p>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 text-left">
              <p className="text-sm opacity-70 mb-2">Senorita's Answer:</p>
              <p className="text-base italic">"{answers[day.dayNumber]}"</p>
            </div>
          </motion.div>
        )}

        {/* Custom Message */}
        {customMessages[day.dayNumber] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <Gift className="w-8 h-8 mx-auto mb-4 text-blue-300" />
            <p className="text-sm opacity-70 mb-2">Your Message to Her:</p>
            <p className="text-lg italic">
              "{customMessages[day.dayNumber]}"
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  // Get unread count
  const unreadCount = Array.from(unlockedDays).filter(
    dayNum => answers[dayNum] && !readDays.has(dayNum)
  ).length;

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{
        backgroundImage: dashboardBackgroundCookie 
          ? `url(${dashboardBackgroundCookie})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Anime.js Animated Heart Background - Only if 3D effects enabled */}
      {enable3DEffects && !dashboardBackgroundCookie && <AnimatedHeartBg />}
      
      {/* Fallback Animated Heart Background - CSS only */}
      {!enable3DEffects && !dashboardBackgroundCookie && (
        <div className="valentine-heart-bg">
          <div className="heart-bg-layer heart-1"></div>
          <div className="heart-bg-layer heart-2"></div>
          <div className="heart-bg-layer heart-3"></div>
          <div className="heart-bg-layer heart-4"></div>
          <div className="heart-bg-layer heart-5"></div>
          <div className="heart-bg-layer heart-6"></div>
        </div>
      )}
      
      {/* Global Confetti System */}
      <ConfettiSystem active={triggerConfetti} duration={3000} particleCount={50} />
      
      {/* Audio Player */}
      <AudioPlayer />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/30 to-cyan-500/30 dark:from-blue-900/50 dark:via-blue-800/50 dark:to-cyan-900/50" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <Button
            onClick={() => navigate('/cookie')}
            variant="ghost"
            className="mb-6 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Valentine's Week Viewer 💙
            </h1>
          </motion.div>
          
          <p className="text-xl md:text-2xl mb-4 text-white/90">
            View Senorita's Beautiful Answers
          </p>

          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block bg-blue-500/20 backdrop-blur-md rounded-full px-6 py-3 border border-blue-300/30 mt-4"
            >
              <span className="text-lg font-medium text-white">
                💝 {unreadCount} New Answer{unreadCount > 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {valentineDays.map((day, index) => {
            const isUnlocked = unlockedDays.has(day.dayNumber);
            const hasAnswer = answers[day.dayNumber];
            const isUnread = hasAnswer && !readDays.has(day.dayNumber);
            
            return (
              <motion.div
                key={day.dayNumber}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={isUnlocked ? { scale: 1.08, y: -8, rotateY: 2 } : {}}
                onClick={() => handleViewDay(day)}
                className={`
                  relative group cursor-pointer
                  bg-white/10 dark:bg-black/20 backdrop-blur-xl
                  rounded-3xl p-8 border-2 border-white/20
                  transition-bounce day-card-enhanced gradient-border-animate
                  ${isUnlocked ? 'hover-glow-blue hover:shadow-2xl hover:border-blue-300/40' : 'opacity-40'}
                  ${!isUnlocked ? 'blur-sm' : ''}
                `}
              >
                {/* Unread Badge */}
                {isUnread && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center z-10"
                  >
                    NEW
                  </motion.div>
                )}

                {/* Lock Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-6"
                    >
                      <Lock className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>
                )}

                {/* Content */}
                <div className="text-center relative text-white">
                  <div className="text-6xl mb-4">{day.emoji}</div>
                  <h3 className="text-2xl font-bold mb-2">{day.name}</h3>
                  <p className="text-sm opacity-80 mb-3">{day.date.replace('-', '/')}/{new Date().getFullYear()}</p>
                  <p className="text-base opacity-90 font-medium mb-2">{day.theme}</p>

                  {/* Status Badge */}
                  <div className="mt-4">
                    {isUnlocked ? (
                      hasAnswer ? (
                        <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                          <Check className="w-4 h-4" />
                          {isUnread ? 'New Answer' : 'Answered'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          Unlocked
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-white/10 text-white/70 px-4 py-2 rounded-full text-sm font-medium">
                        <Lock className="w-4 h-4" />
                        Not Yet Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 text-white/80"
        >
          <Heart className="w-8 h-8 mx-auto mb-4 text-blue-300" />
          <p className="text-lg">Reading her beautiful words fills my heart with joy 💙</p>
        </motion.div>
      </div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                bg-gradient-to-br ${selectedDay.gradient}
                rounded-3xl p-8 md:p-12 max-w-2xl w-full
                shadow-2xl border border-white/20
                max-h-[90vh] overflow-y-auto
              `}
            >
              {/* Close Button */}
              <Button
                onClick={() => setSelectedDay(null)}
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                ✕
              </Button>

              {/* Header */}
              <div className="text-center mb-8 text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {selectedDay.name}
                </h2>
                <p className="text-xl opacity-90">{selectedDay.theme}</p>
              </div>

              {/* Content */}
              <div className="text-center text-white">
                {renderDayContent(selectedDay)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValentinesViewer;
