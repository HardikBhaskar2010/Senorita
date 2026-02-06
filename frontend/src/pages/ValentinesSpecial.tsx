import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Sparkles, Gift, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';

interface ValentineDay {
  dayNumber: number;
  date: string; // MM-DD format
  name: string;
  emoji: string;
  theme: string;
  description: string;
  unlockPhrase?: string; // For type-to-unlock days
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
    unlockPhrase: 'I Love You',
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
    unlockPhrase: 'I Promise',
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

const ValentinesSpecial = () => {
  const navigate = useNavigate();
  const { dashboardBackgroundSenorita } = useTheme();
  const [unlockedDays, setUnlockedDays] = useState<Set<number>>(new Set());
  const [selectedDay, setSelectedDay] = useState<ValentineDay | null>(null);
  const [unlockInput, setUnlockInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [customMessages, setCustomMessages] = useState<Record<number, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Check if a day is available to unlock based on current date
  const isDayAvailable = (day: ValentineDay): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear(); // Dynamic year
    const [month, date] = day.date.split('-').map(Number);
    const unlockDate = new Date(currentYear, month - 1, date);
    
    // Day is available if current date >= unlock date
    return now >= unlockDate;
  };

  // Check if Valentine's Week has ended
  const isValentinesWeekEnded = (): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const endDate = new Date(currentYear, 1, 15); // Feb 15, current year
    return now >= endDate;
  };

  // Check if Valentine's Week hasn't started
  const isBeforeValentinesWeek = (): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, 1, 7); // Feb 7, current year
    return now < startDate;
  };

  // Fetch unlocked days from Supabase
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('valentines_progress')
          .select('*')
          .eq('user_name', 'Senorita');

        if (error) throw error;

        if (data) {
          // Only set as unlocked if the day is actually available OR after Valentine's Week
          const now = new Date();
          const currentYear = now.getFullYear();
          const isAfterValentinesWeek = now >= new Date(currentYear, 1, 15);
          
          const unlocked = new Set<number>();
          const messages: Record<number, string> = {};
          const userAnswers: Record<number, string> = {};
          
          data.forEach(d => {
            // Check if this day should be unlocked based on date
            const [month, date] = valentineDays.find(vd => vd.dayNumber === d.day_number)?.date.split('-').map(Number) || [0, 0];
            const dayUnlockDate = new Date(currentYear, month - 1, date);
            
            // Only add to unlocked if:
            // 1. It's after Valentine's Week (all unlocked), OR
            // 2. Current date >= unlock date
            if (isAfterValentinesWeek || now >= dayUnlockDate) {
              unlocked.add(d.day_number);
            }
            
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
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('valentines-updates')
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
            
            // Check if day should be unlocked based on date
            const now = new Date();
            const currentYear = now.getFullYear();
            const isAfterValentinesWeek = now >= new Date(currentYear, 1, 15);
            const [month, date] = valentineDays.find(vd => vd.dayNumber === data.day_number)?.date.split('-').map(Number) || [0, 0];
            const dayUnlockDate = new Date(currentYear, month - 1, date);
            
            if (isAfterValentinesWeek || now >= dayUnlockDate) {
              setUnlockedDays(prev => new Set([...prev, data.day_number]));
            }
            
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

  // Handle day unlock
  const handleUnlockDay = async (day: ValentineDay) => {
    // If already unlocked, just open it
    if (unlockedDays.has(day.dayNumber)) {
      setSelectedDay(day);
      // Load existing answer if available
      if (answers[day.dayNumber]) {
        setCurrentAnswer('');
      } else {
        setCurrentAnswer('');
      }
      return;
    }

    // Check if day is available
    if (!isDayAvailable(day)) {
      toast({
        title: '🔒 Not yet, my love',
        description: `This unlocks on ${day.date.replace('-', '/')}. Patience, darling! 💕`,
        variant: 'default'
      });
      return;
    }

    // If it requires typing, show the unlock modal
    if (day.unlockPhrase) {
      setSelectedDay(day);
      setUnlockInput('');
      setCurrentAnswer('');
      return;
    }

    // Otherwise, unlock directly
    await unlockDay(day);
  };

  // Unlock day in database
  const unlockDay = async (day: ValentineDay) => {
    setIsUnlocking(true);
    try {
      const { error } = await supabase
        .from('valentines_progress')
        .insert({
          user_name: 'Senorita',
          day_number: day.dayNumber,
          day_name: day.name,
          unlocked_at: new Date().toISOString()
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      setUnlockedDays(prev => new Set([...prev, day.dayNumber]));
      setSelectedDay(day);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      toast({
        title: `💝 ${day.name} Unlocked!`,
        description: `${day.emoji} ${day.theme}`,
        variant: 'default'
      });
    } catch (err) {
      console.error('Error unlocking day:', err);
      toast({
        title: 'Error',
        description: 'Failed to unlock day. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUnlocking(false);
      setUnlockInput('');
    }
  };

  // Handle type-to-unlock validation
  const handleTypeUnlock = () => {
    if (!selectedDay) return;

    const input = unlockInput.trim().toLowerCase();
    const required = selectedDay.unlockPhrase?.toLowerCase() || '';

    if (input === required) {
      unlockDay(selectedDay);
    } else {
      toast({
        title: 'Almost there! 💕',
        description: `Type "${selectedDay.unlockPhrase}" to unlock this special day.`,
        variant: 'default'
      });
    }
  };

  // Save answer to database
  const saveAnswer = async () => {
    if (!selectedDay || !currentAnswer.trim()) {
      toast({
        title: 'Oops! 💕',
        description: 'Please write your answer before saving.',
        variant: 'default'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('valentines_progress')
        .update({ answer: currentAnswer.trim() })
        .eq('user_name', 'Senorita')
        .eq('day_number', selectedDay.dayNumber);

      if (error) throw error;

      setAnswers(prev => ({
        ...prev,
        [selectedDay.dayNumber]: currentAnswer.trim()
      }));

      toast({
        title: '💝 Answer Saved!',
        description: 'Your beautiful response has been saved.',
        variant: 'default'
      });

      setCurrentAnswer('');
    } catch (err) {
      console.error('Error saving answer:', err);
      toast({
        title: 'Error',
        description: 'Failed to save answer. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Render interactive answer section for each day
  const renderAnswerSection = (day: ValentineDay) => {
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

    const question = dayQuestions[day.dayNumber] || "Share your thoughts about this day...";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      >
        <p className="text-lg font-medium mb-4">{question}</p>
        
        {answers[day.dayNumber] ? (
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 text-left">
              <p className="text-sm opacity-70 mb-2">Your Answer:</p>
              <p className="text-base italic">"{answers[day.dayNumber]}"</p>
            </div>
            <Button
              onClick={() => {
                setCurrentAnswer(answers[day.dayNumber]);
              }}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 w-full"
            >
              ✏️ Edit Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={4}
              className="w-full text-base py-3 px-4 bg-white/20 border border-white/30 text-white placeholder:text-white/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              onClick={saveAnswer}
              className="w-full py-3 text-base bg-white/20 hover:bg-white/30 text-white"
            >
              💝 Save My Answer
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  // Render day content based on day number
  const renderDayContent = (day: ValentineDay) => {
    const message = customMessages[day.dayNumber];

    switch (day.dayNumber) {
      case 1: // Rose Day
        return (
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
              className="text-9xl mb-8"
            >
              🌹
            </motion.div>
            {renderAnswerSection(day)}
          </div>
        );
      
      case 2: // Propose Day
        return (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-8xl mb-8"
            >
              💍
            </motion.div>
            {renderAnswerSection(day)}
          </motion.div>
        );

      case 3: // Chocolate Day
        return (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-amber-800 rounded-lg p-6 text-4xl cursor-pointer shadow-lg"
                >
                  🍫
                </motion.div>
              ))}
            </div>
            {renderAnswerSection(day)}
          </div>
        );

      case 4: // Teddy Day
        return (
          <div>
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-9xl mb-8 cursor-pointer"
            >
              🧸
            </motion.div>
            {renderAnswerSection(day)}
          </div>
        );

      case 5: // Promise Day
        return (
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md mb-6">
              <h3 className="text-2xl font-bold mb-6">My Promises to You:</h3>
              <ul className="space-y-4 text-lg text-left">
                <motion.li 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>I promise to always love you unconditionally</span>
                </motion.li>
                <motion.li 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>I promise to support you in every dream</span>
                </motion.li>
                <motion.li 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <span>I promise to cherish every moment together</span>
                </motion.li>
              </ul>
              <div className="mt-8 text-4xl">🤝</div>
            </div>
            {renderAnswerSection(day)}
          </div>
        );

      case 6: // Hug Day
        return (
          <div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
              className="relative"
            >
              <div className="text-9xl mb-8">🤗</div>
              <div className="text-2xl font-medium mb-8">Sending you a warm virtual hug 🫂</div>
            </motion.div>
            {renderAnswerSection(day)}
          </div>
        );

      case 7: // Kiss Day
        return (
          <div>
            <div className="relative mb-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -100, y: 0, opacity: 1 }}
                  animate={{ 
                    x: 300, 
                    y: Math.sin(i) * 100,
                    opacity: 0 
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute text-6xl"
                  style={{ left: '50%', top: '50%' }}
                >
                  💋
                </motion.div>
              ))}
              <div className="text-9xl relative z-10">💋</div>
            </div>
            {renderAnswerSection(day)}
          </div>
        );

      case 8: // Valentine's Day
        return (
          <div>
            <div className="relative mb-8">
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: Math.random() * 400 - 200,
                        y: -50,
                        rotate: 0
                      }}
                      animate={{ 
                        y: 600,
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 2 + Math.random(),
                        delay: Math.random() * 0.5
                      }}
                      className="absolute text-3xl"
                      style={{ left: '50%' }}
                    >
                      {['❤️', '💕', '💖', '💗', '💝'][Math.floor(Math.random() * 5)]}
                    </motion.div>
                  ))}
                </div>
              )}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-9xl mb-8 relative z-10"
              >
                ❤️
              </motion.div>
              <h2 className="text-4xl font-bold mb-4">Happy Valentine's Day! 💝</h2>
              <p className="text-xl mb-8">Celebrating our beautiful love story</p>
            </div>
            {renderAnswerSection(day)}
          </div>
        );

      default:
        return (
          <div className="text-8xl">
            {day.emoji}
          </div>
        );
    }
  };

  // Status message
  const getStatusMessage = () => {
    const currentYear = new Date().getFullYear();
    
    if (isBeforeValentinesWeek()) {
      return {
        title: '💕 Coming Soon',
        message: `Valentine's Week starts on February 7, ${currentYear}`,
        emoji: '⏰'
      };
    }
    if (isValentinesWeekEnded()) {
      return {
        title: '💝 Relive Our Valentine\'s Week',
        message: 'All moments are now unlocked forever',
        emoji: '♾️'
      };
    }
    const nextDay = valentineDays.find(d => !unlockedDays.has(d.dayNumber) && isDayAvailable(d));
    if (nextDay) {
      return {
        title: '💖 New Day Available!',
        message: `${nextDay.name} is ready to unlock`,
        emoji: nextDay.emoji
      };
    }
    return {
      title: '💕 More Coming Soon',
      message: 'Check back tomorrow for the next surprise',
      emoji: '✨'
    };
  };

  const status = getStatusMessage();

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{
        backgroundImage: dashboardBackgroundSenorita 
          ? `url(${dashboardBackgroundSenorita})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-rose-500/30 to-red-500/30 dark:from-pink-900/50 dark:via-rose-900/50 dark:to-red-900/50" />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-48 -left-48 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-48 -right-48 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <Button
            onClick={() => navigate('/senorita')}
            variant="ghost"
            className="mb-6 hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-rose-300 to-red-300 bg-clip-text text-transparent">
              Valentine's Week Mystery 2025
            </h1>
          </motion.div>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Unlock Love Day by Day ❤️
          </p>

          {/* Status Banner */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block bg-white/10 backdrop-blur-md rounded-full px-8 py-4 border border-white/20"
          >
            <span className="text-3xl mr-3">{status.emoji}</span>
            <span className="text-lg font-medium">{status.title}</span>
            <p className="text-sm opacity-80 mt-1">{status.message}</p>
          </motion.div>
        </motion.div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {valentineDays.map((day, index) => {
            const isUnlocked = unlockedDays.has(day.dayNumber);
            const isAvailable = isDayAvailable(day);
            const shouldShowLock = !isUnlocked && !isValentinesWeekEnded();

            return (
              <motion.div
                key={day.dayNumber}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={isAvailable || isUnlocked ? { scale: 1.05, y: -5 } : {}}
                onClick={() => handleUnlockDay(day)}
                className={`
                  relative group cursor-pointer
                  bg-white/10 dark:bg-black/20 backdrop-blur-xl
                  rounded-3xl p-8 border border-white/20
                  transition-all duration-300
                  ${isAvailable || isUnlocked ? 'hover:shadow-2xl hover:border-white/40' : 'opacity-60'}
                  ${shouldShowLock ? 'blur-sm hover:blur-none' : ''}
                `}
              >
                {/* Lock Overlay */}
                {shouldShowLock && (
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
                <div className="text-center relative">
                  <div className="text-6xl mb-4">{day.emoji}</div>
                  <h3 className="text-2xl font-bold mb-2">{day.name}</h3>
                  <p className="text-sm opacity-80 mb-3">{day.date.replace('-', '/')}/2025</p>
                  <p className="text-base opacity-90 font-medium mb-2">{day.theme}</p>
                  <p className="text-sm opacity-70">{day.description}</p>

                  {/* Status Badge */}
                  <div className="mt-4">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Unlocked
                      </span>
                    ) : isAvailable ? (
                      <span className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        Available Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-white/10 text-white/70 px-4 py-2 rounded-full text-sm font-medium">
                        <Lock className="w-4 h-4" />
                        Coming Soon
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
          <Heart className="w-8 h-8 mx-auto mb-4 text-pink-300" />
          <p className="text-lg">Made with infinite love for my beautiful Senorita 💕</p>
          <p className="text-sm opacity-70 mt-2">Every day is special with you ✨</p>
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
            onClick={() => {
              if (unlockedDays.has(selectedDay.dayNumber)) {
                setSelectedDay(null);
              }
            }}
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
              {unlockedDays.has(selectedDay.dayNumber) && (
                <Button
                  onClick={() => setSelectedDay(null)}
                  variant="ghost"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  {selectedDay.name}
                </h2>
                <p className="text-xl text-white/90">{selectedDay.theme}</p>
              </div>

              {/* Content or Unlock Input */}
              {unlockedDays.has(selectedDay.dayNumber) ? (
                <div className="text-center text-white">
                  {renderDayContent(selectedDay)}
                  
                  {/* Custom Message from Cookie */}
                  {customMessages[selectedDay.dayNumber] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                      <Gift className="w-8 h-8 mx-auto mb-4" />
                      <p className="text-lg italic">
                        "{customMessages[selectedDay.dayNumber]}"
                      </p>
                      <p className="text-sm opacity-70 mt-4">- Your Cookie 🍪</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                // Type-to-unlock for Propose & Promise Day
                selectedDay.unlockPhrase && (
                  <div className="text-center text-white">
                    <Lock className="w-16 h-16 mx-auto mb-6 opacity-80" />
                    <p className="text-xl mb-6">
                      Type <span className="font-bold text-2xl">"{selectedDay.unlockPhrase}"</span> to unlock
                    </p>
                    <div className="max-w-md mx-auto space-y-4">
                      <Input
                        value={unlockInput}
                        onChange={(e) => setUnlockInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTypeUnlock()}
                        placeholder={`Type "${selectedDay.unlockPhrase}"...`}
                        className="text-center text-xl py-6 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        disabled={isUnlocking}
                      />
                      <Button
                        onClick={handleTypeUnlock}
                        disabled={isUnlocking}
                        className="w-full py-6 text-lg bg-white/20 hover:bg-white/30 text-white"
                      >
                        {isUnlocking ? 'Unlocking...' : 'Unlock 💝'}
                      </Button>
                      <Button
                        onClick={() => setSelectedDay(null)}
                        variant="ghost"
                        className="w-full text-white/80 hover:bg-white/10"
                      >
                        Maybe Later
                      </Button>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValentinesSpecial;
