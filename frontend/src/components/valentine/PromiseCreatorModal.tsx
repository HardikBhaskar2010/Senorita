import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Lock, Heart, Sparkles, Sun, Star, HandHeart } from 'lucide-react';

interface PromiseCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promise: {
    text: string;
    category: string;
    signature: string;
  }) => void;
}

const categories = [
  { 
    id: 'forever', 
    label: 'Forever Promise', 
    icon: Heart, 
    color: '#ff1493',
    description: 'Eternal commitments' 
  },
  { 
    id: 'daily', 
    label: 'Daily Promise', 
    icon: Sun, 
    color: '#ffa500',
    description: 'Everyday love' 
  },
  { 
    id: 'dreams', 
    label: 'Dream Promise', 
    icon: Star, 
    color: '#9370db',
    description: 'Future goals together' 
  },
  { 
    id: 'support', 
    label: 'Support Promise', 
    icon: HandHeart, 
    color: '#32cd32',
    description: 'Being there for each other' 
  },
  { 
    id: 'love-language', 
    label: 'Love Language Promise', 
    icon: Sparkles, 
    color: '#ff69b4',
    description: 'Speaking your love language' 
  },
];

export default function PromiseCreatorModal({ 
  isOpen, 
  onClose, 
  onSave 
}: PromiseCreatorModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [promiseText, setPromiseText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (step === 3) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasSignature = imageData.data.some(channel => channel !== 0);

    if (!hasSignature) {
      alert('Please sign your promise!');
      return;
    }

    const signatureBase64 = canvas.toDataURL();
    
    onSave({
      text: promiseText,
      category: selectedCategory,
      signature: signatureBase64
    });

    // Reset
    setStep(1);
    setSelectedCategory('');
    setPromiseText('');
    clearSignature();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCategory('');
    setPromiseText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Step 1: Category Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Choose Promise Type</h2>
                  <p className="text-white/70">What kind of promise do you want to make?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setStep(2);
                        }}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all text-left"
                        style={{
                          boxShadow: `0 0 20px ${category.color}40`
                        }}
                      >
                        <Icon className="w-8 h-8 mb-3" style={{ color: category.color }} />
                        <h3 className="text-xl font-bold mb-1">{category.label}</h3>
                        <p className="text-sm text-white/60">{category.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Write Promise */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Write Your Promise</h2>
                  <p className="text-white/70">
                    {categories.find(c => c.id === selectedCategory)?.label}
                  </p>
                </div>

                <Textarea
                  value={promiseText}
                  onChange={(e) => setPromiseText(e.target.value)}
                  placeholder="I promise to..."
                  rows={6}
                  className="w-full bg-white/10 border-white/30 text-white placeholder:text-white/50 text-lg"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="ghost"
                    className="flex-1 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!promiseText.trim()}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                  >
                    Next: Sign
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Sign Promise */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Sign Your Promise</h2>
                  <p className="text-white/70">Draw your signature to seal it</p>
                </div>

                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-48 bg-white/5 border-2 border-dashed border-white/30 rounded-xl cursor-crosshair"
                />

                <Button
                  onClick={clearSignature}
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/70 hover:bg-white/10"
                >
                  Clear Signature
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="ghost"
                    className="flex-1 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Seal Promise
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
