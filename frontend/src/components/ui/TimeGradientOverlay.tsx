import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const TimeGradientOverlay = () => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 10) setTimeOfDay('morning');
      else if (hour >= 10 && hour < 17) setTimeOfDay('day');
      else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Soft blending colors that sit beneath everything but on top of base bg
  const variants = {
    morning: { background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)' },
    day: { background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.03) 0%, rgba(236, 72, 153, 0.03) 100%)' },
    evening: { background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' },
    night: { background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.08) 0%, rgba(88, 28, 135, 0.08) 100%)' },
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 pointer-events-none z-[-1] mix-blend-overlay"
        animate={variants[timeOfDay]}
        transition={{ duration: 10, ease: "linear" }}
      />
      {timeOfDay === 'night' && (
         <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
           {/* Simple CSS twinkling stars for night */}
           {Array.from({ length: 20 }).map((_, i) => (
             <motion.div
               key={i}
               className="absolute bg-white rounded-full"
               style={{
                 width: Math.random() * 3 + 1 + 'px',
                 height: Math.random() * 3 + 1 + 'px',
                 left: Math.random() * 100 + '%',
                 top: Math.random() * 100 + '%',
               }}
               animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.2, 1] }}
               transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
             />
           ))}
         </div>
      )}
    </>
  );
};
