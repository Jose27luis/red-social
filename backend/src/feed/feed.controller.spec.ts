import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('FeedController', () => {
  let controller: FeedController;
  let feedService: jest.Mocked<FeedService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockPost = {
    id: 'post-123',
    authorId: 'user-456',
    content: 'Test post content',
    type: 'DISCUSSION',
    images: [],
    createdAt: new Date(),
    author: {
      id: 'user-456',
      firstName: 'Jane',
      lastName: 'Doe',
      profilePicture: null,
    },
    _count: {
      comments: 5,
      likes: 10,
    },
  };

  beforeEach(async () => {
    const mockFeedService = {
      getPersonalizedFeed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [{ provide: FeedService, useValue: mockFeedService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FeedController>(FeedController);
    feedService = module.get(FeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPersonalizedFeed', () => {
    it('should return personalized feed', async () => {
      const feed = [mockPost];
      feedService.getPersonalizedFeed.mockResolvedValue(feed as any);

      const result = await controller.getPersonalizedFeed(mockUser, 1, 20);

      expect(result).toEqual(feed);
      expect(feedService.getPersonalizedFeed).toHaveBeenCalledWith(mockUser.id, 0, 20);
    });

    it('should handle pagination correctly', async () => {
      feedService.getPersonalizedFeed.mockResolvedValue({ data: [], meta: { total: 0 } } as any);

      await controller.getPersonalizedFeed(mockUser, 2, 10);

      expect(feedService.getPersonalizedFeed).toHaveBeenCalledWith(mockUser.id, 10, 10);
    });

    it('should handle page 3 with limit 20', async () => {
      feedService.getPersonalizedFeed.mockResolvedValue({ data: [], meta: { total: 0 } } as any);

      await controller.getPersonalizedFeed(mockUser, 3, 20);

      expect(feedService.getPersonalizedFeed).toHaveBeenCalledWith(mockUser.id, 40, 20);
    });

    it('should return empty data when no posts available', async () => {
      const emptyResult = { data: [], meta: { total: 0 } };
      feedService.getPersonalizedFeed.mockResolvedValue(emptyResult as any);

      const result = await controller.getPersonalizedFeed(mockUser, 1, 20);

      expect(result).toEqual(emptyResult);
    });

    it('should return multiple posts', async () => {
      const multiplePosts = [mockPost, { ...mockPost, id: 'post-456' }];
      feedService.getPersonalizedFeed.mockResolvedValue(multiplePosts as any);

      const result = await controller.getPersonalizedFeed(mockUser, 1, 20);

      expect(result).toHaveLength(2);
    });
  });
});
