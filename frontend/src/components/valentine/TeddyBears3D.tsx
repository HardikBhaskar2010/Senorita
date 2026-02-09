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
  
  // Enhanced rotation with floating animation
  useFrame((state) => {
    if (modelRef.current) {
      // Rotate around Y-axis (spinning in place)
      modelRef.current.rotation.y += 0.015;
      
      // Gentle floating up and down
      modelRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      
      // Slight breathing effect (scale pulsing)
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      modelRef.current.scale.set(breathe * 2, breathe * 2, breathe * 2);
    }
  });
  
  return <primitive ref={modelRef} object={scene} scale={2} position={[0, -1, 0]} />;
}

const TeddyBears3D = () => {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 3D Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full h-[400px] bg-white/5 rounded-2xl overflow-hidden border border-white/20"
      >
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Suspense fallback={null}>
            <TeddyModel />
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={8}
          />
        </Canvas>
      </motion.div>

      {/* Message Below */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center max-w-md"
      >
        <div className="text-6xl mb-4">💕</div>
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">
          We are Always Together
        </h3>
        <p className="text-lg opacity-90 italic">
          "Just like these two teddy bears, you and I are inseparable. 
          Forever side by side, forever in each other's hearts."
        </p>
        <div className="flex justify-center gap-4 mt-6 text-2xl">
          <div>🍪 Cookie</div>
          <div>💕</div>
          <div>💃 Senorita</div>
        </div>
      </motion.div>

      {/* Instructions */}
      <p className="text-sm opacity-70 text-center">
        🔄 Drag to rotate • 🔍 Scroll to zoom
      </p>
    </div>
  );
};

// Preload the model
useGLTF.preload('/models/bears.glb');

export default TeddyBears3D;