import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCw, ZoomIn, Download, X, FlipHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as THREE from 'three';
import { Pose, Results } from '@mediapipe/pose';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';

interface TeddyARCameraProps {
  onClose: () => void;
}

function ARTeddyModel({ 
  position, 
  rotation, 
  scale,
  enableFloating = false
}: { 
  position: [number, number, number]; 
  rotation: number; 
  scale: number;
  enableFloating?: boolean;
}) {
  const { scene } = useGLTF('/models/bears.glb');
  const modelRef = useRef<THREE.Group>(null);
  
  // Gentle floating animation only when enabled
  useFrame((state) => {
    if (modelRef.current && enableFloating) {
      const floatOffset = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      modelRef.current.position.set(position[0], position[1] + floatOffset, position[2]);
    } else if (modelRef.current) {
      modelRef.current.position.set(position[0], position[1], position[2]);
    }
  });
  
  return (
    <primitive 
      ref={modelRef} 
      object={scene.clone()} 
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale} 
    />
  );
}

const TeddyARCamera: React.FC<TeddyARCameraProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [teddyPosition, setTeddyPosition] = useState<[number, number, number]>([0, 0.5, 0]);
  const [teddyRotation, setTeddyRotation] = useState(0);
  const [teddyScale, setTeddyScale] = useState(1.5);
  const [shoulderPosition, setShoulderPosition] = useState<{ x: number; y: number } | null>(null);
  const [placementMode, setPlacementMode] = useState<'right-shoulder' | 'left-shoulder' | 'head'>('right-shoulder');
  const poseRef = useRef<Pose | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize camera
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Initialize pose detection for front camera
        if (facingMode === 'user') {
          initializePoseDetection();
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
  };

  const initializePoseDetection = async () => {
    if (!videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);
    poseRef.current = pose;

    // Start pose detection
    const camera = new MediaPipeCamera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
      },
      width: 1920,
      height: 1080
    });
    camera.start();
  };

  const onPoseResults = (results: Results) => {
    if (results.poseLandmarks) {
      let targetLandmark;
      
      // Select landmark based on placement mode
      if (placementMode === 'right-shoulder') {
        targetLandmark = results.poseLandmarks[12]; // Right shoulder
      } else if (placementMode === 'left-shoulder') {
        targetLandmark = results.poseLandmarks[11]; // Left shoulder
      } else if (placementMode === 'head') {
        targetLandmark = results.poseLandmarks[0]; // Nose (head center)
      }
      
      if (targetLandmark && targetLandmark.visibility > 0.5) {
        setShoulderPosition({
          x: targetLandmark.x,
          y: targetLandmark.y
        });
        
        // Update teddy position based on selected landmark
        // Convert normalized coordinates to Three.js coordinates
        const x = (targetLandmark.x - 0.5) * 4; // Map to -2 to 2 range
        const y = -(targetLandmark.y - 0.5) * 3; // Map to -1.5 to 1.5 range (inverted)
        
        // Adjust offset based on placement
        const yOffset = placementMode === 'head' ? 0.4 : 0.3;
        
        setTeddyPosition([x, y + yOffset, 0]);
      }
    }
  };

  const flipCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    
    // Reset position for environment camera (ground mode)
    if (facingMode === 'user') {
      setTeddyPosition([0, -1, 0]);
      setTeddyScale(2);
    } else {
      setTeddyPosition([0, 0.5, 0]);
      setTeddyScale(1.5);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teddy-ar-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: '📸 Photo Captured!',
          description: 'Your AR teddy photo has been saved!',
          variant: 'default'
        });
      }
    }, 'image/png');
  };

  const handleZoomChange = (value: number[]) => {
    setTeddyScale(value[0]);
  };

  const handleRotationChange = (value: number[]) => {
    // Convert degrees to radians for rotation
    setTeddyRotation((value[0] / 180) * Math.PI);
  };

  const cyclePlacementMode = () => {
    setPlacementMode(prev => {
      if (prev === 'right-shoulder') return 'left-shoulder';
      if (prev === 'left-shoulder') return 'head';
      return 'right-shoulder';
    });
    
    toast({
      title: '📍 Position Changed',
      description: `Teddy moved to ${
        placementMode === 'right-shoulder' ? 'left shoulder' :
        placementMode === 'left-shoulder' ? 'head' : 'right shoulder'
      }!`,
      variant: 'default'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Three.js AR Overlay */}
      <div 
        className="absolute inset-0"
        onClick={facingMode === 'user' ? cyclePlacementMode : undefined}
        style={{ cursor: facingMode === 'user' ? 'pointer' : 'default' }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#ff69b4" />
          
          <Suspense fallback={null}>
            <ARTeddyModel 
              position={teddyPosition} 
              rotation={teddyRotation}
              scale={teddyScale}
              enableFloating={facingMode === 'user'}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Controls */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white"
            >
              📸 AR Teddy Photobooth
            </motion.h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mode Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
            <p className="text-white text-sm font-medium">
              {facingMode === 'user' 
                ? `👤 Selfie Mode - ${
                    placementMode === 'right-shoulder' ? 'Right Shoulder' :
                    placementMode === 'left-shoulder' ? 'Left Shoulder' : 'On Head'
                  } (Tap to move)` 
                : '🌍 Ground Mode - Place & Style'}
            </p>
          </div>
        </motion.div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent pointer-events-auto">
          {/* Sliders for environment mode */}
          {facingMode === 'environment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-4 max-w-md mx-auto"
            >
              {/* Zoom Slider */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <ZoomIn className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Size: {teddyScale.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[teddyScale]}
                  onValueChange={handleZoomChange}
                  min={0.5}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotation Slider */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <RotateCw className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Rotation: {Math.round((teddyRotation / Math.PI) * 180)}°</span>
                </div>
                <Slider
                  value={[teddyRotation]}
                  onValueChange={handleRotationChange}
                  min={0}
                  max={Math.PI * 2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Flip Camera */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={flipCamera}
                size="lg"
                className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/40"
              >
                <FlipHorizontal className="w-6 h-6 text-white" />
              </Button>
            </motion.div>

            {/* Capture Photo */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-20 h-20 bg-pink-500 hover:bg-pink-600 border-4 border-white shadow-2xl"
              >
                <Camera className="w-8 h-8 text-white" />
              </Button>
            </motion.div>

            {/* Download Latest */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/40"
              >
                <Download className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
          </div>

          {/* Instructions */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/70 text-sm mt-4"
          >
            {facingMode === 'user' 
              ? '💡 Teddy will follow your shoulder! Flip camera to place on ground.'
              : '💡 Use sliders to adjust size and rotation. Flip to return to selfie mode.'
            }
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default TeddyARCamera;
