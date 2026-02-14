import React, { useEffect, useRef, useState } from "react";
import { animate, createMotionPath, remove } from "animejs";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Memory = {
  id: string;
  title: string;
  snippet: string;
  image_url?: string;
  description: string;
  diorama_config?: any;
  order_index: number;
};

interface MemoryTravelerProps {
  onMemoryClick: (memory: Memory) => void;
  visitedMemories: Set<string>;
}

export default function MemoryTraveler({ onMemoryClick, visitedMemories }: MemoryTravelerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Fetch memories from Supabase
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from('future_memories')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        if (data) {
          setMemories(data);
        }
      } catch (err) {
        console.error('Error fetching memories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  // Focus on a specific card with smooth camera movement
  const focusOnCard = (index: number) => {
    if (index < 0 || index >= memories.length) return;
    
    setFocusedIndex(index);
    
    const targetNode = nodesRef.current[index];
    if (!targetNode) return;

    // Animate all cards
    nodesRef.current.forEach((node, i) => {
      if (!node) return;
      
      const distance = i - index;
      const isFocused = i === index;
      
      animate(node, {
        translateX: distance * 350, // Spread cards 350px apart
        translateY: 0,
        scale: isFocused ? 1.2 : 0.85, // Focused card is larger
        opacity: isFocused ? 1 : 0.6, // Focused card is brighter
        duration: 800,
        ease: "outCubic",
      });
    });
  };

  // Initial layout and animation
  useEffect(() => {
    if (memories.length === 0) return;

    // Initial scatter animation
    nodesRef.current.forEach((el, idx) => {
      if (!el) return;
      
      const distance = idx - focusedIndex;
      
      animate(el, {
        translateX: distance * 350,
        translateY: 0,
        opacity: [0, idx === focusedIndex ? 1 : 0.6],
        scale: [0.5, idx === focusedIndex ? 1.2 : 0.85],
        duration: 1200,
        ease: "outElastic(1, .6)",
        delay: idx * 100,
      });
    });

    return () => {
      remove(nodesRef.current);
    };
  }, [memories, focusedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusedIndex, memories.length]);

  const handlePrevious = () => {
    if (focusedIndex > 0) {
      focusOnCard(focusedIndex - 1);
    }
  };

  const handleNext = () => {
    if (focusedIndex < memories.length - 1) {
      focusOnCard(focusedIndex + 1);
    }
  };

  const handleCardClick = (index: number, memory: Memory) => {
    focusOnCard(index);
    
    // Delay modal opening to show card focus animation
    setTimeout(() => {
      onMemoryClick(memory);
      
      // Play chime sound
      const chime = new Audio("/audio/memory-chime.mp3");
      chime.volume = 0.6;
      chime.play().catch(() => { /* ignore */ });
    }, 400);
  };

  if (loading) {
    return (
      <div className="memory-traveler-root flex items-center justify-center" style={{ minHeight: 600 }}>
        <div className="text-white/70 text-lg">Loading memories...</div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="memory-traveler-root flex items-center justify-center" style={{ minHeight: 600 }}>
        <div className="text-white/70 text-lg">No memories found. Add some in the database!</div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: 600 }}>
      {/* Navigation Buttons */}
      <div className="absolute top-1/2 left-4 z-20 -translate-y-1/2">
        <Button
          onClick={handlePrevious}
          disabled={focusedIndex === 0}
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-600 hover:to-blue-600 border-2 border-white/20 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          data-testid="previous-memory-btn"
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>
      </div>

      <div className="absolute top-1/2 right-4 z-20 -translate-y-1/2">
        <Button
          onClick={handleNext}
          disabled={focusedIndex === memories.length - 1}
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500/80 to-purple-500/80 hover:from-pink-600 hover:to-purple-600 border-2 border-white/20 shadow-2xl shadow-pink-500/30 backdrop-blur-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          data-testid="next-memory-btn"
        >
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 shadow-xl">
          <span className="text-white font-medium text-sm">
            {focusedIndex + 1} / {memories.length}
          </span>
        </div>
      </div>

      {/* Memory Cards Container */}
      <div 
        ref={containerRef} 
        className="memory-traveler-root relative overflow-hidden flex items-center justify-center"
        style={{ minHeight: 600 }}
      >
        <div className="relative" style={{ width: 200, height: 400 }}>
          {memories.map((m, i) => {
            const isVisited = visitedMemories.has(m.id);
            const isFocused = i === focusedIndex;

            return (
              <div
                key={m.id}
                ref={(el) => (nodesRef.current[i] = el)}
                className={`memory-node absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  isVisited ? 'ring-4 ring-green-400/50' : ''
                }`}
                onClick={() => handleCardClick(i, m)}
                style={{
                  width: 220,
                  height: 280,
                  borderRadius: 24,
                  background: isVisited
                    ? "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.15))"
                    : "linear-gradient(135deg, rgba(0,217,255,0.2), rgba(255,0,136,0.2))",
                  boxShadow: isFocused
                    ? "0 20px 60px rgba(0,217,255,0.5), 0 0 80px rgba(255,0,136,0.3)"
                    : isVisited
                    ? "0 10px 40px rgba(34,197,94,0.4)"
                    : "0 10px 40px rgba(0,217,255,0.3)",
                  border: isVisited ? '3px solid rgba(34,197,94,0.6)' : '3px solid rgba(0,217,255,0.4)',
                  backdropFilter: 'blur(20px)',
                  display: "flex",
                  flexDirection: 'column',
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  textAlign: "center",
                  padding: 20,
                  opacity: 0,
                }}
                role="button"
                aria-label={`Open memory ${m.title}`}
                data-testid={`memory-card-${i}`}
              >
                <div className="flex flex-col items-center gap-3 w-full">
                  {isVisited && (
                    <div className="text-green-400 text-2xl mb-1 animate-bounce">✓</div>
                  )}
                  
                  {/* Memory Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-pink-400 flex items-center justify-center text-3xl mb-2 shadow-lg">
                    {['☕', '🚂', '💻', '🌟', '💃', '🎬', '🌅', '📖', '🏠', '✨'][i]}
                  </div>
                  
                  <div className="text-xl font-bold tracking-tight">{m.title}</div>
                  <div className="text-sm opacity-90 font-light line-clamp-2">{m.snippet}</div>
                  
                  {isFocused && (
                    <div className="mt-3 text-xs text-cyan-300 animate-pulse">
                      Click to explore →
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-full px-6 py-2 border border-white/10">
          <span className="text-white/60 text-xs font-light">
            ← → Arrow keys to navigate • Click card to open
          </span>
        </div>
      </div>
    </div>
  );
}
