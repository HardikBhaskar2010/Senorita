import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface Promise {
  id: string;
  text: string;
  category: string;
  signature: string;
  createdAt: string;
  position: [number, number, number];
  color: string;
}

interface PromiseTree3DProps {
  promises: Promise[];
  onLeafClick: (promise: Promise) => void;
}

// Tree trunk and branches
const TreeStructure = () => {
  const trunkRef = useRef<THREE.Mesh>(null);
  
  return (
    <group>
      {/* Main Trunk */}
      <mesh ref={trunkRef} position={[0, -2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 4, 16]} />
        <meshStandardMaterial 
          color="#4a3728" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Large Branches */}
      <mesh position={[-1.5, 0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.15, 0.2, 2, 12]} />
        <meshStandardMaterial color="#5a4738" roughness={0.8} />
      </mesh>
      
      <mesh position={[1.5, 0.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.15, 0.2, 2, 12]} />
        <meshStandardMaterial color="#5a4738" roughness={0.8} />
      </mesh>

      <mesh position={[0, 1, -1.5]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 2, 12]} />
        <meshStandardMaterial color="#5a4738" roughness={0.8} />
      </mesh>

      <mesh position={[0, 1, 1.5]} rotation={[-Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 2, 12]} />
        <meshStandardMaterial color="#5a4738" roughness={0.8} />
      </mesh>

      {/* Smaller Branches */}
      <mesh position={[-2, 1.5, 0.5]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
        <meshStandardMaterial color="#6a5748" roughness={0.8} />
      </mesh>

      <mesh position={[2, 1.5, -0.5]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
        <meshStandardMaterial color="#6a5748" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Individual glowing leaf
const PromiseLeaf = ({ 
  promise, 
  onClick 
}: { 
  promise: Promise; 
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = promise.position[1] + Math.sin(time + promise.position[0]) * 0.1;
      
      // Gentle rotation
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.2;
      
      // Scale on hover
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
    setTime(time + delta);
  });

  return (
    <mesh
      ref={meshRef}
      position={promise.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Leaf shape */}
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial 
        color={promise.color}
        emissive={promise.color}
        emissiveIntensity={hovered ? 0.8 : 0.4}
        roughness={0.3}
        metalness={0.5}
      />
      
      {/* Glow effect */}
      <pointLight 
        color={promise.color} 
        intensity={hovered ? 2 : 1} 
        distance={2} 
      />
    </mesh>
  );
};

// Firefly particles
const Fireflies = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 6 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Golden firefly colors
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.3;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        // Floating animation
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        
        // Reset if too high
        if (positions[i * 3 + 1] > 4) {
          positions[i * 3 + 1] = -2;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Main tree scene
const TreeScene = ({ promises, onLeafClick }: PromiseTree3DProps) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={1} color="#ffd700" />
      
      <TreeStructure />
      
      {promises.map((promise) => (
        <PromiseLeaf 
          key={promise.id} 
          promise={promise} 
          onClick={() => onLeafClick(promise)}
        />
      ))}
      
      <Fireflies />
      <Stars radius={50} depth={50} count={1000} factor={3} fade speed={0.5} />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export default function PromiseTree3D({ promises, onLeafClick }: PromiseTree3DProps) {
  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-900 to-purple-900">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <TreeScene promises={promises} onLeafClick={onLeafClick} />
      </Canvas>
    </div>
  );
}
