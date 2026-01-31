import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSpace } from '@/contexts/SpaceContext';

const ChatBubble = () => {
  const { displayName } = useSpace();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to message changes
    const subscription = supabase
      .channel('chat-bubble-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `to_user=eq.${displayName}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [displayName]);

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user', displayName)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Button
        asChild
        size="icon"
        className="relative h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-purple-500 hover:scale-110 transition-transform"
        data-testid="chat-bubble-button"
      >
        <Link to="/chat">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Link>
      </Button>
    </motion.div>
  );
};

export default ChatBubble;
