import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, Heart, Sparkles as SparklesIcon } from 'lucide-react';
import * as THREE from 'three';
import TeddyARCamera from './TeddyARCamera';

function TeddyModel() {
  const { scene } = useGLTF('/models/bears.glb');
  const modelRef = useRef<THREE.Group>(null);
  
  // Simple rotation - spinning in place only
  useFrame((state) => {
    if (modelRef.current) {
      // Rotate around Y-axis (spinning in place)
      modelRef.current.rotation.y += 0.015;
      
      // Gentle floating up and down (keeping position relative to base)
      const floatOffset = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      modelRef.current.position.set(0, -1 + floatOffset, 0);
      
      // Keep scale constant to avoid affecting accessories like bows
      modelRef.current.scale.set(2, 2, 2);
    }
  });
  
  return <primitive ref={modelRef} object={scene} scale={2} position={[0, -1, 0]} />;
}

const TeddyBears3D = () => {
  const [showARPopup, setShowARPopup] = useState(false);
  const [showARCamera, setShowARCamera] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const handleCanvasClick = () => {
    setInteractionCount(prev => prev + 1);
    setShowARPopup(true);
  };

  const startARExperience = () => {
    setShowARPopup(false);
    setShowARCamera(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 3D Canvas with enhanced visuals */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[450px] bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-amber-500/10 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl cursor-pointer group"
        onClick={handleCanvasClick}
      >
        {/* AR Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute top-4 right-4 z-10 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>AR Ready!</span>
        </motion.div>

        {/* Click to activate hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Click for AR Photos! 📸
            </p>
          </div>
        </motion.div>

        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          {/* Enhanced lighting with warm glow */}
          <ambientLight intensity={0.6} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.2} 
            penumbra={1} 
            intensity={1.5}
            color="#ffb6c1"
          />
          <spotLight 
            position={[-10, 10, 10]} 
            angle={0.2} 
            penumbra={1} 
            intensity={1.2}
            color="#ffd700"
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <pointLight position={[0, 5, 5]} intensity={0.8} color="#ff69b4" />
          
          <Suspense fallback={null}>
            <TeddyModel />
            <Environment preset="sunset" />
            
            {/* Floating sparkles around teddies */}
            <Sparkles
              count={50}
              scale={5}
              size={3}
              speed={0.4}
              opacity={0.6}
              color="#ff69b4"
            />
            <Sparkles
              count={30}
              scale={4}
              size={2}
              speed={0.3}
              opacity={0.4}
              color="#ffd700"
            />
          </Suspense>
          
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={8}
            autoRotate={false}
          />
        </Canvas>

        {/* Floating hearts decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ 
                y: '-20%', 
                x: `${Math.random() * 100}%`,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 1.5,
                ease: 'linear'
              }}
              className="absolute text-3xl"
            >
              {['💕', '💖', '💗', '✨'][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AR Popup Modal */}
      <AnimatePresence>
        {showARPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowARPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-white/30 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                className="text-8xl mb-6"
              >
                📸
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-4">
                Wanna Get Some Pics?
              </h2>
              
              <p className="text-white/90 text-lg mb-8">
                Try AR mode and place this adorable teddy on your shoulder or anywhere! 
                Create magical moments! ✨
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={startARExperience}
                  size="lg"
                  className="w-full bg-white text-pink-600 hover:bg-white/90 text-xl py-6 rounded-2xl font-bold shadow-xl"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Yess! 🎉
                </Button>
                
                <Button
                  onClick={startARExperience}
                  size="lg"
                  variant="outline"
                  className="w-full bg-white/20 text-white hover:bg-white/30 border-2 border-white/40 text-xl py-6 rounded-2xl font-bold"
                >
                  <Heart className="w-6 h-6 mr-2" />
                  Why Not! 💕
                </Button>

                <Button
                  onClick={() => setShowARPopup(false)}
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:bg-white/10 mt-2"
                >
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Camera View */}
      <AnimatePresence>
        {showARCamera && (
          <TeddyARCamera onClose={() => setShowARCamera(false)} />
        )}
      </AnimatePresence>

      {/* Enhanced Message Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 text-center max-w-lg shadow-xl"
      >
        <div className="text-6xl mb-4">💕</div>
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-200 via-rose-200 to-amber-200 bg-clip-text text-transparent">
          We are Always Together
        </h3>
        <p className="text-lg opacity-90 italic mb-6">
          "Just like these two teddy bears, you and I are inseparable. 
          Forever side by side, forever in each other's hearts."
        </p>
        <div className="flex justify-center gap-4 mt-6 text-2xl items-center">
          <div>🍪 Cookie</div>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💕
          </motion.div>
          <div>💃 Senorita</div>
        </div>

        {/* Interaction counter */}
        {interactionCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-pink-500/20 rounded-full px-4 py-2 inline-flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              You've clicked {interactionCount} time{interactionCount > 1 ? 's' : ''}! 🎉
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20"
      >
        <p className="text-sm opacity-90 text-center mb-2 font-medium">
          ✨ Interactive Controls ✨
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs opacity-80">
          <span>🔄 Drag to rotate</span>
          <span>•</span>
          <span>🔍 Scroll to zoom</span>
          <span>•</span>
          <span>📸 Click for AR mode</span>
        </div>
      </motion.div>
    </div>
  );
};

// Preload the model
useGLTF.preload('/models/bears.glb');

export default TeddyBears3D;