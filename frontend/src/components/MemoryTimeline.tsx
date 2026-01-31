import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Milestone, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  milestone_date: string;
  category: string;
  icon: string;
  image_url: string | null;
}

const MemoryTimeline = () => {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  useEffect(() => {
    fetchMilestones();

    // Subscribe to changes
    const subscription = supabase
      .channel('milestones-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
        },
        () => {
          fetchMilestones();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('milestone_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-primary fill-current" />
          Our Memories
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No milestones yet. Create your first memory!
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 p-3 bg-card/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="text-2xl">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{milestone.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {milestone.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(milestone.milestone_date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <Button variant="outline" className="w-full" size="sm" asChild>
          <Link to="/milestones">View All Memories</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MemoryTimeline;
