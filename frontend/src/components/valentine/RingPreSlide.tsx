import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DiamondRing3D from './DiamondRing3D';
import ParticleMagic from './ParticleMagic';

interface RingPreSlideProps {
  onContinue: () => void;
}

const RingPreSlide = ({ onContinue }: RingPreSlideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[600px] px-4 py-8 relative"
    >
      <ParticleMagic intensity="low" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-xl relative z-20"
      >
        {/* Ring Container - Smaller and better positioned */}
        <div className="relative h-[350px] sm:h-[400px] w-full mb-8">
          <DiamondRing3D transparent={true} />
        </div>

        {/* Text Content with High Contrast */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">
            From Cookie to Senorita
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4 drop-shadow-md">
            💍 A Promise in 3D 💍
          </p>
          <p className="text-base sm:text-lg text-white/90 italic px-4 drop-shadow-md">
            (Real One Will be In Your Hand after Boards tho)
          </p>
        </motion.div>

        {/* Okay Button - High Contrast */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex justify-center"
        >
          <Button
            onClick={onContinue}
            className="py-4 sm:py-6 px-10 sm:px-16 text-lg sm:text-xl font-bold bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 border-2 border-white rounded-full shadow-2xl transform hover:scale-105 transition-all relative z-30"
          >
            Okay 💕
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RingPreSlide;
