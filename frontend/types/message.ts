export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface SendMessageDto {
  receiverId: string;
  content: string;
}

export interface PaginatedMessages {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
