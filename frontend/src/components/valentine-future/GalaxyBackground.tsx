import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Rotating galaxy component
function RotatingGalaxy() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation for galaxy effect
      groupRef.current.rotation.z += 0.0002;
      groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Multiple star layers for depth */}
      <Stars radius={120} depth={40} count={8000} factor={4} saturation={0} fade />
      <Stars radius={80} depth={30} count={5000} factor={3} saturation={0} fade />
      <Stars radius={50} depth={20} count={3000} factor={2} saturation={0} fade />
      
      {/* Ambient galaxy particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2000}
            array={new Float32Array(
              Array.from({ length: 2000 * 3 }, () => (
                (Math.random() - 0.5) * 200
              ))
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color="#00d9ff"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function GalaxyBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ background: 'radial-gradient(circle at 50% 50%, #0a0e27 0%, #000 100%)' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#00d9ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff0088" />
        
        <RotatingGalaxy />
        
        {/* Disable controls but keep for potential future use */}
        <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
      </Canvas>
    </div>
  );
}