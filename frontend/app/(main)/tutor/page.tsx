'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tutorApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { Bot, Send, Plus, Trash2, Sparkles, User } from 'lucide-react';
import { TutorConversation, TutorMessage } from '@/types';
import ReactMarkdown from 'react-markdown';

export default function TutorPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener lista de conversaciones
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TUTOR_CONVERSATIONS,
    queryFn: () => tutorApi.getConversations(),
  });

  // Obtener mensajes de la conversacion seleccionada
  const { data: conversationData, refetch: refetchConversation } = useQuery({
    queryKey: QUERY_KEYS.TUTOR_CONVERSATION(selectedConversation || ''),
    queryFn: () => tutorApi.getConversation(selectedConversation!),
    enabled: !!selectedConversation,
  });

  const conversations = conversationsData?.data || [];
  const messages: TutorMessage[] = useMemo(
    () => conversationData?.data?.messages || [],
    [conversationData?.data?.messages]
  );

  // Mutacion para enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      return tutorApi.sendMessage({
        content,
        conversationId: selectedConversation || undefined,
      });
    },
    onMutate: () => {
      setIsThinking(true);
    },
    onSuccess: (response) => {
      setMessageContent('');
      setIsThinking(false);

      // Si es una nueva conversacion, seleccionarla
      if (!selectedConversation && response.data) {
        setSelectedConversation(response.data.conversationId);
      }

      // Actualizar listas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TUTOR_CONVERSATIONS });
      if (selectedConversation) {
        refetchConversation();
      }
    },
    onError: () => {
      setIsThinking(false);
    },
  });

  // Mutacion para eliminar conversacion
  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => tutorApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TUTOR_CONVERSATIONS });
      if (selectedConversation) {
        setSelectedConversation(null);
      }
    },
  });

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent.trim());
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversationMutation.mutate(id);
  };

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
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#b01e54] to-[#e23e7d] shadow-lg shadow-primary/30">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Tutor IA</h1>
            <p className="text-sm text-muted-foreground">
              Tu asistente academico con inteligencia artificial
            </p>
          </div>
        </div>
        <Button onClick={handleNewConversation} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nueva conversacion
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)]">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <h2 className="font-bold mb-4">Historial</h2>

              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Inicia una nueva conversacion
                  </p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-22rem)]">
                  {conversations.map((conversation: TutorConversation) => {
                    const isSelected = selectedConversation === conversation.id;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {conversation.title || 'Sin titulo'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage || 'Sin mensajes'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {!selectedConversation && messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="h-16 w-16 mx-auto mb-6 rounded-[18px] bg-gradient-to-br from-[#b01e54] to-[#e23e7d] shadow-lg shadow-primary/30 flex items-center justify-center">
                        <Bot className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        Hola {user?.firstName}!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Soy tu tutor academico de UNAMAD. Puedo ayudarte con:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm text-left">
                        <button
                          type="button"
                          onClick={() => sendMessageMutation.mutate('Ayudame con una duda academica')}
                          disabled={isThinking}
                          className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50"
                        >
                          📚 Resolver dudas academicas
                        </button>
                        <button
                          type="button"
                          onClick={() => sendMessageMutation.mutate('Busca estudiantes de mi carrera')}
                          disabled={isThinking}
                          className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50"
                        >
                          🔍 Buscar companeros de estudio
                        </button>
                        <button
                          type="button"
                          onClick={() => sendMessageMutation.mutate('Quiero enviar un mensaje a alguien')}
                          disabled={isThinking}
                          className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50"
                        >
                          💬 Enviar mensajes por ti
                        </button>
                        <button
                          type="button"
                          onClick={() => sendMessageMutation.mutate('Que eventos hay disponibles?')}
                          disabled={isThinking}
                          className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50"
                        >
                          📅 Inscribirte a eventos
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isUser = message.role === 'user';

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isUser && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-r from-[#b01e54] to-[#e23e7d] text-white">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-3 ${
                              isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {isUser ? (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            ) : (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            )}
                            <p className="text-xs mt-2 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {isUser && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {isThinking && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-[#b01e54] to-[#e23e7d] text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    aria-label="Escribe tu mensaje al tutor..."
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={2000}
                    disabled={isThinking}
                  />
                  <Button
                    type="submit"
                    disabled={!messageContent.trim() || isThinking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Puedes pedirme que busque usuarios, envie mensajes, o te ayude con temas academicos.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
