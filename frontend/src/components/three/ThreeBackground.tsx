import { Suspense } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FloatingParticles3D from './FloatingParticles';
import Rotating3DHearts from './Rotating3DHearts';
import WaveBackground from './WaveBackground';

interface ThreeBackgroundProps {
  variant?: 'particles' | 'hearts' | 'waves';
  customBackground?: string;
}

const ThreeBackground = ({ variant = 'particles', customBackground }: ThreeBackgroundProps) => {
  const { enable3DEffects } = useTheme();

  // Don't render if 3D effects are disabled or if there's a custom background
  if (!enable3DEffects || customBackground) {
    return null;
  }

  // Render based on variant
  const renderBackground = () => {
    switch (variant) {
      case 'hearts':
        return <Rotating3DHearts />;
      case 'waves':
        return <WaveBackground />;
      case 'particles':
      default:
        return <FloatingParticles3D />;
    }
  };

  return (
    <Suspense fallback={null}>
      {renderBackground()}
    </Suspense>
  );
};

export default ThreeBackground;
