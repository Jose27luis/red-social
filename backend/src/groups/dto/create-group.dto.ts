import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum GroupType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  INVITE_ONLY = 'INVITE_ONLY',
}

export class CreateGroupDto {
  @ApiProperty({ example: 'Ingeniería de Sistemas' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Grupo para estudiantes de Ingeniería de Sistemas' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ enum: GroupType, default: 'PUBLIC' })
  @IsOptional()
  @IsEnum(GroupType)
  type?: GroupType;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;
}
