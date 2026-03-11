import { useEffect, useRef } from 'react';
import { animate, createScope } from 'animejs';
import { useSpace } from '@/contexts/SpaceContext';

interface FuturisticMotionPathsProps {
  theme?: 'cyan' | 'pink' | 'purple';
  pathCount?: number;
  shape?: 'heart' | 'infinity';
}

const FuturisticMotionPaths = ({ theme = 'cyan', pathCount = 8, shape = 'heart' }: FuturisticMotionPathsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<any>(null);
  const { partnerName, displayName } = useSpace();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ''; // clear old stuff
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    // Shift the heart slightly up because the math heart sits a bit low
    const centerY = height / 2 - Math.min(width, height) * 0.05; 

    // Theme colors
    const themeColors = {
      cyan: ['#06b6d4', '#0891b2', '#22d3ee', '#67e8f9'],
      pink: ['#ec4899', '#db2777', '#f472b6', '#f9a8d4'],
      purple: ['#a855f7', '#9333ea', '#c084fc', '#d8b4fe']
    };

    // Use partner's theme if possible, otherwise fallback to prop.
    // E.g., if you're Cookie, the partner is Senorita (pink). 
    // If you're Senorita, partner is Cookie (cyan).
    let activeTheme = theme;
    if (partnerName.toLowerCase() === 'senorita') activeTheme = 'pink';
    else if (partnerName.toLowerCase() === 'cookie') activeTheme = 'cyan';
    
    const colors = themeColors[activeTheme as keyof typeof themeColors] || themeColors.cyan;

    // The name we display glowing in the center
    const nameToDisplay = partnerName || 'Senorita';

    scopeRef.current = createScope({ root: containerRef }).add(() => {
      
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', '100%');
      svgEl.style.position = 'absolute';
      svgEl.style.top = '0';
      svgEl.style.left = '0';
      svgEl.style.pointerEvents = 'none';
      svgEl.style.zIndex = '1';
      container.appendChild(svgEl);

      // Generate Concentric Wavy Paths
      for (let i = 0; i < pathCount; i++) {
        // Parametric scaling
        const baseScale = shape === 'heart' ? Math.min(width, height) / 38 : Math.min(width, height) / 3.5; 
        const scale = baseScale * (0.8 + (i * 0.15)); // Different sizes for nested loops
        
        let pathData = '';
        const pointsCount = 150; // Increased resolution for smoother loops
        
        for (let j = 0; j <= pointsCount; j++) {
          const t = (j / pointsCount) * Math.PI * 2;
          let x, y;
          
          if (shape === 'heart') {
            // Heart curve
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            
            // Add a varying wave to the edges so lines look active and ethereal
            const waveAmp = (i % 2 === 0 ? 0.3 : -0.3) * i;
            x += waveAmp * Math.sin(t * 10);
            y += waveAmp * Math.cos(t * 10);
          } else {
            // Infinity curve (Lemniscate of Bernoulli)
            const denominator = 1 + Math.sin(t) * Math.sin(t);
            // X spans roughly -1.4 to +1.4, Y spans roughly -0.7 to +0.7
            x = (Math.sqrt(2) * Math.cos(t)) / denominator;
            y = (Math.sqrt(2) * Math.cos(t) * Math.sin(t)) / denominator;
            
            // Stretch horizontally slightly
            x *= 1.3;
            
            // Add a delicate varying wave to infinity
            const waveAmp = (i % 2 === 0 ? 0.02 : -0.02) * i;
            x += waveAmp * Math.sin(t * 16);
            y += waveAmp * Math.cos(t * 16);
          }

          const px = centerX + x * scale;
          const py = shape === 'heart' ? centerY - y * scale : centerY + y * scale; // Invert Y only for Heart
          
          if (j === 0) pathData += `M ${px} ${py} `;
          else pathData += `L ${px} ${py} `;
        }
        // Close the shape
        pathData += 'Z';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', colors[i % colors.length]);
        path.setAttribute('stroke-width', i % 2 === 0 ? '2' : '1');
        path.setAttribute('opacity', '0.4');
        path.setAttribute('class', `motion-path motion-path-${i}`);
        path.style.filter = `drop-shadow(0 0 ${4 + i}px ${colors[i % colors.length]})`;

        svgEl.appendChild(path);

        // Particle tracing the heart bounds
        const particle = document.createElement('div');
        particle.setAttribute('class', `particle-${i}`);
        particle.style.position = 'absolute';
        particle.style.width = i % 2 === 0 ? '6px' : '4px';
        particle.style.height = i % 2 === 0 ? '6px' : '4px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = '#ffffff';
        particle.style.boxShadow = `0 0 20px ${colors[i % colors.length]}, 0 0 40px ${colors[i % colors.length]}`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '2';
        container.appendChild(particle);

        const pathLength = path.getTotalLength();
        const duration = 12000 + (i * 2000); // Slow graceful tracing
        
        // Extract exact coordinates for animejs to follow
        const points: { x: number; y: number }[] = [];
        for (let j = 0; j <= pointsCount; j++) {
          const point = path.getPointAtLength((j / pointsCount) * pathLength);
          points.push({ x: point.x, y: point.y });
        }

        // 1. Move the glowing particle along the heart
        animate(`.particle-${i}`, {
          translateX: points.map(p => p.x),
          translateY: points.map(p => p.y),
          duration: duration,
          ease: 'linear',
          loop: true,
          // Reverse direction for half the particles for a mesmerizing weave effect
          direction: i % 2 === 0 ? 'normal' : 'reverse',
        });

        // 2. Pulse the entire path's opacity softly
        animate(`.motion-path-${i}`, {
          opacity: [0.1, 0.6, 0.1],
          duration: 4000 + i * 1000,
          ease: 'inOut(2)',
          loop: true,
        });

        // 3. Draw the lines smoothly in and out
        path.style.strokeDasharray = `${pathLength}`;
        path.style.strokeDashoffset = `${pathLength}`;

        animate(`.motion-path-${i}`, {
          strokeDashoffset: [pathLength, 0],
          duration: duration * 0.8,
          ease: 'inOut(3)',
          direction: 'alternate',
          loop: true,
          delay: i * 300,
        });
      }

      // Add the Glowing Name Text right in the middle
      if (nameToDisplay && shape === 'heart') {
        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        // ... (rest of text drawing identical because we conditionally wrap it)
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameText.textContent = nameToDisplay;
        nameText.setAttribute('x', '50%');
        nameText.setAttribute('y', '15%'); // Moved up so it's not hidden behind the central modal
        nameText.setAttribute('text-anchor', 'middle');
        nameText.setAttribute('dominant-baseline', 'middle');
        nameText.setAttribute('class', 'vault-glowing-name');
        
        // Inline styling to perfectly capture the romantic script 
        nameText.style.fontFamily = "'Dancing Script', cursive";
        nameText.style.fontSize = `${Math.max(70, Math.min(width, height) / 7)}px`;
        nameText.style.fill = 'rgba(255, 255, 255, 0.1)'; // Slight fill to make it pop
        nameText.style.stroke = colors[0];
        nameText.style.strokeWidth = '3px'; // Thicker stroke
        nameText.style.filter = `drop-shadow(0 0 20px ${colors[1]})`;
        
        textGroup.appendChild(nameText);
        svgEl.appendChild(textGroup);

        // Simple animation for the name stroke
        animate('.vault-glowing-name', {
          opacity: [0.3, 1, 0.3],
          duration: 4000,
          ease: 'inOut(2)',
          loop: true,
        });
      }

    });

    return () => {
      if (scopeRef.current) scopeRef.current.revert();
    };
  }, [theme, pathCount, partnerName]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
};

export default FuturisticMotionPaths;
