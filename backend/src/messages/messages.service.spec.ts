import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
    isActive: true,
    isVerified: true,
  };

  const mockReceiver = {
    id: 'user-456',
    firstName: 'Jane',
    lastName: 'Doe',
    profilePicture: null,
    isActive: true,
    isVerified: true,
  };

  const mockMessage = {
    id: 'message-123',
    senderId: 'user-123',
    receiverId: 'user-456',
    content: 'Hello!',
    isRead: false,
    createdAt: new Date(),
    sender: mockUser,
    receiver: mockReceiver,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      message: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const sendMessageDto = {
      receiverId: 'user-456',
      content: 'Hello!',
    };

    it('should send a message successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockReceiver);
      (prisma.message.count as jest.Mock).mockResolvedValue(0);
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await service.sendMessage('user-123', sendMessageDto);

      expect(result).toEqual(mockMessage);
    });

    it('should throw BadRequestException when content exceeds 1000 characters', async () => {
      const longMessageDto = {
        receiverId: 'user-456',
        content: 'a'.repeat(1001),
      };

      await expect(service.sendMessage('user-123', longMessageDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when receiver not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive receiver', async () => {
      const inactiveReceiver = { ...mockReceiver, isActive: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveReceiver);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unverified receiver', async () => {
      const unverifiedReceiver = { ...mockReceiver, isVerified: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(unverifiedReceiver);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when rate limit exceeded', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockReceiver);
      (prisma.message.count as jest.Mock).mockResolvedValue(50);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findConversation', () => {
    it('should return conversation between two users', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockReceiver);
      (prisma.message.findMany as jest.Mock).mockResolvedValue([mockMessage]);

      const result = await service.findConversation('user-123', 'user-456');

      expect(result.otherUser).toEqual(mockReceiver);
      expect(result.messages).toHaveLength(1);
    });

    it('should throw NotFoundException when other user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findConversation('user-123', 'nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversations', () => {
    it('should return list of conversations', async () => {
      const messages = [mockMessage];
      (prisma.message.findMany as jest.Mock).mockResolvedValue(messages);

      const result = await service.getConversations('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].user).toEqual(mockReceiver);
    });

    it('should count unread messages correctly', async () => {
      const unreadMessage = { ...mockMessage, senderId: 'user-456', receiverId: 'user-123', isRead: false };
      (prisma.message.findMany as jest.Mock).mockResolvedValue([unreadMessage]);

      const result = await service.getConversations('user-123');

      expect(result[0].unreadCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      (prisma.message.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await service.markAsRead('user-123', 'user-456');

      expect(result.count).toBe(5);
      expect(prisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          senderId: 'user-456',
          receiverId: 'user-123',
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    });
  });

  describe('deleteMessage', () => {
    it('should delete message when user is sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.message.delete as jest.Mock).mockResolvedValue(mockMessage);

      const result = await service.deleteMessage('message-123', 'user-123');

      expect(result.message).toContain('deleted successfully');
    });

    it('should throw NotFoundException when message not found', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteMessage('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);

      await expect(service.deleteMessage('message-123', 'user-456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      (prisma.message.count as jest.Mock).mockResolvedValue(10);

      const result = await service.getUnreadCount('user-123');

      expect(result.unreadCount).toBe(10);
    });
  });
});
