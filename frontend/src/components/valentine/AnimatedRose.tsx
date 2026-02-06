import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedRose = () => {
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [clickedPetals, setClickedPetals] = useState<Set<number>>(new Set());

  const petals = [
    { id: 1, message: "You make my world brighter 💖", position: "top-5 left-[30px]" },
    { id: 2, message: "Every day with you is magic ✨", position: "top-0 left-0" },
    { id: 3, message: "You are my favorite person 🌸", position: "top-0 right-0" },
    { id: 4, message: "Forever starts with you 💍", position: "top-5 right-[30px]" },
  ];

  const handlePetalClick = (petal: { id: number; message: string }) => {
    setSelectedMessage(petal.message);
    setClickedPetals(prev => new Set([...prev, petal.id]));
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      setSelectedMessage('');
    }, 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col justify-center items-center my-8 relative"
    >
      {/* Rose Container */}
      <div className="relative w-[120px] h-[200px]">
        {/* Stem */}
        <div 
          className="absolute bottom-0 left-1/2 w-[6px] h-[120px] rounded-[3px] -translate-x-1/2"
          style={{
            background: 'linear-gradient(to bottom, #2ecc71, #145a32)'
          }}
        />

        {/* Petals */}
        {petals.map((petal, index) => (
          <motion.div
            key={petal.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: clickedPetals.has(petal.id) ? 0 : 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.2,
              duration: clickedPetals.has(petal.id) ? 1 : 0.6
            }}
            onClick={() => handlePetalClick(petal)}
            className={`
              absolute w-[60px] h-[60px] rounded-[50%] cursor-pointer
              transition-all duration-300
              ${petal.position}
              ${clickedPetals.has(petal.id) ? 'animate-fall' : 'hover:scale-110'}
            `}
            style={{
              background: 'radial-gradient(circle, #ff4d6d, #c9184a)',
              boxShadow: clickedPetals.has(petal.id) 
                ? '0 0 15px rgba(255, 77, 109, 0.6)' 
                : '0 0 15px rgba(255, 77, 109, 0.6), 0 0 25px rgba(255, 77, 109, 0.3)'
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 25px rgba(255, 77, 109, 1)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Petal hint on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs text-white font-bold pointer-events-none">
              ✨
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8 bg-black/60 text-white px-6 py-4 rounded-[20px] text-center max-w-xs"
          >
            <p className="text-lg font-medium">{selectedMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      <p className="mt-4 text-sm opacity-70 text-center">
        ✨ Click petals to reveal love messages
      </p>
    </motion.div>
  );
};

export default AnimatedRose;
