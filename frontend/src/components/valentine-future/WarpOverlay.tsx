import React, { useEffect, useRef } from "react";
import { createTimeline } from "animejs";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean; onClose?: () => void };

export default function WarpOverlay({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const overlay = overlayRef.current!;
    overlay.style.display = "block";

    // Play whoosh SFX (optional - will gracefully fail if file doesn't exist)
    const sfx = new Audio("/audio/warp-whoosh.mp3");
    sfx.volume = 0.9;
    sfx.play().catch(() => { /* ignore autoplay block or missing file */ });

    // Star streak canvas: simple particle stretch while animating zoom
    const canvas = starsRef.current!;
    const ctx = canvas.getContext("2d")!;
    const DPR = window.devicePixelRatio || 1;
    
    function resize() {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Create star field (simple)
    const stars = new Array(400).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1, // depth
    }));

    let animFrame = 0;
    function draw(progress: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const speedFactor = 10 + 60 * progress; // accelerate
      for (const s of stars) {
        // Move 'towards' viewer
        s.y += speedFactor * (1 - s.z) * 0.02;
        s.x += (s.x - canvas.width / 2) * 0.0005 * progress;
        // Respawn
        if (s.y > canvas.height + 50) {
          s.y = -50;
          s.x = Math.random() * canvas.width;
          s.z = Math.random();
        }
        const size = Math.max(0.4, (1 - s.z) * 2.5 * progress);
        ctx.fillStyle = `rgba(255,255,255,${0.6 * (1 - s.z)})`;
        ctx.fillRect(s.x, s.y, size, size * 4 * (1 + progress * 6)); // streak effect
      }
    }

    // Anime timeline: scale, blur, speed ramp, then navigate
    const tl = createTimeline({
      ease: "inOutQuad",
      duration: 1400,
      onComplete: () => {
        // Route to future page
        navigate("/valentine/future");
        // Small delay to let route mount
        setTimeout(() => {
          overlay.style.display = "none";
          onClose?.();
        }, 250);
      },
      onUpdate: anim => {
        const p = anim.progress / 100;
        draw(p);
        // Optional: scale/blur overlay via CSS var
        overlay.style.setProperty("--warp-scale", `${1 + p * 2}`);
        overlay.style.setProperty("--warp-blur", `${Math.min(24, p * 40)}px`);
      },
    });

    // Timeline effects (dummy tweens to drive update)
    tl.add({ duration: 600 }) // accelerate
      .add({ duration: 500 }) // full warp
      .add({ duration: 300 }); // settle then route

    return () => {
      tl.pause();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame);
    };
  }, [open, navigate, onClose]);

  return (
    <div
      ref={overlayRef}
      aria-hidden={!open}
      style={{
        display: "none",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "radial-gradient(circle at 50% 50%, #071428 0%, #000 60%)",
        backdropFilter: "blur(var(--warp-blur, 0px))",
        transform: "scale(var(--warp-scale,1))",
        transition: "transform 300ms linear, backdrop-filter 300ms linear",
        touchAction: "none",
      }}
    >
      <canvas ref={starsRef} style={{ width: "100%", height: "100%" }} />
      {/* Optional centered "warp" UI */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
        display: "flex", justifyContent: "center", pointerEvents: "none"
      }}>
        <div style={{ color: "rgba(255,255,255,0.9)", fontFamily: "monospace", fontSize: 18 }}>
          Initiating Temporal Jump…
        </div>
      </div>
    </div>
  );
}
