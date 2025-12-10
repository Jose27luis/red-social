import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new group
   */
  async create(creatorId: string, data: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type || 'PUBLIC',
        coverImage: data.coverImage,
        creatorId,
        membersCount: 1,
        members: {
          create: {
            userId: creatorId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    return group;
  }

  /**
   * Find all groups with pagination
   */
  async findAll(skip = 0, take = 20, type?: string) {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return this.prisma.group.findMany({
      where,
      skip,
      take,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find group by ID
   */
  async findById(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                role: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  /**
   * Update group
   */
  async update(id: string, userId: string, data: UpdateGroupDto) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is admin of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new ForbiddenException('Only group admins can update group settings');
    }

    return this.prisma.group.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });
  }

  /**
   * Delete group
   */
  async delete(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is admin of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new ForbiddenException('Only group admins can delete the group');
    }

    return this.prisma.group.delete({ where: { id } });
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if already a member
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('You are already a member of this group');
    }

    // Check group type
    if (group.type === 'PRIVATE' || group.type === 'INVITE_ONLY') {
      throw new ForbiddenException('This group requires an invitation to join');
    }

    // Check member limit (max 100)
    if (group.membersCount >= 100) {
      throw new BadRequestException('This group has reached its maximum capacity (100 members)');
    }

    // Create membership
    const membership = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Update member count
    await this.prisma.group.update({
      where: { id: groupId },
      data: { membersCount: { increment: 1 } },
    });

    return membership;
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this group');
    }

    // Check if user is the last admin
    if (membership.role === 'ADMIN') {
      const adminCount = await this.prisma.groupMember.count({
        where: {
          groupId,
          role: 'ADMIN',
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'You cannot leave the group as the last admin. Please assign another admin first.',
        );
      }
    }

    // Delete membership
    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    // Update member count
    await this.prisma.group.update({
      where: { id: groupId },
      data: { membersCount: { decrement: 1 } },
    });

    return { message: 'Successfully left the group' };
  }

  /**
   * Add member to group (by admin/moderator)
   */
  async addMember(groupId: string, adminId: string, data: AddMemberDto) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if requesting user is admin or moderator
    const adminMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: adminId,
        },
      },
    });

    if (!adminMembership || (adminMembership.role !== 'ADMIN' && adminMembership.role !== 'MODERATOR')) {
      throw new ForbiddenException('Only admins and moderators can add members');
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: data.userId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this group');
    }

    // Check member limit
    if (group.membersCount >= 100) {
      throw new BadRequestException('This group has reached its maximum capacity (100 members)');
    }

    // Create membership
    const membership = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId: data.userId,
        role: data.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Update member count
    await this.prisma.group.update({
      where: { id: groupId },
      data: { membersCount: { increment: 1 } },
    });

    return membership;
  }

  /**
   * Remove member from group (by admin/moderator)
   */
  async removeMember(groupId: string, adminId: string, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if requesting user is admin or moderator
    const adminMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: adminId,
        },
      },
    });

    if (!adminMembership || (adminMembership.role !== 'ADMIN' && adminMembership.role !== 'MODERATOR')) {
      throw new ForbiddenException('Only admins and moderators can remove members');
    }

    // Check if member exists
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this group');
    }

    // Cannot remove admin if you're not an admin
    if (membership.role === 'ADMIN' && adminMembership.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove other admins');
    }

    // Delete membership
    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    // Update member count
    await this.prisma.group.update({
      where: { id: groupId },
      data: { membersCount: { decrement: 1 } },
    });

    return { message: 'Member removed successfully' };
  }

  /**
   * Update member role (by admin)
   */
  async updateMemberRole(groupId: string, adminId: string, userId: string, data: UpdateMemberRoleDto) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if requesting user is admin
    const adminMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: adminId,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update member roles');
    }

    // Check if member exists
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this group');
    }

    // Update role
    return this.prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: { role: data.role },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            _count: {
              select: {
                members: true,
                posts: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.group,
      myRole: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Check if user is member of group
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return !!membership;
  }
}
