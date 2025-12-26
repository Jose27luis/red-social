import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PostType } from '@prisma/client';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
    role: 'STUDENT',
  };

  const mockPost = {
    id: 'post-123',
    authorId: 'user-123',
    content: 'Test post content',
    type: 'POST',
    images: [],
    groupId: null,
    likesCount: 0,
    commentsCount: 0,
    isEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
  };

  const mockComment = {
    id: 'comment-123',
    postId: 'post-123',
    authorId: 'user-123',
    content: 'Test comment',
    createdAt: new Date(),
    author: mockUser,
  };

  const mockLike = {
    id: 'like-123',
    postId: 'post-123',
    userId: 'user-123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      post: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      comment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      like: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      groupMember: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPostDto = {
      content: 'New post content',
      type: PostType.DISCUSSION,
    };

    it('should create a post successfully', async () => {
      (prisma.post.create as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.create('user-123', createPostDto);

      expect(result).toEqual(mockPost);
      expect(prisma.post.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when content exceeds 3000 characters', async () => {
      const longContent = { ...createPostDto, content: 'a'.repeat(3001) };

      await expect(service.create('user-123', longContent)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when images exceed 10', async () => {
      const tooManyImages = { ...createPostDto, images: Array(11).fill('image.jpg') };

      await expect(service.create('user-123', tooManyImages)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when posting to group without membership', async () => {
      const groupPost = { ...createPostDto, groupId: 'group-123' };
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create('user-123', groupPost)).rejects.toThrow(ForbiddenException);
    });

    it('should allow posting to group when user is a member', async () => {
      const groupPost = { ...createPostDto, groupId: 'group-123' };
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue({
        groupId: 'group-123',
        userId: 'user-123',
      });
      (prisma.post.create as jest.Mock).mockResolvedValue({ ...mockPost, groupId: 'group-123' });

      const result = await service.create('user-123', groupPost);

      expect(result.groupId).toBe('group-123');
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const posts = [mockPost];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(posts);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result).toEqual(posts);
    });
  });

  describe('findById', () => {
    it('should return a post when found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.findById('post-123');

      expect(result).toEqual(mockPost);
    });

    it('should return null when post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto = { content: 'Updated content' };

    it('should update post successfully', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue({ ...mockPost, ...updateDto, isEdited: true });

      const result = await service.update('post-123', 'user-123', updateDto);

      expect(result.content).toBe('Updated content');
      expect(result.isEdited).toBe(true);
    });

    it('should throw NotFoundException when post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent-id', 'user-123', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      await expect(service.update('post-123', 'other-user', updateDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when post is older than 24 hours', async () => {
      const oldPost = {
        ...mockPost,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(oldPost);

      await expect(service.update('post-123', 'user-123', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete post successfully', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.delete as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.delete('post-123', 'user-123');

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      await expect(service.delete('post-123', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createComment', () => {
    const createCommentDto = { content: 'New comment' };

    it('should create a comment successfully', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockComment);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.createComment('post-123', 'user-123', createCommentDto);

      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createComment('nonexistent-id', 'user-123', createCommentDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when comment exceeds 1000 characters', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      const longComment = { content: 'a'.repeat(1001) };

      await expect(service.createComment('post-123', 'user-123', longComment)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.deleteComment('comment-123', 'user-123');

      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteComment('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      await expect(service.deleteComment('comment-123', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('likePost', () => {
    it('should like a post successfully', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.like.create as jest.Mock).mockResolvedValue(mockLike);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.likePost('post-123', 'user-123');

      expect(result).toEqual(mockLike);
    });

    it('should throw NotFoundException when post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.likePost('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already liked', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(mockLike);

      await expect(service.likePost('post-123', 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post successfully', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(mockLike);
      (prisma.like.delete as jest.Mock).mockResolvedValue(mockLike);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.unlikePost('post-123', 'user-123');

      expect(result).toEqual(mockLike);
    });

    it('should throw NotFoundException when like not found', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.unlikePost('post-123', 'user-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasUserLikedPost', () => {
    it('should return true when user has liked post', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(mockLike);

      const result = await service.hasUserLikedPost('post-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false when user has not liked post', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.hasUserLikedPost('post-123', 'user-123');

      expect(result).toBe(false);
    });
  });
});
