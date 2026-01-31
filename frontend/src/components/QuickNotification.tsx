import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSpace } from '@/contexts/SpaceContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  from_user: string;
  to_user: string;
  notification_type: string;
  message: string;
  is_seen: boolean;
  created_at: string;
}

const QuickNotification = () => {
  const { displayName, partnerName } = useSpace();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quick_notifications',
          filter: `to_user=eq.${displayName}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setShowNotifications(true);
          
          // Show toast
          toast({
            title: '💕 New from ' + newNotif.from_user,
            description: newNotif.message,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [displayName]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_notifications')
        .select('*')
        .eq('to_user', displayName)
        .eq('is_seen', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
      
      if (data && data.length > 0) {
        setShowNotifications(true);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsSeen = async (notificationId: string) => {
    try {
      await supabase
        .from('quick_notifications')
        .update({ is_seen: true })
        .eq('id', notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      if (notifications.length <= 1) {
        setShowNotifications(false);
      }
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await supabase
        .from('quick_notifications')
        .update({ is_seen: true })
        .eq('to_user', displayName)
        .eq('is_seen', false);

      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  };

  const sendThinkingOfYou = async () => {
    try {
      await supabase.from('quick_notifications').insert({
        from_user: displayName,
        to_user: partnerName,
        notification_type: 'thinking',
        message: `💭 ${displayName} is thinking of you right now!`,
      });

      toast({
        title: '💭 Notification Sent!',
        description: `${partnerName} knows you're thinking of them!`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Floating notification bell */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-pink-500 hover:scale-110 transition-transform"
          data-testid="notification-bell-button"
        >
          <Bell className="w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {notifications.length}
            </span>
          )}
        </Button>
      </div>

      {/* Notifications panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
          >
            <Card className="bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary fill-current" />
                  Love Notifications
                </h3>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsSeen}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-primary/10 rounded-lg p-3 relative group"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsSeen(notif.id)}
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <p className="text-sm pr-6">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-border/50">
                <Button
                  onClick={sendThinkingOfYou}
                  className="w-full"
                  size="sm"
                  data-testid="thinking-of-you-button"
                >
                  💭 Send "Thinking of You"
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickNotification;
