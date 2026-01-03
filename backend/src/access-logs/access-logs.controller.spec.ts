import { Test, TestingModule } from '@nestjs/testing';
import { AccessLogsController } from './access-logs.controller';
import { AccessLogsService } from './access-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('AccessLogsController', () => {
  let controller: AccessLogsController;
  let accessLogsService: jest.Mocked<AccessLogsService>;

  const mockRequest = {
    user: {
      userId: 'user-123',
    },
  };

  const mockAccessLogsResponse = {
    data: [
      {
        id: 'log-1',
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        country: 'Peru',
        city: 'Lima',
        success: true,
        failReason: null,
        createdAt: new Date(),
      },
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    const mockAccessLogsService = {
      getAccessLogs: jest.fn(),
      getFailedAttempts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessLogsController],
      providers: [{ provide: AccessLogsService, useValue: mockAccessLogsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AccessLogsController>(AccessLogsController);
    accessLogsService = module.get(AccessLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyAccessLogs', () => {
    it('should return access logs with default pagination', async () => {
      accessLogsService.getAccessLogs.mockResolvedValue(mockAccessLogsResponse);

      const result = await controller.getMyAccessLogs(mockRequest);

      expect(result).toEqual(mockAccessLogsResponse);
      expect(accessLogsService.getAccessLogs).toHaveBeenCalledWith('user-123', 1, 20);
    });

    it('should return access logs with custom pagination', async () => {
      accessLogsService.getAccessLogs.mockResolvedValue(mockAccessLogsResponse);

      const result = await controller.getMyAccessLogs(mockRequest, '2', '10');

      expect(result).toEqual(mockAccessLogsResponse);
      expect(accessLogsService.getAccessLogs).toHaveBeenCalledWith('user-123', 2, 10);
    });
  });

  describe('getFailedAttempts', () => {
    it('should return failed attempts count', async () => {
      accessLogsService.getFailedAttempts.mockResolvedValue(5);

      const result = await controller.getFailedAttempts(mockRequest);

      expect(result).toEqual({ failedAttempts: 5, period: '24 hours' });
      expect(accessLogsService.getFailedAttempts).toHaveBeenCalledWith('user-123');
    });

    it('should return zero for no failed attempts', async () => {
      accessLogsService.getFailedAttempts.mockResolvedValue(0);

      const result = await controller.getFailedAttempts(mockRequest);

      expect(result).toEqual({ failedAttempts: 0, period: '24 hours' });
    });
  });
});
