import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useSpace } from '@/contexts/SpaceContext';

interface LoveLanguageData {
  id: string;
  user_name: string;
  words_of_affirmation: number;
  quality_time: number;
  receiving_gifts: number;
  acts_of_service: number;
  physical_touch: number;
  primary_language: string | null;
  secondary_language: string | null;
}

const loveLanguages = [
  { key: 'words_of_affirmation', label: 'Words of Affirmation', emoji: '💬', color: 'text-blue-500' },
  { key: 'quality_time', label: 'Quality Time', emoji: '⏰', color: 'text-green-500' },
  { key: 'receiving_gifts', label: 'Receiving Gifts', emoji: '🎁', color: 'text-purple-500' },
  { key: 'acts_of_service', label: 'Acts of Service', emoji: '🤝', color: 'text-orange-500' },
  { key: 'physical_touch', label: 'Physical Touch', emoji: '🤗', color: 'text-pink-500' },
];

const LoveLanguageResults = () => {
  const { displayName, partnerName } = useSpace();
  const [myResults, setMyResults] = useState<LoveLanguageData | null>(null);
  const [partnerResults, setPartnerResults] = useState<LoveLanguageData | null>(null);

  useEffect(() => {
    fetchResults();

    // Subscribe to changes
    const subscription = supabase
      .channel('love-language-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'love_language_results',
        },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [displayName, partnerName]);

  const fetchResults = async () => {
    try {
      // Fetch my results
      const { data: myData, error: myError } = await supabase
        .from('love_language_results')
        .select('*')
        .eq('user_name', displayName)
        .maybeSingle();

      if (myError && myError.code !== 'PGRST116') {
        console.error('Error fetching my love language results:', myError);
      }

      // Fetch partner results
      const { data: partnerData, error: partnerError } = await supabase
        .from('love_language_results')
        .select('*')
        .eq('user_name', partnerName)
        .maybeSingle();

      if (partnerError && partnerError.code !== 'PGRST116') {
        console.error('Error fetching partner love language results:', partnerError);
      }

      setMyResults(myData);
      setPartnerResults(partnerData);
    } catch (error) {
      console.error('Error fetching love language results:', error);
    }
  };

  if (!myResults && !partnerResults) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-primary" />
          Our Love Languages
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {myResults && myResults.primary_language && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">You</span>
              <span className="text-xs text-muted-foreground">Primary</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-primary/10 rounded-lg border border-primary/30"
            >
              <div className="text-center">
                <div className="text-3xl mb-1">
                  {loveLanguages.find(l => l.label === myResults.primary_language)?.emoji}
                </div>
                <p className="text-sm font-semibold">{myResults.primary_language}</p>
              </div>
            </motion.div>
          </div>
        )}

        {partnerResults && partnerResults.primary_language && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{partnerName}</span>
              <span className="text-xs text-muted-foreground">Primary</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/30"
            >
              <div className="text-center">
                <div className="text-3xl mb-1">
                  {loveLanguages.find(l => l.label === partnerResults.primary_language)?.emoji}
                </div>
                <p className="text-sm font-semibold">{partnerResults.primary_language}</p>
              </div>
            </motion.div>
          </div>
        )}

        {!myResults?.primary_language && !partnerResults?.primary_language && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Take the love language quiz to discover how you both prefer to express and receive love!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LoveLanguageResults;
