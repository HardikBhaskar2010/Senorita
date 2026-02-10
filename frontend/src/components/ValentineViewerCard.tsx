import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { Eye, Heart, Sparkles, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

const ValentineViewerCard = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);

  // Check for unread answers
  useEffect(() => {
    const fetchAnswersStatus = async () => {
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

        const readDays = new Set(readsData?.map(r => r.day_number) || []);
        const unreadAnswers = progressData?.filter(p => !readDays.has(p.day_number) && p.answer);
        
        setTotalAnswers(progressData?.length || 0);
        setUnreadCount(unreadAnswers?.length || 0);
      } catch (err) {
        console.error('Error fetching answers status:', err);
      }
    };

    fetchAnswersStatus();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('valentine-answers-card')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'valentines_progress',
          filter: 'user_name=eq.Senorita'
        },
        () => {
          fetchAnswersStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Anime.js heart animation
  useEffect(() => {
    const animation = anime({
      targets: '.valentine-viewer-heart',
      scale: [1, 1.2, 1],
      rotate: ['0deg', '10deg', '-10deg', '0deg'],
      duration: 2000,
      easing: 'easeInOutQuad',
      loop: true
    });

    return () => {
      animation.pause();
    };
  }, []);

  return (
    <Card 
      className="bg-gradient-to-br from-blue-500/15 via-cyan-400/10 to-blue-500/5 border-blue-500/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group overflow-hidden relative"
      onClick={() => navigate('/valentines-viewer')}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sparkle effect */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Sparkles className="w-6 h-6 text-blue-400" />
      </motion.div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <Badge className="bg-red-500 text-white border-0 flex items-center gap-1 px-3 py-1">
            <Bell className="w-3 h-3" />
            {unreadCount} New
          </Badge>
        </motion.div>
      )}

      <CardHeader className="relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-3 rounded-xl bg-blue-500/20 valentine-viewer-heart"
            whileHover={{ scale: 1.1 }}
          >
            <Eye className="w-6 h-6 text-blue-400" />
          </motion.div>
          <div className="flex-1">
            <CardTitle className="text-xl text-blue-400">Valentine's Viewer</CardTitle>
            <CardDescription className="text-blue-300/70">Read Senorita's Answers</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <span className="text-sm text-muted-foreground">Total Answers</span>
            <span className="font-bold text-lg text-blue-400">{totalAnswers}/8</span>
          </div>
          
          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30"
            >
              <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                {unreadCount} unread answer{unreadCount > 1 ? 's' : ''} waiting!
              </span>
            </motion.div>
          )}

          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/valentines-viewer');
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Her Answers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValentineViewerCard;