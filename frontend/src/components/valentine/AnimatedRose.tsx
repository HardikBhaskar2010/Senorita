import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const petalsData = [
  { id: 1, message: "You make my world brighter 💖", style: { top: 40, left: 40 }, rotation: 0, size: 1.0, color: "#ff4d6d" },
  { id: 2, message: "Every day with you is magic ✨", style: { top: 15, left: 15 }, rotation: -30, size: 1.1, color: "#ff758f" },
  { id: 3, message: "You are my favorite person 🌸", style: { top: 15, right: 15 }, rotation: 30, size: 1.1, color: "#ff85a1" },
  { id: 4, message: "Forever starts with you 💍", style: { top: 40, right: 40 }, rotation: 0, size: 1.0, color: "#ff4d6d" },
  { id: 5, message: "Your smile lights up my life 😊", style: { top: 60, left: 30 }, rotation: -20, size: 0.9, color: "#ffb3c1" },
  { id: 6, message: "You're my everything ❤️", style: { top: 60, right: 30 }, rotation: 20, size: 0.9, color: "#ff758f" },
  { id: 7, message: "You complete me 🧩", style: { top: 25, left: 60 }, rotation: -15, size: 1.0, color: "#ff85a1" },
  { id: 8, message: "My heart beats for you 💓", style: { top: 25, right: 60 }, rotation: 15, size: 1.0, color: "#ff4d6d" },
  { id: 9, message: "Endless love for you ∞", style: { top: 50, left: 50 }, rotation: 0, size: 0.8, color: "#ffb3c1" },
  { id: 10, message: "You're my sunshine ☀️", style: { top: 10, left: 40 }, rotation: -10, size: 1.2, color: "#ff758f" },
];

const AnimatedRose: React.FC = () => {
  const [clickedPetals, setClickedPetals] = useState<Set<number>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState("");
  const allPetalsGone = useMemo(
    () => clickedPetals.size === petalsData.length,
    [clickedPetals]
  );

  const handlePetalClick = (petal: any) => {
    if (clickedPetals.has(petal.id)) {
      setSelectedMessage(petal.message);
      return;
    }
    setSelectedMessage(petal.message);
    setClickedPetals(prev => new Set([...prev, petal.id]));
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[600px] p-10 text-white bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
      {/* Sparkle background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      {/* Title - Ensure no duplicates */}
      <h1 className="text-6xl font-extrabold mb-1 tracking-wider" style={{ fontFamily: 'cursive' }}>Rose Day</h1>
      <p className="opacity-90 mb-8 text-xl font-light">Beauty & Admiration</p>
      
      {/* Main animation area */}
      <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center perspective-1500">
        
        {/* Love You text (slides from right, positioned to the right of the 'I') */}
        <AnimatePresence>
          {allPetalsGone && (
            <motion.div
              initial={{ x: 300, opacity: 0, rotateY: 90 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-[150px] text-7xl font-bold text-pink-200 drop-shadow-2xl" // Positioned right of stem
            >
              Love You
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Rose container (moves left to become the 'I') */}
        <motion.div
          animate={{ x: allPetalsGone ? -150 : 0, rotate: allPetalsGone ? -3 : 0 }} // Adjusted left position
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="relative w-[220px] h-[340px] transform-style-preserve-3d"
        >
          {/* Stem (the “I” with realistic gradient) */}
          <motion.div
            animate={{ height: allPetalsGone ? 260 : 180 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[14px] bg-gradient-to-t from-green-900 to-green-600 rounded-full shadow-2xl"
          />
          {/* Small heart as dot on 'I' */}
          <AnimatePresence>
            {allPetalsGone && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute top-[20px] left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-pink-400 to-red-500 rounded-full shadow-lg"
                style={{ clipPath: "path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')" }}
              />
            )}
          </AnimatePresence>
          {/* Leaves on stem */}
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex justify-between w-36"
            animate={{ rotate: allPetalsGone ? 0 : 0 }}
          >
            <div className="w-14 h-7 bg-green-800 rounded-full rotate-45 shadow-xl origin-bottom-left"></div>
            <div className="w-14 h-7 bg-green-800 rounded-full -rotate-45 shadow-xl origin-bottom-right"></div>
          </motion.div>
          {/* Thorns for realism */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rotate-45 w-4 h-4 bg-green-900 clip-path-polygon"></div>
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 -rotate-45 w-4 h-4 bg-green-900 clip-path-polygon"></div>
          
          {/* Petals - More realistic shape with custom path, layered for rose effect */}
          {petalsData.map((petal, i) => {
            const isClicked = clickedPetals.has(petal.id);
            const randomRotate = Math.random() * 720 - 360;
            const randomX = Math.random() * 300 - 150;
            const randomY = 400 + Math.random() * 100;
            return (
              <motion.div
                key={petal.id}
                initial={{ scale: 0, rotate: petal.rotation }}
                animate={
                  isClicked
                    ? { y: randomY, x: randomX, rotate: randomRotate, opacity: 0, pointerEvents: "none" }
                    : { scale: petal.size, y: 0, opacity: 1, rotate: petal.rotation, pointerEvents: "auto" }
                }
                transition={{ duration: 1.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => handlePetalClick(petal)}
                className="absolute cursor-pointer origin-bottom z-10"
                style={{
                  ...petal.style,
                  width: `${100 * petal.size}px`,
                  height: `${140 * petal.size}px`,
                  background: `radial-gradient(circle at 30% 40%, ${petal.color || '#ff99ac'}, #b3123e, #800f2f)`,
                  clipPath: "path('M 50 0 C 20 20, 0 60, 0 100 C 0 140, 50 160, 100 140 C 100 100, 80 20, 50 0 Z')", // Realistic petal path
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  filter: "drop-shadow(0 0 10px rgba(255, 77, 109, 0.3))",
                }}
                whileHover={{ scale: 1.15 * petal.size, rotate: petal.rotation + 8 }}
                whileTap={{ scale: 0.85 * petal.size }}
              />
            );
          })}
        </motion.div>
      </div>
      
      {/* Message */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            className="mt-10 bg-black/80 px-10 py-5 rounded-3xl shadow-2xl text-xl font-serif"
          >
            {selectedMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {!allPetalsGone && (
        <p className="mt-8 text-lg opacity-85 italic font-light">
          ✨ Tap the petals to uncover heartfelt messages
        </p>
      )}
    </div>
  );
};

export default AnimatedRose;
