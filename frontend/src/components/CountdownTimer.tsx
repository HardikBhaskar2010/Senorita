import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface SpecialDate {
  id: string;
  title: string;
  date: string;
  category: string;
  icon: string;
  description: string | null;
}

const CountdownTimer = () => {
  const [nextEvent, setNextEvent] = useState<SpecialDate | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    fetchNextEvent();

    // Subscribe to changes
    const subscription = supabase
      .channel('special-dates-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'special_dates',
        },
        () => {
          fetchNextEvent();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNextEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('special_dates')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setNextEvent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching special dates:', error);
    }
  };

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      const eventDate = new Date(nextEvent.date).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
        fetchNextEvent(); // Fetch next event after current one passes
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  if (!nextEvent || !timeLeft) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          Countdown to {nextEvent.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-2">{nextEvent.icon}</div>
          
          <div className="grid grid-cols-4 gap-2">
            <motion.div
              key={timeLeft.days}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-primary/10 rounded-lg p-3"
            >
              <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
              <div className="text-xs text-muted-foreground">Days</div>
            </motion.div>
            
            <motion.div
              key={timeLeft.hours}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-primary/10 rounded-lg p-3"
            >
              <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </motion.div>
            
            <motion.div
              key={timeLeft.minutes}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-primary/10 rounded-lg p-3"
            >
              <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
              <div className="text-xs text-muted-foreground">Mins</div>
            </motion.div>
            
            <motion.div
              key={timeLeft.seconds}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-primary/10 rounded-lg p-3"
            >
              <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
              <div className="text-xs text-muted-foreground">Secs</div>
            </motion.div>
          </div>

          {nextEvent.description && (
            <p className="text-sm text-muted-foreground mt-3">
              {nextEvent.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;
