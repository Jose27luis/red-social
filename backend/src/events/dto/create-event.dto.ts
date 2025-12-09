import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Seminario de Inteligencia Artificial' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Seminario sobre las últimas tendencias en IA' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2024-12-15T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-15T12:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Auditorio Principal' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 500, default: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxAttendees?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;
}
