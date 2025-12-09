import { IsString, IsEnum, IsOptional, IsArray, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ maxLength: 3000 })
  @IsString()
  @MaxLength(3000)
  content: string;

  @ApiProperty({ enum: PostType, default: PostType.DISCUSSION })
  @IsEnum(PostType)
  type: PostType;

  @ApiPropertyOptional({ type: [String], maxItems: 10 })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
