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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Resources')
@Controller('resources')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a resource' })
  @ApiResponse({ status: 201, description: 'Resource uploaded successfully' })
  async create(@CurrentUser() user: any, @Body() data: any) {
    return this.resourcesService.create(user.id, data);
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
