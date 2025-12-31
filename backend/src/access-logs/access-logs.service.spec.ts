import { Test, TestingModule } from '@nestjs/testing';
import { AccessLogsService } from './access-logs.service';
import { PrismaService } from '../database/prisma.service';

describe('AccessLogsService', () => {
  let service: AccessLogsService;

  const mockPrismaService = {
    accessLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessLogsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AccessLogsService>(AccessLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccessLog', () => {
    it('should create an access log', async () => {
      const mockLog = {
        id: 'log-123',
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        country: 'Local',
        city: 'Localhost',
        success: true,
        createdAt: new Date(),
      };

      mockPrismaService.accessLog.create.mockResolvedValue(mockLog);

      const result = await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      });

      expect(result).toEqual(mockLog);
      expect(mockPrismaService.accessLog.create).toHaveBeenCalled();
    });
  });

  describe('getAccessLogs', () => {
    it('should return paginated access logs', async () => {
      const mockLogs = [
        { id: 'log-1', userId: 'user-123', ipAddress: '192.168.1.1' },
        { id: 'log-2', userId: 'user-123', ipAddress: '192.168.1.2' },
      ];

      mockPrismaService.accessLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.accessLog.count.mockResolvedValue(2);

      const result = await service.getAccessLogs('user-123', 1, 20);

      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('getFailedAttempts', () => {
    it('should return count of failed attempts', async () => {
      mockPrismaService.accessLog.count.mockResolvedValue(3);

      const result = await service.getFailedAttempts('user-123', 24);

      expect(result).toBe(3);
    });
  });

  describe('cleanupOldLogs', () => {
    it('should delete old logs and return count', async () => {
      mockPrismaService.accessLog.deleteMany.mockResolvedValue({ count: 10 });

      const result = await service.cleanupOldLogs(90);

      expect(result).toBe(10);
    });
  });
});
