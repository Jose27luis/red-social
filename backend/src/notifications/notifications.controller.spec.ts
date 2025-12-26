import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockNotification = {
    id: 'notification-123',
    userId: 'user-123',
    type: 'NEW_FOLLOWER',
    message: 'John Doe started following you',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockNotificationsService = {
      findByUser: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockNotificationsService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('should return paginated notifications', async () => {
      const notifications = [mockNotification];
      notificationsService.findByUser.mockResolvedValue(notifications as any);

      const result = await controller.getMyNotifications(mockUser, 1, 50);

      expect(result).toEqual(notifications);
      expect(notificationsService.findByUser).toHaveBeenCalledWith(mockUser.id, 0, 50);
    });

    it('should handle pagination correctly', async () => {
      notificationsService.findByUser.mockResolvedValue([]);

      await controller.getMyNotifications(mockUser, 3, 20);

      expect(notificationsService.findByUser).toHaveBeenCalledWith(mockUser.id, 40, 20);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const response = { unreadCount: 5 };
      notificationsService.getUnreadCount.mockResolvedValue(response);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual(response);
      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const response = { message: 'Notifications marked as read', count: 10 };
      notificationsService.markAsRead.mockResolvedValue(response);

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual(response);
      expect(notificationsService.markAsRead).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('markAsRead', () => {
    it('should mark specific notification as read', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      notificationsService.markAsRead.mockResolvedValue(readNotification as any);

      const result = await controller.markAsRead('notification-123', mockUser);

      expect(result).toEqual(readNotification);
      expect(notificationsService.markAsRead).toHaveBeenCalledWith(mockUser.id, 'notification-123');
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      notificationsService.delete.mockResolvedValue(mockNotification as any);

      const result = await controller.delete('notification-123', mockUser);

      expect(result).toEqual(mockNotification);
      expect(notificationsService.delete).toHaveBeenCalledWith(mockUser.id, 'notification-123');
    });
  });
});
