import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus, Trash2, Upload, FileText, Image as ImageIcon, File, Share2, Shield, Eye, Download, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSpace } from '@/contexts/SpaceContext';
import FuturisticMotionPaths from '@/components/FuturisticMotionPaths';

interface VaultItem {
  id: string;
  user_name: string;
  item_type: 'text' | 'image' | 'file';
  title: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  is_synced: boolean;
  created_at: string;
}

const SecretVaultPage = () => {
  const navigate = useNavigate();
  const { currentSpace, displayName } = useSpace();
  const userName = currentSpace === 'cookie' ? 'Cookie' : 'Senorita';
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'text' | 'image' | 'file'>('text');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [matrixNumbers, setMatrixNumbers] = useState<string[]>([]);

  // Generate matrix effect
  useEffect(() => {
    const numbers: string[] = [];
    for (let i = 0; i < 30; i++) {
      numbers.push(Math.random().toString(2).substring(2, 12));
    }
    setMatrixNumbers(numbers);
  }, []);

  // Fetch vault items
  useEffect(() => {
    fetchVaultItems();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('vault-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secret_vault'
        },
        () => {
          fetchVaultItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userName]);

  const fetchVaultItems = async () => {
    try {
      // Fetch own items
      const { data: ownData, error: ownError } = await supabase
        .from('secret_vault')
        .select('*')
        .eq('user_name', userName)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      // Fetch partner's synced items
      const partnerName = userName === 'Cookie' ? 'Senorita' : 'Cookie';
      const { data: partnerData, error: partnerError } = await supabase
        .from('secret_vault')
        .select('*')
        .eq('user_name', partnerName)
        .eq('is_synced', true)
        .order('created_at', { ascending: false });

      if (partnerError) throw partnerError;

      const allItems = [...(ownData || []), ...(partnerData || [])];
      setVaultItems(allItems);
    } catch (err) {
      console.error('Error fetching vault items:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `vault/${userName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('chat-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Add vault item
  const addVaultItem = async () => {
    if (!newTitle.trim()) {
      toast({
        title: '⚠️ Title Required',
        description: 'Please enter a title for your vault item',
        variant: 'destructive'
      });
      return;
    }

    if (newItemType === 'text' && !newContent.trim()) {
      toast({
        title: '⚠️ Content Required',
        description: 'Please enter some content',
        variant: 'destructive'
      });
      return;
    }

    if ((newItemType === 'image' || newItemType === 'file') && !newFile) {
      toast({
        title: '⚠️ File Required',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    if (newFile && newFile.size > 10 * 1024 * 1024) {
      toast({
        title: '⚠️ File Too Large',
        description: 'File size must be less than 10MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl = '';
      let fileName = '';
      let fileType = '';
      let fileSize = 0;

      if (newFile) {
        fileUrl = await handleFileUpload(newFile);
        fileName = newFile.name;
        fileType = newFile.type;
        fileSize = newFile.size;
      }

      const { error } = await supabase
        .from('secret_vault')
        .insert({
          user_name: userName,
          item_type: newItemType,
          title: newTitle,
          content: newItemType === 'text' ? newContent : null,
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_type: fileType || null,
          file_size: fileSize || null,
          is_synced: isSynced
        });

      if (error) throw error;

      toast({
        title: '✅ Item Added',
        description: isSynced ? 'Item added and synced with partner' : 'Item added to your vault',
        variant: 'default'
      });

      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewFile(null);
      setIsSynced(false);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding vault item:', err);
      toast({
        title: '❌ Error',
        description: 'Failed to add item to vault',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete vault item
  const deleteVaultItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('secret_vault')
        .delete()
        .eq('id', id)
        .eq('user_name', userName); // Can only delete own items

      if (error) throw error;

      toast({
        title: '✅ Item Deleted',
        description: 'Vault item removed',
        variant: 'default'
      });

      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting vault item:', err);
      toast({
        title: '❌ Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  // Toggle sync status
  const toggleSync = async (item: VaultItem) => {
    if (item.user_name !== userName) {
      toast({
        title: '⚠️ Cannot Edit',
        description: "You can only modify your own items",
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('secret_vault')
        .update({ is_synced: !item.is_synced })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: item.is_synced ? '🔒 Sync Disabled' : '🔄 Sync Enabled',
        description: item.is_synced ? 'Item is now private' : 'Item is now shared with partner',
        variant: 'default'
      });
    } catch (err) {
      console.error('Error toggling sync:', err);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-6 h-6" />;
      case 'image': return <ImageIcon className="w-6 h-6" />;
      case 'file': return <File className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const theme = currentSpace === 'cookie' ? {
    primary: 'cyan',
    secondary: 'blue',
    gradient: 'from-cyan-500 via-blue-500 to-blue-600'
  } : {
    primary: 'pink',
    secondary: 'rose',
    gradient: 'from-pink-500 via-rose-500 to-pink-600'
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Futuristic Motion Paths Background */}
      <FuturisticMotionPaths 
        theme={currentSpace === 'cookie' ? 'cyan' : 'pink'} 
        pathCount={10}
      />

      {/* Matrix Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {matrixNumbers.map((num, i) => (
          <motion.div
            key={i}
            initial={{ y: -20 }}
            animate={{ y: '100vh' }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.1
            }}
            className={`absolute text-${theme.primary}-500 text-xs font-mono`}
            style={{ 
              left: `${(i * 3.3) % 100}%`,
              top: `-${Math.random() * 100}px`
            }}
          >
            {num}
          </motion.div>
        ))}
      </div>

      {/* Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`w-full h-0.5 bg-gradient-to-r from-transparent via-${theme.primary}-500/30 to-transparent`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              onClick={() => navigate(`/${currentSpace}`)}
              variant="ghost"
              className="text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent font-mono`}>
              {'>'} SECRET VAULT
            </h1>
            <p className="text-gray-400 font-mono mt-2">Your private sanctuary 🔒</p>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 rounded-full bg-gradient-to-br from-${theme.primary}-500 to-${theme.secondary}-500 p-0.5`}
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <Shield className={`w-8 h-8 text-${theme.primary}-400`} />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-5 text-center shadow-lg shadow-cyan-500/20"
          >
            <p className="text-cyan-400 text-3xl font-bold font-mono mb-1">{vaultItems.filter(i => i.user_name === userName).length}</p>
            <p className="text-gray-400 text-xs font-mono">Your Items</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 backdrop-blur-xl border-2 border-pink-500/30 rounded-2xl p-5 text-center shadow-lg shadow-pink-500/20"
          >
            <p className="text-pink-400 text-3xl font-bold font-mono mb-1">{vaultItems.filter(i => i.is_synced).length}</p>
            <p className="text-gray-400 text-xs font-mono">Synced Items</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-5 text-center shadow-lg shadow-purple-500/20"
          >
            <p className="text-purple-400 text-3xl font-bold font-mono mb-1">{vaultItems.filter(i => i.user_name !== userName).length}</p>
            <p className="text-gray-400 text-xs font-mono">Partner's Items</p>
          </motion.div>
        </div>

        {/* Add Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setShowAddModal(true)}
            className={`w-full mb-8 py-7 text-lg font-mono bg-gradient-to-r ${theme.gradient} hover:from-${theme.primary}-600 hover:via-${theme.secondary}-600 hover:to-${theme.primary}-700 text-white shadow-2xl shadow-${theme.primary}-500/40 border border-${theme.primary}-400/30 transition-all duration-300`}
          >
            <Plus className="w-6 h-6 mr-2" />
            ADD TO VAULT
          </Button>
        </motion.div>

        {/* Vault Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaultItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -8 }}
              onClick={() => setSelectedItem(item)}
              className={`bg-gradient-to-br from-gray-900/80 to-gray-900/50 backdrop-blur-xl border-2 border-${item.is_synced ? 'purple' : theme.primary}-500/30 rounded-2xl p-6 cursor-pointer relative group shadow-lg hover:shadow-2xl hover:shadow-${item.is_synced ? 'purple' : theme.primary}-500/30 transition-all duration-300`}
            >
              {/* Owner Badge */}
              {item.user_name !== userName && (
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-3 py-1 font-mono">
                  SYNCED
                </div>
              )}

              {/* Sync Badge */}
              {item.is_synced && item.user_name === userName && (
                <div className="absolute -top-2 -right-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Share2 className="w-5 h-5 text-purple-400" />
                  </motion.div>
                </div>
              )}

              {/* Icon */}
              <div className={`text-${theme.primary}-400 mb-4`}>
                {getItemIcon(item.item_type)}
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold mb-2 truncate font-mono">{item.title}</h3>

              {/* Preview */}
              {item.item_type === 'text' && (
                <p className="text-gray-400 text-sm line-clamp-2">{item.content}</p>
              )}
              {item.item_type === 'image' && item.file_url && (
                <img src={item.file_url} alt={item.title} className="w-full h-32 object-cover rounded-lg" />
              )}
              {item.item_type === 'file' && (
                <p className="text-gray-400 text-xs font-mono">{item.file_name}</p>
              )}

              {/* Metadata */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <span>{item.user_name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {vaultItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Lock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-mono">Your vault is empty</h3>
            <p className="text-gray-600 font-mono mt-2">Add your first secret item</p>
          </motion.div>
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border-2 border-cyan-500/30 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold text-${theme.primary}-400 font-mono`}>ADD ITEM</h3>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['text', 'image', 'file'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewItemType(type)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newItemType === type
                        ? `border-${theme.primary}-500 bg-${theme.primary}-500/10`
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`text-${newItemType === type ? theme.primary : 'gray'}-400 mb-2`}>
                      {getItemIcon(type)}
                    </div>
                    <p className="text-xs text-gray-400 font-mono capitalize">{type}</p>
                  </button>
                ))}
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-mono mb-2">{'>'} TITLE</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter title..."
                  className="bg-gray-800 border-cyan-500/30 text-white font-mono"
                />
              </div>

              {/* Content Input (Text) */}
              {newItemType === 'text' && (
                <div className="mb-4">
                  <label className="block text-cyan-400 text-sm font-mono mb-2">{'>'} CONTENT</label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Enter content..."
                    rows={4}
                    className="bg-gray-800 border-cyan-500/30 text-white font-mono"
                  />
                </div>
              )}

              {/* File Upload (Image/File) */}
              {(newItemType === 'image' || newItemType === 'file') && (
                <div className="mb-4">
                  <label className="block text-cyan-400 text-sm font-mono mb-2">{'>'} FILE</label>
                  <Input
                    type="file"
                    accept={newItemType === 'image' ? 'image/*' : '*'}
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="bg-gray-800 border-cyan-500/30 text-white font-mono"
                  />
                  {newFile && (
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      {newFile.name} ({(newFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {/* Sync Toggle */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSynced}
                    onChange={(e) => setIsSynced(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-purple-400 font-mono text-sm">SYNC WITH PARTNER</span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-1 font-mono">
                  {isSynced ? 'Partner can view this item' : 'Keep this item private'}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={addVaultItem}
                disabled={isUploading}
                className={`w-full py-7 text-base font-mono bg-gradient-to-r ${theme.gradient} hover:from-${theme.primary}-600 hover:via-${theme.secondary}-600 hover:to-${theme.primary}-700 text-white border border-${theme.primary}-400/30 shadow-xl shadow-${theme.primary}-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      <Shield className="w-5 h-5" />
                    </motion.div>
                    UPLOADING...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    ADD TO VAULT
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border-2 border-cyan-500/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className={`text-${theme.primary}-400 mb-3`}>
                    {getItemIcon(selectedItem.item_type)}
                  </div>
                  <h3 className="text-2xl font-bold text-white font-mono mb-2">{selectedItem.title}</h3>
                  <p className="text-gray-400 text-sm font-mono">
                    By {selectedItem.user_name} • {new Date(selectedItem.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedItem(null)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                {selectedItem.item_type === 'text' && (
                  <div className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-6">
                    <p className="text-white whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                )}
                {selectedItem.item_type === 'image' && selectedItem.file_url && (
                  <img 
                    src={selectedItem.file_url} 
                    alt={selectedItem.title} 
                    className="w-full rounded-xl"
                  />
                )}
                {selectedItem.item_type === 'file' && selectedItem.file_url && (
                  <div className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-6">
                    <File className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-white text-center font-mono mb-2">{selectedItem.file_name}</p>
                    <p className="text-gray-400 text-xs text-center font-mono">
                      {selectedItem.file_type} • {((selectedItem.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedItem.file_url && (
                  <Button
                    onClick={() => window.open(selectedItem.file_url, '_blank')}
                    className="flex-1 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 text-cyan-400 border-2 border-cyan-500/30 font-mono shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    DOWNLOAD
                  </Button>
                )}
                {selectedItem.user_name === userName && (
                  <>
                    <Button
                      onClick={() => toggleSync(selectedItem)}
                      className="flex-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 text-purple-400 border-2 border-purple-500/30 font-mono shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {selectedItem.is_synced ? 'UNSYNC' : 'SYNC'}
                    </Button>
                    <Button
                      onClick={() => deleteVaultItem(selectedItem.id)}
                      className="flex-1 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 border-2 border-red-500/30 font-mono shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      DELETE
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecretVaultPage;