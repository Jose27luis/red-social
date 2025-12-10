import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png', 'zip'];
const MAX_FILE_SIZE = 52428800; // 50MB

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async create(uploaderId: string, data: any) {
    // Validate file type
    const fileExtension = data.fileType.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      throw new BadRequestException(
        `File type ${fileExtension} not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (data.fileSize > MAX_FILE_SIZE) {
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
        ...data,
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
    return this.prisma.resource.findMany({
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
    });
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
