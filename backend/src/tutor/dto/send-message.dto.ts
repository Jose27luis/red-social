import { IsString, IsUUID, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendTutorMessageDto {
  @ApiProperty({
    description: 'Contenido del mensaje',
    example: 'Explica el concepto de polimorfismo en POO',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    description: 'ID de la conversacion (si continua una conversacion existente)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  conversationId?: string;
}
