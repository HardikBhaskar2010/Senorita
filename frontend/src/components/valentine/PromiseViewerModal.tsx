import { motion } from 'framer-motion';
import { X, Heart, Sun, Star, HandHeart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Promise {
  id: string;
  text: string;
  category: string;
  signature: string;
  createdAt: string;
  color: string;
}

interface PromiseViewerModalProps {
  promise: Promise | null;
  onClose: () => void;
}

const categoryInfo: Record<string, { label: string; icon: any; color: string }> = {
  'forever': { label: 'Forever Promise', icon: Heart, color: '#ff1493' },
  'daily': { label: 'Daily Promise', icon: Sun, color: '#ffa500' },
  'dreams': { label: 'Dream Promise', icon: Star, color: '#9370db' },
  'support': { label: 'Support Promise', icon: HandHeart, color: '#32cd32' },
  'love-language': { label: 'Love Language Promise', icon: Sparkles, color: '#ff69b4' },
};

export default function PromiseViewerModal({ promise, onClose }: PromiseViewerModalProps) {
  if (!promise) return null;

  const category = categoryInfo[promise.category];
  const Icon = category?.icon || Heart;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl relative"
        style={{
          boxShadow: `0 0 40px ${category?.color}40`
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Promise Content */}
        <div className="space-y-6">
          {/* Category Badge */}
          <div className="flex items-center justify-center gap-3">
            <Icon className="w-8 h-8" style={{ color: category?.color }} />
            <h3 className="text-2xl font-bold" style={{ color: category?.color }}>
              {category?.label}
            </h3>
          </div>

          {/* Promise Text */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-xl italic leading-relaxed">
              "{promise.text}"
            </p>
          </div>

          {/* Signature */}
          {promise.signature && (
            <div className="space-y-2">
              <p className="text-sm text-white/70 text-center">Signature:</p>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <img 
                  src={promise.signature} 
                  alt="Signature" 
                  className="w-full h-32 object-contain"
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              📅 Sealed on {new Date(promise.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-white/20 hover:bg-white/30 text-white"
          >
            Close
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
