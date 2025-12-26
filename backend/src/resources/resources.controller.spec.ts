import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let resourcesService: jest.Mocked<ResourcesService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockResource = {
    id: 'resource-123',
    uploaderId: 'user-123',
    title: 'Course Notes',
    description: 'Notes for the software quality course',
    fileType: 'PDF',
    fileUrl: '/uploads/notes.pdf',
    fileSize: 1024000,
    downloadCount: 0,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockResourcesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      incrementDownload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [{ provide: ResourcesService, useValue: mockResourcesService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ResourcesController>(ResourcesController);
    resourcesService = module.get(ResourcesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a resource with metadata', async () => {
      const createData = {
        title: 'New Resource',
        description: 'A test resource',
        fileType: 'PDF',
        fileUrl: '/uploads/test.pdf',
      };
      resourcesService.create.mockResolvedValue(mockResource as any);

      const result = await controller.create(mockUser, createData);

      expect(result).toEqual(mockResource);
      expect(resourcesService.create).toHaveBeenCalledWith(mockUser.id, createData);
    });
  });

  describe('upload', () => {
    it('should upload a file and create resource', async () => {
      const file = {
        filename: 'test-file.pdf',
        originalname: 'original.pdf',
        size: 1024000,
      } as Express.Multer.File;
      const body = { title: 'Uploaded File', description: 'File description', fileType: 'PDF' };

      resourcesService.create.mockResolvedValue(mockResource as any);

      const result = await controller.upload(mockUser, file, body);

      expect(result).toEqual(mockResource);
      expect(resourcesService.create).toHaveBeenCalledWith(mockUser.id, {
        title: 'Uploaded File',
        description: 'File description',
        fileType: 'PDF',
        fileUrl: '/uploads/test-file.pdf',
        fileSize: 1024000,
      });
    });

    it('should use original filename when title is not provided', async () => {
      const file = {
        filename: 'test-file.pdf',
        originalname: 'original.pdf',
        size: 1024000,
      } as Express.Multer.File;
      const body = { title: '', description: 'File description', fileType: 'PDF' };

      resourcesService.create.mockResolvedValue(mockResource as any);

      await controller.upload(mockUser, file, body);

      expect(resourcesService.create).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          title: 'original.pdf',
        }),
      );
    });

    it('should throw BadRequestException when no file provided', async () => {
      const body = { title: 'Test', description: 'Desc', fileType: 'PDF' };

      await expect(controller.upload(mockUser, undefined as any, body)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      const resources = [mockResource];
      resourcesService.findAll.mockResolvedValue(resources as any);

      const result = await controller.findAll(1, 20);

      expect(result).toEqual(resources);
      expect(resourcesService.findAll).toHaveBeenCalledWith(0, 20);
    });

    it('should handle pagination correctly', async () => {
      resourcesService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } } as any);

      await controller.findAll(3, 10);

      expect(resourcesService.findAll).toHaveBeenCalledWith(20, 10);
    });
  });

  describe('findById', () => {
    it('should return resource by id', async () => {
      resourcesService.findById.mockResolvedValue(mockResource as any);

      const result = await controller.findById('resource-123');

      expect(result).toEqual(mockResource);
      expect(resourcesService.findById).toHaveBeenCalledWith('resource-123');
    });
  });

  describe('incrementDownload', () => {
    it('should increment download count', async () => {
      const updatedResource = { ...mockResource, downloadCount: 1 };
      resourcesService.incrementDownload.mockResolvedValue(updatedResource as any);

      const result = await controller.incrementDownload('resource-123');

      expect(result).toEqual(updatedResource);
      expect(resourcesService.incrementDownload).toHaveBeenCalledWith('resource-123');
    });
  });

  describe('delete', () => {
    it('should delete a resource', async () => {
      resourcesService.delete.mockResolvedValue(mockResource as any);

      const result = await controller.delete('resource-123', mockUser);

      expect(result).toEqual(mockResource);
      expect(resourcesService.delete).toHaveBeenCalledWith('resource-123', mockUser.id);
    });
  });
});
