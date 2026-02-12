import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
}

interface ShootingStarWish {
  id: string;
  from_user: string;
  wish_text: string;
  created_at: string;
}

interface ShootingStarsProps {
  userName: 'Cookie' | 'Senorita';
}

export default function ShootingStars({ userName }: ShootingStarsProps) {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [starId, setStarId] = useState(0);
  const [selectedStar, setSelectedStar] = useState<ShootingStar | null>(null);
  const [wishText, setWishText] = useState('');
  const [receivedWishes, setReceivedWishes] = useState<ShootingStarWish[]>([]);
  const [showWish, setShowWish] = useState<ShootingStarWish | null>(null);

  // Generate random shooting stars
  useEffect(() => {
    const interval = setInterval(() => {
      const newStar: ShootingStar = {
        id: Date.now(),
        startX: Math.random() * 100,
        startY: Math.random() * 40, // Top portion of screen
        angle: 35 + Math.random() * 25, // Diagonal angle
      };
      
      setShootingStars((prev) => [...prev, newStar]);
      setStarId((prev) => prev + 1);

      // Remove after animation
      setTimeout(() => {
        setShootingStars((prev) => prev.filter((s) => s.id !== newStar.id));
      }, 3000);
    }, 5000); // New star every 5 seconds (more frequent)

    return () => clearInterval(interval);
  }, []);

  // Listen for incoming wishes
  useEffect(() => {
    const loadWishes = async () => {
      const { data } = await supabase
        .from('shooting_star_wishes')
        .select('*')
        .eq('to_user', userName)
        .eq('seen', false)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setReceivedWishes(data);
      }
    };

    loadWishes();

    // Real-time subscription
    const channel = supabase
      .channel('shooting_star_wishes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shooting_star_wishes',
          filter: `to_user=eq.${userName}`,
        },
        (payload) => {
          const newWish = payload.new as ShootingStarWish;
          setReceivedWishes((prev) => [newWish, ...prev]);
          setShowWish(newWish);
          
          toast({
            title: '🌠 A Shooting Star Wish!',
            description: `${newWish.from_user} sent you a wish!`,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userName]);

  const handleStarClick = (star: ShootingStar) => {
    setSelectedStar(star);
  };

  const handleSendWish = async () => {
    if (!wishText.trim()) return;

    const partnerName = userName === 'Cookie' ? 'Senorita' : 'Cookie';

    const { error } = await supabase.from('shooting_star_wishes').insert({
      from_user: userName,
      to_user: partnerName,
      wish_text: wishText,
      seen: false,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send wish',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '🌠 Wish Sent!',
      description: `Your wish is flying to ${partnerName}`,
    });

    setSelectedStar(null);
    setWishText('');
  };

  const markWishAsSeen = async (wishId: string) => {
    await supabase
      .from('shooting_star_wishes')
      .update({ seen: true, seen_at: new Date().toISOString() })
      .eq('id', wishId);

    setReceivedWishes((prev) => prev.filter((w) => w.id !== wishId));
    setShowWish(null);
  };

  return (
    <>
      {/* Shooting stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {shootingStars.map((star) => (
            <motion.div
              key={star.id}
              initial={{
                x: `${star.startX}%`,
                y: `${star.startY}%`,
                opacity: 0,
              }}
              animate={{
                x: `${star.startX + 50}%`,
                y: `${star.startY + 50}%`,
                opacity: [0, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute pointer-events-auto cursor-pointer"
              onClick={() => handleStarClick(star)}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-yellow-200" fill="currentColor" />
              </motion.div>
              {/* Trail */}
              <motion.div
                initial={{ width: 0, opacity: 0.8 }}
                animate={{ width: 100, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-yellow-200 to-transparent"
                style={{ transformOrigin: 'left', transform: `rotate(${star.angle}deg)` }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Wish input modal */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedStar(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🌠</div>
                <h3 className="text-2xl font-bold text-white mb-2">Make a Wish</h3>
                <p className="text-white/70">Send a wish to your love</p>
              </div>

              <Input
                placeholder="Type your wish..."
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSendWish()}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStar(null)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendWish}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold hover:from-yellow-500 hover:to-orange-500"
                  disabled={!wishText.trim()}
                >
                  Send Wish ✨
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Received wish notification */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4"
          >
            <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🌠</div>
                <div className="flex-1">
                  <p className="text-sm text-white/70 mb-1">Wish from {showWish.from_user}</p>
                  <p className="text-white font-medium text-lg italic">"{showWish.wish_text}"</p>
                </div>
              </div>
              <Button
                onClick={() => markWishAsSeen(showWish.id)}
                className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wish counter */}
      {receivedWishes.length > 0 && !showWish && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowWish(receivedWishes[0])}
          className="fixed top-24 right-8 bg-gradient-to-br from-yellow-400 to-orange-400 text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        >
          <span className="font-bold">{receivedWishes.length}</span>
        </motion.button>
      )}
    </>
  );
}
