import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Send a message
   */
  async sendMessage(senderId: string, data: SendMessageDto) {
    // Validate content length
    if (data.content.length > 1000) {
      throw new BadRequestException('Message must not exceed 1000 characters');
    }

    // Check if receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: data.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    if (!receiver.isActive || !receiver.isVerified) {
      throw new BadRequestException('Cannot send message to inactive or unverified user');
    }

    // Check sender's message rate limit (50 messages per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMessages = await this.prisma.message.count({
      where: {
        senderId,
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    });

    if (recentMessages >= 50) {
      throw new BadRequestException('Message rate limit exceeded. Please wait before sending more messages.');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        content: data.content,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    return message;
  }

  /**
   * Get conversation between two users
   */
  async findConversation(userId: string, otherUserId: string, skip = 0, take = 50) {
    // Verify other user exists
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
      },
    });

    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
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
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    return {
      otherUser,
      messages: messages.reverse(), // Reverse to show oldest first
    };
  }

  /**
   * Get all conversations for a user (list of users they've chatted with)
   */
  async getConversations(userId: string) {
    // Get all messages where user is sender or receiver
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
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
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages (messages sent to current user that are unread)
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    return Array.from(conversationsMap.values());
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: string, otherUserId: string) {
    // Mark all messages from otherUser to currentUser as read
    const result = await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      message: 'Messages marked as read',
      count: result.count,
    };
  }

  /**
   * Delete a message (soft delete by the sender)
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete the message
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return { message: 'Message deleted successfully' };
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }
}
