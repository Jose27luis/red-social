import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('MessagesController', () => {
  let controller: MessagesController;
  let messagesService: jest.Mocked<MessagesService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockMessage = {
    id: 'message-123',
    senderId: 'user-123',
    receiverId: 'user-456',
    content: 'Hello!',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockMessagesService = {
      sendMessage: jest.fn(),
      getConversations: jest.fn(),
      findConversation: jest.fn(),
      markAsRead: jest.fn(),
      deleteMessage: jest.fn(),
      getUnreadCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: mockMessagesService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessagesController>(MessagesController);
    messagesService = module.get(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const sendDto = { receiverId: 'user-456', content: 'Hello!' };
      messagesService.sendMessage.mockResolvedValue(mockMessage as any);

      const result = await controller.sendMessage(mockUser, sendDto);

      expect(result).toEqual(mockMessage);
      expect(messagesService.sendMessage).toHaveBeenCalledWith(mockUser.id, sendDto);
    });
  });

  describe('getConversations', () => {
    it('should return all conversations', async () => {
      const conversations = [{ user: { id: 'user-456', firstName: 'Jane' }, lastMessage: mockMessage, unreadCount: 2 }];
      messagesService.getConversations.mockResolvedValue(conversations as any);

      const result = await controller.getConversations(mockUser);

      expect(result).toEqual(conversations);
    });
  });

  describe('getConversation', () => {
    it('should return conversation with specific user', async () => {
      const conversation = {
        otherUser: { id: 'user-456', firstName: 'Jane' },
        messages: [mockMessage],
      };
      messagesService.findConversation.mockResolvedValue(conversation as any);

      const result = await controller.getConversation(mockUser, 'user-456', 1, 50);

      expect(result).toEqual(conversation);
      expect(messagesService.findConversation).toHaveBeenCalledWith(mockUser.id, 'user-456', 0, 50);
    });

    it('should handle pagination correctly', async () => {
      messagesService.findConversation.mockResolvedValue({} as any);

      await controller.getConversation(mockUser, 'user-456', 3, 20);

      expect(messagesService.findConversation).toHaveBeenCalledWith(mockUser.id, 'user-456', 40, 20);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      const response = { message: 'Messages marked as read', count: 5 };
      messagesService.markAsRead.mockResolvedValue(response);

      const result = await controller.markAsRead(mockUser, 'user-456');

      expect(result).toEqual(response);
      expect(messagesService.markAsRead).toHaveBeenCalledWith(mockUser.id, 'user-456');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const response = { message: 'Message deleted successfully' };
      messagesService.deleteMessage.mockResolvedValue(response);

      const result = await controller.deleteMessage(mockUser, 'message-123');

      expect(result).toEqual(response);
      expect(messagesService.deleteMessage).toHaveBeenCalledWith('message-123', mockUser.id);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      const response = { unreadCount: 10 };
      messagesService.getUnreadCount.mockResolvedValue(response);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual(response);
    });
  });
});
