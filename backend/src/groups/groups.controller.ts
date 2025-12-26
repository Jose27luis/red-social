import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  async create(@CurrentUser() user: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(user.id, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['PUBLIC', 'PRIVATE', 'INVITE_ONLY'] })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.groupsService.findAll(skip, limit, type);
  }

  @Get('my-groups')
  @ApiOperation({ summary: 'Get current user groups' })
  @ApiResponse({ status: 200, description: 'User groups retrieved successfully' })
  async getUserGroups(@CurrentUser() user: any) {
    return this.groupsService.getUserGroups(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiResponse({ status: 200, description: 'Group retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findById(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'Get posts for a group' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Group posts retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Must be a member to view posts' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async getGroupPosts(
    @Param('id') groupId: string,
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const skip = (page - 1) * limit;
    return this.groupsService.getGroupPosts(groupId, user.id, skip, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update group' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can update' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, user.id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can delete' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.delete(id, user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a group' })
  @ApiResponse({ status: 201, description: 'Successfully joined the group' })
  @ApiResponse({ status: 400, description: 'Bad request - Already a member or group is full' })
  @ApiResponse({ status: 403, description: 'Forbidden - Group requires invitation' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async joinGroup(@Param('id') groupId: string, @CurrentUser() user: any) {
    return this.groupsService.joinGroup(groupId, user.id);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a group' })
  @ApiResponse({ status: 200, description: 'Successfully left the group' })
  @ApiResponse({ status: 400, description: 'Bad request - Last admin cannot leave' })
  @ApiResponse({ status: 404, description: 'Not a member of the group' })
  async leaveGroup(@Param('id') groupId: string, @CurrentUser() user: any) {
    return this.groupsService.leaveGroup(groupId, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to group (admin/moderator only)' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins/moderators can add members' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async addMember(@Param('id') groupId: string, @CurrentUser() user: any, @Body() addMemberDto: AddMemberDto) {
    return this.groupsService.addMember(groupId, user.id, addMemberDto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from group (admin/moderator only)' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins/moderators can remove members' })
  @ApiResponse({ status: 404, description: 'Group or member not found' })
  async removeMember(@Param('id') groupId: string, @Param('userId') userId: string, @CurrentUser() user: any) {
    return this.groupsService.removeMember(groupId, user.id, userId);
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role (admin only)' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can update roles' })
  @ApiResponse({ status: 404, description: 'Group or member not found' })
  async updateMemberRole(
    @Param('id') groupId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    return this.groupsService.updateMemberRole(groupId, user.id, userId, updateMemberRoleDto);
  }

  @Get(':id/is-member')
  @ApiOperation({ summary: 'Check if current user is member of group' })
  @ApiResponse({ status: 200, description: 'Membership status retrieved' })
  async isMember(@Param('id') groupId: string, @CurrentUser() user: any) {
    const isMember = await this.groupsService.isMember(groupId, user.id);
    return { isMember };
  }
}
