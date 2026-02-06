import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Lock, Unlock } from 'lucide-react';

interface PromiseVaultProps {
  dayNumber: number;
}

const PromiseVault = ({ dayNumber }: PromiseVaultProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [promiseText, setPromiseText] = useState('');
  const [isSealed, setIsSealed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [sealedPromise, setSealedPromise] = useState<string | null>(null);

  useEffect(() => {
    // Load saved promise
    const loadPromise = async () => {
      const { data } = await supabase
        .from('valentines_progress')
        .select('sealed_promise, signature_data')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      if (data?.sealed_promise) {
        setSealedPromise(data.sealed_promise);
        setSignatureData(data.signature_data);
        setIsSealed(true);
        // Decode the promise
        try {
          const decoded = atob(data.sealed_promise);
          setPromiseText(decoded);
        } catch (e) {
          console.error('Failed to decode promise');
        }
      }
    };
    loadPromise();
  }, [dayNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set drawing style
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

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

  const sealPromise = async () => {
    if (!promiseText.trim()) {
      toast({
        title: 'Write a Promise 📝',
        description: 'Please write your promise before sealing.',
        variant: 'default'
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if signature is drawn
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasSignature = imageData.data.some(channel => channel !== 0);

    if (!hasSignature) {
      toast({
        title: 'Sign Your Promise ✍️',
        description: 'Please sign on the canvas to seal your promise.',
        variant: 'default'
      });
      return;
    }

    // Get signature as base64
    const signatureBase64 = canvas.toDataURL();

    // Encode promise (simple base64)
    const encodedPromise = btoa(promiseText);

    // Save to database
    await supabase
      .from('valentines_progress')
      .update({
        sealed_promise: encodedPromise,
        signature_data: signatureBase64,
        promise_unlock_date: new Date().toISOString()
      })
      .eq('user_name', 'Senorita')
      .eq('day_number', dayNumber);

    setIsSealed(true);
    setSealedPromise(encodedPromise);
    setSignatureData(signatureBase64);

    toast({
      title: '🔐 Promise Sealed!',
      description: 'Your promise is now locked in the vault forever.',
      variant: 'default'
    });
  };

  if (isSealed && sealedPromise) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center gap-6 max-w-md mx-auto"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-8xl"
        >
          📦
        </motion.div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center w-full">
          <Unlock className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <h3 className="text-2xl font-bold mb-4">Promise Sealed & Secured 🔐</h3>
          <div className="bg-white/5 rounded-xl p-4 mb-4 text-left">
            <p className="text-sm opacity-70 mb-2">Your Promise:</p>
            <p className="italic">"{promiseText}"</p>
          </div>

          {signatureData && (
            <div className="mt-4">
              <p className="text-sm opacity-70 mb-2">Your Signature:</p>
              <img 
                src={signatureData} 
                alt="Signature" 
                className="w-full h-24 object-contain bg-white/10 rounded-lg"
              />
            </div>
          )}

          <p className="text-xs opacity-60 mt-4">
            📅 Sealed on {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-7xl"
      >
        🔐
      </motion.div>

      <h3 className="text-2xl font-bold text-center">Write & Seal Your Promise</h3>

      {/* Promise Text */}
      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Your Promise:</label>
        <Textarea
          value={promiseText}
          onChange={(e) => setPromiseText(e.target.value)}
          placeholder="I promise to..."
          rows={4}
          className="w-full bg-white/10 border-white/30 text-white placeholder:text-white/50"
        />
      </div>

      {/* Signature Canvas */}
      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Sign Here:</label>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 bg-white/5 border-2 border-dashed border-white/30 rounded-xl cursor-crosshair"
        />
        <Button
          onClick={clearSignature}
          variant="ghost"
          size="sm"
          className="mt-2 text-white/70 hover:bg-white/10"
        >
          Clear Signature
        </Button>
      </div>

      {/* Seal Button */}
      <Button
        onClick={sealPromise}
        className="w-full py-6 text-lg bg-white/20 hover:bg-white/30 text-white"
      >
        <Lock className="w-5 h-5 mr-2" />
        Seal My Promise
      </Button>

      <p className="text-sm opacity-70 text-center">
        Once sealed, your promise will be stored forever in the vault 💖
      </p>
    </div>
  );
};

export default PromiseVault;