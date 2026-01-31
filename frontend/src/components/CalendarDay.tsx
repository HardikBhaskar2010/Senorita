import { useState, useEffect } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Calendar, Plus, Heart, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useSpace } from '@/contexts/SpaceContext';
import { useCouple } from '@/contexts/CoupleContext';
import { toast } from 'sonner';

interface TodayEvent {
  id: string;
  title: string;
  description?: string;
  time?: string;
  category: string;
  icon: string;
}

const CalendarDay = () => {
  const { currentUser } = useSpace();
  const { relationshipStart } = useCouple();
  const [todayEvents, setTodayEvents] = useState<TodayEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', time: '' });
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dayOfWeek = format(today, 'EEEE');
  const dateStr = format(today, 'MMM d');
  const relationshipStartDate = relationshipStart || new Date(2024, 1, 14);
  const daysInRelationship = differenceInDays(today, relationshipStartDate);

  // Fetch today's events
  useEffect(() => {
    fetchTodayEvents();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('calendar_events_today')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'calendar_events' },
        () => fetchTodayEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodayEvents = async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('event_date', todayStart.toISOString())
        .lte('event_date', todayEnd.toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;

      const events: TodayEvent[] = (data || []).map((event: any) => {
        const eventDate = new Date(event.event_date);
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          time: format(eventDate, 'HH:mm'),
          category: event.category || 'reminder',
          icon: getCategoryIcon(event.category || 'reminder')
        };
      });

      setTodayEvents(events);
    } catch (error) {
      console.error('Error fetching today events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      date: '💕',
      reminder: '🔔',
      appointment: '📅',
      special: '✨',
      anniversary: '🎉',
      call: '📞',
      study: '💻',
      meetup: '🤝'
    };
    return icons[category] || '📌';
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || null,
        event_date: format(today, 'yyyy-MM-dd'),
        event_time: newEvent.time || null,
        category: 'reminder',
        created_by: currentUser || 'Cookie',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert([eventData]);

      if (error) throw error;

      toast.success('Event added! 🎉');
      setNewEvent({ title: '', description: '', time: '' });
      setIsAddDialogOpen(false);
      fetchTodayEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background opacity-80" />
      <div className="absolute inset-0 bg-grid-white/5" />
      
      {/* Content */}
      <div className="relative p-8 space-y-6">
        {/* Today's Date - Big, Cute, Emotional */}
        <div className="text-center space-y-3">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <Calendar className="w-12 h-12 text-primary mx-auto mb-2" />
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent"
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            {dayOfWeek}, {dateStr}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Day <span className="font-bold text-primary">{daysInRelationship}</span> 
            <Heart className="w-5 h-5 text-primary fill-current animate-pulse-heart" />
          </motion.p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/20" />
          </div>
          <div className="relative flex justify-center">
            <Sparkles className="w-5 h-5 text-primary bg-background px-2" />
          </div>
        </div>

        {/* Today's Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Moments
            </h3>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="hover:bg-primary/10"
                  data-testid="add-today-event-button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" data-testid="add-event-dialog">
                <DialogHeader>
                  <DialogTitle>Add Today's Moment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Input
                      placeholder="What's happening today?"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      data-testid="event-title-input"
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      data-testid="event-time-input"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Add a note... (optional)"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      data-testid="event-description-input"
                    />
                  </div>
                  <Button 
                    onClick={handleAddEvent} 
                    className="w-full"
                    data-testid="save-event-button"
                  >
                    Save Moment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Events List or Empty State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="space-y-3" data-testid="today-events-list">
              <AnimatePresence>
                {todayEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
                    data-testid={`event-card-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.span 
                        className="text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {event.icon}
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          {event.time && (
                            <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                              {event.time}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 space-y-2"
              data-testid="no-events-message"
            >
              <motion.p 
                className="text-lg text-muted-foreground"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Nothing planned today… just us 🫶
              </motion.p>
              <p className="text-sm text-muted-foreground/70">
                Sometimes the best moments are unplanned
              </p>
            </motion.div>
          )}
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pt-4 border-t border-primary/10"
        >
          <p className="text-xs text-muted-foreground/70 italic">
            "Love is not about how many days... but how much love is in each day" 💕
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CalendarDay;
