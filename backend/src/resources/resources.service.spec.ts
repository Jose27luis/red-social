import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  };

  const mockNewUser = {
    ...mockUser,
    id: 'user-new',
    createdAt: new Date(), // Just created
  };

  const mockResource = {
    id: 'resource-123',
    title: 'Test Resource',
    description: 'A test resource',
    fileUrl: 'https://example.com/file.pdf',
    fileType: 'DOCUMENT',
    fileSize: 1024,
    downloadCount: 0,
    uploaderId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    uploader: mockUser,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      resource: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createResourceDto = {
      title: 'New Resource',
      description: 'Resource description',
      fileUrl: 'https://example.com/file.pdf',
      fileType: 'DOCUMENT',
      fileSize: 1024,
    };

    it('should create a resource successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.resource.create as jest.Mock).mockResolvedValue(mockResource);

      const result = await service.create('user-123', createResourceDto);

      expect(result).toEqual(mockResource);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidDto = { ...createResourceDto, fileType: 'INVALID_TYPE' };

      await expect(service.create('user-123', invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file size exceeds 50MB', async () => {
      const largeFileDto = { ...createResourceDto, fileSize: 60 * 1024 * 1024 };

      await expect(service.create('user-123', largeFileDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create('nonexistent-id', createResourceDto)).rejects.toThrow(BadRequestException);
    });

    it('should enforce daily limit for new users', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockNewUser);
      (prisma.resource.count as jest.Mock).mockResolvedValue(3);

      await expect(service.create('user-new', createResourceDto)).rejects.toThrow(BadRequestException);
    });

    it('should allow resource creation for new users under limit', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockNewUser);
      (prisma.resource.count as jest.Mock).mockResolvedValue(2);
      (prisma.resource.create as jest.Mock).mockResolvedValue(mockResource);

      const result = await service.create('user-new', createResourceDto);

      expect(result).toEqual(mockResource);
    });
  });

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      const resources = [mockResource];
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(resources);
      (prisma.resource.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(0, 20);

      expect(result.data).toEqual(resources);
      expect(result.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.resource.count as jest.Mock).mockResolvedValue(50);

      const result = await service.findAll(20, 10);

      expect(result.meta.page).toBe(3);
    });
  });

  describe('findById', () => {
    it('should return resource when found', async () => {
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(mockResource);

      const result = await service.findById('resource-123');

      expect(result).toEqual(mockResource);
    });

    it('should throw NotFoundException when resource not found', async () => {
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementDownload', () => {
    it('should increment download count', async () => {
      (prisma.resource.update as jest.Mock).mockResolvedValue({ ...mockResource, downloadCount: 1 });

      const result = await service.incrementDownload('resource-123');

      expect(result.message).toContain('incremented');
      expect(prisma.resource.update).toHaveBeenCalledWith({
        where: { id: 'resource-123' },
        data: { downloadCount: { increment: 1 } },
      });
    });
  });

  describe('delete', () => {
    it('should delete resource when user is uploader', async () => {
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(mockResource);
      (prisma.resource.delete as jest.Mock).mockResolvedValue(mockResource);

      const result = await service.delete('resource-123', 'user-123');

      expect(result).toEqual(mockResource);
    });

    it('should throw NotFoundException when resource not found', async () => {
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not uploader', async () => {
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(mockResource);

      await expect(service.delete('resource-123', 'other-user')).rejects.toThrow(BadRequestException);
    });
  });
});
