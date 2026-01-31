import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Smile,
  Heart,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSpace } from '@/contexts/SpaceContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import FloatingHearts from '@/components/FloatingHearts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  message_type: 'text' | 'image' | 'hug' | 'kiss';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  reactions?: MessageReaction[];
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

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
      const { error } = await supabase.from('messages').insert({
        from_user: displayName,
        to_user: partnerName,
        content: newMessage.trim(),
        message_type: 'text',
      });

      if (error) throw error;

      setNewMessage('');
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <FloatingHearts />

      {/* Header */}
      <div className="relative z-10 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative z-10 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
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
                    {message.message_type === 'hug' && (
                      <div className="text-center text-4xl mb-2">🤗</div>
                    )}
                    {message.message_type === 'kiss' && (
                      <div className="text-center text-4xl mb-2">😘</div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

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

                  {/* Quick reactions */}
                  <div className="flex gap-1 mt-1 text-sm">
                    {['❤️', '😍', '😊', '👍', '🔥'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(message.id, emoji)}
                        className="hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 bg-card/80 backdrop-blur-md border-t border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="resize-none"
                disabled={isSending}
                data-testid="message-input"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              data-testid="send-button"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
