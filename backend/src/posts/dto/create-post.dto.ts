import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
  MinLength,
  IsUUID,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ maxLength: 3000, minLength: 1 })
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Content cannot be empty' })
  @MaxLength(3000, { message: 'Content must not exceed 3000 characters' })
  // Prevenir inyección de scripts básica
  @Matches(/^(?!.*<script).*$/i, {
    message: 'Content contains forbidden patterns',
  })
  content: string;

  @ApiProperty({ enum: PostType, default: PostType.DISCUSSION })
  @IsEnum(PostType, { message: 'Type must be a valid post type' })
  type: PostType;

  @ApiPropertyOptional({ type: [String], maxItems: 10 })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string' })
  @Matches(/^(\/uploads\/|https?:\/\/)/, { each: true, message: 'Each image must be a valid path or URL' })
  @ArrayMaxSize(10, { message: 'Cannot upload more than 10 images' })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Group ID must be a valid UUID' })
  groupId?: string;
}
