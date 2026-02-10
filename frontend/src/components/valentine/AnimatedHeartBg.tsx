import { useEffect, useRef } from 'react';
import { animate, createScope, svg } from 'animejs';

const AnimatedHeartBg = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef.current }).add((self) => {
      // Every anime.js instance declared here is now scoped to <div ref={rootRef}>
      
      const heartElement = rootRef.current?.querySelector('.main-heart');
      if (!heartElement) return;

      // Heartbeat animation - stronger pulse, stays in place
      animate(heartElement, {
        scale: [1, 1.2, 1, 1.1, 1],
        opacity: [0.15, 0.3, 0.15, 0.25, 0.15],
        duration: 2000,
        easing: 'inOut(3)',
        loop: true,
      });

      // Animate individual heart paths with morphing effect
      const paths = heartElement.querySelectorAll('path');
      paths.forEach((path, index) => {
        const pathLength = (path as SVGPathElement).getTotalLength();
        (path as SVGPathElement).style.strokeDasharray = pathLength.toString();
        (path as SVGPathElement).style.strokeDashoffset = pathLength.toString();
        
        animate(path, {
          strokeDashoffset: [pathLength, 0],
          easing: 'inOutSine',
          duration: 3000,
          delay: index * 200,
          alternate: true,
          loop: true,
        });
      });

      // Add subtle position movement
      animate(heartElement, {
        translateX: [-10, 10],
        translateY: [-10, 10],
        duration: 8000,
        easing: 'inOut(2)',
        alternate: true,
        loop: true,
      });

      // Animate small hearts along motion paths
      const motionPaths = rootRef.current?.querySelectorAll('.motion-path');
      const smallHearts = rootRef.current?.querySelectorAll('.small-heart');
      
      motionPaths?.forEach((path, index) => {
        const smallHeart = smallHearts?.[index];
        if (!smallHeart || !path) return;

        // Create motion path animation for each heart
        const motionPathValues = svg.createMotionPath(path as SVGPathElement);
        
        animate(smallHeart, {
          ...motionPathValues,
          duration: 8000 + (index * 1000), // Vary duration for each heart
          easing: 'linear',
          loop: true,
          delay: index * 500, // Stagger the start
        });

        // Add pulsing effect to small hearts
        animate(smallHeart, {
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
          duration: 2000,
          easing: 'inOut(2)',
          loop: true,
          delay: index * 300,
        });
      });
    });

    // Properly cleanup all anime.js instances declared inside the scope
    return () => scope.current?.revert();
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 -z-10 pointer-events-none overflow-hidden flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="main-heart w-[800px] h-[800px] md:w-[1000px] md:h-[1000px]"
        style={{ opacity: 0.15 }}
      >
        {/* Main heart shape */}
        <path
          d="M100,170 C60,130 20,110 20,70 C20,40 40,20 65,20 C80,20 90,30 100,45 C110,30 120,20 135,20 C160,20 180,40 180,70 C180,110 140,130 100,170 Z"
          fill="none"
          stroke="url(#heartGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Inner heart detail */}
        <path
          d="M100,155 C70,125 35,105 35,75 C35,50 50,35 70,35 C82,35 92,42 100,55 C108,42 118,35 130,35 C150,35 165,50 165,75 C165,105 130,125 100,155 Z"
          fill="none"
          stroke="url(#heartGradient)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Additional decorative heart layer */}
        <path
          d="M100,140 C80,120 50,100 50,80 C50,60 65,50 80,50 C90,50 95,55 100,65 C105,55 110,50 120,50 C135,50 150,60 150,80 C150,100 120,120 100,140 Z"
          fill="url(#heartGradient)"
          fillOpacity="0.1"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f472b6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Motion Paths and Small Hearts Container */}
      <svg
        viewBox="0 0 1920 800"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Motion Paths - Hidden but used for animation */}
        {/* Path 1: Circular motion top left */}
        <path
          className="motion-path"
          d="M 300,200 Q 400,100 500,200 T 700,200 Q 600,300 500,200 T 300,200 Z"
          fill="none"
          stroke="none"
        />
        
        {/* Path 2: Wave motion across top */}
        <path
          className="motion-path"
          d="M 100,150 Q 300,100 500,150 T 900,150 Q 1100,100 1300,150 T 1700,150"
          fill="none"
          stroke="none"
        />
        
        {/* Path 3: Diagonal swoosh */}
        <path
          className="motion-path"
          d="M 1600,100 Q 1400,200 1200,300 T 800,500 Q 600,600 400,700"
          fill="none"
          stroke="none"
        />
        
        {/* Path 4: Bottom wave */}
        <path
          className="motion-path"
          d="M 200,600 Q 400,550 600,600 T 1000,600 Q 1200,550 1400,600 T 1800,600"
          fill="none"
          stroke="none"
        />
        
        {/* Path 5: Figure-8 pattern */}
        <path
          className="motion-path"
          d="M 960,400 Q 1100,300 1200,400 Q 1100,500 960,400 Q 820,300 720,400 Q 820,500 960,400 Z"
          fill="none"
          stroke="none"
        />
        
        {/* Path 6: Vertical loop right side */}
        <path
          className="motion-path"
          d="M 1500,200 Q 1600,300 1500,400 T 1500,600 Q 1400,500 1500,400 T 1500,200 Z"
          fill="none"
          stroke="none"
        />

        {/* Small Hearts - Animated along paths */}
        {[...Array(6)].map((_, i) => (
          <g key={i} className="small-heart">
            <path
              d="M 12,21 C 8,17 4,14 4,10 C 4,7 6,5 8,5 C 10,5 11,6 12,8 C 13,6 14,5 16,5 C 18,5 20,7 20,10 C 20,14 16,17 12,21 Z"
              fill="#ec4899"
              fillOpacity="0.7"
              transform="translate(-12, -13)"
            />
          </g>
        ))}
      </svg>

      {/* Additional floating hearts for atmosphere */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M12,21 C8,17 4,14 4,10 C4,7 6,5 8,5 C10,5 11,6 12,8 C13,6 14,5 16,5 C18,5 20,7 20,10 C20,14 16,17 12,21 Z"
                fill="#ec4899"
                fillOpacity="0.2"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedHeartBg;
