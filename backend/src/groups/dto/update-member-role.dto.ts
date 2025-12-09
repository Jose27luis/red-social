import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum GroupMemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: GroupMemberRole })
  @IsEnum(GroupMemberRole)
  role: GroupMemberRole;
}
