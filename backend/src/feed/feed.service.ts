import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new NotFoundException('User not found');
    }

    const followingIds = user.following.map((f) => f.followingId);

    // Build where clause - if user has no following/groups/interests, get all posts
    // IMPORTANT: Only show posts that are NOT in groups (groupId: null) in the main feed
    const hasFilters = followingIds.length > 0 || user.interests.length > 0;

    const whereClause = hasFilters
      ? {
          groupId: null, // Exclude group posts from main feed
          OR: [
            ...(followingIds.length > 0 ? [{ authorId: { in: followingIds } }] : []),
            ...(user.interests.length > 0 ? [{ author: { interests: { hasSome: user.interests } } }] : []),
          ],
        }
      : { groupId: null }; // Exclude group posts from main feed

    // Get total count for pagination
    const total = await this.prisma.post.count({ where: whereClause });

    // Personalized algorithm: Posts from followed users and posts matching interests
    const posts = await this.prisma.post.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: [
        { createdAt: 'desc' }, // Most recent first
        { likesCount: 'desc' }, // Then by likes
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
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 10, // Limit comments to prevent large payloads
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // If not enough personalized posts, fill with general posts (excluding group posts)
    if (posts.length < take && hasFilters) {
      const generalPosts = await this.prisma.post.findMany({
        where: {
          id: { notIn: posts.map((p) => p.id) },
          groupId: null, // Exclude group posts
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
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 10,
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

    // Return paginated response format
    const page = Math.floor(skip / take) + 1;
    return {
      data: posts,
      meta: {
        total: total + (posts.length > total ? posts.length - total : 0),
        page,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }
}
