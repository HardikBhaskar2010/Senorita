import { useEffect, useRef } from 'react';
import { animate, createScope } from 'animejs';

const AnimatedHeartBg = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef }).add(() => {
      const heartElement = rootRef.current?.querySelector('svg');
      if (!heartElement) return;

      // Pumping heart animation - scale and opacity
      animate(heartElement, {
        scale: [1, 1.15, 1],
        opacity: [0.15, 0.25, 0.15],
        duration: 1500,
        easing: 'inOut(2)',
        loop: true,
      });

      // Rotate the entire heart slowly
      animate(heartElement, {
        rotate: '1turn',
        duration: 60000,
        easing: 'linear',
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
    });

    // Properly cleanup all anime.js instances
    return () => scope.current?.revert();
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 -z-10 pointer-events-none overflow-hidden flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="w-[800px] h-[800px] md:w-[1000px] md:h-[1000px]"
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
