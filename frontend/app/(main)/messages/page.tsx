'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';
import { MessageCircle, Send } from 'lucide-react';
import useSocket from '@/hooks/useSocket';
import { SafeHTML } from '@/components/SafeHTML';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface Conversation {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount?: number;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const { isConnected, onlineUsers, emit, on, off } = useSocket({
    namespace: '/messages',
    autoConnect: true,
  });

  // Fetch conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CONVERSATIONS,
    queryFn: () => messagesApi.getConversations(),
  });

  // Fetch messages for selected conversation
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: [QUERY_KEYS.CONVERSATION, selectedConversation],
    queryFn: () => messagesApi.getConversation(selectedConversation!),
    enabled: !!selectedConversation,
  });

  const conversations = conversationsData?.data || [];
  const activeConversation = conversations.find(
    (conversation: Conversation) => conversation.user.id === selectedConversation
  );
  const messages: Message[] = useMemo(
    () => (Array.isArray(messagesData?.data) ? messagesData?.data : []),
    [messagesData]
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!selectedConversation) throw new Error('No conversation selected');
      return messagesApi.sendMessage({
        receiverId: selectedConversation,
        content,
      });
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
      refetchMessages();
    },
  });

  // WebSocket event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Escuchar mensajes recibidos
    const handleMessageReceived = (message: Message) => {
      console.log('Message received:', message);

      // Si el mensaje es de la conversación actual, actualizar
      if (message.senderId === selectedConversation) {
        refetchMessages();

        // Marcar como leído automáticamente
        emit('message:read', { conversationUserId: selectedConversation });
      }

      // Actualizar lista de conversaciones
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
    };

    // Escuchar confirmación de mensaje enviado
    const handleMessageSent = (message: Message) => {
      console.log('Message sent:', message);
      refetchMessages();
    };

    // Escuchar indicador de "escribiendo"
    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === selectedConversation) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    // Escuchar mensajes leídos
    const handleMessagesRead = (data: { userId: string }) => {
      console.log('Messages read by:', data.userId);
      refetchMessages();
    };

    on('message:received', handleMessageReceived);
    on('message:sent', handleMessageSent);
    on('user:typing', handleUserTyping);
    on('messages:read', handleMessagesRead);

    return () => {
      off('message:received', handleMessageReceived);
      off('message:sent', handleMessageSent);
      off('user:typing', handleUserTyping);
      off('messages:read', handleMessagesRead);
    };
  }, [isConnected, selectedConversation, emit, on, off, refetchMessages, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation && isConnected) {
      emit('message:read', { conversationUserId: selectedConversation });
    }
  }, [selectedConversation, isConnected, emit]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() || !selectedConversation) return;

    // Enviar vía WebSocket si está conectado, sino vía HTTP
    if (isConnected) {
      emit('message:send', {
        receiverId: selectedConversation,
        content: messageContent.trim(),
      });
      setMessageContent('');
    } else {
      sendMessageMutation.mutate(messageContent.trim());
    }

    // Detener indicador de "escribiendo"
    emit('message:typing', { receiverId: selectedConversation, isTyping: false });
  };

  const handleTyping = (value: string) => {
    setMessageContent(value);

    if (!selectedConversation || !isConnected) return;

    // Enviar indicador de "escribiendo"
    emit('message:typing', { receiverId: selectedConversation, isTyping: true });

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Detener indicador después de 2 segundos sin escribir
    typingTimeoutRef.current = setTimeout(() => {
      emit('message:typing', { receiverId: selectedConversation, isTyping: false });
    }, 2000);
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-5">
      <div className="hidden w-[330px] flex-none flex-col overflow-hidden rounded-[15px] border border-border bg-card shadow-sm md:flex">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h1 className="font-serif text-xl font-bold text-foreground">Mensajes</h1>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            {isConnected ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tienes conversaciones aún.</p>
            </div>
          ) : (
            conversations.map((conversation: Conversation) => {
              const isOnline = isUserOnline(conversation.user.id);
              const isSelected = selectedConversation === conversation.user.id;
              return (
                <button
                  key={conversation.user.id}
                  onClick={() => setSelectedConversation(conversation.user.id)}
                  className={`flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-accent' : 'hover:bg-muted'
                  }`}
                >
                  <div className="relative flex-none">
                    <Avatar className="h-11 w-11 rounded-xl">
                      <AvatarImage src={conversation.user.profilePicture} />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#b01e54] to-[#e23e7d] text-[13px] font-bold text-white">
                        {getInitials(conversation.user.firstName, conversation.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-foreground">
                        {conversation.user.firstName} {conversation.user.lastName}
                      </span>
                      {conversation.lastMessage && (
                        <span className="flex-none text-[11px] text-muted-foreground">
                          {new Date(conversation.lastMessage.createdAt).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] text-muted-foreground">
                        {conversation.lastMessage?.content || 'Sin mensajes'}
                      </span>
                      {(conversation.unreadCount ?? 0) > 0 && (
                        <span className="flex h-[18px] min-w-[18px] flex-none items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[15px] border border-border bg-muted shadow-sm">
        {!selectedConversation || !activeConversation ? (
          <div className="flex flex-1 items-center justify-center bg-card">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">Selecciona una conversación</h3>
              <p className="text-sm text-muted-foreground">
                Elige una conversación de la lista para comenzar a chatear
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-16 flex-none items-center gap-3 border-b border-border bg-card px-5">
              <Avatar className="h-10 w-10 rounded-[11px]">
                <AvatarImage src={activeConversation.user.profilePicture} />
                <AvatarFallback className="rounded-[11px] bg-gradient-to-br from-[#b01e54] to-[#e23e7d] text-xs font-bold text-white">
                  {getInitials(activeConversation.user.firstName, activeConversation.user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">
                  {activeConversation.user.firstName} {activeConversation.user.lastName}
                </div>
                {isUserOnline(activeConversation.user.id) && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    En línea
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
              {messages.map((message) => {
                const isMine = message.senderId === user?.id;
                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[62%] px-4 py-2.5 text-[13.5px] leading-relaxed ${
                        isMine
                          ? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-2xl rounded-bl-sm border border-border bg-card text-foreground'
                      }`}
                    >
                      <SafeHTML content={message.content} level="strict" className="break-words" />
                      <p
                        className={`mt-1 text-[10.5px] ${
                          isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isMine && message.isRead && <span className="ml-1">✓✓</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />

              {typingUsers.has(selectedConversation) && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-border bg-card px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex flex-none items-center gap-2.5 border-t border-border bg-card px-5 py-3.5"
            >
              <input
                type="text"
                aria-label="Escribe un mensaje"
                value={messageContent}
                onChange={(e) => handleTyping(e.target.value)}
                className="h-11 flex-1 rounded-xl border border-input bg-secondary px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
                maxLength={1000}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                className="h-11 w-11 rounded-xl"
              >
                <Send className="h-[18px] w-[18px]" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
