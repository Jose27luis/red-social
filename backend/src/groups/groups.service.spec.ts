import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

describe('GroupsService', () => {
  let service: GroupsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
  };

  const mockGroup = {
    id: 'group-123',
    name: 'Test Group',
    description: 'A test group',
    type: 'PUBLIC',
    coverImage: null,
    creatorId: 'user-123',
    membersCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: mockUser,
    _count: { members: 1, posts: 0 },
  };

  const mockMembership = {
    groupId: 'group-123',
    userId: 'user-123',
    role: 'ADMIN',
    joinedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      group: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      groupMember: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      post: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createGroupDto = {
      name: 'New Group',
      description: 'A new group',
    } as CreateGroupDto;

    it('should create a group successfully', async () => {
      (prisma.group.create as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.create('user-123', createGroupDto);

      expect(result).toEqual(mockGroup);
      expect(prisma.group.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated groups', async () => {
      const groups = [mockGroup];
      (prisma.group.findMany as jest.Mock).mockResolvedValue(groups);
      (prisma.group.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(0, 20);

      expect(result.data).toEqual(groups);
      expect(result.meta.total).toBe(1);
    });

    it('should filter groups by type', async () => {
      (prisma.group.findMany as jest.Mock).mockResolvedValue([mockGroup]);
      (prisma.group.count as jest.Mock).mockResolvedValue(1);

      await service.findAll(0, 20, 'PUBLIC');

      expect(prisma.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'PUBLIC' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a group when found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.findById('group-123');

      expect(result).toEqual(mockGroup);
    });

    it('should throw NotFoundException when group not found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Group' };

    it('should update group when user is admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.group.update as jest.Mock).mockResolvedValue({ ...mockGroup, ...updateDto });

      const result = await service.update('group-123', 'user-123', updateDto);

      expect(result.name).toBe('Updated Group');
    });

    it('should throw NotFoundException when group not found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent-id', 'user-123', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue({ ...mockMembership, role: 'MEMBER' });

      await expect(service.update('group-123', 'user-123', updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete group when user is admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.group.delete as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.delete('group-123', 'user-123');

      expect(result).toEqual(mockGroup);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue({ ...mockMembership, role: 'MEMBER' });

      await expect(service.delete('group-123', 'user-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('joinGroup', () => {
    it('should join a public group successfully', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.groupMember.create as jest.Mock).mockResolvedValue({ ...mockMembership, userId: 'user-456' });
      (prisma.group.update as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.joinGroup('group-123', 'user-456');

      expect(result.userId).toBe('user-456');
    });

    it('should throw NotFoundException when group not found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.joinGroup('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already a member', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);

      await expect(service.joinGroup('group-123', 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for private group', async () => {
      const privateGroup = { ...mockGroup, type: 'PRIVATE' };
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(privateGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.joinGroup('group-123', 'user-456')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when group is full', async () => {
      const fullGroup = { ...mockGroup, membersCount: 100 };
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(fullGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.joinGroup('group-123', 'user-456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('leaveGroup', () => {
    it('should leave group successfully', async () => {
      const memberMembership = { ...mockMembership, role: 'MEMBER' };
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(memberMembership);
      (prisma.groupMember.delete as jest.Mock).mockResolvedValue(memberMembership);
      (prisma.group.update as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.leaveGroup('group-123', 'user-123');

      expect(result.message).toContain('Successfully left');
    });

    it('should throw NotFoundException when not a member', async () => {
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.leaveGroup('group-123', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when last admin tries to leave', async () => {
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.groupMember.count as jest.Mock).mockResolvedValue(1);

      await expect(service.leaveGroup('group-123', 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addMember', () => {
    const addMemberDto = { userId: 'user-456' };

    it('should add member successfully when admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValueOnce(mockMembership).mockResolvedValueOnce(null);
      (prisma.groupMember.create as jest.Mock).mockResolvedValue({
        ...mockMembership,
        userId: 'user-456',
        role: 'MEMBER',
      });
      (prisma.group.update as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.addMember('group-123', 'user-123', addMemberDto);

      expect(result.userId).toBe('user-456');
    });

    it('should throw ForbiddenException when not admin or moderator', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue({ ...mockMembership, role: 'MEMBER' });

      await expect(service.addMember('group-123', 'user-123', addMemberDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when user already member', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockMembership)
        .mockResolvedValueOnce({ ...mockMembership, userId: 'user-456' });

      await expect(service.addMember('group-123', 'user-123', addMemberDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully when admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockMembership)
        .mockResolvedValueOnce({ ...mockMembership, userId: 'user-456', role: 'MEMBER' });
      (prisma.groupMember.delete as jest.Mock).mockResolvedValue({});
      (prisma.group.update as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.removeMember('group-123', 'user-123', 'user-456');

      expect(result.message).toContain('removed successfully');
    });

    it('should throw ForbiddenException when moderator tries to remove admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock)
        .mockResolvedValueOnce({ ...mockMembership, role: 'MODERATOR' })
        .mockResolvedValueOnce({ ...mockMembership, userId: 'user-456', role: 'ADMIN' });

      await expect(service.removeMember('group-123', 'user-123', 'user-456')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMemberRole', () => {
    const updateRoleDto = { role: 'MODERATOR' } as unknown as UpdateMemberRoleDto;

    it('should update member role when admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockMembership)
        .mockResolvedValueOnce({ ...mockMembership, userId: 'user-456' });
      (prisma.groupMember.update as jest.Mock).mockResolvedValue({
        ...mockMembership,
        userId: 'user-456',
        role: 'MODERATOR',
      });

      const result = await service.updateMemberRole('group-123', 'user-123', 'user-456', updateRoleDto);

      expect(result.role).toBe('MODERATOR');
    });

    it('should throw ForbiddenException when not admin', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue({ ...mockMembership, role: 'MEMBER' });

      await expect(service.updateMemberRole('group-123', 'user-123', 'user-456', updateRoleDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserGroups', () => {
    it('should return user groups with role', async () => {
      const memberships = [{ ...mockMembership, group: mockGroup }];
      (prisma.groupMember.findMany as jest.Mock).mockResolvedValue(memberships);

      const result = await service.getUserGroups('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].myRole).toBe('ADMIN');
    });
  });

  describe('isMember', () => {
    it('should return true when user is member', async () => {
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);

      const result = await service.isMember('group-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false when user is not member', async () => {
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.isMember('group-123', 'user-456');

      expect(result).toBe(false);
    });
  });

  describe('getGroupPosts', () => {
    it('should return group posts when user is member', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getGroupPosts('group-123', 'user-123');

      expect(result.data).toEqual([]);
    });

    it('should throw ForbiddenException when user is not member', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getGroupPosts('group-123', 'user-456')).rejects.toThrow(ForbiddenException);
    });
  });
});
