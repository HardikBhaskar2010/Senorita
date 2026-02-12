import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Trash2, Eye, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { AudioEngine, mapYToNote, mapYToInstrument } from './AudioEngine';
import type { Instrument, Note } from './AudioEngine';
import StarryBackground from './StarryBackground';
import MusicalParticles from './MusicalParticles';
import ShootingStars from './ShootingStars';
import ConstellationComplete from './ConstellationComplete';

interface Star {
  id: string;
  x: number;
  y: number;
  note: Note;
  instrument: Instrument;
  addedBy: string;
  orderIndex: number;
}

interface Constellation {
  id: string;
  name: string;
  createdBy: string;
  isComplete: boolean;
  stars: Star[];
}

interface CosmicKissSymphonyProps {
  userName: 'Cookie' | 'Senorita';
}

// Helper function to generate star shape path
const generateStarPath = (cx: number, cy: number, outerRadius: number, innerRadius: number, points: number = 5): string => {
  const angle = Math.PI / points;
  let path = '';
  
  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + radius * Math.sin(i * angle);
    const y = cy - radius * Math.cos(i * angle);
    
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  path += ' Z';
  return path;
};

export default function CosmicKissSymphony({ userName }: CosmicKissSymphonyProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentConstellation, setCurrentConstellation] = useState<Star[]>([]);
  const [constellationName, setConstellationName] = useState('');
  const [savedConstellations, setSavedConstellations] = useState<Constellation[]>([]);
  const [lastNote, setLastNote] = useState<{ x: number; y: number; instrument: Instrument } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComplete, setShowComplete] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null);

  // Initialize audio engine
  useEffect(() => {
    AudioEngine.initialize();
    return () => AudioEngine.stop();
  }, []);

  // Load saved constellations
  useEffect(() => {
    loadConstellations();

    // Real-time subscription for new stars
    const channel = supabase
      .channel('constellation_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'constellation_stars' },
        () => loadConstellations()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'constellations' },
        () => loadConstellations()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadConstellations = async () => {
    const { data: constellationsData, error: constError } = await supabase
      .from('constellations')
      .select('*')
      .order('created_at', { ascending: false });

    if (constError) {
      console.error('Error loading constellations:', constError);
      return;
    }

    if (!constellationsData) return;

    // Load stars for each constellation
    const constellationsWithStars = await Promise.all(
      constellationsData.map(async (const_) => {
        const { data: starsData } = await supabase
          .from('constellation_stars')
          .select('*')
          .eq('constellation_id', const_.id)
          .order('order_index', { ascending: true });

        return {
          id: const_.id,
          name: const_.name,
          createdBy: const_.created_by,
          isComplete: const_.is_complete,
          stars:
            starsData?.map((s) => ({
              id: s.id,
              x: parseFloat(s.x),
              y: parseFloat(s.y),
              note: s.note as Note,
              instrument: s.instrument as Instrument,
              addedBy: s.added_by,
              orderIndex: s.order_index,
            })) || [],
        };
      })
    );

    setSavedConstellations(constellationsWithStars);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || isPlaying) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Map position to note and instrument
    const note = mapYToNote(y);
    const instrument = mapYToInstrument(y);

    // Play sound
    AudioEngine.playNote(note, instrument, 0.6);

    // Visual feedback
    setLastNote({ x: e.clientX - rect.left, y: e.clientY - rect.top, instrument });

    // Add to current constellation
    const newStar: Star = {
      id: `temp-${Date.now()}`,
      x,
      y,
      note,
      instrument,
      addedBy: userName,
      orderIndex: currentConstellation.length,
    };

    setCurrentConstellation((prev) => [...prev, newStar]);

    // Show save prompt after 5 stars
    if (currentConstellation.length + 1 >= 5 && !showSaveModal) {
      toast({
        title: '✨ Beautiful constellation!',
        description: 'You can save it now if you like',
      });
    }
  };

  const saveConstellation = async () => {
    if (currentConstellation.length < 3) {
      toast({
        title: 'Need more stars',
        description: 'Add at least 3 stars to create a constellation',
        variant: 'destructive',
      });
      return;
    }

    if (!constellationName.trim()) {
      toast({
        title: 'Name required',
        description: 'Give your constellation a name',
        variant: 'destructive',
      });
      return;
    }

    // Save constellation
    const { data: constData, error: constError } = await supabase
      .from('constellations')
      .insert({
        name: constellationName,
        user_name: userName,
        created_by: userName,
        is_complete: true,
      })
      .select()
      .single();

    if (constError || !constData) {
      toast({
        title: 'Error',
        description: 'Failed to save constellation',
        variant: 'destructive',
      });
      return;
    }

    // Save stars
    const starsToInsert = currentConstellation.map((star) => ({
      constellation_id: constData.id,
      x: star.x.toFixed(2),
      y: star.y.toFixed(2),
      note: star.note,
      instrument: star.instrument,
      added_by: star.addedBy,
      order_index: star.orderIndex,
    }));

    const { error: starsError } = await supabase
      .from('constellation_stars')
      .insert(starsToInsert);

    if (starsError) {
      toast({
        title: 'Error',
        description: 'Failed to save stars',
        variant: 'destructive',
      });
      return;
    }

    // Show completion animation
    setShowComplete(constellationName);

    // Play the constellation melody
    setTimeout(() => {
      playConstellation(currentConstellation);
    }, 1500);

    // Reset
    setTimeout(() => {
      setCurrentConstellation([]);
      setConstellationName('');
      setShowSaveModal(false);
      loadConstellations();
    }, 3000);
  };

  const playConstellation = (stars: Star[]) => {
    if (isPlaying) return;
    setIsPlaying(true);

    const notes = stars.map((star) => ({
      note: star.note,
      instrument: star.instrument,
    }));

    AudioEngine.playSequence(notes, 500);

    setTimeout(() => {
      setIsPlaying(false);
    }, notes.length * 500 + 1000);
  };

  const deleteConstellation = async (id: string) => {
    const { error } = await supabase.from('constellations').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete constellation',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Constellation removed',
    });

    loadConstellations();
  };

  const addStarToConstellation = async (constellationId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || isPlaying) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const note = mapYToNote(y);
    const instrument = mapYToInstrument(y);

    AudioEngine.playNote(note, instrument, 0.6);

    const constellation = savedConstellations.find((c) => c.id === constellationId);
    if (!constellation) return;

    const { error } = await supabase.from('constellation_stars').insert({
      constellation_id: constellationId,
      x: x.toFixed(2),
      y: y.toFixed(2),
      note,
      instrument,
      added_by: userName,
      order_index: constellation.stars.length,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add star',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '⭐ Star added!',
      description: `Added to ${constellation.name}`,
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Starry background */}
      <StarryBackground />

      {/* Shooting stars */}
      <ShootingStars userName={userName} />

      {/* Instrument zones indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-8 z-10">
        <div className="flex items-center gap-2 text-pink-300">
          <span className="text-2xl">🎻</span>
          <span className="text-sm font-medium">Violin</span>
        </div>
        <div className="flex items-center gap-2 text-blue-300">
          <span className="text-2xl">🎹</span>
          <span className="text-sm font-medium">Piano</span>
        </div>
        <div className="flex items-center gap-2 text-purple-300">
          <span className="text-2xl">🪕</span>
          <span className="text-sm font-medium">Harp</span>
        </div>
      </div>

      {/* Main canvas */}
      <div
        ref={canvasRef}
        onClick={(e) => {
          if (selectedConstellation) {
            addStarToConstellation(selectedConstellation.id, e);
          } else {
            handleCanvasClick(e);
          }
        }}
        className="absolute inset-0 cursor-crosshair"
      >
        {/* Musical particles */}
        <MusicalParticles lastNote={lastNote} />

        {/* Current constellation being created */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* SVG Filters for glow effects */}
          <defs>
            <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="starSparkle" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Draw lines between stars */}
          {currentConstellation.map((star, index) => {
            if (index === 0) return null;
            const prevStar = currentConstellation[index - 1];
            return (
              <line
                key={`line-${index}`}
                x1={`${prevStar.x}%`}
                y1={`${prevStar.y}%`}
                x2={`${star.x}%`}
                y2={`${star.y}%`}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            );
          })}

          {/* Draw stars as star shapes with glow */}
          {currentConstellation.map((star, index) => {
            const color = star.instrument === 'violin' ? '#ff6b9d' : star.instrument === 'piano' ? '#4facfe' : '#f093fb';
            const x = parseFloat(star.x.toFixed(2));
            const y = parseFloat(star.y.toFixed(2));
            
            return (
              <g key={star.id}>
                {/* Outer glow circle */}
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="14"
                  fill={color}
                  opacity="0.2"
                  filter="url(#starGlow)"
                />
                
                {/* Star shape */}
                <g transform={`translate(0, 0)`}>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${x} ${y}`}
                    to={`360 ${x} ${y}`}
                    dur="8s"
                    repeatCount="indefinite"
                  />
                  <path
                    d={generateStarPath(x, y, 10, 4.5)}
                    fill={color}
                    filter="url(#starSparkle)"
                    className="drop-shadow-lg"
                  />
                </g>
                
                {/* Inner bright core */}
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="white"
                  opacity="0.9"
                />
                
                {/* Sparkle animation */}
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="8"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values="8;16;8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Number label */}
                <text
                  x={`${x}%`}
                  y={`${y}%`}
                  dy="-20"
                  textAnchor="middle"
                  fill="white"
                  fontSize="13"
                  fontWeight="bold"
                  className="drop-shadow-lg"
                  style={{ textShadow: `0 0 8px ${color}` }}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Saved constellations */}
        {savedConstellations.map((constellation) => (
          <svg key={constellation.id} className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
            {constellation.stars.map((star, index) => {
              if (index === 0) return null;
              const prevStar = constellation.stars[index - 1];
              return (
                <line
                  key={`saved-line-${star.id}`}
                  x1={`${prevStar.x}%`}
                  y1={`${prevStar.y}%`}
                  x2={`${star.x}%`}
                  y2={`${star.y}%`}
                  stroke="rgba(255, 215, 0, 0.4)"
                  strokeWidth="1.5"
                />
              );
            })}
            {constellation.stars.map((star) => {
              const x = parseFloat(star.x.toFixed(2));
              const y = parseFloat(star.y.toFixed(2));
              
              return (
                <g key={star.id}>
                  {/* Glow */}
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="10"
                    fill="#FFD700"
                    opacity="0.15"
                  />
                  
                  {/* Star shape */}
                  <path
                    d={generateStarPath(x, y, 7, 3)}
                    fill="#FFD700"
                    className="drop-shadow-md"
                  />
                  
                  {/* Core */}
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="2"
                    fill="#FFFACD"
                  />
                </g>
              );
            })}
          </svg>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {currentConstellation.length > 0 && (
          <>
            <Button
              onClick={() => setShowSaveModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save ({currentConstellation.length} stars)
            </Button>
            <Button
              onClick={() => playConstellation(currentConstellation)}
              disabled={isPlaying}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            <Button
              onClick={() => setCurrentConstellation([])}
              variant="destructive"
              className="shadow-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </>
        )}
      </div>

      {/* Saved constellations list */}
      <div className="absolute top-8 right-8 max-w-xs space-y-2 z-20">
        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Saved Constellations
        </h3>
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
          {savedConstellations.map((constellation) => (
            <motion.div
              key={constellation.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-semibold">{constellation.name}</h4>
                  <p className="text-white/60 text-xs">by {constellation.createdBy}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteConstellation(constellation.id)}
                  className="text-white/60 hover:text-white h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                <Music className="w-3 h-3" />
                {constellation.stars.length} stars
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => playConstellation(constellation.stars)}
                  disabled={isPlaying}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs h-7"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Play
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setSelectedConstellation(
                      selectedConstellation?.id === constellation.id ? null : constellation
                    )
                  }
                  className={`flex-1 text-xs h-7 ${
                    selectedConstellation?.id === constellation.id
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-white/20 hover:bg-white/30'
                  } text-white`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {selectedConstellation?.id === constellation.id ? 'Selected' : 'Add Star'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">✨</div>
                <h3 className="text-2xl font-bold text-white mb-2">Name Your Constellation</h3>
                <p className="text-white/70">Give your cosmic creation a beautiful name</p>
              </div>

              <Input
                placeholder="e.g., Midnight Promise, Eternal Love..."
                value={constellationName}
                onChange={(e) => setConstellationName(e.target.value)}
                className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                onKeyDown={(e) => e.key === 'Enter' && saveConstellation()}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveConstellation}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600"
                  disabled={!constellationName.trim() || currentConstellation.length < 3}
                >
                  Save ✨
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion animation */}
      <AnimatePresence>
        {showComplete && <ConstellationComplete name={showComplete} onClose={() => setShowComplete(null)} />}
      </AnimatePresence>

      {/* Instructions */}
      {currentConstellation.length === 0 && savedConstellations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Cosmic Kiss Symphony 🌟</h2>
          <p className="text-xl text-white/80 mb-6">Click anywhere to place kiss stars</p>
          <div className="flex items-center justify-center gap-8 text-white/60">
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 mb-2" />
              <span className="text-sm">Create constellations</span>
            </div>
            <div className="flex flex-col items-center">
              <Music className="w-8 h-8 mb-2" />
              <span className="text-sm">Compose melodies</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">💞</span>
              <span className="text-sm">Collaborate together</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
