import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import GalaxyBackground from '@/components/valentine-future/GalaxyBackground';
import MemoryTraveler from '@/components/valentine-future/MemoryTraveler';
import MemoryModal from '@/components/valentine-future/MemoryModal';
import SecretMessageReveal from '@/components/valentine-future/SecretMessageReveal';

interface Memory {
  id: string;
  title: string;
  description: string;
  snippet?: string;
  image_url?: string;
  diorama_config?: any;
  order_index: number;
}

export default function ValentineFuturePage() {
  const navigate = useNavigate();
  const { enable3DEffects } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [visitedMemories, setVisitedMemories] = useState<Set<string>>(new Set());
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [totalMemories, setTotalMemories] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      if (mobile) {
        toast({
          title: '💻 Desktop Recommended',
          description: 'This experience is best enjoyed on a laptop or desktop. Something amazing is cooking! 🎉',
          duration: 8000,
        });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch total memories and visited progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Get total memories
        const { count, error: countError } = await supabase
          .from('future_memories')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        setTotalMemories(count || 0);

        // Get visited memories
        const { data: progressData, error: progressError } = await supabase
          .from('memory_progress')
          .select('memory_id')
          .eq('user_name', 'Senorita');

        if (progressError) throw progressError;

        if (progressData) {
          const visited = new Set(progressData.map(p => p.memory_id));
          setVisitedMemories(visited);

          // Check if all memories visited
          if (visited.size === count && count > 0) {
            setSecretUnlocked(true);
          }
        }

        // Check secret unlock status
        const { data: unlockData, error: unlockError } = await supabase
          .from('secret_message_unlocks')
          .select('*')
          .eq('user_name', 'Senorita')
          .single();

        if (!unlockError && unlockData) {
          setSecretUnlocked(true);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();

    // Subscribe to progress updates
    const subscription = supabase
      .channel('memory-progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_progress',
          filter: 'user_name=eq.Senorita'
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Play ambient space music
  useEffect(() => {
    if (!isPlaying) return;

    const ambient = new Audio('/audio/space-ambient.mp3');
    ambient.loop = true;
    ambient.volume = 0.3;
    ambient.play().catch(() => { /* ignore */ });

    return () => {
      ambient.pause();
      ambient.currentTime = 0;
    };
  }, [isPlaying]);

  const handleStartJourney = () => {
    setShowStartButton(false);
    setIsPlaying(true);
    
    // Smooth scroll to memory section
    setTimeout(() => {
      const el = document.querySelector('#memory-traveler');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleMemoryClick = async (memory: Memory) => {
    setSelectedMemory(memory);

    // Mark as visited in database
    try {
      const { error } = await supabase
        .from('memory_progress')
        .insert({
          user_name: 'Senorita',
          memory_id: memory.id,
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      // Update local state
      setVisitedMemories(prev => new Set([...prev, memory.id]));

      // Check if all memories visited
      const newVisited = new Set([...visitedMemories, memory.id]);
      if (newVisited.size === totalMemories && totalMemories > 0 && !secretUnlocked) {
        // Unlock secret message
        await supabase
          .from('secret_message_unlocks')
          .insert({ user_name: 'Senorita' });

        setSecretUnlocked(true);

        toast({
          title: '✨ Secret Unlocked!',
          description: 'You\'ve discovered all the memories. A special message awaits...',
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('Error marking memory as visited:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedMemory(null);
  };

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      {/* Galaxy Background */}
      {enable3DEffects && !isMobile && <GalaxyBackground />}

      {/* Fallback gradient background */}
      {(!enable3DEffects || isMobile) && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/senorita')}
            variant="ghost"
            className="text-white/80 hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400">
                Message from 2030 ✨
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-xl md:text-2xl text-white/80 mb-12 font-light"
              >
                A future we build, memory by memory.
              </motion.p>

              {/* Progress Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="inline-block bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 mb-8"
              >
                <span className="text-cyan-400 font-semibold">
                  {visitedMemories.size} / {totalMemories} Memories Discovered
                </span>
              </motion.div>

              {showStartButton && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                >
                  <Button
                    onClick={handleStartJourney}
                    size="lg"
                    className="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white border-0 shadow-2xl shadow-cyan-500/50"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Start Future Play
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Memory Traveler Section */}
        {!showStartButton && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            id="memory-traveler"
            className="container mx-auto px-4 py-16"
          >
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Our Memory Constellation
            </h2>
            <MemoryTraveler 
              onMemoryClick={handleMemoryClick}
              visitedMemories={visitedMemories}
            />
          </motion.div>
        )}

        {/* Footer Hint */}
        {!showStartButton && visitedMemories.size < totalMemories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center py-8 text-white/60 text-sm"
          >
            <p>Click on memory nodes to explore them • Visit all to unlock a secret</p>
          </motion.div>
        )}
      </div>

      {/* Memory Modal */}
      <MemoryModal
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={handleCloseModal}
      />

      {/* Secret Message */}
      <SecretMessageReveal isUnlocked={secretUnlocked} />
    </div>
  );
}