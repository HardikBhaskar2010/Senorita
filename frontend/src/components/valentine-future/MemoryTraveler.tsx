import React, { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    if (memories.length === 0) return;

    // Create an SVG path programmatically
    const svgNS = "http://www.w3.org/2000/svg";
    let svg = document.getElementById("motion-svg") as SVGSVGElement | null;
    if (!svg) {
      svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("id", "motion-svg");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.style.left = "0";
      svg.style.top = "0";
      
      // Complex path with multiple curves for interesting memory placement
      svg.innerHTML = `
        <path id="memoryPath" d="
          M 100 300
          C 300 50, 900 50, 1100 300
          C 1300 550, 1700 550, 1900 300
        " />
      `;
      document.body.appendChild(svg);
    }

    // Initial scatter animate in along segments
    nodesRef.current.forEach((el, idx) => {
      if (!el) return;
      const path = anime.path("#memoryPath");
      // Use a staggered offset across path length
      const offset = idx / memories.length;
      anime({
        targets: el,
        translateX: path("x")(offset),
        translateY: path("y")(offset),
        rotate: path("angle")(offset),
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 1200,
        easing: "easeOutElastic(1, .6)",
        delay: idx * 120,
      });
    });

    return () => {
      anime.remove(nodesRef.current);
    };
  }, [memories]);

  function flyToMemory(index: number, memory: Memory) {
    const targetEl = nodesRef.current[index];
    if (!targetEl) return;
    const path = anime.path("#memoryPath");

    // Timeline: node moves along path to the center with easing
    anime({
      targets: targetEl,
      translateX: path("x")(0.5), // mid-point on path
      translateY: path("y")(0.5),
      rotate: path("angle")(0.5),
      scale: [1, 1.08],
      duration: 1100,
      easing: "cubicBezier(.2,.8,.2,1)",
      complete: () => {
        // Open modal
        onMemoryClick(memory);
        // Reset position after modal opens
        setTimeout(() => {
          const originalOffset = index / memories.length;
          anime({
            targets: targetEl,
            translateX: path("x")(originalOffset),
            translateY: path("y")(originalOffset),
            rotate: path("angle")(originalOffset),
            scale: 1,
            duration: 800,
            easing: "easeOutQuad",
          });
        }, 300);
      },
    });

    // Play chime sound
    const chime = new Audio("/audio/memory-chime.mp3");
    chime.volume = 0.6;
    chime.play().catch(() => { /* ignore */ });
  }

  if (loading) {
    return (
      <div className="memory-traveler-root flex items-center justify-center" style={{ height: 520 }}>
        <div className="text-white/70 text-lg">Loading memories...</div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="memory-traveler-root flex items-center justify-center" style={{ height: 520 }}>
        <div className="text-white/70 text-lg">No memories found. Add some in the database!</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="memory-traveler-root relative" style={{ height: 520 }}>
      <div className="memory-track relative">
        {memories.map((m, i) => {
          const isVisited = visitedMemories.has(m.id);
          
          return (
            <div
              key={m.id}
              ref={(el) => (nodesRef.current[i] = el)}
              className={`memory-node absolute cursor-pointer transition-all ${
                isVisited ? 'ring-2 ring-green-400' : ''
              }`}
              onClick={() => flyToMemory(i, m)}
              style={{
                width: 120,
                height: 120,
                borderRadius: 16,
                background: isVisited
                  ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))"
                  : "linear-gradient(135deg, rgba(0,217,255,0.15), rgba(255,0,136,0.15))",
                boxShadow: isVisited
                  ? "0 6px 30px rgba(34,197,94,0.3)"
                  : "0 6px 30px rgba(0,217,255,0.3)",
                border: isVisited ? '2px solid rgba(34,197,94,0.5)' : '2px solid rgba(0,217,255,0.3)',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontFamily: "monospace",
                textAlign: "center",
                padding: 12,
                opacity: 0,
              }}
              role="button"
              aria-label={`Open memory ${m.title}`}
            >
              <div className="flex flex-col items-center gap-1">
                {isVisited && (
                  <div className="text-green-400 text-xs mb-1">✓</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.title}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{m.snippet}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}