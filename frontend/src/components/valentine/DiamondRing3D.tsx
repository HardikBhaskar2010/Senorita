import { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, SpotLight } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function RingModel() {
  const ringRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load the GLB model
  const gltf = useLoader(GLTFLoader, '/diamond_ring.glb');
  
  // Auto-rotate the ring
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.01;
      
      // Add subtle floating animation
      ringRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      
      // Scale up on hover
      const targetScale = hovered ? 1.15 : 1;
      ringRef.current.scale.x = THREE.MathUtils.lerp(ringRef.current.scale.x, targetScale, 0.1);
      ringRef.current.scale.y = THREE.MathUtils.lerp(ringRef.current.scale.y, targetScale, 0.1);
      ringRef.current.scale.z = THREE.MathUtils.lerp(ringRef.current.scale.z, targetScale, 0.1);
    }
  });

  return (
    <group
      ref={ringRef}
      position={[0, -0.5, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={gltf.scene} scale={1.8} />
    </group>
  );
}

function Sparkles() {
  const count = 100;
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i + 1] = (Math.random() - 0.5) * 10;
    positions[i + 2] = (Math.random() - 0.5) * 10;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function DiamondRing3D({ transparent = false }: { transparent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className={`w-full h-full rounded-2xl overflow-hidden ${
        transparent 
          ? 'bg-transparent' 
          : 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20 backdrop-blur-sm border border-white/10'
      }`}
    >
      <Canvas style={{ background: 'transparent', width: '100%', height: '100%' }}>
        <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <SpotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          castShadow
        />
        <SpotLight
          position={[-10, -10, -10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          color="#ff69b4"
        />
        <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
        
        {/* Environment for reflections */}
        <Environment preset="sunset" />
        
        {/* The Ring */}
        <RingModel />
        
        {/* Sparkles */}
        <Sparkles />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={10}
          autoRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {!transparent && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-white/80 text-sm"
          >
            ✨ Drag to rotate • Scroll to zoom ✨
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
