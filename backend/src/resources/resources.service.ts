import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const ALLOWED_RESOURCE_TYPES = ['DOCUMENT', 'PRESENTATION', 'SPREADSHEET', 'VIDEO', 'AUDIO', 'IMAGE', 'CODE', 'OTHER'];
const MAX_FILE_SIZE = 52428800; // 50MB

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(uploaderId: string, data: any) {
    // Validate resource type
    const resourceType = data.fileType?.toUpperCase();
    if (resourceType && !ALLOWED_RESOURCE_TYPES.includes(resourceType)) {
      throw new BadRequestException(
        `Resource type ${data.fileType} not allowed. Allowed types: ${ALLOWED_RESOURCE_TYPES.join(', ')}`,
      );
    }

    // Validate file size if provided
    if (data.fileSize && data.fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds maximum of 50MB`);
    }

    // Check daily limit for new users (3 resources per day)
    const user = await this.prisma.user.findUnique({ where: { id: uploaderId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const accountAge = Date.now() - user.createdAt.getTime();
    const isNewUser = accountAge < 7 * 24 * 60 * 60 * 1000; // 7 days

    if (isNewUser) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const todayResources = await this.prisma.resource.count({
        where: {
          uploaderId,
          createdAt: { gte: oneDayAgo },
        },
      });

      if (todayResources >= 3) {
        throw new BadRequestException('New users can upload max 3 resources per day');
      }
    }

    return this.prisma.resource.create({
      data: {
        title: data.title,
        description: data.description || null,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        uploaderId,
      },
      include: {
        uploader: {
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

  async findAll(skip = 0, take = 20) {
    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        skip,
        take,
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count(),
    ]);

    const page = Math.floor(skip / take) + 1;
    return {
      data: resources,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async findById(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async incrementDownload(id: string) {
    await this.prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    return { message: 'Download count incremented' };
  }

  async delete(id: string, userId: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.uploaderId !== userId) {
      throw new BadRequestException('You can only delete your own resources');
    }

    return this.prisma.resource.delete({ where: { id } });
  }
}
