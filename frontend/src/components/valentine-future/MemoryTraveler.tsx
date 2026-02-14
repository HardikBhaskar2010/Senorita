import React, { useEffect, useRef, useState } from "react";
import { animate, createMotionPath, remove } from "animejs";
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
  const [cameraOffset, setCameraOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  const focusNode = (index: number) => {
    const container = containerRef.current;
    const targetNode = nodesRef.current[index];
    if (!container || !targetNode) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;

    const candidateOffsets = nodesRef.current
      .filter((node): node is HTMLDivElement => Boolean(node))
      .map((node) => {
        const nodeCenterX = node.getBoundingClientRect().left + node.getBoundingClientRect().width / 2;
        return cameraOffset + (containerCenterX - nodeCenterX);
      });

    if (candidateOffsets.length === 0) return;

    const minAllowed = Math.min(...candidateOffsets);
    const maxAllowed = Math.max(...candidateOffsets);
    const targetCenterX = targetNode.getBoundingClientRect().left + targetNode.getBoundingClientRect().width / 2;
    const targetOffset = cameraOffset + (containerCenterX - targetCenterX);

    setCameraOffset(Math.max(minAllowed, Math.min(maxAllowed, targetOffset)));
  };

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

  // Keep path sizing responsive
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (memories.length === 0) return;

    const containerWidth = containerRef.current?.clientWidth ?? viewportWidth;
    const margin = Math.max(80, containerWidth * 0.08);
    const pathY = 300;
    const pathD = `
      M ${margin} ${pathY}
      C ${containerWidth * 0.22} 70, ${containerWidth * 0.45} 70, ${containerWidth * 0.56} ${pathY}
      C ${containerWidth * 0.72} 530, ${containerWidth * 0.86} 530, ${containerWidth - margin} ${pathY}
    `;

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
      svg.innerHTML = `<path id="memoryPath" d="${pathD}" />`;
      document.body.appendChild(svg);
    } else {
      const pathEl = svg.querySelector("#memoryPath");
      if (pathEl) {
        pathEl.setAttribute("d", pathD);
      } else {
        svg.innerHTML = `<path id="memoryPath" d="${pathD}" />`;
      }
    }

    // Initial scatter animate in along segments
    nodesRef.current.forEach((el, idx) => {
      if (!el) return;
      // Use a staggered offset across path length
      const offset = idx / memories.length;
      const path = createMotionPath("#memoryPath", offset);
      animate(el, {
        translateX: path.translateX,
        translateY: path.translateY,
        rotate: path.rotate,
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 1200,
        ease: "outElastic(1, .6)",
        delay: idx * 120,
      });
    });

    return () => {
      remove(nodesRef.current);
    };
  }, [memories, viewportWidth]);

  // Focus camera on latest visited/opened memory card
  useEffect(() => {
    if (memories.length === 0 || visitedMemories.size === 0) return;

    const latestVisitedIndex = [...memories]
      .reverse()
      .findIndex((memory) => visitedMemories.has(memory.id));

    if (latestVisitedIndex === -1) return;

    const index = memories.length - 1 - latestVisitedIndex;
    const timer = window.setTimeout(() => focusNode(index), 450);
    return () => window.clearTimeout(timer);
  }, [memories, visitedMemories]);

  function flyToMemory(index: number, memory: Memory) {
    const targetEl = nodesRef.current[index];
    if (!targetEl) return;
    const centerPath = createMotionPath("#memoryPath", 0.5);

    // Timeline: node moves along path to the center with easing
    animate(targetEl, {
      translateX: centerPath.translateX,
      translateY: centerPath.translateY,
      rotate: centerPath.rotate,
      scale: [1, 1.08],
      duration: 1100,
      ease: "cubicBezier(.2,.8,.2,1)",
      onComplete: () => {
        // Open modal
        onMemoryClick(memory);
        // Reset position after modal opens
        setTimeout(() => {
          const originalOffset = index / memories.length;
          const originalPath = createMotionPath("#memoryPath", originalOffset);
          animate(targetEl, {
            translateX: originalPath.translateX,
            translateY: originalPath.translateY,
            rotate: originalPath.rotate,
            scale: 1,
            duration: 800,
            ease: "outQuad",
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
    <div ref={containerRef} className="memory-traveler-root relative overflow-hidden" style={{ height: 520 }}>
      <div
        className="memory-track relative"
        style={{
          height: "100%",
          transform: `translateX(${cameraOffset}px)`,
          transition: "transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          willChange: "transform",
        }}
      >
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
