import { Test, TestingModule } from '@nestjs/testing';
import { AccessLogsService } from './access-logs.service';
import { PrismaService } from '../database/prisma.service';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccessLog', () => {
    it('should create an access log with Windows Chrome Desktop', async () => {
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

    it('should parse macOS Safari user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Mac OS X 10_15) Safari/605.1.15',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'macOS',
            browser: 'Safari',
            device: 'Desktop',
          }),
        }),
      );
    });

    it('should parse Linux Firefox user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Firefox/121.0',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'Linux',
            browser: 'Firefox',
            device: 'Desktop',
          }),
        }),
      );
    });

    it('should parse Android Mobile Chrome user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Android 13; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'Android',
            browser: 'Chrome',
            device: 'Mobile',
          }),
        }),
      );
    });

    it('should parse iOS Safari user agent with iPhone', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile Safari/604.1',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'iOS',
            browser: 'Safari',
            device: 'Mobile',
          }),
        }),
      );
    });

    it('should parse iPad tablet user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0) Tablet Safari/604.1',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'iOS',
            browser: 'Safari',
            device: 'Tablet',
          }),
        }),
      );
    });

    it('should parse Edge browser user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/120.0.0.0',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            browser: 'Edge',
          }),
        }),
      );
    });

    it('should parse Opera browser user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) OPR/105.0.0.0',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            browser: 'Opera',
          }),
        }),
      );
    });

    it('should handle empty user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: '',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'Unknown',
            browser: 'Unknown',
            device: 'Unknown',
          }),
        }),
      );
    });

    it('should handle undefined user agent', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '192.168.1.1',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            os: 'Unknown',
            browser: 'Unknown',
            device: 'Unknown',
          }),
        }),
      );
    });

    it('should get location from public IP', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ country: 'Peru', city: 'Lima' }),
      });
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '200.48.100.50',
        userAgent: 'Mozilla/5.0',
      });

      expect(mockFetch).toHaveBeenCalledWith('http://ip-api.com/json/200.48.100.50?fields=country,city');
      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            country: 'Peru',
            city: 'Lima',
          }),
        }),
      );
    });

    it('should handle failed IP geolocation', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '200.48.100.50',
        userAgent: 'Mozilla/5.0',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            country: 'Unknown',
            city: 'Unknown',
          }),
        }),
      );
    });

    it('should create access log with failed status', async () => {
      mockPrismaService.accessLog.create.mockResolvedValue({});

      await service.createAccessLog({
        userId: 'user-123',
        ipAddress: '127.0.0.1',
        success: false,
        failReason: 'Invalid password',
      });

      expect(mockPrismaService.accessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            success: false,
            failReason: 'Invalid password',
          }),
        }),
      );
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
