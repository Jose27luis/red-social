import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    profilePicture: null,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      search: jest.fn(),
      findById: jest.fn(),
      getProfile: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      follow: jest.fn(),
      unfollow: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn(),
      isFollowing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      usersService.findAll.mockResolvedValue(users as any);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(users);
      expect(usersService.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { isActive: true, isVerified: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      usersService.findAll.mockResolvedValue([]);

      await controller.findAll(3, 10);

      expect(usersService.findAll).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
    });
  });

  describe('search', () => {
    it('should search users by query', async () => {
      const users = [mockUser];
      usersService.search.mockResolvedValue(users as any);

      const result = await controller.search('John', 1, 20);

      expect(result).toEqual(users);
      expect(usersService.search).toHaveBeenCalledWith('John', 0, 20);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await controller.findById('user-123');

      expect(result).toEqual(mockUser);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const profile = { ...mockUser, _count: { posts: 5, followers: 10, following: 8 } };
      usersService.getProfile.mockResolvedValue(profile as any);

      const result = await controller.getProfile('user-123');

      expect(result).toEqual(profile);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, ...updateDto };
      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, updateDto);
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture', async () => {
      const file = { filename: 'profile-123.jpg' } as Express.Multer.File;
      const updatedUser = { ...mockUser, profilePicture: '/uploads/profiles/profile-123.jpg' };
      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.uploadProfilePicture(mockUser, file);

      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadProfilePicture(mockUser, undefined as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete user account', async () => {
      usersService.delete.mockResolvedValue({ ...mockUser, isActive: false } as any);

      await controller.deleteAccount(mockUser);

      expect(usersService.delete).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete user account', async () => {
      usersService.hardDelete.mockResolvedValue(mockUser as any);

      await controller.permanentDelete(mockUser);

      expect(usersService.hardDelete).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      const followResult = { message: 'Successfully followed user' };
      usersService.follow.mockResolvedValue(followResult as any);

      const result = await controller.followUser('user-456', mockUser);

      expect(result).toEqual(followResult);
      expect(usersService.follow).toHaveBeenCalledWith(mockUser.id, 'user-456');
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user', async () => {
      const unfollowResult = { message: 'Successfully unfollowed user' };
      usersService.unfollow.mockResolvedValue(unfollowResult);

      const result = await controller.unfollowUser('user-456', mockUser);

      expect(result).toEqual(unfollowResult);
    });
  });

  describe('getFollowers', () => {
    it('should return user followers', async () => {
      const followers = [{ id: 'user-456', firstName: 'Jane' }];
      usersService.getFollowers.mockResolvedValue(followers as any);

      const result = await controller.getFollowers('user-123', 1, 20);

      expect(result).toEqual(followers);
    });
  });

  describe('getFollowing', () => {
    it('should return user following', async () => {
      const following = [{ id: 'user-789', firstName: 'Bob' }];
      usersService.getFollowing.mockResolvedValue(following as any);

      const result = await controller.getFollowing('user-123', 1, 20);

      expect(result).toEqual(following);
    });
  });

  describe('isFollowing', () => {
    it('should return true if following', async () => {
      usersService.isFollowing.mockResolvedValue(true);

      const result = await controller.isFollowing('user-456', mockUser);

      expect(result).toEqual({ isFollowing: true });
    });

    it('should return false if not following', async () => {
      usersService.isFollowing.mockResolvedValue(false);

      const result = await controller.isFollowing('user-456', mockUser);

      expect(result).toEqual({ isFollowing: false });
    });
  });
});
