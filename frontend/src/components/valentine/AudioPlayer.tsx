import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/audio/background-music.mp3');
    audio.loop = true;
    audio.volume = 0.3; // Set to 30% volume
    audio.setAttribute('data-bg-music', 'true'); // Add identifier for pausing
    audioRef.current = audio;

    // Try to autoplay (browsers may block this)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.log('Autoplay prevented:', error);
          // User interaction required
        });
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        // First time clicking - start playing
        audioRef.current.play();
        setIsPlaying(true);
      }
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Button
      onClick={toggleMute}
      variant="ghost"
      size="icon"
      className="fixed bottom-8 right-8 z-50 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
      title={isMuted ? 'Unmute music' : 'Mute music'}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
};

export default AudioPlayer;