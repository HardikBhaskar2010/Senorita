import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Heart, X, Plus, Feather, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useSpace } from "@/contexts/SpaceContext";

interface LoveLetter {
  id: string;
  title: string;
  content: string;
  from_user: string;
  to_user: string;
  created_at: string;
}

const LoveLetters = () => {
  const { displayName } = useSpace();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [newLetter, setNewLetter] = useState({ title: "", content: "", from: "" });

  useEffect(() => {
    loadLetters();
    subscribeToLetters();
  }, []);

  const loadLetters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4); // Show only latest 4 letters in dashboard preview

      if (error) throw error;
      setLetters(data || []);
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToLetters = () => {
    const channel = supabase
      .channel('letters-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letters'
        },
        () => {
          loadLetters();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = () => {
    // This is just a preview component - redirect to full letters page
    setIsWriting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>Love Letters</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                {isLoading ? "Loading..." : letters.length === 0 ? "No letters yet" : `${letters.length}+ heartfelt messages`}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-accent/20 border border-primary/10 animate-pulse">
                  <div className="h-4 bg-primary/10 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-primary/10 rounded w-full mb-1"></div>
                  <div className="h-3 bg-primary/10 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : letters.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No letters yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Visit the Letters page to write your first one</p>
            </div>
          ) : (
            <motion.div key="list" className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {letters.map((letter, index) => (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedLetter(letter)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="p-4 rounded-xl bg-gradient-to-br from-accent/40 to-accent/20 border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {letter.title}
                      </h3>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1.2 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                      >
                        <Heart className="w-4 h-4 text-primary fill-current" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {letter.content}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-primary font-medium">— {letter.from_user}</span>
                      <span className="text-muted-foreground">{format(new Date(letter.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Letter Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-medium">Love Letter</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedLetter.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedLetter.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedLetter(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="bg-accent/20 rounded-xl p-4 mb-4 border border-primary/10">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-primary font-medium flex items-center gap-2">
                  — {selectedLetter.from_user}
                  <Heart className="w-4 h-4 fill-current animate-pulse-heart" />
                </p>
                <Sparkles className="w-5 h-5 text-primary/50" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoveLetters;
