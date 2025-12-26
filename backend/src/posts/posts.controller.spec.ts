import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { BadRequestException } from '@nestjs/common';
import { PostType } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<PostsService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockPost = {
    id: 'post-123',
    authorId: 'user-123',
    content: 'Test post',
    type: 'DISCUSSION',
    images: [],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPostsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createComment: jest.fn(),
      deleteComment: jest.fn(),
      likePost: jest.fn(),
      unlikePost: jest.fn(),
      hasUserLikedPost: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto = { content: 'New post', type: PostType.DISCUSSION };
      postsService.create.mockResolvedValue(mockPost as any);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockPost);
      expect(postsService.create).toHaveBeenCalledWith(mockUser.id, createDto);
    });
  });

  describe('uploadImages', () => {
    it('should upload images and return URLs', async () => {
      const files = [{ filename: 'post-1.jpg' }, { filename: 'post-2.jpg' }] as Express.Multer.File[];

      const result = await controller.uploadImages(files);

      expect(result.images).toHaveLength(2);
      expect(result.images[0]).toContain('/uploads/posts/');
    });

    it('should throw BadRequestException when no files provided', async () => {
      await expect(controller.uploadImages([])).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when files is undefined', async () => {
      await expect(controller.uploadImages(undefined as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const posts = [mockPost];
      postsService.findAll.mockResolvedValue(posts as any);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(posts);
    });

    it('should filter by type', async () => {
      postsService.findAll.mockResolvedValue([]);

      await controller.findAll(1, 20, 'QUESTION');

      expect(postsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'QUESTION' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      postsService.findById.mockResolvedValue(mockPost as any);

      const result = await controller.findOne('post-123');

      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto = { content: 'Updated content' };
      const updatedPost = { ...mockPost, ...updateDto };
      postsService.update.mockResolvedValue(updatedPost as any);

      const result = await controller.update('post-123', mockUser, updateDto);

      expect(result).toEqual(updatedPost);
      expect(postsService.update).toHaveBeenCalledWith('post-123', mockUser.id, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      postsService.delete.mockResolvedValue(mockPost as any);

      const result = await controller.delete('post-123', mockUser);

      expect(result).toEqual(mockPost);
      expect(postsService.delete).toHaveBeenCalledWith('post-123', mockUser.id);
    });
  });

  describe('createComment', () => {
    it('should create a comment on a post', async () => {
      const commentDto = { content: 'Nice post!' };
      const comment = { id: 'comment-123', ...commentDto, authorId: mockUser.id };
      postsService.createComment.mockResolvedValue(comment as any);

      const result = await controller.createComment('post-123', mockUser, commentDto);

      expect(result).toEqual(comment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const comment = { id: 'comment-123', content: 'Comment' };
      postsService.deleteComment.mockResolvedValue(comment as any);

      const result = await controller.deleteComment('comment-123', mockUser);

      expect(result).toEqual(comment);
    });
  });

  describe('likePost', () => {
    it('should like a post', async () => {
      const like = { postId: 'post-123', userId: mockUser.id };
      postsService.likePost.mockResolvedValue(like as any);

      const result = await controller.likePost('post-123', mockUser);

      expect(result).toEqual(like);
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      const like = { postId: 'post-123', userId: mockUser.id };
      postsService.unlikePost.mockResolvedValue(like as any);

      const result = await controller.unlikePost('post-123', mockUser);

      expect(result).toEqual(like);
    });
  });

  describe('hasUserLikedPost', () => {
    it('should return true if user liked post', async () => {
      postsService.hasUserLikedPost.mockResolvedValue(true);

      const result = await controller.hasUserLikedPost('post-123', mockUser);

      expect(result).toEqual({ hasLiked: true });
    });

    it('should return false if user has not liked post', async () => {
      postsService.hasUserLikedPost.mockResolvedValue(false);

      const result = await controller.hasUserLikedPost('post-123', mockUser);

      expect(result).toEqual({ hasLiked: false });
    });
  });
});
