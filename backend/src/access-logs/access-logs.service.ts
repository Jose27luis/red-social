import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface CreateAccessLogDto {
  userId: string;
  ipAddress: string;
  userAgent?: string;
  success?: boolean;
  failReason?: string;
}

interface ParsedUserAgent {
  device: string;
  browser: string;
  os: string;
}

@Injectable()
export class AccessLogsService {
  private readonly logger = new Logger(AccessLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parsea el user agent para extraer información del dispositivo, navegador y SO
   */
  private parseUserAgent(userAgent: string): ParsedUserAgent {
    const result: ParsedUserAgent = {
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
    };

    if (!userAgent) return result;

    // Detect OS
    if (userAgent.includes('Windows')) {
      result.os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      result.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      result.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      result.os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      result.os = 'iOS';
    }

    // Detect Browser
    if (userAgent.includes('Firefox')) {
      result.browser = 'Firefox';
    } else if (userAgent.includes('Edg')) {
      result.browser = 'Edge';
    } else if (userAgent.includes('Chrome')) {
      result.browser = 'Chrome';
    } else if (userAgent.includes('Safari')) {
      result.browser = 'Safari';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      result.browser = 'Opera';
    }

    // Detect Device
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      result.device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      result.device = 'Tablet';
    } else {
      result.device = 'Desktop';
    }

    return result;
  }

  /**
   * Obtiene la ubicación a partir de la IP usando el servicio gratuito ip-api.com
   */
  private async getLocationFromIp(ip: string): Promise<{ country: string; city: string }> {
    try {
      // Omitir para IPs locales/privadas
      if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Local', city: 'Localhost' };
      }

      const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
      const data = await response.json();

      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
      };
    } catch {
      this.logger.warn(`Failed to get location for IP: ${ip}`);
      return { country: 'Unknown', city: 'Unknown' };
    }
  }

  /**
   * Crea un nuevo registro de acceso
   */
  async createAccessLog(dto: CreateAccessLogDto) {
    const parsedAgent = this.parseUserAgent(dto.userAgent || '');
    const location = await this.getLocationFromIp(dto.ipAddress);

    const accessLog = await this.prisma.accessLog.create({
      data: {
        userId: dto.userId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        device: parsedAgent.device,
        browser: parsedAgent.browser,
        os: parsedAgent.os,
        country: location.country,
        city: location.city,
        success: dto.success ?? true,
        failReason: dto.failReason,
      },
    });

    this.logger.log(`Access log created for user ${dto.userId} from ${dto.ipAddress}`);
    return accessLog;
  }

  /**
   * Obtiene los registros de acceso de un usuario específico
   */
  async getAccessLogs(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.accessLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.accessLog.count({ where: { userId } }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene los intentos fallidos de login recientes de un usuario
   */
  async getFailedAttempts(userId: string, hours = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.prisma.accessLog.count({
      where: {
        userId,
        success: false,
        createdAt: { gte: since },
      },
    });
  }

  /**
   * Elimina registros de acceso antiguos (más antiguos que los días especificados)
   */
  async cleanupOldLogs(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.accessLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old access logs`);
    return result.count;
  }
}
