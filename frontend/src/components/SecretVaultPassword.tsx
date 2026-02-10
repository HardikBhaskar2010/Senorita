import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Shield, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface SecretVaultPasswordProps {
  userName: 'Cookie' | 'Senorita';
  onSuccess: () => void;
  onCancel: () => void;
}

const SecretVaultPassword = ({ userName, onSuccess, onCancel }: SecretVaultPasswordProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matrixNumbers, setMatrixNumbers] = useState<string[]>([]);

  // Generate matrix effect
  useState(() => {
    const numbers: string[] = [];
    for (let i = 0; i < 20; i++) {
      numbers.push(Math.random().toString(2).substring(2, 10));
    }
    setMatrixNumbers(numbers);
  });

  // Check if vault is setup
  const checkVaultSetup = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_settings')
        .select('is_setup')
        .eq('user_name', userName)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data || !data.is_setup) {
        setIsSetupMode(true);
      }
    } catch (err) {
      console.error('Error checking vault setup:', err);
      setIsSetupMode(true);
    }
  };

  useState(() => {
    checkVaultSetup();
  });

  // Handle password verification
  const verifyPassword = async () => {
    if (!password.trim()) {
      toast({
        title: '⚠️ Password Required',
        description: 'Please enter your vault password',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabase
        .from('vault_settings')
        .select('vault_password')
        .eq('user_name', userName)
        .single();

      if (error) throw error;

      // Simple password check (in production, use proper hashing)
      if (data.vault_password === password) {
        toast({
          title: '✅ Access Granted',
          description: 'Welcome to your Secret Vault',
          variant: 'default'
        });
        onSuccess();
      } else {
        toast({
          title: '❌ Access Denied',
          description: 'Incorrect password',
          variant: 'destructive'
        });
        setPassword('');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      toast({
        title: '❌ Error',
        description: 'Failed to verify password',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle password setup
  const setupPassword = async () => {
    if (!password.trim()) {
      toast({
        title: '⚠️ Password Required',
        description: 'Please create a vault password',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: '⚠️ Password Too Short',
        description: 'Password must be at least 4 characters',
        variant: 'destructive'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: '⚠️ Passwords Don\'t Match',
        description: 'Please confirm your password',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { error } = await supabase
        .from('vault_settings')
        .upsert({
          user_name: userName,
          vault_password: password, // In production, hash this!
          is_setup: true
        }, {
          onConflict: 'user_name'
        });

      if (error) throw error;

      toast({
        title: '✅ Vault Setup Complete',
        description: 'Your Secret Vault is now protected',
        variant: 'default'
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error setting up vault:', err);
      toast({
        title: '❌ Setup Failed',
        description: 'Failed to setup vault password',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSetupMode) {
      setupPassword();
    } else {
      verifyPassword();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {matrixNumbers.map((num, i) => (
          <motion.div
            key={i}
            initial={{ y: -20 }}
            animate={{ y: '100vh' }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="absolute text-cyan-500 text-xs font-mono"
            style={{ 
              left: `${(i * 5) % 100}%`,
              top: `-${Math.random() * 100}px`
            }}
          >
            {num}
          </motion.div>
        ))}
      </div>

      {/* Cyber Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-8 md:p-12 max-w-md w-full border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
      >
        {/* Close Button */}
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-cyan-500/10"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Glowing Corner Accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-pink-500/50 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-500/50 rounded-br-3xl" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 p-0.5 mb-6"
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2 font-mono">
            {isSetupMode ? '> VAULT SETUP' : '> ACCESS VAULT'}
          </h2>
          <p className="text-gray-400 text-sm font-mono">
            {isSetupMode 
              ? 'Create your secret vault password' 
              : `Enter ${userName}'s vault password`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div className="relative">
            <label className="block text-cyan-400 text-sm font-mono mb-2">
              {'>'} PASSWORD
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="bg-gray-900/50 border-cyan-500/30 text-white placeholder:text-gray-600 pr-12 font-mono focus:border-cyan-500 focus:ring-cyan-500/50"
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Setup Mode) */}
          {isSetupMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <label className="block text-pink-400 text-sm font-mono mb-2">
                {'>'} CONFIRM PASSWORD
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password..."
                className="bg-gray-900/50 border-pink-500/30 text-white placeholder:text-gray-600 font-mono focus:border-pink-500 focus:ring-pink-500/50"
                disabled={isVerifying}
              />
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isVerifying}
            className="w-full py-6 text-lg font-mono bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 hover:from-cyan-600 hover:via-blue-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-cyan-500/50"
          >
            {isVerifying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="w-5 h-5 inline mr-2" />
              </motion.div>
            ) : (
              <Unlock className="w-5 h-5 inline mr-2" />
            )}
            {isVerifying ? 'VERIFYING...' : isSetupMode ? 'CREATE VAULT' : 'UNLOCK VAULT'}
          </Button>
        </form>

        {/* Info Text */}
        <p className="text-gray-500 text-xs text-center mt-6 font-mono">
          {isSetupMode 
            ? '💝 Your vault will be protected with this password'
            : '🔒 Your private sanctuary awaits'}
        </p>

        {/* Pulsing Border Effect */}
        <motion.div
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 border-2 border-cyan-500/20 rounded-3xl pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
};

export default SecretVaultPassword;
