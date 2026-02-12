import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced twinkling stars with variety
function TwinklingStars() {
  const ref = useRef<THREE.Points>(null);
  const ref2 = useRef<THREE.Points>(null);
  const ref3 = useRef<THREE.Points>(null);
  
  // Generate star positions with clusters
  const { mainStars, brightStars, distantStars } = useMemo(() => {
    const mainPositions = new Float32Array(3000 * 3);
    const brightPositions = new Float32Array(500 * 3);
    const distantPositions = new Float32Array(1000 * 3);
    
    // Main star field
    for (let i = 0; i < 3000; i++) {
      const i3 = i * 3;
      const radius = 40 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      mainPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      mainPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      mainPositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    // Bright stars
    for (let i = 0; i < 500; i++) {
      const i3 = i * 3;
      const radius = 35 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      brightPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      brightPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    // Distant stars (background)
    for (let i = 0; i < 1000; i++) {
      const i3 = i * 3;
      const radius = 60 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      distantPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      distantPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      distantPositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return { 
      mainStars: mainPositions, 
      brightStars: brightPositions,
      distantStars: distantPositions 
    };
  }, []);

  // Animate with twinkling
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (ref.current) {
      ref.current.rotation.y = time * 0.015;
      ref.current.rotation.x = Math.sin(time * 0.01) * 0.1;
    }
    
    if (ref2.current) {
      ref2.current.rotation.y = time * 0.02;
      ref2.current.rotation.z = Math.sin(time * 0.015) * 0.05;
      // Twinkling effect via opacity
      const material = ref2.current.material as THREE.PointsMaterial;
      material.opacity = 0.7 + Math.sin(time * 2) * 0.3;
    }
    
    if (ref3.current) {
      ref3.current.rotation.y = time * 0.008;
    }
  });

  return (
    <>
      {/* Distant background stars */}
      <Points ref={ref3} positions={distantStars} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#b8c5d6"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
      
      {/* Main star field */}
      <Points ref={ref} positions={mainStars} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
      
      {/* Bright prominent stars */}
      <Points ref={ref2} positions={brightStars} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#fffacd"
          size={0.25}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.9}
        />
      </Points>
    </>
  );
}

// Saturn-like planet with rings
function SaturnPlanet() {
  const planetRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      planetRef.current.position.y = 8 + Math.sin(state.clock.getElapsedTime() * 0.2) * 1;
    }
  });

  return (
    <group ref={planetRef} position={[-25, 8, -40]}>
      {/* Planet body */}
      <Sphere args={[2.5, 32, 32]}>
        <meshStandardMaterial 
          color="#e6c79c" 
          emissive="#d4a574"
          emissiveIntensity={0.3}
          roughness={0.7}
        />
      </Sphere>
      
      {/* Ring */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[3.2, 4.5, 64]} />
        <meshStandardMaterial 
          color="#c9b18f"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          emissive="#b8a080"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Atmospheric glow */}
      <Sphere args={[2.8, 32, 32]}>
        <meshBasicMaterial 
          color="#f4d4a8"
          transparent
          opacity={0.15}
        />
      </Sphere>
    </group>
  );
}

// Gas giant planet (Jupiter-like)
function GasGiantPlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
      planetRef.current.position.x = 20 + Math.cos(state.clock.getElapsedTime() * 0.15) * 2;
    }
  });

  return (
    <group position={[20, -5, -35]}>
      <Sphere ref={planetRef} args={[3, 32, 32]}>
        <meshStandardMaterial 
          color="#d4916e" 
          emissive="#c47d5a"
          emissiveIntensity={0.4}
          roughness={0.6}
        />
      </Sphere>
      
      {/* Glow */}
      <Sphere args={[3.3, 32, 32]}>
        <meshBasicMaterial 
          color="#f5a77b"
          transparent
          opacity={0.12}
        />
      </Sphere>
    </group>
  );
}

// Red/Mars-like planet
function RedPlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.getElapsedTime() * 0.06;
      planetRef.current.position.y = -8 + Math.sin(state.clock.getElapsedTime() * 0.18) * 1.5;
    }
  });

  return (
    <group position={[-15, -8, -30]}>
      <Sphere ref={planetRef} args={[1.8, 32, 32]}>
        <meshStandardMaterial 
          color="#cd5c5c" 
          emissive="#b04545"
          emissiveIntensity={0.35}
          roughness={0.8}
        />
      </Sphere>
      
      {/* Glow */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial 
          color="#ff6b6b"
          transparent
          opacity={0.1}
        />
      </Sphere>
    </group>
  );
}

// Cosmic dust particles
function CosmicDust() {
  const dustRef = useRef<THREE.Points>(null);
  
  const dustParticles = useMemo(() => {
    const positions = new Float32Array(800 * 3);
    
    for (let i = 0; i < 800; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
    }
    
    return positions;
  }, []);
  
  useFrame((state) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = state.clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <Points ref={dustRef} positions={dustParticles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b7fb5"
        size={0.3}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Main component with dark space theme
export default function StarryBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Deep space black background */}
        <color attach="background" args={['#000000']} />
        
        {/* Ambient light - very dim for space */}
        <ambientLight intensity={0.15} />
        
        {/* Directional light for planets */}
        <directionalLight position={[10, 10, 5]} intensity={0.4} color="#ffffff" />
        
        {/* Point lights for atmospheric effect */}
        <pointLight position={[-20, 10, -30]} intensity={0.3} color="#9b59b6" />
        <pointLight position={[20, -10, -30]} intensity={0.3} color="#3498db" />
        
        {/* Star fields */}
        <TwinklingStars />
        
        {/* Planets */}
        <SaturnPlanet />
        <GasGiantPlanet />
        <RedPlanet />
        
        {/* Cosmic dust */}
        <CosmicDust />
        
        {/* Deep space fog */}
        <fog attach="fog" args={['#0d0221', 40, 80]} />
      </Canvas>
      
      {/* Nebula gradient overlays for cosmic atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Purple nebula top-left */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-purple-900/20 via-purple-900/5 to-transparent blur-3xl" />
        
        {/* Blue nebula top-right */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-blue-900/15 via-blue-900/5 to-transparent blur-3xl" />
        
        {/* Magenta nebula bottom */}
        <div className="absolute bottom-0 left-1/4 w-1/2 h-1/3 bg-gradient-radial from-pink-900/15 via-pink-900/5 to-transparent blur-3xl" />
        
        {/* Dark vignette for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
      </div>
    </div>
  );
}
