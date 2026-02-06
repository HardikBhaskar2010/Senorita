import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface ValentineAnswer {
  day_number: number;
  day_name: string;
  answer: string;
  question: string;
}

interface ValentineAnswersModalProps {
  onClose: () => void;
}

const ValentineAnswersModal = ({ onClose }: ValentineAnswersModalProps) => {
  const [answers, setAnswers] = useState<ValentineAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [thankingDays, setThankingDays] = useState<Set<number>>(new Set());

  // Questions mapping
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

  // Day names mapping
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

  // Day emojis
  const dayEmojis: Record<number, string> = {
    1: "🌹",
    2: "💍",
    3: "🍫",
    4: "🧸",
    5: "🤝",
    6: "🤗",
    7: "💋",
    8: "❤️"
  };

  useEffect(() => {
    fetchUnreadAnswers();
  }, []);

  const fetchUnreadAnswers = async () => {
    try {
      setLoading(true);

      // Get all answers from Senorita
      const { data: progressData, error: progressError } = await supabase
        .from('valentines_progress')
        .select('day_number, day_name, answer')
        .eq('user_name', 'Senorita')
        .not('answer', 'is', null);

      if (progressError) throw progressError;

      // Get already read answers by Cookie
      const { data: readsData, error: readsError } = await supabase
        .from('valentines_answer_reads')
        .select('day_number')
        .eq('read_by', 'Cookie');

      if (readsError) throw readsError;

      // Filter out already read answers
      const readDays = new Set(readsData?.map(r => r.day_number) || []);
      const unreadAnswers = progressData?.filter(
        p => !readDays.has(p.day_number) && p.answer
      ).map(p => ({
        day_number: p.day_number,
        day_name: p.day_name,
        answer: p.answer,
        question: dayQuestions[p.day_number] || "Share your thoughts..."
      })) || [];

      setAnswers(unreadAnswers);
    } catch (err) {
      console.error('Error fetching unread answers:', err);
      toast({
        title: 'Error',
        description: 'Failed to load answers. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThankYou = async (dayNumber: number) => {
    setThankingDays(prev => new Set([...prev, dayNumber]));
    
    try {
      // Mark as read and thanked in database
      const { error: insertError } = await supabase
        .from('valentines_answer_reads')
        .insert({
          day_number: dayNumber,
          read_by: 'Cookie',
          thanked: true,
          thanked_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Remove from local state
      setAnswers(prev => prev.filter(a => a.day_number !== dayNumber));

      // Show success toast
      toast({
        title: '💝 Thank You Sent!',
        description: 'Senorita will be notified that you read her answer.',
        variant: 'default'
      });

      // If no more answers, close modal
      if (answers.length === 1) {
        setTimeout(() => onClose(), 500);
      }
    } catch (err) {
      console.error('Error sending thank you:', err);
      toast({
        title: 'Error',
        description: 'Failed to send thank you. Please try again.',
        variant: 'destructive'
      });
      setThankingDays(prev => {
        const newSet = new Set(prev);
        newSet.delete(dayNumber);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading messages from Senorita...</p>
          </div>
        </div>
      </div>
    );
  }

  if (answers.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-950 dark:via-rose-950 dark:to-red-950 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-pink-200 dark:border-pink-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  Messages from Senorita
                </h2>
                <p className="text-pink-100 text-sm mt-1">
                  {answers.length} new {answers.length === 1 ? 'answer' : 'answers'} waiting for you 💕
                </p>
              </div>
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6 space-y-6">
            {answers.map((answer, index) => (
              <motion.div
                key={answer.day_number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-pink-800"
              >
                {/* Day Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-pink-200 dark:border-pink-800">
                  <span className="text-4xl">{dayEmojis[answer.day_number]}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {dayNames[answer.day_number]}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date().getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">
                    Question:
                  </p>
                  <p className="text-base text-gray-700 dark:text-gray-300 italic">
                    "{answer.question}"
                  </p>
                </div>

                {/* Answer */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">
                    Senorita's Answer:
                  </p>
                  <div className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl p-4 border-l-4 border-pink-500">
                    <p className="text-base text-gray-900 dark:text-white leading-relaxed">
                      "{answer.answer}"
                    </p>
                  </div>
                </div>

                {/* Thank You Button */}
                <Button
                  onClick={() => handleThankYou(answer.day_number)}
                  disabled={thankingDays.has(answer.day_number)}
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  data-testid={`thank-you-btn-day-${answer.day_number}`}
                >
                  {thankingDays.has(answer.day_number) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Thank You, My Love 💕
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="bg-pink-100 dark:bg-pink-900/30 p-4 text-center border-t border-pink-200 dark:border-pink-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click "Thank You" on each message to let Senorita know you've read it 💖
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ValentineAnswersModal;
