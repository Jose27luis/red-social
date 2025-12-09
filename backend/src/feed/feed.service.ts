import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getPersonalizedFeed(userId: string, skip = 0, take = 20) {
    // Get user's interests and following
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: true,
        groupMemberships: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const followingIds = user.following.map(f => f.followingId);
    const groupIds = user.groupMemberships.map(m => m.groupId);

    // Personalized algorithm: Posts from followed users, user's groups, and posts matching interests
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          { authorId: { in: followingIds } }, // Posts from followed users
          { groupId: { in: groupIds } }, // Posts from user's groups
          { author: { interests: { hasSome: user.interests } } }, // Posts from users with similar interests
        ],
      },
      skip,
      take,
      orderBy: [
        { likesCount: 'desc' }, // More liked posts first
        { createdAt: 'desc' }, // Then by date
      ],
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // If not enough personalized posts, fill with general posts
    if (posts.length < take) {
      const generalPosts = await this.prisma.post.findMany({
        where: {
          id: { notIn: posts.map(p => p.id) },
        },
        take: take - posts.length,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              role: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      posts.push(...generalPosts);
    }

    return posts;
  }
}
