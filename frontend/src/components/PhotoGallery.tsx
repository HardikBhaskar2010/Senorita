import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Plus, Heart, ImageIcon, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Memory {
  id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: string;
  created_at: string;
}

const PhotoGallery = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
    subscribeToPhotos();
  }, []);

  const loadPhotos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6); // Only fetch latest 6 photos for dashboard preview

    if (error) {
      console.error('Error loading photos:', error);
    } else {
      setMemories(data || []);
    }
    setIsLoading(false);
  };

  const subscribeToPhotos = () => {
    const channel = supabase
      .channel('photos-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos'
        },
        () => {
          loadPhotos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const nextPhoto = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % memories.length);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + memories.length) % memories.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>Our Memories</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                {memories.length > 0 ? `${memories.length} recent moments` : 'No memories yet'}
              </p>
            </div>
          </CardTitle>
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/gallery')}
            data-testid="view-gallery-button"
          >
            <Plus className="w-4 h-4" />
            {memories.length > 0 ? 'View All' : 'Add'}
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No memories yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first photo to start building your gallery!
              </p>
              <Button 
                onClick={() => navigate('/gallery')}
                className="gap-2"
                data-testid="upload-first-photo-button"
              >
                <Plus className="w-4 h-4" />
                Upload First Photo
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {memories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    whileHover={{ scale: 1.03, zIndex: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedIndex(index)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <img
                      src={memory.image_url}
                      alt={memory.caption || "Memory"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-primary-foreground text-xs font-medium line-clamp-1">
                          {memory.caption || "Our Memory"}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Heart className="w-4 h-4 text-primary fill-current" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                onClick={() => navigate('/gallery')}
                className="mt-4 w-full p-3 rounded-xl bg-accent/20 border border-primary/10 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-accent/30 hover:border-primary/20 transition-all"
                whileHover={{ scale: 1.02 }}
                data-testid="tap-memory-hint"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Tap any memory to relive the moment</span>
              </motion.button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/95 z-50 flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/10 z-10"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-4xl max-h-[85vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={memories[selectedIndex].image_url}
                  alt={memories[selectedIndex].caption || "Memory"}
                  className="max-w-full max-h-[70vh] object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/90 to-transparent p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary-foreground text-xl font-semibold flex items-center gap-2">
                        {memories[selectedIndex].caption || "Our Memory"}
                        <Heart className="w-5 h-5 text-primary fill-current" />
                      </p>
                      <p className="text-primary-foreground/70 text-sm mt-1">
                        {format(new Date(memories[selectedIndex].created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-primary-foreground/50 text-sm">
                      {selectedIndex + 1} / {memories.length}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-foreground/50 backdrop-blur-sm rounded-full">
              {memories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedIndex 
                      ? 'bg-primary w-6' 
                      : 'bg-primary-foreground/50 hover:bg-primary-foreground'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhotoGallery;
