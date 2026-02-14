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

    // Map configuration scene names to 3D models
    // Based on database scene configurations
    switch (scene) {
      // Memory 1: First Meet (cafe) → CozyCorner
      case 'cafe':
        elements.push(<Models.CozyCornerModel key="model-cafe" />);
        break;
      
      // Memory 2: First Trip (train) → TravelDreams
      case 'train':
        elements.push(<Models.TravelDreamsModel key="model-train" />);
        break;
      
      // Memory 3: Late Night Code (desk) → TechHaven
      case 'desk':
        elements.push(<Models.TechHavenModel key="model-desk" />);
        break;
      
      // Memory 4: Stargazing (night_field) → StarryNight
      case 'night_field':
        elements.push(<Models.StarryNightModel key="model-night" />);
        break;
      
      // Memory 5: Kitchen Dance (kitchen) → CozyCorner
      case 'kitchen':
        elements.push(<Models.CozyCornerModel key="model-kitchen" />);
        break;
      
      // Memory 6: Movie Marathon (living_room) → CozyCorner
      case 'living_room':
        elements.push(<Models.CozyCornerModel key="model-living" />);
        break;
      
      // Memory 7: Sunrise (hilltop) → RomanticGarden
      case 'hilltop':
        elements.push(<Models.RomanticGardenModel key="model-hilltop" />);
        break;
      
      // Memory 8: Bookmark (reading_nook) → ArtisticSoul
      case 'reading_nook':
        elements.push(<Models.ArtisticSoulModel key="model-reading" />);
        break;
      
      // Memory 9: Future Plans (night_balcony) → ArtisticSoul
      case 'night_balcony':
        elements.push(<Models.ArtisticSoulModel key="model-balcony" />);
        break;
      
      // Memory 10: This Moment (infinity_space) → StarryNight
      case 'infinity_space':
        elements.push(<Models.StarryNightModel key="model-infinity" />);
        break;

      // Legacy scene types (backward compatibility)
      case 'cozy_corner':
        elements.push(<Models.CozyCornerModel key="model-cozy" />);
        break;
      case 'tech_haven':
        elements.push(<Models.TechHavenModel key="model-tech" />);
        elements.push(
          <gridHelper key="grid" args={[10, 20, "#00d9ff", "#002233"]} position={[0, -0.79, 0]} />
        );
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
        // Default decorations - floating sparkles
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
  }, [scene]);

  // Lighting based on config
  const lights = useMemo(() => {
    const lightElements: JSX.Element[] = [];

    switch (lighting) {
      case 'warm':
      case 'warm_evening':
        lightElements.push(
          <pointLight key="warm" position={[2, 3, 2]} intensity={1.2} color="#ffa500" />
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
      case 'sunset':
        lightElements.push(
          <pointLight key="sunset" position={[3, 2, 1]} intensity={1.2} color="#ff6b35" />
        );
        break;
      case 'golden_hour':
        lightElements.push(
          <pointLight key="golden" position={[3, 4, 2]} intensity={1.3} color="#ffd700" />
        );
        break;
      case 'tv_glow':
        lightElements.push(
          <pointLight key="tv" position={[0, 1, 2]} intensity={1} color="#4169e1" />
        );
        break;
      case 'afternoon_sun':
        lightElements.push(
          <pointLight key="afternoon" position={[2, 4, 2]} intensity={1.1} color="#ffeb3b" />
        );
        break;
      case 'city_lights':
        lightElements.push(
          <pointLight key="city1" position={[2, 2, 2]} intensity={0.8} color="#00bcd4" />,
          <pointLight key="city2" position={[-2, 2, -2]} intensity={0.8} color="#ff9800" />
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
    <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
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
