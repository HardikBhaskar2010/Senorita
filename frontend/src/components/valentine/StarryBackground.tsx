import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Twinkling stars background
function TwinklingStars() {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random star positions
  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    
    for (let i = 0; i < 2000; i++) {
      const i3 = i * 3;
      // Spread across a large sphere
      const radius = 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  // Animate - slow rotation and twinkling
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

// Moon in the background
function Moon() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 15;
      ref.current.position.y = 10 + Math.cos(state.clock.getElapsedTime() * 0.15) * 3;
    }
  });

  return (
    <mesh ref={ref} position={[15, 10, -30]}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial 
        color="#f0f0f0" 
        emissive="#e8e8e8"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Main component
export default function StarryBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0a0e27']} />
        
        {/* Ambient light */}
        <ambientLight intensity={0.3} />
        
        {/* Point light from moon */}
        <pointLight position={[15, 10, -20]} intensity={0.5} color="#f0f0f0" />
        
        {/* Stars */}
        <TwinklingStars />
        
        {/* Moon */}
        <Moon />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0e27', 30, 60]} />
      </Canvas>
      
      {/* Gradient overlay for better foreground visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-950/20 pointer-events-none" />
    </div>
  );
}
