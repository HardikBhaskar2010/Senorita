import { motion } from 'framer-motion';

const AnimatedRose = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex justify-center items-center my-8"
    >
      <div className="css-rose rose-bloom">
        {/* Rose Petals */}
        <div className="rose-petal"></div>
        <div className="rose-petal"></div>
        <div className="rose-petal"></div>
        <div className="rose-petal"></div>
        <div className="rose-petal"></div>
        <div className="rose-petal"></div>
        
        {/* Rose Center */}
        <div className="rose-center"></div>
        
        {/* Rose Stem */}
        <div className="rose-stem">
          <div className="rose-leaf"></div>
          <div className="rose-leaf"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedRose;
