'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';
import { MessageCircle, Send, Circle } from 'lucide-react';
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
  const messages: Message[] = useMemo(
    () => messagesData?.data?.messages || [],
    [messagesData?.data?.messages]
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mensajes</h1>
        <div className="flex items-center gap-2">
          <Circle
            className={`h-3 w-3 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <h2 className="font-bold mb-4">Conversaciones</h2>

              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    No tienes conversaciones aún.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation: Conversation) => {
                    const isOnline = isUserOnline(conversation.user.id);
                    const isSelected = selectedConversation === conversation.user.id;

                    return (
                      <div
                        key={conversation.user.id}
                        onClick={() => setSelectedConversation(conversation.user.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.user.profilePicture} />
                            <AvatarFallback>
                              {getInitials(
                                conversation.user.firstName,
                                conversation.user.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conversation.user.firstName} {conversation.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || 'Sin mensajes'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      Selecciona una conversación
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Elige una conversación de la lista para comenzar a chatear
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages.map((message) => {
                      const isMine = message.senderId === user?.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMine
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <SafeHTML
                              content={message.content}
                              level="strict"
                              className="text-sm break-words"
                            />
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {isMine && message.isRead && (
                                <span className="ml-1">✓✓</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />

                    {/* Typing Indicator */}
                    {typingUsers.has(selectedConversation) && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="border-t pt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        maxLength={1000}
                      />
                      <Button
                        type="submit"
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
