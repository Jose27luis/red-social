'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tutorApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { Bot, Send, X, Minimize2, Maximize2, User } from 'lucide-react';
import { TutorMessage } from '@/types';
import ReactMarkdown from 'react-markdown';

export default function TutorWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Mutacion para enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      return tutorApi.sendMessage({
        content,
        conversationId: conversationId || undefined,
      });
    },
    onMutate: (content) => {
      setIsThinking(true);
      // Agregar mensaje del usuario optimisticamente
      const userMessage: TutorMessage = {
        id: `temp-${Date.now()}`,
        conversationId: conversationId || '',
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
    },
    onSuccess: (response) => {
      setMessageContent('');
      setIsThinking(false);

      if (response.data) {
        // Actualizar conversationId si es nueva
        if (!conversationId) {
          setConversationId(response.data.conversationId);
        }

        // Agregar respuesta del asistente
        const assistantMessage: TutorMessage = {
          id: response.data.message.id,
          conversationId: response.data.conversationId,
          role: 'assistant',
          content: response.data.message.content,
          createdAt: response.data.message.createdAt,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TUTOR_CONVERSATIONS });
    },
    onError: () => {
      setIsThinking(false);
      // Remover el mensaje temporal del usuario en caso de error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent.trim());
  };

  const handleQuickAction = (message: string) => {
    sendMessageMutation.mutate(message);
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  // No mostrar si no esta autenticado
  if (!isAuthenticated) return null;

  const widgetSize = isExpanded
    ? 'w-[500px] h-[600px]'
    : 'w-[380px] h-[500px]';

  return (
    <>
      {/* Boton flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Tutor IA"
        >
          <Bot className="h-7 w-7 text-white" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Widget del chat */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 ${widgetSize} bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Tutor IA</h3>
                <p className="text-xs text-white/80">Tu asistente academico</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-purple-500" />
                  </div>
                  <h4 className="font-bold mb-2">Hola {user?.firstName}!</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Soy tu tutor academico. Puedo ayudarte con:
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => handleQuickAction('Tengo una duda academica')}
                      disabled={isThinking}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50 text-xs"
                    >
                      📚 Dudas academicas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAction('Busca estudiantes de mi carrera')}
                      disabled={isThinking}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50 text-xs"
                    >
                      🔍 Buscar companeros
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAction('Que eventos hay disponibles?')}
                      disabled={isThinking}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left disabled:opacity-50 text-xs"
                    >
                      📅 Ver eventos
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
                      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {isUser ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {isUser && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}

                {/* Indicador de pensando */}
                {isThinking && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer con input */}
          <div className="border-t p-3">
            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="text-xs text-muted-foreground hover:text-foreground mb-2 block"
              >
                + Nueva conversacion
              </button>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={2000}
                disabled={isThinking}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!messageContent.trim() || isThinking}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
