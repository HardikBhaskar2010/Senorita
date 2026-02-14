import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface MemoryDioramaProps {
  config?: any;
}

// Animated objects based on scene config
function SceneObjects({ config }: { config: any }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Parse scene type from config
  const scene = config?.scene || 'default';
  const lighting = config?.lighting || 'neutral';
  const objects = config?.objects || [];

  // Generate scene-specific objects
  const sceneElements = useMemo(() => {
    const elements: JSX.Element[] = [];

    // Base platform
    elements.push(
      <mesh key="platform" position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 32]} />
        <meshStandardMaterial color="#1a1f3a" metalness={0.6} roughness={0.4} />
      </mesh>
    );

    // Scene-specific objects
    if (objects.includes('coffee_cup')) {
      elements.push(
        <mesh key="coffee" position={[-1, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.25, 0.6, 16]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      );
    }

    if (objects.includes('laptop')) {
      elements.push(
        <group key="laptop" position={[0, 0.2, 0]}>
          <mesh position={[0, 0, 0.1]} castShadow>
            <boxGeometry args={[1.2, 0.02, 0.8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0.4, -0.3]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.9, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      );
    }

    if (objects.includes('heart_constellation')) {
      // Floating heart particles
      for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * 4;
        const y = Math.random() * 2;
        const z = (Math.random() - 0.5) * 4;
        elements.push(
          <mesh key={`heart-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ff0088" emissive="#ff0088" emissiveIntensity={0.5} />
          </mesh>
        );
      }
    }

    if (objects.includes('book')) {
      elements.push(
        <mesh key="book" position={[0.5, 0, 0.5]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.8]} />
          <meshStandardMaterial color="#8b0000" />
        </mesh>
      );
    }

    return elements;
  }, [objects]);

  // Lighting based on config
  const lights = useMemo(() => {
    const lightElements: JSX.Element[] = [];

    switch (lighting) {
      case 'warm':
        lightElements.push(
          <pointLight key="warm" position={[2, 3, 2]} intensity={1} color="#ffa500" />
        );
        break;
      case 'blue_monitor':
        lightElements.push(
          <pointLight key="blue" position={[0, 1, 2]} intensity={1.5} color="#00d9ff" />
        );
        break;
      case 'starlight':
        lightElements.push(
          <pointLight key="star" position={[0, 5, 0]} intensity={0.8} color="#ffffff" />
        );
        break;
      case 'ethereal':
        lightElements.push(
          <pointLight key="ethereal1" position={[2, 2, 2]} intensity={1} color="#ff0088" />,
          <pointLight key="ethereal2" position={[-2, 2, -2]} intensity={1} color="#00d9ff" />
        );
        break;
      default:
        lightElements.push(
          <pointLight key="default" position={[2, 3, 2]} intensity={1} color="#ffffff" />
        );
    }

    return lightElements;
  }, [lighting]);

  return (
    <group ref={groupRef}>
      {lights}
      {sceneElements}
    </group>
  );
}

export default function MemoryDiorama({ config }: MemoryDioramaProps) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <ambientLight intensity={0.3} />
        <SceneObjects config={config} />
        <OrbitControls 
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          enablePan={false}
        />
        
        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#0a0e27', 5, 15]} />
      </Canvas>
    </div>
  );
}