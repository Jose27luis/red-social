import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async create(data: CreateUserDto): Promise<User> {
    // Validate interests count
    if (data.interests && data.interests.length > 10) {
      throw new BadRequestException('Maximum 10 interests allowed');
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        department: data.department,
        career: data.career,
        verificationToken: data.verificationToken,
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }

  /**
   * Find all users with pagination and filters
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        career: true,
        profilePicture: true,
        bio: true,
        interests: true,
        privacyLevel: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false,
        refreshToken: false,
        verificationToken: false,
        resetPasswordToken: false,
        resetPasswordExpires: false,
      },
    }) as Promise<User[]>;
  }

  /**
   * Search users by name or email
   */
  async search(query: string, skip = 0, take = 20): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
        isVerified: true,
      },
      skip,
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        career: true,
        profilePicture: true,
        bio: true,
        interests: true,
        privacyLevel: true,
        createdAt: true,
        password: false,
        refreshToken: false,
        verificationToken: false,
        resetPasswordToken: false,
        resetPasswordExpires: false,
      },
    }) as Promise<User[]>;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    // Validate bio length
    if (data.bio && data.bio.length > 500) {
      throw new BadRequestException('Bio must not exceed 500 characters');
    }

    // Validate interests count
    if (data.interests && data.interests.length > 10) {
      throw new BadRequestException('Maximum 10 interests allowed');
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async delete(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete user (for GDPR compliance)
   */
  async hardDelete(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Verify user email
   */
  async verifyUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  /**
   * Get user profile (without sensitive data)
   */
  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        career: true,
        profilePicture: true,
        bio: true,
        interests: true,
        privacyLevel: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Follow a user
   */
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('You are already following this user');
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { message: 'Successfully followed user', follow };
  }

  /**
   * Unfollow a user
   */
  async unfollow(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('You are not following this user');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'Successfully unfollowed user' };
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, skip = 0, take = 20) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      skip,
      take,
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return followers.map((f) => f.follower);
  }

  /**
   * Get user's following
   */
  async getFollowing(userId: string, skip = 0, take = 20) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      skip,
      take,
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return following.map((f) => f.following);
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }
}
