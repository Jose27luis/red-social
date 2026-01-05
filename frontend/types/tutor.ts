// Tipos para Tutor IA

export interface TutorMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface TutorConversation {
  id: string;
  title: string | null;
  lastMessage: string | null;
  updatedAt: string;
}

export interface TutorConversationWithMessages {
  id: string;
  title: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: TutorMessage[];
}

export interface SendTutorMessageDto {
  content: string;
  conversationId?: string;
}

export interface TutorChatResponse {
  conversationId: string;
  message: TutorMessage;
  actionsExecuted: number;
}
