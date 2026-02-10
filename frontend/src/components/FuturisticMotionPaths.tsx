import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface FuturisticMotionPathsProps {
  theme?: 'cyan' | 'pink' | 'purple';
  pathCount?: number;
}

const FuturisticMotionPaths = ({ theme = 'cyan', pathCount = 8 }: FuturisticMotionPathsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Theme colors
    const themeColors = {
      cyan: ['#06b6d4', '#0891b2', '#22d3ee', '#67e8f9'],
      pink: ['#ec4899', '#db2777', '#f472b6', '#f9a8d4'],
      purple: ['#a855f7', '#9333ea', '#c084fc', '#d8b4fe']
    };

    const colors = themeColors[theme];

    // Create random SVG paths
    const paths: SVGPathElement[] = [];
    const animations: anime.AnimeInstance[] = [];
    
    for (let i = 0; i < pathCount; i++) {
      // Create SVG element
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', '100%');
      svgEl.style.position = 'absolute';
      svgEl.style.top = '0';
      svgEl.style.left = '0';
      svgEl.style.pointerEvents = 'none';
      svgEl.style.zIndex = '1';

      // Generate random control points for complex curved path
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      const cp1X = Math.random() * width;
      const cp1Y = Math.random() * height;
      
      const cp2X = Math.random() * width;
      const cp2Y = Math.random() * height;
      
      const cp3X = Math.random() * width;
      const cp3Y = Math.random() * height;
      
      const endX = Math.random() * width;
      const endY = Math.random() * height;

      // Create path with cubic bezier curves for smooth, flowing lines
      const pathData = `
        M ${startX} ${startY}
        C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${(cp2X + cp3X) / 2} ${(cp2Y + cp3Y) / 2}
        S ${cp3X} ${cp3Y}, ${endX} ${endY}
      `;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colors[i % colors.length]);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('opacity', '0.3');
      path.style.filter = 'blur(1px)';

      svgEl.appendChild(path);
      container.appendChild(svgEl);
      paths.push(path);

      // Create glowing particle that follows the path
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = colors[i % colors.length];
      particle.style.boxShadow = `0 0 20px ${colors[i % colors.length]}, 0 0 40px ${colors[i % colors.length]}`;
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '2';
      container.appendChild(particle);

      // Animate particle along the path using anime.js motion path
      const pathLength = path.getTotalLength();
      const duration = 8000 + Math.random() * 6000;
      
      // Use anime's built-in motion path animation
      const particleAnim = anime({
        targets: particle,
        translateX: anime.path(path, 'x'),
        translateY: anime.path(path, 'y'),
        duration: duration,
        easing: 'linear',
        loop: true,
        delay: i * 400
      });
      
      animations.push(particleAnim);

      // Animate path opacity for pulsing effect
      const opacityAnim = anime({
        targets: path,
        opacity: [0.1, 0.5, 0.1],
        duration: 3000 + Math.random() * 2000,
        easing: 'easeInOutSine',
        loop: true,
        delay: i * 200
      });
      
      animations.push(opacityAnim);

      // Animate stroke-dashoffset for drawing effect
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;

      const drawAnim = anime({
        targets: path,
        strokeDashoffset: [pathLength, 0],
        duration: 4000,
        easing: 'easeInOutQuad',
        delay: i * 300,
        complete: () => {
          // After drawing, animate in reverse for continuous flow
          const flowAnim = anime({
            targets: path,
            strokeDashoffset: [0, -pathLength],
            duration: 10000 + Math.random() * 5000,
            easing: 'linear',
            loop: true
          });
          animations.push(flowAnim);
        }
      });
      
      animations.push(drawAnim);
    }

    // Create floating nodes at intersections
    const nodeCount = pathCount * 2;
    for (let i = 0; i < nodeCount; i++) {
      const node = document.createElement('div');
      node.style.position = 'absolute';
      node.style.width = '4px';
      node.style.height = '4px';
      node.style.borderRadius = '50%';
      node.style.backgroundColor = colors[i % colors.length];
      node.style.boxShadow = `0 0 10px ${colors[i % colors.length]}`;
      node.style.left = `${Math.random() * width}px`;
      node.style.top = `${Math.random() * height}px`;
      node.style.pointerEvents = 'none';
      node.style.zIndex = '3';
      container.appendChild(node);

      // Pulse animation for nodes
      animate(node, {
        scale: [1, 2, 1],
        opacity: [0.3, 0.8, 0.3],
        duration: 2000 + Math.random() * 1000,
        easing: 'easeInOutSine',
        loop: true,
        delay: i * 150
      });

      // Floating animation
      animate(node, {
        translateX: [
          { value: (Math.random() - 0.5) * 100, duration: 3000 },
          { value: 0, duration: 3000 }
        ],
        translateY: [
          { value: (Math.random() - 0.5) * 100, duration: 3000 },
          { value: 0, duration: 3000 }
        ],
        easing: 'easeInOutQuad',
        loop: true,
        delay: i * 200
      });
    }

    // Cleanup function
    return () => {
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [theme, pathCount]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
};

export default FuturisticMotionPaths;
