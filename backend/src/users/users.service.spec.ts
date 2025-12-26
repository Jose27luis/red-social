import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    department: 'Ingeniería',
    career: 'Sistemas',
    profilePicture: null,
    bio: 'Test bio',
    interests: ['programming', 'music'],
    privacyLevel: 'PUBLIC',
    isVerified: true,
    isActive: true,
    refreshToken: null,
    verificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      follow: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'newuser@unamad.edu.pe',
      password: 'hashedPassword',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'STUDENT' as const,
      department: 'Ingeniería',
      career: 'Sistemas',
    };

    it('should create a new user successfully', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when interests exceed 10', async () => {
      const dtoWithTooManyInterests = {
        ...createUserDto,
        interests: Array(11).fill('interest'),
      };

      await expect(service.create(dtoWithTooManyInterests)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@unamad.edu.pe');

      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('notfound@unamad.edu.pe');

      expect(result).toBeNull();
    });
  });

  describe('findByVerificationToken', () => {
    it('should return user by verification token', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByVerificationToken('valid-token');

      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result).toEqual(users);
    });
  });

  describe('search', () => {
    it('should search users by query', async () => {
      const users = [mockUser];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.search('John', 0, 20);

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'Updated',
      bio: 'Updated bio',
    };

    it('should update user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.update('user-123', updateDto);

      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when bio exceeds 500 characters', async () => {
      const longBio = { bio: 'a'.repeat(501) };

      await expect(service.update('user-123', longBio)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when interests exceed 10', async () => {
      const tooManyInterests = { interests: Array(11).fill('interest') };

      await expect(service.update('user-123', tooManyInterests)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should soft delete user by deactivating', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

      const result = await service.delete('user-123');

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.hardDelete('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.hardDelete('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyUser', () => {
    it('should verify user and clear verification token', async () => {
      const verifiedUser = { ...mockUser, isVerified: true, verificationToken: null };
      (prisma.user.update as jest.Mock).mockResolvedValue(verifiedUser);

      const result = await service.verifyUser('user-123');

      expect(result.isVerified).toBe(true);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      const updatedUser = { ...mockUser, refreshToken: 'newToken' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateRefreshToken('user-123', 'newToken');

      expect(result.refreshToken).toBe('newToken');
    });
  });

  describe('getProfile', () => {
    it('should return user profile with counts', async () => {
      const profileData = {
        ...mockUser,
        _count: { posts: 5, followers: 10, following: 8 },
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(profileData);

      const result = await service.getProfile('user-123');

      expect(result._count.posts).toBe(5);
    });

    it('should throw NotFoundException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('follow', () => {
    it('should follow a user successfully', async () => {
      (prisma.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.follow.create as jest.Mock).mockResolvedValue({
        followerId: 'user-123',
        followingId: 'user-456',
      });

      const result = await service.follow('user-123', 'user-456');

      expect(result.message).toContain('Successfully followed');
    });

    it('should throw BadRequestException when following yourself', async () => {
      await expect(service.follow('user-123', 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when already following', async () => {
      (prisma.follow.findUnique as jest.Mock).mockResolvedValue({
        followerId: 'user-123',
        followingId: 'user-456',
      });

      await expect(service.follow('user-123', 'user-456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('unfollow', () => {
    it('should unfollow a user successfully', async () => {
      (prisma.follow.findUnique as jest.Mock).mockResolvedValue({
        followerId: 'user-123',
        followingId: 'user-456',
      });
      (prisma.follow.delete as jest.Mock).mockResolvedValue({});

      const result = await service.unfollow('user-123', 'user-456');

      expect(result.message).toContain('Successfully unfollowed');
    });

    it('should throw NotFoundException when not following', async () => {
      (prisma.follow.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.unfollow('user-123', 'user-456')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const followers = [{ follower: { id: 'user-456', firstName: 'Jane' } }];
      (prisma.follow.findMany as jest.Mock).mockResolvedValue(followers);

      const result = await service.getFollowers('user-123');

      expect(result).toHaveLength(1);
    });
  });

  describe('getFollowing', () => {
    it('should return list of following users', async () => {
      const following = [{ following: { id: 'user-789', firstName: 'Bob' } }];
      (prisma.follow.findMany as jest.Mock).mockResolvedValue(following);

      const result = await service.getFollowing('user-123');

      expect(result).toHaveLength(1);
    });
  });

  describe('isFollowing', () => {
    it('should return true when following', async () => {
      (prisma.follow.findUnique as jest.Mock).mockResolvedValue({
        followerId: 'user-123',
        followingId: 'user-456',
      });

      const result = await service.isFollowing('user-123', 'user-456');

      expect(result).toBe(true);
    });

    it('should return false when not following', async () => {
      (prisma.follow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.isFollowing('user-123', 'user-456');

      expect(result).toBe(false);
    });
  });
});
