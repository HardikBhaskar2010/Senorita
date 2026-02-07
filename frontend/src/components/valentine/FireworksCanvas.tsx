import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FireworksCanvasProps {
  active: boolean;
  duration?: number;
}

export default function FireworksCanvas({ active, duration = 5000 }: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    startTimeRef.current = Date.now();
    particlesRef.current = [];

    const colors = ['#ff69b4', '#ff1493', '#ff6347', '#ffd700', '#ff69b4', '#ffffff'];

    const createFirework = (x: number, y: number) => {
      const particleCount = 100;
      const angleStep = (Math.PI * 2) / particleCount;

      for (let i = 0; i < particleCount; i++) {
        const angle = angleStep * i;
        const speed = 2 + Math.random() * 4;
        
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }
    };

    const createHeartFirework = (x: number, y: number) => {
      const particleCount = 150;
      
      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount) * Math.PI * 2;
        
        // Heart shape parametric equations
        const heartX = 16 * Math.pow(Math.sin(t), 3);
        const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        const scale = 0.3;
        const speed = 2;
        
        particlesRef.current.push({
          x,
          y,
          vx: (heartX * scale * speed) / 10,
          vy: (heartY * scale * speed) / 10,
          life: 1,
          maxLife: 80 + Math.random() * 40,
          color: i % 3 === 0 ? '#ff1493' : i % 3 === 1 ? '#ff69b4' : '#ffd700',
          size: 3 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed > duration) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch new fireworks randomly
      if (Math.random() < 0.03) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        
        if (Math.random() < 0.3) {
          createHeartFirework(x, y);
        } else {
          createFirework(x, y);
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05; // Gravity
        particle.life--;

        if (particle.life <= 0) return false;

        const opacity = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = opacity;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;

        return true;
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Launch initial fireworks burst
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const x = (canvas.width / 6) * (i + 1);
          const y = canvas.height * 0.3;
          createHeartFirework(x, y);
        }, i * 200);
      }
    }, 100);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
