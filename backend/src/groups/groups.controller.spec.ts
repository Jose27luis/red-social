import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: jest.Mocked<GroupsService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockGroup = {
    id: 'group-123',
    name: 'Test Group',
    description: 'A test group',
    type: 'PUBLIC',
    creatorId: 'user-123',
    membersCount: 1,
  };

  beforeEach(async () => {
    const mockGroupsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      joinGroup: jest.fn(),
      leaveGroup: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      updateMemberRole: jest.fn(),
      getUserGroups: jest.fn(),
      isMember: jest.fn(),
      getGroupPosts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [{ provide: GroupsService, useValue: mockGroupsService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GroupsController>(GroupsController);
    groupsService = module.get(GroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a group', async () => {
      const createDto = { name: 'New Group', description: 'Description' } as CreateGroupDto;
      groupsService.create.mockResolvedValue(mockGroup as any);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockGroup);
      expect(groupsService.create).toHaveBeenCalledWith(mockUser.id, createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated groups', async () => {
      const paginatedResult = { data: [mockGroup], meta: { total: 1, page: 1 } };
      groupsService.findAll.mockResolvedValue(paginatedResult as any);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(paginatedResult);
      expect(groupsService.findAll).toHaveBeenCalledWith(0, 20, undefined);
    });

    it('should filter by type', async () => {
      groupsService.findAll.mockResolvedValue({ data: [], meta: {} } as any);

      await controller.findAll(1, 20, 'PUBLIC');

      expect(groupsService.findAll).toHaveBeenCalledWith(0, 20, 'PUBLIC');
    });
  });

  describe('getUserGroups', () => {
    it('should return user groups', async () => {
      const userGroups = [mockGroup];
      groupsService.getUserGroups.mockResolvedValue(userGroups as any);

      const result = await controller.getUserGroups(mockUser);

      expect(result).toEqual(userGroups);
    });
  });

  describe('findById', () => {
    it('should return a group by id', async () => {
      groupsService.findById.mockResolvedValue(mockGroup as any);

      const result = await controller.findById('group-123');

      expect(result).toEqual(mockGroup);
    });
  });

  describe('getGroupPosts', () => {
    it('should return group posts', async () => {
      const posts = { data: [], meta: { total: 0 } };
      groupsService.getGroupPosts.mockResolvedValue(posts as any);

      const result = await controller.getGroupPosts('group-123', mockUser, 1, 20);

      expect(result).toEqual(posts);
      expect(groupsService.getGroupPosts).toHaveBeenCalledWith('group-123', mockUser.id, 0, 20);
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const updateDto = { name: 'Updated Group' };
      const updatedGroup = { ...mockGroup, ...updateDto };
      groupsService.update.mockResolvedValue(updatedGroup as any);

      const result = await controller.update('group-123', mockUser, updateDto);

      expect(result).toEqual(updatedGroup);
    });
  });

  describe('delete', () => {
    it('should delete a group', async () => {
      groupsService.delete.mockResolvedValue(mockGroup as any);

      const result = await controller.delete('group-123', mockUser);

      expect(result).toEqual(mockGroup);
    });
  });

  describe('joinGroup', () => {
    it('should join a group', async () => {
      const membership = { groupId: 'group-123', userId: 'user-123', role: 'MEMBER' };
      groupsService.joinGroup.mockResolvedValue(membership as any);

      const result = await controller.joinGroup('group-123', mockUser);

      expect(result).toEqual(membership);
    });
  });

  describe('leaveGroup', () => {
    it('should leave a group', async () => {
      const response = { message: 'Successfully left the group' };
      groupsService.leaveGroup.mockResolvedValue(response);

      const result = await controller.leaveGroup('group-123', mockUser);

      expect(result).toEqual(response);
    });
  });

  describe('addMember', () => {
    it('should add a member to group', async () => {
      const addMemberDto = { userId: 'user-456' };
      const membership = { groupId: 'group-123', userId: 'user-456', role: 'MEMBER' };
      groupsService.addMember.mockResolvedValue(membership as any);

      const result = await controller.addMember('group-123', mockUser, addMemberDto as any);

      expect(result).toEqual(membership);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from group', async () => {
      const response = { message: 'Member removed successfully' };
      groupsService.removeMember.mockResolvedValue(response);

      const result = await controller.removeMember('group-123', 'user-456', mockUser);

      expect(result).toEqual(response);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role', async () => {
      const updateRoleDto = { role: 'MODERATOR' };
      const membership = { groupId: 'group-123', userId: 'user-456', role: 'MODERATOR' };
      groupsService.updateMemberRole.mockResolvedValue(membership as any);

      const result = await controller.updateMemberRole('group-123', 'user-456', mockUser, updateRoleDto as any);

      expect(result).toEqual(membership);
    });
  });

  describe('isMember', () => {
    it('should return true if user is member', async () => {
      groupsService.isMember.mockResolvedValue(true);

      const result = await controller.isMember('group-123', mockUser);

      expect(result).toEqual({ isMember: true });
    });

    it('should return false if user is not member', async () => {
      groupsService.isMember.mockResolvedValue(false);

      const result = await controller.isMember('group-123', mockUser);

      expect(result).toEqual({ isMember: false });
    });
  });
});
