import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import PromiseTree3D from './PromiseTree3D';
import PromiseCreatorModal from './PromiseCreatorModal';
import PromiseViewerModal from './PromiseViewerModal';
import { v4 as uuidv4 } from 'uuid';

interface PromiseTreeContainerProps {
  dayNumber: number;
}

interface Promise {
  id: string;
  text: string;
  category: string;
  signature: string;
  createdAt: string;
  position: [number, number, number];
  color: string;
}

const categoryColors: Record<string, string> = {
  'forever': '#ff1493',
  'daily': '#ffa500',
  'dreams': '#9370db',
  'support': '#32cd32',
  'love-language': '#ff69b4',
};

// Generate random position on tree branches
const generatePosition = (index: number, total: number): [number, number, number] => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 1.5 + Math.random() * 1;
  const height = Math.random() * 2 + 0.5;
  
  return [
    Math.cos(angle) * radius,
    height,
    Math.sin(angle) * radius
  ];
};

export default function PromiseTreeContainer({ dayNumber }: PromiseTreeContainerProps) {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedPromise, setSelectedPromise] = useState<Promise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load promises from database
  useEffect(() => {
    loadPromises();
  }, [dayNumber]);

  const loadPromises = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('valentines_progress')
        .select('promises_data')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.promises_data) {
        const loadedPromises = JSON.parse(data.promises_data);
        setPromises(loadedPromises);
      }
    } catch (err) {
      console.error('Error loading promises:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const savePromises = async (updatedPromises: Promise[]) => {
    try {
      const { data: existing } = await supabase
        .from('valentines_progress')
        .select('id')
        .eq('user_name', 'Senorita')
        .eq('day_number', dayNumber)
        .single();

      const promisesJson = JSON.stringify(updatedPromises);

      if (existing) {
        await supabase
          .from('valentines_progress')
          .update({ promises_data: promisesJson })
          .eq('user_name', 'Senorita')
          .eq('day_number', dayNumber);
      } else {
        await supabase
          .from('valentines_progress')
          .insert({
            user_name: 'Senorita',
            day_number: dayNumber,
            day_name: 'Promise Day',
            promises_data: promisesJson,
            unlocked_at: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error('Error saving promises:', err);
      throw err;
    }
  };

  const handleCreatePromise = async (newPromise: {
    text: string;
    category: string;
    signature: string;
  }) => {
    try {
      const promise: Promise = {
        id: uuidv4(),
        text: newPromise.text,
        category: newPromise.category,
        signature: newPromise.signature,
        createdAt: new Date().toISOString(),
        position: generatePosition(promises.length, promises.length + 1),
        color: categoryColors[newPromise.category] || '#ff69b4'
      };

      const updatedPromises = [...promises, promise];
      setPromises(updatedPromises);
      await savePromises(updatedPromises);

      setIsCreatorOpen(false);
      
      toast({
        title: '🌳 Promise Added to Tree!',
        description: 'Your promise is now growing on the Tree of Life.',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save promise. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleLeafClick = (promise: Promise) => {
    setSelectedPromise(promise);
  };

  // Category counts
  const categoryCounts = promises.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🌳
          </motion.div>
          <p className="text-white/70">Loading Promise Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <h3 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Promise Tree of Life
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </h3>
        </motion.div>
        <p className="text-white/70 max-w-2xl mx-auto">
          Each promise you make becomes a glowing leaf on our eternal tree. Watch it grow with every commitment we make to each other. 🌳💖
        </p>
      </div>

      {/* Stats */}
      {promises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
        >
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff1493' }} />
              <span>Forever: {categoryCounts['forever'] || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffa500' }} />
              <span>Daily: {categoryCounts['daily'] || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9370db' }} />
              <span>Dreams: {categoryCounts['dreams'] || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#32cd32' }} />
              <span>Support: {categoryCounts['support'] || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff69b4' }} />
              <span>Love Language: {categoryCounts['love-language'] || 0}</span>
            </div>
          </div>
          <p className="text-center mt-2 text-white/60">
            Total Promises: {promises.length} 🍃
          </p>
        </motion.div>
      )}

      {/* 3D Tree */}
      {promises.length > 0 ? (
        <PromiseTree3D promises={promises} onLeafClick={handleLeafClick} />
      ) : (
        <div className="bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl h-[600px] flex items-center justify-center border border-white/20">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl"
            >
              🌱
            </motion.div>
            <h4 className="text-2xl font-bold">Your Tree is Waiting</h4>
            <p className="text-white/70 max-w-md">
              Plant your first promise to start growing your Tree of Life together
            </p>
          </div>
        </div>
      )}

      {/* Add Promise Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => setIsCreatorOpen(true)}
          className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Promise to Tree
        </Button>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
      >
        <p className="text-sm text-white/60 text-center">
          💡 <strong>Tip:</strong> Click any glowing leaf to read that promise. Drag to rotate the tree and zoom in/out to explore!
        </p>
      </motion.div>

      {/* Modals */}
      <PromiseCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSave={handleCreatePromise}
      />

      <AnimatePresence>
        {selectedPromise && (
          <PromiseViewerModal
            promise={selectedPromise}
            onClose={() => setSelectedPromise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
