import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { recipientId: string; senderId?: string; type: string; title: string; message: string; link?: string }) {
    return this.prisma.notification.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  async createPostLikeNotification(postId: string, likerId: string, postAuthorId: string) {
    if (likerId === postAuthorId) return; // Don't notify yourself

    const liker = await this.prisma.user.findUnique({ where: { id: likerId } });
    if (!liker) return;

    return this.create({
      recipientId: postAuthorId,
      senderId: likerId,
      type: 'post_like',
      title: 'New like on your post',
      message: `${liker.firstName} ${liker.lastName} liked your post`,
      link: `/posts/${postId}`,
    });
  }

  async createCommentNotification(postId: string, commenterId: string, postAuthorId: string) {
    if (commenterId === postAuthorId) return;

    const commenter = await this.prisma.user.findUnique({ where: { id: commenterId } });
    if (!commenter) return;

    return this.create({
      recipientId: postAuthorId,
      senderId: commenterId,
      type: 'post_comment',
      title: 'New comment on your post',
      message: `${commenter.firstName} ${commenter.lastName} commented on your post`,
      link: `/posts/${postId}`,
    });
  }

  async createFollowNotification(followerId: string, followingId: string) {
    const follower = await this.prisma.user.findUnique({ where: { id: followerId } });
    if (!follower) return;

    return this.create({
      recipientId: followingId,
      senderId: followerId,
      type: 'new_follower',
      title: 'New follower',
      message: `${follower.firstName} ${follower.lastName} started following you`,
      link: `/users/${followerId}`,
    });
  }

  async findByUser(userId: string, skip = 0, take = 50) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      return this.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    // Mark all as read
    const result = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read', count: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });

    return { unreadCount: count };
  }

  async delete(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });
  }
}
