import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FeedService', () => {
  let service: FeedService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
    role: 'STUDENT',
    interests: ['programming', 'music'],
    following: [{ followingId: 'user-456' }],
    groupMemberships: [{ groupId: 'group-123' }],
  };

  const mockPost = {
    id: 'post-123',
    authorId: 'user-456',
    content: 'Test post content',
    type: 'POST',
    images: [],
    groupId: null,
    likesCount: 5,
    commentsCount: 2,
    createdAt: new Date(),
    author: {
      id: 'user-456',
      firstName: 'Jane',
      lastName: 'Doe',
      profilePicture: null,
      role: 'STUDENT',
    },
    group: null,
    likes: [],
    comments: [],
    _count: { comments: 2, likes: 5 },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      post: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<FeedService>(FeedService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPersonalizedFeed', () => {
    it('should return personalized feed for user with following', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.count as jest.Mock).mockResolvedValue(20);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

      const result = await service.getPersonalizedFeed('user-123', 0, 1);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getPersonalizedFeed('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should return general feed when user has no following or interests', async () => {
      const userWithoutFilters = {
        ...mockUser,
        following: [],
        interests: [],
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithoutFilters);
      (prisma.post.count as jest.Mock).mockResolvedValue(10);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

      const result = await service.getPersonalizedFeed('user-123');

      expect(result.data).toBeDefined();
    });

    it('should exclude group posts from main feed', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

      await service.getPersonalizedFeed('user-123');

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            groupId: null,
          }),
        }),
      );
    });

    it('should fill with general posts when personalized posts are insufficient', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.count as jest.Mock).mockResolvedValue(5);
      (prisma.post.findMany as jest.Mock)
        .mockResolvedValueOnce([mockPost])
        .mockResolvedValueOnce([{ ...mockPost, id: 'post-456' }]);

      const result = await service.getPersonalizedFeed('user-123', 0, 20);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should support pagination', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.count as jest.Mock).mockResolvedValue(50);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

      const result = await service.getPersonalizedFeed('user-123', 20, 10);

      expect(result.meta.page).toBe(3);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should order posts by createdAt and likesCount', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

      await service.getPersonalizedFeed('user-123');

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ createdAt: 'desc' }, { likesCount: 'desc' }],
        }),
      );
    });
  });
});
