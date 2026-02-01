import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Image as ImageIcon,
  Smile,
  Send,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSpace } from '@/contexts/SpaceContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RelationshipStats {
  daysTogether: number;
  totalMessages: number;
  totalHugs: number;
  totalKisses: number;
  totalPhotos: number;
  upcomingEvents: number;
}

interface Mood {
  user_name: string;
  mood_emoji: string;
  mood_label: string;
  created_at: string;
}

interface Photo {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  event_title: string;
  event_date: string;
  category: string;
}

const RelationshipSidebar = () => {
  const { displayName, partnerName } = useSpace();
  const { toast } = useToast();
  const [stats, setStats] = useState<RelationshipStats>({
    daysTogether: 0,
    totalMessages: 0,
    totalHugs: 0,
    totalKisses: 0,
    totalPhotos: 0,
    upcomingEvents: 0,
  });
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [currentMoods, setCurrentMoods] = useState<{ cookie?: Mood; senorita?: Mood }>({});
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  // Fetch stats
  useEffect(() => {
    fetchStats();
    fetchRecentPhotos();
    fetchCurrentMoods();
    fetchUpcomingEvents();

    // Subscribe to real-time updates
    const photosSubscription = supabase
      .channel('sidebar-photos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, fetchRecentPhotos)
      .subscribe();

    const moodsSubscription = supabase
      .channel('sidebar-moods')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moods' }, fetchCurrentMoods)
      .subscribe();

    const messagesSubscription = supabase
      .channel('sidebar-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchStats)
      .subscribe();

    return () => {
      photosSubscription.unsubscribe();
      moodsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Calculate days together (from Jan 1, 2024 - adjust as needed)
      const startDate = new Date('2024-01-01');
      const today = new Date();
      const daysTogether = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Fetch message counts
      const { data: messages } = await supabase.from('messages').select('message_type');
      const totalMessages = messages?.filter(m => m.message_type === 'text' || m.message_type === 'file').length || 0;
      const totalHugs = messages?.filter(m => m.message_type === 'hug').length || 0;
      const totalKisses = messages?.filter(m => m.message_type === 'kiss').length || 0;

      // Fetch photo count
      const { count: photoCount } = await supabase.from('photos').select('*', { count: 'exact', head: true });

      // Fetch upcoming events count
      const { count: eventsCount } = await supabase
        .from('calendar_events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', new Date().toISOString());

      setStats({
        daysTogether,
        totalMessages,
        totalHugs,
        totalKisses,
        totalPhotos: photoCount || 0,
        upcomingEvents: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentPhotos = async () => {
    try {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      setRecentPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const fetchCurrentMoods = async () => {
    try {
      // Fetch latest mood for each user
      const { data: cookieMood } = await supabase
        .from('moods')
        .select('*')
        .eq('user_name', 'Cookie')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: senoritaMood } = await supabase
        .from('moods')
        .select('*')
        .eq('user_name', 'Senorita')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setCurrentMoods({
        cookie: cookieMood || undefined,
        senorita: senoritaMood || undefined,
      });
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const sendQuickAction = async (type: 'hug' | 'kiss') => {
    try {
      const content = type === 'hug' ? '🤗 Sending you a big hug!' : '😘 Sending you a kiss!';
      await supabase.from('messages').insert({
        from_user: displayName,
        to_user: partnerName,
        content,
        message_type: type,
      });

      toast({
        title: type === 'hug' ? '🤗 Hug Sent!' : '😘 Kiss Sent!',
        description: `Sent to ${partnerName}!`,
      });
    } catch (error) {
      console.error('Error sending action:', error);
    }
  };

  const categoryEmojis: { [key: string]: string } = {
    date: '💕',
    reminder: '🔔',
    appointment: '📅',
    special: '⭐',
    call: '📞',
    meetup: '👥',
    study: '💻',
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Animated Beating Heart */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex justify-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <Heart className="w-24 h-24 text-red-500 fill-current drop-shadow-2xl" />
          {/* Glow effect */}
          <div className="absolute inset-0 blur-xl opacity-50 bg-red-500/30 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Love Hub
          </h2>
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Your love story at a glance ✨</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => sendQuickAction('hug')}
              className="h-auto py-3 flex-col gap-1"
              variant="outline"
            >
              <span className="text-2xl">🤗</span>
              <span className="text-xs">Send Hug</span>
            </Button>
            <Button
              onClick={() => sendQuickAction('kiss')}
              className="h-auto py-3 flex-col gap-1"
              variant="outline"
            >
              <span className="text-2xl">😘</span>
              <span className="text-xs">Send Kiss</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
          <Heart className="w-6 h-6 mx-auto mb-2 text-red-500 fill-current animate-pulse" />
          <div className="text-2xl font-bold text-primary">{stats.daysTogether}</div>
          <div className="text-xs text-muted-foreground">Days Together</div>
        </Card>

        <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
          <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-primary">{stats.totalMessages}</div>
          <div className="text-xs text-muted-foreground">Messages</div>
        </Card>

        <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
          <span className="text-2xl block mb-1">🤗</span>
          <div className="text-xl font-bold text-primary">{stats.totalHugs}</div>
          <div className="text-xs text-muted-foreground">Hugs</div>
        </Card>

        <Card className="p-3 text-center bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
          <span className="text-2xl block mb-1">😘</span>
          <div className="text-xl font-bold text-primary">{stats.totalKisses}</div>
          <div className="text-xs text-muted-foreground">Kisses</div>
        </Card>
      </motion.div>

      {/* Current Moods */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Smile className="w-4 h-4 text-primary" />
            Current Moods
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10">
              <span className="text-sm font-medium">🍪 Cookie</span>
              <span className="text-2xl">{currentMoods.cookie?.mood_emoji || '😊'}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-pink-500/10">
              <span className="text-sm font-medium">💃 Senorita</span>
              <span className="text-2xl">{currentMoods.senorita?.mood_emoji || '😊'}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Photos */}
      {recentPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Recent Memories ({stats.totalPhotos})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {recentPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Memory'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Coming Up ({stats.upcomingEvents})
            </h3>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <span className="text-lg">{categoryEmojis[event.category] || '📅'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.event_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Fun Metric */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold text-primary mb-1">
              {stats.totalMessages + stats.totalHugs + stats.totalKisses}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Love Interactions ❤️
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RelationshipSidebar;
