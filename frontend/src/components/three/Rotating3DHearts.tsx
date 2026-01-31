import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

function HeartShape({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.2} />
    </mesh>
  );
}

const Rotating3DHearts = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <HeartShape position={[-2, 0, 0]} />
        <HeartShape position={[2, 1, -1]} />
        <HeartShape position={[0, -1, 1]} />
      </Canvas>
    </div>
  );
};

export default Rotating3DHearts;
