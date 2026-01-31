import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function WavePlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positionAttribute = geometry.attributes.position;

      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const waveX = Math.sin(x * 0.5 + state.clock.elapsedTime) * 0.3;
        const waveY = Math.sin(y * 0.5 + state.clock.elapsedTime * 0.5) * 0.3;
        positionAttribute.setZ(i, waveX + waveY);
      }

      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, -2, -5]}>
      <planeGeometry args={[20, 20, 50, 50]} />
      <meshStandardMaterial
        color="#ec4899"
        wireframe
        transparent
        opacity={0.2}
      />
    </mesh>
  );
}

const WaveBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <WavePlane />
      </Canvas>
    </div>
  );
};

export default WaveBackground;
