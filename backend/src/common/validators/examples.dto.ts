/**
 * ==========================================================
 * EJEMPLOS DE USO DE VALIDADORES PERSONALIZADOS
 * ==========================================================
 *
 * Este archivo contiene DTOs de ejemplo que muestran cómo usar
 * los validadores personalizados de seguridad.
 */

import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotXSS,
  IsNotSqlInjection,
  IsStrongPassword,
  IsSafeFilename,
  IsSanitizedText,
  IsNotPathTraversal,
} from './security.validators';

// ==========================================================
// EJEMPLO 1: Registro de usuario con validaciones de seguridad
// ==========================================================

export class SecureRegisterDto {
  @ApiProperty({ example: 'usuario@unamad.edu.pe' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsStrongPassword({ message: 'Password does not meet security requirements' })
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotXSS()
  @IsNotSqlInjection()
  name: string;
}

// ==========================================================
// EJEMPLO 2: Búsqueda segura (prevenir SQL Injection)
// ==========================================================

export class SearchDto {
  @ApiProperty({ example: 'matemáticas' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsNotSqlInjection({ message: 'Search query contains forbidden patterns' })
  @IsNotXSS()
  query: string;

  @ApiPropertyOptional({ example: 'posts' })
  @IsOptional()
  @IsString()
  @IsNotSqlInjection()
  category?: string;
}

// ==========================================================
// EJEMPLO 3: Subida de archivo seguro
// ==========================================================

export class UploadFileDto {
  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  @MaxLength(255)
  @IsSafeFilename({ message: 'Filename contains forbidden characters' })
  filename: string;

  @ApiProperty({ example: '/uploads' })
  @IsString()
  @MaxLength(500)
  @IsNotPathTraversal({ message: 'Path contains traversal patterns' })
  destination: string;
}

// ==========================================================
// EJEMPLO 4: Comentario/Post seguro (prevenir XSS)
// ==========================================================

export class SecureCommentDto {
  @ApiProperty({ example: 'Este es un comentario seguro' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  @IsNotXSS({ message: 'Comment contains potentially dangerous content' })
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;
}

// ==========================================================
// EJEMPLO 5: Configuración de perfil (múltiples validaciones)
// ==========================================================

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Mi biografía' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSanitizedText() // Aplica XSS, SQL Injection, y Command Injection
  bio?: string;

  @ApiPropertyOptional({ example: 'Ciudad Universitaria' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotXSS()
  location?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  website?: string;
}

// ==========================================================
// EJEMPLO 6: Filtros con validación estricta
// ==========================================================

export class FilterDto {
  @ApiPropertyOptional({ example: 'STUDENT' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsNotSqlInjection()
  role?: string;

  @ApiPropertyOptional({ example: 'Ingeniería' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotSqlInjection()
  @IsNotXSS()
  department?: string;

  @ApiPropertyOptional({ example: '2024' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @IsNotSqlInjection()
  year?: string;
}

// ==========================================================
// EJEMPLO 7: Validación de entrada de formulario completo
// ==========================================================

export class ContactFormDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotXSS()
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: 'Consulta sobre el curso' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsNotXSS()
  subject: string;

  @ApiProperty({ example: 'Necesito información sobre...' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  @IsSanitizedText()
  message: string;
}
