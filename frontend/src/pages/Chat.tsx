import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Heart,
  Check,
  CheckCheck,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  X,
  FileText,
  Download,
  Loader2,
  Reply,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSpace } from '@/contexts/SpaceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import FloatingHearts from '@/components/FloatingHearts';
import RelationshipSidebar from '@/components/RelationshipSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  message_type: 'text' | 'image' | 'hug' | 'kiss' | 'file';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  reactions?: MessageReaction[];
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  reply_to_message_id?: string | null;
  reply_to_content?: string | null;
  reply_to_user?: string | null;
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_name: string;
  reaction_emoji: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentSpace, displayName, partnerName } = useSpace();
  const { chatBackground } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            
            // Mark as read if message is for current user
            if (newMsg.to_user === displayName) {
              markMessageAsRead(newMsg.id);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
            );
          }
        }
      )
      .subscribe();

    // Subscribe to typing status
    const typingSubscription = supabase
      .channel('typing-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'typing_status',
          filter: `user_name=eq.${partnerName}`,
        },
        (payload) => {
          setPartnerIsTyping((payload.new as any).is_typing);
        }
      )
      .subscribe();

    // Subscribe to message reactions
    const reactionsSubscription = supabase
      .channel('reactions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          fetchMessages(); // Reload messages with reactions
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      typingSubscription.unsubscribe();
      reactionsSubscription.unsubscribe();
    };
  }, [displayName, partnerName]);

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          reactions:message_reactions(*)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);

      // Mark unread messages as read
      const unreadMessages = messagesData?.filter(
        (msg: Message) => msg.to_user === displayName && !msg.is_read
      );
      unreadMessages?.forEach((msg: Message) => markMessageAsRead(msg.id));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const updateTypingStatus = async (typing: boolean) => {
    try {
      await supabase
        .from('typing_status')
        .update({ is_typing: typing, updated_at: new Date().toISOString() })
        .eq('user_name', displayName);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status to true
    if (value && !isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData: any = {
        from_user: displayName,
        to_user: partnerName,
        content: newMessage.trim(),
        message_type: 'text',
      };

      // Add reply data if replying
      if (replyingTo) {
        messageData.reply_to_message_id = replyingTo.id;
        messageData.reply_to_content = String(replyingTo.content || '').substring(0, 100); // Store first 100 chars
        messageData.reply_to_user = replyingTo.from_user;
      }

      const { error } = await supabase.from('messages').insert(messageData);

      if (error) throw error;

      setNewMessage('');
      setReplyingTo(null);
      setIsTyping(false);
      updateTypingStatus(false);
      scrollToBottom();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendSpecialMessage = async (type: 'hug' | 'kiss') => {
    try {
      const content = type === 'hug' ? '🤗 Sending you a big hug!' : '😘 Sending you a kiss!';
      const { error } = await supabase.from('messages').insert({
        from_user: displayName,
        to_user: partnerName,
        content,
        message_type: type,
      });

      if (error) throw error;

      toast({
        title: type === 'hug' ? '🤗 Hug Sent!' : '😘 Kiss Sent!',
        description: `Your ${type} has been sent to ${partnerName}!`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send ${type}`,
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${displayName}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('chat-media').getPublicUrl(fileName);

    return publicUrl;
  };

  const sendFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setIsSending(true);

    try {
      const fileUrl = await uploadFile(selectedFile);
      const fileType = selectedFile.type.split('/')[0]; // 'image', 'video', 'application', etc.

      const messageData: any = {
        from_user: displayName,
        to_user: partnerName,
        content: `Sent a file: ${selectedFile.name}`,
        message_type: 'file',
        file_url: fileUrl,
        file_name: selectedFile.name,
        file_type: fileType,
        file_size: selectedFile.size,
      };

      // Add reply data if replying
      if (replyingTo) {
        messageData.reply_to_message_id = replyingTo.id;
        messageData.reply_to_content = String(replyingTo.content || '').substring(0, 100);
        messageData.reply_to_user = replyingTo.from_user;
      }

      const { error } = await supabase.from('messages').insert(messageData);

      if (error) throw error;

      setSelectedFile(null);
      setReplyingTo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: '📎 File sent!',
        description: 'Your file has been delivered',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setIsSending(false);
    }
  };

  const getFileIcon = (fileType: string | null | undefined) => {
    if (!fileType) return <FileText className="w-4 h-4" />;
    if (fileType === 'image') return <ImageIcon className="w-4 h-4" />;
    if (fileType === 'video') return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      // Check if user already reacted
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_name', displayName)
        .single();

      if (existing) {
        // Update existing reaction
        await supabase
          .from('message_reactions')
          .update({ reaction_emoji: emoji })
          .eq('id', existing.id);
      } else {
        // Add new reaction
        await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_name: displayName,
          reaction_emoji: emoji,
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goBack = () => {
    navigate(currentSpace === 'cookie' ? '/cookie' : '/senorita');
  };

  const getMessageColor = (fromUser: string) => {
    if (fromUser === 'Cookie') return 'bg-blue-500 text-white';
    return 'bg-pink-500 text-white';
  };

  const getMessageAlignment = (fromUser: string) => {
    return fromUser === displayName ? 'justify-end' : 'justify-start';
  };

  const handleImageClick = (url: string) => {
    setImagePreview(url);
  };

  // Safe content renderer - fixes React error #31
  const renderMessageContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return String(content);
    if (content === null || content === undefined) return '';
    // If it's an object, stringify it
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Desktop Split Layout */}
      <div className="flex flex-1 w-full max-w-full">
        {/* Left Sidebar - Only visible on desktop */}
        <div className="hidden lg:flex lg:w-[calc(100%-420px)] xl:w-[calc(100%-420px)] border-r border-primary/30 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <RelationshipSidebar />
        </div>

        {/* Right Chat Panel - Full width on mobile, fixed width on desktop */}
        <div 
          className="flex-1 lg:w-[420px] lg:max-w-[420px] lg:flex-none flex flex-col relative bg-background"
        >
          {/* Background and hearts container - only for messages area */}
          <div className="absolute inset-0 pointer-events-none">
            {!chatBackground && <FloatingHearts />}
          </div>
          
          {/* Fixed Header */}
          <div className="fixed top-0 right-0 z-50 w-full lg:w-[420px] bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goBack}
                  data-testid="back-button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">
                    {partnerName} <Heart className="inline w-4 h-4 text-primary fill-current" />
                  </h1>
                  {partnerIsTyping && (
                    <p className="text-xs text-muted-foreground">typing...</p>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => sendSpecialMessage('hug')}>
                    🤗 Send Virtual Hug
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => sendSpecialMessage('kiss')}>
                    😘 Send Virtual Kiss
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages - with padding for fixed header and footer, background applied here */}
          <div 
            className="flex-1 overflow-y-auto pt-20 pb-40 relative z-10 p-4"
            style={{
              background: chatBackground 
                ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${chatBackground}) center/cover`
                : undefined
            }}
          >
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${getMessageAlignment(message.from_user)}`}
                  >
                    <div className="max-w-[70%]">
                      <Card
                        className={`p-3 ${getMessageColor(message.from_user)} shadow-lg`}
                        data-testid="chat-message"
                      >
                        {/* Reply indicator */}
                        {message.reply_to_content && (
                          <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/50">
                            <p className="text-xs opacity-70">{message.reply_to_user}</p>
                            <p className="text-sm opacity-90">{renderMessageContent(message.reply_to_content)}</p>
                          </div>
                        )}

                        {message.message_type === 'hug' && (
                          <div className="text-center text-4xl mb-2">🤗</div>
                        )}
                        {message.message_type === 'kiss' && (
                          <div className="text-center text-4xl mb-2">😘</div>
                        )}
                        {message.message_type === 'file' && (
                          <div className="space-y-2">
                            {message.file_type === 'image' && message.file_url ? (
                              <div onClick={() => handleImageClick(message.file_url!)}>
                                <img
                                  src={message.file_url}
                                  alt={message.file_name || 'Image'}
                                  className="max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                />
                              </div>
                            ) : message.file_type === 'video' && message.file_url ? (
                              <video
                                src={message.file_url}
                                controls
                                className="max-w-full h-auto rounded-lg max-h-64"
                              />
                            ) : (
                              <a
                                href={message.file_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                              >
                                {getFileIcon(message.file_type)}
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">
                                    {message.file_name || 'File'}
                                  </p>
                                  <p className="text-xs opacity-70">
                                    {formatFileSize(message.file_size)}
                                  </p>
                                </div>
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words">{renderMessageContent(message.content)}</p>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {message.reactions.map((reaction) => (
                              <span
                                key={reaction.id}
                                className="text-sm bg-white/20 px-2 py-1 rounded-full"
                              >
                                {reaction.reaction_emoji}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {message.from_user === displayName && (
                            <span>
                              {message.is_read ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </Card>

                      {/* Quick reactions and reply */}
                      <div className="flex gap-1 mt-1 text-sm items-center">
                        {['❤️', '😍', '😊', '👍', '🔥'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className="hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          onClick={() => setReplyingTo(message)}
                          className="ml-2 p-1 hover:bg-primary/10 rounded-md transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input Footer */}
          <div className="fixed bottom-0 right-0 z-50 w-full lg:w-[420px] bg-card/95 backdrop-blur-md border-t border-border/50 shadow-lg">
            <div className="px-4 py-4">
              {/* Reply preview */}
              {replyingTo && (
                <div className="mb-3 p-3 bg-primary/10 rounded-lg flex items-start gap-3">
                  <Reply className="w-5 h-5 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Replying to {replyingTo.from_user}
                    </p>
                    <p className="text-sm line-clamp-2">{renderMessageContent(replyingTo.content)}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setReplyingTo(null)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Selected file preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-primary/10 rounded-lg flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2 items-end">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                />

                {/* File upload button */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isUploading}
                  data-testid="file-upload-button"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedFile ? "Add a message (optional)..." : "Type a message..."}
                    className="resize-none"
                    disabled={isSending || isUploading}
                    data-testid="message-input"
                  />
                </div>

                {selectedFile ? (
                  <Button
                    onClick={sendFile}
                    disabled={isUploading}
                    size="icon"
                    data-testid="send-file-button"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    size="icon"
                    data-testid="send-button"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img 
              src={imagePreview || ''} 
              alt="Preview" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button
              className="absolute top-2 right-2"
              size="icon"
              variant="secondary"
              onClick={() => setImagePreview(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
