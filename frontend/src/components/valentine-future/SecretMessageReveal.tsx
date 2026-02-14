import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Send, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface SecretMessageRevealProps {
  isUnlocked: boolean;
}

export default function SecretMessageReveal({ isUnlocked }: SecretMessageRevealProps) {
  const [showMessage, setShowMessage] = useState(false);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isUnlocked) {
      setTimeout(() => setShowMessage(true), 500);
    }
  }, [isUnlocked]);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('secret_message_unlocks')
        .update({
          message_content: response.trim()
        })
        .eq('user_name', 'Senorita');

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Message Sent to 2030! 🚀",
        description: "Your response has been etched into our future timeline.",
      });
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isUnlocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,0,136,0.2) 0%, rgba(0,0,0,0.9) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          delay: 0.3 
        }}
        className="relative max-w-2xl w-full my-8"
      >
        {/* Glowing background orbs */}
        <div className="absolute -inset-20 opacity-30 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 left-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"
          />
        </div>

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border-2 border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
          {/* Sparkles decoration */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-yellow-400" fill="currentColor" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Heart className="w-16 h-16 mx-auto text-pink-500 mb-2" fill="currentColor" />
            </motion.div>

            {showMessage && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-cyan-400">
                    Message from 2030
                  </h2>
                  
                  <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="text-lg md:text-xl text-white/90 leading-relaxed font-light"
                  >
                    My dearest Senorita,
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                    className="text-base md:text-lg text-white/80 space-y-4 leading-relaxed"
                  >
                    <p>
                      If you're reading this, you've traveled through all our memories — 
                      past, present, and the ones we haven't lived yet. 
                    </p>
                    <p>
                      Every moment we share is a thread in the tapestry of our forever. 
                      From that first coffee in the rain to this very second, 
                      and to all the tomorrows waiting for us.
                    </p>
                    <p>
                      I built this for you because I wanted you to see us the way I do — 
                      not just as we are, but as we will be. Growing, laughing, creating, 
                      and loving through every season of life.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.4 }}
                    className="pt-6 space-y-4"
                  >
                    <p className="text-2xl font-semibold text-pink-400">
                      Will you keep building this future with me?
                    </p>
                    
                    <AnimatePresence mode="wait">
                      {!isSubmitted ? (
                        <motion.div
                          key="input-form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="max-w-md mx-auto space-y-4"
                        >
                          <Textarea
                            placeholder="Your message to our future selves..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            className="bg-white/5 border-pink-500/20 text-white placeholder:text-white/30 focus:border-pink-500/50 resize-none h-24"
                          />
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !response.trim()}
                            className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-bold py-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-5 h-5 mr-2" />
                                Send to the Future
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="success-msg"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-4 text-cyan-400 font-medium flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          Message recorded in our destiny
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4">
                      <p className="text-lg text-cyan-400">
                        Forever yours, across all timelines,
                      </p>
                      <p className="text-xl font-bold text-white mt-1">
                        Your Cookie 🍪
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Floating hearts decoration */}
                <div className="relative h-16 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: -100, opacity: [0, 1, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.6 + 4,
                      }}
                      className="absolute text-2xl"
                      style={{ left: `${20 + i * 15}%` }}
                    >
                      ❤️
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
