import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
  };

  const mockNotification = {
    id: 'notification-123',
    recipientId: 'user-123',
    senderId: 'user-456',
    type: 'post_like',
    title: 'New like on your post',
    message: 'Jane Doe liked your post',
    link: '/posts/post-123',
    isRead: false,
    createdAt: new Date(),
    sender: mockUser,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createData = {
      recipientId: 'user-123',
      senderId: 'user-456',
      type: 'post_like',
      title: 'New like',
      message: 'Someone liked your post',
    };

    it('should create a notification successfully', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await service.create(createData);

      expect(result).toEqual(mockNotification);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('createPostLikeNotification', () => {
    it('should create like notification successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await service.createPostLikeNotification('post-123', 'user-456', 'user-123');

      expect(result).toEqual(mockNotification);
    });

    it('should not create notification when liker is author', async () => {
      const result = await service.createPostLikeNotification('post-123', 'user-123', 'user-123');

      expect(result).toBeUndefined();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should not create notification when liker not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.createPostLikeNotification('post-123', 'user-456', 'user-123');

      expect(result).toBeUndefined();
    });
  });

  describe('createCommentNotification', () => {
    it('should create comment notification successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await service.createCommentNotification('post-123', 'user-456', 'user-123');

      expect(result).toEqual(mockNotification);
    });

    it('should not create notification when commenter is author', async () => {
      const result = await service.createCommentNotification('post-123', 'user-123', 'user-123');

      expect(result).toBeUndefined();
    });
  });

  describe('createFollowNotification', () => {
    it('should create follow notification successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await service.createFollowNotification('user-456', 'user-123');

      expect(result).toEqual(mockNotification);
    });

    it('should not create notification when follower not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.createFollowNotification('user-456', 'user-123');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUser', () => {
    it('should return user notifications', async () => {
      const notifications = [mockNotification];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

      const result = await service.findByUser('user-123');

      expect(result).toEqual(notifications);
    });

    it('should support pagination', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

      await service.findByUser('user-123', 10, 20);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 20,
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      (prisma.notification.update as jest.Mock).mockResolvedValue(readNotification);

      const result = await service.markAsRead('user-123', 'notification-123');

      expect((result as typeof readNotification).isRead).toBe(true);
    });

    it('should mark all notifications as read when no id provided', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await service.markAsRead('user-123');

      expect((result as { message: string; count: number }).count).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValue(10);

      const result = await service.getUnreadCount('user-123');

      expect(result.unreadCount).toBe(10);
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      (prisma.notification.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.delete('user-123', 'notification-123');

      expect(result.count).toBe(1);
    });
  });
});
