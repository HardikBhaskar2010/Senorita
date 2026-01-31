import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  category: string;
  color: string;
}

const SharedCalendar = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchUpcomingEvents();

    // Subscribe to changes
    const subscription = supabase
      .channel('calendar-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
        },
        () => {
          fetchUpcomingEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="w-5 h-5 text-primary" />
          Upcoming Together
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming events. Plan something special!
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-card/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                style={{ borderLeftWidth: '4px', borderLeftColor: event.color }}
              >
                <h4 className="font-semibold text-sm">{event.title}</h4>
                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.event_date).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.location && (
                    <p className="text-xs text-primary">📍 {event.location}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <Button variant="outline" className="w-full" size="sm" asChild>
          <Link to="/calendar">View Full Calendar</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SharedCalendar;
