import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Affirmation {
  id: string;
  affirmation_text: string;
  category: string;
}

const DailyAffirmation = () => {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRandomAffirmation = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('daily_affirmations')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setAffirmation(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching affirmation:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRandomAffirmation();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Daily Love Note
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchRandomAffirmation}
          disabled={isRefreshing}
          className="h-8 w-8"
          data-testid="refresh-affirmation-button"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <AnimatePresence mode="wait">
          {affirmation && (
            <motion.div
              key={affirmation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <blockquote className="text-center italic text-muted-foreground text-sm md:text-base leading-relaxed">
                "{affirmation.affirmation_text}"
              </blockquote>
              <div className="mt-4 text-center">
                <span className="inline-block px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                  {affirmation.category}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DailyAffirmation;
