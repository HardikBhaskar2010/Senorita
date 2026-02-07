import { useState } from 'react';
import RingPreSlide from './RingPreSlide';
import ProposalMainSlides from './ProposalMainSlides';

interface ProposalSlideshowProps {
  dayNumber: number;
}

const ProposalSlideshow = ({ dayNumber }: ProposalSlideshowProps) => {
  const [showRingSlide, setShowRingSlide] = useState(true);

  const handleContinueFromRing = () => {
    setShowRingSlide(false);
  };

  if (showRingSlide) {
    return <RingPreSlide onContinue={handleContinueFromRing} />;
  }

  return <ProposalMainSlides dayNumber={dayNumber} />;
};

export default ProposalSlideshow;
