import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Archive, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import { currentSeason } from '@/lib/seasonConfig';
import MemoryModal from '@/components/valentine-future/MemoryModal';
import SecretMessageReveal from '@/components/valentine-future/SecretMessageReveal';

// 🔥 LAZY IMPORTS — 3D bundles only download if load3D === true
// When archived, these modules are NEVER requested from the server
const GalaxyBackground = lazy(() => import('@/components/valentine-future/GalaxyBackground'));
const MemoryTraveler = lazy(() => import('@/components/valentine-future/MemoryTraveler'));

interface Memory {
  id: string;
  title: string;
  description: string;
  snippet?: string;
  image_url?: string;
  diorama_config?: any;
  order_index: number;
}

// Pure CSS static memory card — zero GPU usage
const StaticMemoryCard = ({
  memory,
  visited,
  onClick,
}: {
  memory: Memory;
  visited: boolean;
  onClick: () => void;
}) => {
  const emojis = ['☕','🚂','💻','🌟','💃','🎬','🌅','📖','🏠','✨'];
  const emoji = emojis[(memory.order_index - 1) % emojis.length] ?? '💫';

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: memory.order_index * 0.06 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative cursor-pointer rounded-2xl p-5 border border-white/20 bg-white/5 backdrop-blur-md hover:border-cyan-400/40 hover:bg-white/10 transition-all group"
    >
      {visited && (
        <span className="absolute top-3 right-3 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
          ✓ Visited
        </span>
      )}
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-bold text-white mb-1 text-sm leading-snug line-clamp-2">{memory.title}</h3>
      <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">{memory.description}</p>
      <div className="mt-3 text-cyan-400/70 text-xs flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
        <Eye className="w-3 h-3" />
        Click to read
      </div>
    </motion.div>
  );
};

export default function ValentineFuturePage() {
  const navigate = useNavigate();
  const { enable3DEffects } = useTheme();
  const season = currentSeason();

  const [isMobile, setIsMobile] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [visitedMemories, setVisitedMemories] = useState<Set<string>>(new Set());
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [totalMemories, setTotalMemories] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [staticMemories, setStaticMemories] = useState<Memory[]>([]);

  // Only mount Three.js scenes if all three conditions are met
  const show3D = season.load3D && enable3DEffects && !isMobile;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { count } = await supabase.from('future_memories').select('*', { count: 'exact', head: true });
        setTotalMemories(count || 0);

        const { data: progressData } = await supabase
          .from('memory_progress').select('memory_id').eq('user_name', 'Senorita');
        if (progressData) {
          const visited = new Set(progressData.map((p: any) => p.memory_id));
          setVisitedMemories(visited);
          if (visited.size === count && count! > 0) setSecretUnlocked(true);
        }

        const { data: unlockData } = await supabase
          .from('secret_message_unlocks').select('*').eq('user_name', 'Senorita').single();
        if (unlockData) setSecretUnlocked(true);

        // In archive mode, pre-fetch memories for the static grid
        if (season.archived) {
          const { data: memData } = await supabase
            .from('future_memories').select('*').order('order_index', { ascending: true });
          if (memData) setStaticMemories(memData as Memory[]);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };
    fetchProgress();
  }, [season.archived]);

  useEffect(() => {
    if (!isPlaying) return;
    const ambient = new Audio('/audio/space-ambient.mp3');
    ambient.loop = true;
    ambient.volume = 0.3;
    ambient.play().catch(() => {});
    return () => { ambient.pause(); ambient.currentTime = 0; };
  }, [isPlaying]);

  const handleMemoryClick = async (memory: Memory) => {
    setSelectedMemory(memory);
    // Archive = view-only, never write to DB
    if (!season.allowInteraction) return;
    try {
      await supabase.from('memory_progress').insert({ user_name: 'Senorita', memory_id: memory.id });
      const newVisited = new Set([...visitedMemories, memory.id]);
      setVisitedMemories(newVisited);
      if (newVisited.size === totalMemories && totalMemories > 0 && !secretUnlocked) {
        await supabase.from('secret_message_unlocks').upsert({ user_name: 'Senorita' }, { onConflict: 'user_name' });
        setSecretUnlocked(true);
        toast({ title: '✨ Secret Unlocked!', description: "You've discovered all the memories.", duration: 5000 });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen relative isolate overflow-hidden">

      {/* =========  BACKGROUND  ========= */}
      {show3D ? (
        // Only mounts when load3D === true — Three.js canvas
        <Suspense fallback={<div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />}>
          <GalaxyBackground />
        </Suspense>
      ) : (
        // Archived / no 3D — pure CSS gradient + CSS-animated star dots
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
          <div className="absolute inset-0 overflow-hidden opacity-40">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
                animate={{ opacity: [0.1, 0.8, 0.1] }}
                transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 6 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========  CONTENT  ========= */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-8">
          <Button onClick={() => navigate('/senorita')} variant="ghost" className="text-white/80 hover:bg-white/10 mb-4">
            <ArrowLeft className="mr-2 w-4 h-4" />Back to Dashboard
          </Button>

          {/* Archive banner */}
          {season.archived && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-rose-500/20 border border-rose-500/30 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6"
            >
              <Archive className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="font-bold text-rose-300 text-sm">{season.label} {season.year}</span>
              <span className="text-white/50 text-sm">· A memory preserved forever</span>
              <Heart className="w-4 h-4 text-rose-400 fill-current flex-shrink-0" />
            </motion.div>
          )}
        </div>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <h1 className="text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                Message from 2030 ✨
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-12 font-extralight tracking-widest uppercase">
                A future we build, memory by memory.
              </p>

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring" }}
                className="inline-block bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/20 mb-12"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-white font-medium">{visitedMemories.size} / {totalMemories} Memories Discovered</span>
                </div>
              </motion.div>

              {/* Start button only in live (non-archived) mode */}
              {!season.archived && showStartButton && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: "spring" }}>
                  <Button
                    onClick={() => { setShowStartButton(false); setIsPlaying(true); setTimeout(() => document.querySelector('#memory-traveler')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }}
                    size="lg"
                    className="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white border-0 shadow-2xl shadow-cyan-500/50"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />Start Future Play
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* =========  MEMORIES  ========= */}
        {season.archived ? (
          // Archive mode: Static CSS grid — no Three.js at all
          <div className="container mx-auto px-4 py-10">
            <h2 className="text-3xl font-black text-center text-white mb-8 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">Memory Constellation</span>
            </h2>
            {staticMemories.length === 0 ? (
              <p className="text-center text-white/50 py-12">Loading memories...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {staticMemories.map(memory => (
                  <StaticMemoryCard key={memory.id} memory={memory} visited={visitedMemories.has(memory.id)} onClick={() => handleMemoryClick(memory)} />
                ))}
              </div>
            )}
          </div>
        ) : !showStartButton && (
          // Live mode: Three.js MemoryTraveler (lazy loaded)
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            id="memory-traveler" className="container mx-auto px-4 py-16">
            <h2 className="text-4xl font-black text-center text-white mb-12 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">Memory Constellation</span>
            </h2>
            <Suspense fallback={<div className="text-center text-white/60 py-20">Loading 3D experience...</div>}>
              <MemoryTraveler onMemoryClick={handleMemoryClick} visitedMemories={visitedMemories} />
            </Suspense>
          </motion.div>
        )}
      </div>

      <MemoryModal memory={selectedMemory} isOpen={!!selectedMemory} onClose={() => setSelectedMemory(null)} />
      <SecretMessageReveal isUnlocked={secretUnlocked} />
    </div>
  );
}