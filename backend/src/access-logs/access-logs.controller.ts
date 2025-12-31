import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessLogsService } from './access-logs.service';

@ApiTags('Access Logs')
@Controller('access-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccessLogsController {
  constructor(private readonly accessLogsService: AccessLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get access history for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Access logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyAccessLogs(
    @Request() req: { user: { userId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);

    return this.accessLogsService.getAccessLogs(req.user.userId, pageNum, limitNum);
  }

  @Get('failed-attempts')
  @ApiOperation({ summary: 'Get count of failed login attempts in last 24 hours' })
  @ApiResponse({ status: 200, description: 'Failed attempts count retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFailedAttempts(@Request() req: { user: { userId: string } }) {
    const count = await this.accessLogsService.getFailedAttempts(req.user.userId);
    return { failedAttempts: count, period: '24 hours' };
  }
}
