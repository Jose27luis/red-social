import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// Configure multer storage
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/javascript',
    'application/json',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
  }
};

@ApiTags('Resources')
@Controller('resources')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a resource with metadata' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async create(@CurrentUser() user: any, @Body() data: any) {
    return this.resourcesService.create(user.id, data);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a resource file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        fileType: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Resource uploaded successfully' })
  async upload(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; description: string; fileType: string },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const resourceData = {
      title: body.title || file.originalname,
      description: body.description,
      fileType: body.fileType,
      fileUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
    };

    return this.resourcesService.create(user.id, resourceData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resources with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const skip = (page - 1) * limit;
    return this.resourcesService.findAll(skip, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource retrieved successfully' })
  async findById(@Param('id') id: string) {
    return this.resourcesService.findById(id);
  }

  @Patch(':id/download')
  @ApiOperation({ summary: 'Increment download count' })
  @ApiResponse({ status: 200, description: 'Download count incremented' })
  async incrementDownload(@Param('id') id: string) {
    return this.resourcesService.incrementDownload(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.resourcesService.delete(id, user.id);
  }
}
