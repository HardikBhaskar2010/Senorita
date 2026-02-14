import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemoryDiorama from './MemoryDiorama';

interface Memory {
  id: string;
  title: string;
  description: string;
  snippet?: string;
  image_url?: string;
  diorama_config?: any;
}

interface MemoryModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoryModal({ memory, isOpen, onClose }: MemoryModalProps) {
  if (!memory) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-4xl w-full shadow-2xl border-2 border-cyan-500/30 max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400"
              >
                {memory.title}
              </motion.h2>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Image */}
              {memory.image_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl overflow-hidden border-2 border-cyan-500/20"
                >
                  <img
                    src={memory.image_url}
                    alt={memory.title}
                    className="w-full h-[300px] object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3Ctext fill="%2394a3b8" font-family="monospace" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EMemory%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </motion.div>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <p className="text-lg text-white/90 leading-relaxed font-light">
                  {memory.description}
                </p>
              </motion.div>

              {/* 3D Diorama */}
              {memory.diorama_config && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                    🎭 Memory Diorama
                  </h3>
                  <MemoryDiorama config={memory.diorama_config} />
                  <p className="text-sm text-white/60 text-center italic">
                    Drag to rotate • Scroll to zoom
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 text-sm text-white/50">
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                <span>A moment frozen in time</span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}