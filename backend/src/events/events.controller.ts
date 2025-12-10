import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Events')
@Controller('events')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async create(@CurrentUser() user: any, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(user.id, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeAll', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll: boolean,
  ) {
    const skip = (page - 1) * limit;
    return this.eventsService.findAll(skip, limit, includeAll);
  }

  @Get('my-events')
  @ApiOperation({ summary: 'Get current user upcoming events' })
  @ApiResponse({ status: 200, description: 'User events retrieved successfully' })
  async getUserEvents(@CurrentUser() user: any) {
    return this.eventsService.getUserEvents(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.findById(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only organizer can update' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, user.id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only organizer can delete' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.delete(id, user.id);
  }

  @Post(':id/attend')
  @ApiOperation({ summary: 'Register attendance for event' })
  @ApiResponse({ status: 201, description: 'Attendance registered successfully' })
  async registerAttendance(@Param('id') eventId: string, @CurrentUser() user: any) {
    return this.eventsService.registerAttendance(eventId, user.id);
  }

  @Delete(':id/attend')
  @ApiOperation({ summary: 'Cancel attendance' })
  @ApiResponse({ status: 200, description: 'Attendance cancelled successfully' })
  async cancelAttendance(@Param('id') eventId: string, @CurrentUser() user: any) {
    return this.eventsService.cancelAttendance(eventId, user.id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm attendance with QR code' })
  @ApiResponse({ status: 200, description: 'Attendance confirmed successfully' })
  async confirmAttendance(@Param('id') eventId: string, @CurrentUser() user: any, @Body('qrCode') qrCode: string) {
    return this.eventsService.confirmAttendance(eventId, user.id, qrCode);
  }
}
