import { useEffect, useRef, useState } from 'react';
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
  type: 'sparkle' | 'heart' | 'star';
}

interface ParticleMagicProps {
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
}

export default function ParticleMagic({ 
  intensity = 'medium',
  colors = ['#ff69b4', '#ff1493', '#ffd700', '#ff6347', '#ffffff', '#ec4899']
}: ParticleMagicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler - particles follow mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Create particles that follow mouse
      if (Math.random() < 0.3) {
        createParticle(e.clientX, e.clientY, 'follow');
      }
    };

    // Click handler - particle burst
    const handleClick = (e: MouseEvent) => {
      createBurst(e.clientX, e.clientY);
    };

    // Touch handlers for mobile
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseRef.current = { x: touch.clientX, y: touch.clientY };
      if (Math.random() < 0.3) {
        createParticle(touch.clientX, touch.clientY, 'follow');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      createBurst(touch.clientX, touch.clientY);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchstart', handleTouchStart);

    // Create a single particle
    const createParticle = (x: number, y: number, type: 'follow' | 'auto' | 'burst') => {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'burst' ? 3 + Math.random() * 5 : 1 + Math.random() * 2;
      
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (type === 'follow' ? 0.5 : 1),
        vy: Math.sin(angle) * speed * (type === 'follow' ? 0.5 : 1),
        life: type === 'burst' ? 60 : 40,
        maxLife: type === 'burst' ? 60 : 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: type === 'burst' ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
        type: ['sparkle', 'heart', 'star'][Math.floor(Math.random() * 3)] as 'sparkle' | 'heart' | 'star'
      });
    };

    // Create burst of particles
    const createBurst = (x: number, y: number) => {
      const particleCount = intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 15;
      for (let i = 0; i < particleCount; i++) {
        createParticle(x, y, 'burst');
      }
    };

    // Auto-generate ambient particles
    const autoGenerateParticles = () => {
      const rate = intensity === 'high' ? 0.1 : intensity === 'medium' ? 0.05 : 0.02;
      
      if (Math.random() < rate) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        createParticle(x, y, 'auto');
      }
    };

    // Draw different particle types
    const drawParticle = (particle: Particle, opacity: number) => {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = particle.color;
      
      switch (particle.type) {
        case 'heart':
          drawHeart(particle.x, particle.y, particle.size);
          break;
        case 'star':
          drawStar(particle.x, particle.y, particle.size);
          break;
        default:
          // Sparkle (circle)
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = particle.color;
          break;
      }
    };

    const drawHeart = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 10, size / 10);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-5, -5, -10, 0, 0, 10);
      ctx.bezierCurveTo(10, 0, 5, -5, 0, 0);
      ctx.fill();
      
      ctx.restore();
    };

    const drawStar = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? size : size / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Auto-generate particles
      autoGenerateParticles();

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.02; // Slight gravity
        particle.vx *= 0.99; // Air resistance
        particle.vy *= 0.99;
        particle.life--;

        if (particle.life <= 0) return false;

        const opacity = particle.life / particle.maxLife;
        drawParticle(particle, opacity);

        return true;
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity, colors]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 pointer-events-auto z-10"
      style={{ 
        mixBlendMode: 'screen',
        cursor: 'crosshair'
      }}
    />
  );
}
