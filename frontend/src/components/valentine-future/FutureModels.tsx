import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Text, MeshWobbleMaterial, MeshDistortMaterial } from '@react-three/drei';

// 1. Cozy Corner (Coffee, Books, Warmth)
export function CozyCornerModel() {
  const groupRef = useRef<THREE.Group>(null);
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Coffee Cup */}
        <mesh position={[-0.8, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
          <meshStandardMaterial color="#fefefe" />
        </mesh>
        <mesh position={[-0.8, 0.6, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 16]} />
          <meshStandardMaterial color="#4b3621" />
        </mesh>
        {/* Steam */}
        {[0, 1, 2].map((i) => (
          <Float key={i} speed={3} floatIntensity={1} position={[-0.8, 0.8 + i * 0.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
          </Float>
        ))}
      </Float>

      {/* Stack of Books */}
      <group position={[0.5, 0.1, 0.2]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1, 0.2, 0.8]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
        <mesh position={[0, 0.22, 0.05]} rotation={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[1, 0.2, 0.8]} />
          <meshStandardMaterial color="#718096" />
        </mesh>
        <mesh position={[0.1, 0.44, -0.05]} rotation={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[1, 0.2, 0.8]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </group>
    </group>
  );
}

// 2. Tech Haven (Laptops, Monitors, Code)
export function TechHavenModel() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[2, 0.1, 1.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Laptop Screen */}
      <group position={[0, 0.1, -0.5]} rotation={[-0.2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.2, 0.05]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.7, 1.1]} />
          <meshBasicMaterial color="#00d9ff">
            <Text position={[0, 0, 0.01]} fontSize={0.1} color="white">
              {"const love = 'forever';"}
            </Text>
          </meshBasicMaterial>
        </mesh>
      </group>
      {/* Floating Binary */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Float key={i} speed={4} position={[(Math.random() - 0.5) * 3, 1 + Math.random(), (Math.random() - 0.5) * 2]}>
          <Text fontSize={0.2} color="#00ff00">
            {Math.random() > 0.5 ? '1' : '0'}
          </Text>
        </Float>
      ))}
    </group>
  );
}

// 3. Romantic Garden (Flowers, Hearts, Nature)
export function RomanticGardenModel() {
  return (
    <group position={[0, 0, 0]}>
      {/* Heart Flower */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[Math.cos(i) * 1.5, 0, Math.sin(i) * 1.5]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
            <meshStandardMaterial color="green" />
          </mesh>
          <Float speed={5} floatIntensity={2}>
            <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.3, 0.1]} />
              <meshStandardMaterial color="#ff0088" />
            </mesh>
            <mesh position={[0, 1, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.3, 0.1]} />
              <meshStandardMaterial color="#ff0088" />
            </mesh>
          </Float>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial color="#1a472a" />
      </mesh>
    </group>
  );
}

// 4. Starry Night (Telescope, Moon, Stars)
export function StarryNightModel() {
  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} floatIntensity={0.5}>
        <mesh position={[2, 2, -2]} castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#f6f1d5" emissive="#f6f1d5" emissiveIntensity={0.2} />
        </mesh>
      </Float>
      {/* Telescope */}
      <group position={[-0.5, 0, 0.5]} rotation={[0, -Math.PI / 4, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1.5, 16]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.7, 0]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
        <mesh position={[0, -0.7, 0]} rotation={[-0.5, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
      </group>
      {/* Floating Stars */}
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={Math.random() * 2 + 1} position={[(Math.random() - 0.5) * 6, Math.random() * 4, (Math.random() - 0.5) * 6]}>
          <mesh>
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// 5. Travel Dreams (Airplane, Map, Globe)
export function TravelDreamsModel() {
  return (
    <group position={[0, 0, 0]}>
      <Float speed={3} floatIntensity={1} rotationIntensity={1}>
        <group position={[0, 1.5, 0]}>
          {/* Paper Plane */}
          <mesh rotation={[0, 0, 0]} castShadow>
            <coneGeometry args={[0.2, 0.6, 3]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <planeGeometry args={[0.4, 0.6]} />
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.4, 0.6]} />
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Float>
      {/* Globe Base */}
      <group position={[0, 0.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#4299e1" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
          <meshStandardMaterial color="#a0aec0" metalness={1} />
        </mesh>
      </group>
    </group>
  );
}

// 6. Artistic Soul (Easel, Paint, Canvas)
export function ArtisticSoulModel() {
  return (
    <group position={[0, 0, 0]}>
      {/* Easel */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1.5, 1.8, 0.05]} />
          <meshStandardMaterial color="#fefefe" />
        </mesh>
        {/* Paint splashes */}
        {[ '#ff0088', '#00d9ff', '#ffcc00' ].map((color, i) => (
          <mesh key={i} position={[ (i - 1) * 0.3, 1 + (Math.random() - 0.5) * 0.5, 0.03 ]}>
            <sphereGeometry args={[0.1, 16, 16]} scale={[1, 1, 0.1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
        {/* Legs */}
        <mesh position={[-0.5, 0, -0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[0.5, 0, -0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[0, 0, 0.5]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
      </group>
    </group>
  );
}
