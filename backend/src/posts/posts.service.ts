import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post, Comment, Like, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new post
   */
  async create(authorId: string, data: CreatePostDto): Promise<Post> {
    // Validate content length
    if (data.content.length > 3000) {
      throw new BadRequestException('Content must not exceed 3000 characters');
    }

    // Validate images count
    if (data.images && data.images.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed per post');
    }

    return this.prisma.post.create({
      data: {
        authorId,
        content: data.content,
        type: data.type,
        images: data.images || [],
        groupId: data.groupId,
      },
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
      },
    });
  }

  /**
   * Find all posts with pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      where,
      orderBy,
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
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  /**
   * Find post by ID
   */
  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  /**
   * Update post
   */
  async update(id: string, userId: string, data: UpdatePostDto): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    // Check if post is older than 24 hours
    const hoursSinceCreation = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      throw new BadRequestException('Posts can only be edited within 24 hours of creation');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        isEdited: true,
      },
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
      },
    });
  }

  /**
   * Delete post
   */
  async delete(id: string, userId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({ where: { id } });
  }

  /**
   * Create a comment on a post
   */
  async createComment(postId: string, userId: string, data: CreateCommentDto): Promise<Comment> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (data.content.length > 1000) {
      throw new BadRequestException('Comment must not exceed 1000 characters');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: data.content,
      },
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
    });

    // Update comment count
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    return comment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const deletedComment = await this.prisma.comment.delete({ where: { id: commentId } });

    // Update comment count
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });

    return deletedComment;
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<Like> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('You have already liked this post');
    }

    const like = await this.prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    // Update likes count
    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });

    return like;
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userId: string): Promise<Like> {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    const deletedLike = await this.prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    // Update likes count
    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });

    return deletedLike;
  }

  /**
   * Check if user has liked a post
   */
  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return !!like;
  }
}
