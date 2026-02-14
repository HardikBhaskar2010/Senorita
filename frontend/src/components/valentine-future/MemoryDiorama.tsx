import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import * as Models from './FutureModels';

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
        <cylinderGeometry args={[3.5, 3.5, 0.4, 64]} />
        <meshStandardMaterial 
          color="#0f172a" 
          metalness={0.9} 
          roughness={0.1} 
          emissive="#1e293b"
          emissiveIntensity={0.2}
        />
      </mesh>
    );

    // Grid helper for tech feel
    if (scene === 'tech_haven') {
      elements.push(
        <gridHelper key="grid" args={[10, 20, "#00d9ff", "#002233"]} position={[0, -0.79, 0]} />
      );
    }

    // Map configuration to specific 3D models
    switch (scene) {
      case 'cozy_corner':
        elements.push(<Models.CozyCornerModel key="model-cozy" />);
        break;
      case 'tech_haven':
        elements.push(<Models.TechHavenModel key="model-tech" />);
        break;
      case 'romantic_garden':
        elements.push(<Models.RomanticGardenModel key="model-garden" />);
        break;
      case 'starry_night':
        elements.push(<Models.StarryNightModel key="model-stars" />);
        break;
      case 'travel_dreams':
        elements.push(<Models.TravelDreamsModel key="model-travel" />);
        break;
      case 'artistic_soul':
        elements.push(<Models.ArtisticSoulModel key="model-art" />);
        break;
      default:
        // Default decorations if nothing else is there
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 2.5 + Math.random();
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.random() * 3 - 0.5;
          
          elements.push(
            <Float key={`default-sparkle-${i}`} speed={2} floatIntensity={1}>
              <mesh position={[x, y, z]}>
                <octahedronGeometry args={[0.12, 0]} />
                <meshStandardMaterial 
                  color={i % 2 === 0 ? "#00d9ff" : "#ff0088"} 
                  emissive={i % 2 === 0 ? "#00d9ff" : "#ff0088"} 
                  emissiveIntensity={1.5}
                />
              </mesh>
            </Float>
          );
        }
    }

    return elements;
  }, [scene, objects]);

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
    <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border border-white/5">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={50} />
        <ambientLight intensity={0.4} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <SceneObjects config={config} />
        <OrbitControls 
          enableZoom={true}
          minDistance={4}
          maxDistance={12}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#020617', 5, 20]} />
      </Canvas>
    </div>
  );
}