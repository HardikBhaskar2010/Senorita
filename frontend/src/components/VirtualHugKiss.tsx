import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSpace } from '@/contexts/SpaceContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const VirtualHugKiss = () => {
  const { displayName, partnerName } = useSpace();
  const { toast } = useToast();
  const [sending, setSending] = useState<'hug' | 'kiss' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const sendVirtual = async (type: 'hug' | 'kiss') => {
    setSending(type);
    setShowAnimation(true);

    try {
      const message = type === 'hug' 
        ? `🤗 ${displayName} sent you a warm virtual hug!`
        : `😘 ${displayName} sent you a sweet kiss!`;

      await supabase.from('quick_notifications').insert({
        from_user: displayName,
        to_user: partnerName,
        notification_type: type,
        message,
      });

      toast({
        title: type === 'hug' ? '🤗 Hug Sent!' : '😘 Kiss Sent!',
        description: `Your ${type} has been delivered to ${partnerName}! 💕`,
      });

      setTimeout(() => {
        setShowAnimation(false);
        setSending(null);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send ${type}`,
        variant: 'destructive',
      });
      setSending(null);
      setShowAnimation(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-primary fill-current animate-pulse" />
          Virtual Love
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        <p className="text-sm text-muted-foreground mb-4">
          Send instant love to {partnerName}! 💕
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={() => sendVirtual('hug')}
            disabled={sending !== null}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            data-testid="send-hug-button"
          >
            🤗 Send Hug
          </Button>
          
          <Button
            onClick={() => sendVirtual('kiss')}
            disabled={sending !== null}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            data-testid="send-kiss-button"
          >
            😘 Send Kiss
          </Button>
        </div>

        {/* Animation */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-6xl"
              >
                {sending === 'hug' ? '🤗' : '😘'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default VirtualHugKiss;
