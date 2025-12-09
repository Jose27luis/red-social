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
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Rate limit exceeded or invalid receiver' })
  @ApiResponse({ status: 404, description: 'Receiver not found' })
  async sendMessage(@CurrentUser() user: any, @Body() sendMessageDto: SendMessageDto) {
    return this.messagesService.sendMessage(user.id, sendMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getConversation(
    @CurrentUser() user: any,
    @Param('userId') otherUserId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const skip = (page - 1) * limit;
    return this.messagesService.findConversation(user.id, otherUserId, skip, limit);
  }

  @Patch('conversation/:userId/read')
  @ApiOperation({ summary: 'Mark messages from a user as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(@CurrentUser() user: any, @Param('userId') otherUserId: string) {
    return this.messagesService.markAsRead(user.id, otherUserId);
  }

  @Delete(':messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Can only delete own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(@CurrentUser() user: any, @Param('messageId') messageId: string) {
    return this.messagesService.deleteMessage(messageId, user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser() user: any) {
    return this.messagesService.getUnreadCount(user.id);
  }
}
