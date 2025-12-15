# Guía de Validación con class-validator

Esta guía completa explica cómo usar `class-validator` para validar y sanitizar entrada de usuarios, previniendo vulnerabilidades de seguridad.

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Decoradores Básicos](#decoradores-básicos)
4. [Validadores de Seguridad Personalizados](#validadores-de-seguridad-personalizados)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

### ¿Qué es class-validator?

**class-validator** permite usar decoradores para validar propiedades de clases TypeScript. En NestJS, se usa principalmente para validar DTOs (Data Transfer Objects).

### ¿Por qué es importante?

La validación de entrada es la **primera línea de defensa** contra:
- ✅ SQL Injection
- ✅ XSS (Cross-Site Scripting)
- ✅ Command Injection
- ✅ Path Traversal
- ✅ Buffer Overflow
- ✅ Prototype Pollution

---

## ⚙️ Configuración

### 1. Instalación

```bash
npm install class-validator class-transformer
```

**Ya instalado en el proyecto:**
- `class-validator@0.14.2`
- `class-transformer@0.5.1`

### 2. Configuración Global

Archivo: `src/main.ts`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Elimina propiedades no decoradas
    forbidNonWhitelisted: true,   // Lanza error si hay props extras
    transform: true,              // Transforma tipos automáticamente
  }),
);
```

#### Opciones del ValidationPipe:

| Opción | Descripción | Valor Actual |
|--------|-------------|--------------|
| `whitelist` | Elimina propiedades no definidas en el DTO | ✅ `true` |
| `forbidNonWhitelisted` | Lanza error si hay propiedades extras | ✅ `true` |
| `transform` | Convierte tipos automáticamente | ✅ `true` |
| `disableErrorMessages` | Oculta mensajes de error (producción) | ❌ `false` |
| `validateCustomDecorators` | Valida decoradores personalizados | ✅ `true` (default) |

---

## 🔧 Decoradores Básicos

### Validación de Strings

```typescript
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ExampleDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters' })
  name: string;
}
```

### Validación de Emails

```typescript
import { IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(100)
  email: string;
}
```

### Validación de Números

```typescript
import { IsNumber, Min, Max, IsInt, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsPositive()
  page: number;

  @IsInt()
  @Min(1)
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number;
}
```

### Validación de Arrays

```typescript
import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class TagsDto {
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMinSize(1, { message: 'At least one tag is required' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags: string[];
}
```

### Validación de Enums

```typescript
import { IsEnum } from 'class-validator';

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export class UserDto {
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole;
}
```

### Validación de UUIDs

```typescript
import { IsUUID } from 'class-validator';

export class GetUserDto {
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  id: string;
}
```

### Validación de URLs

```typescript
import { IsUrl } from 'class-validator';

export class ProfileDto {
  @IsUrl({}, { message: 'Website must be a valid URL' })
  @MaxLength(200)
  website: string;
}
```

### Validación de Fechas

```typescript
import { IsDate, MinDate, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';

export class EventDto {
  @IsDate({ message: 'Start date must be a valid date' })
  @MinDate(new Date(), { message: 'Start date must be in the future' })
  @Type(() => Date)
  startDate: Date;
}
```

### Campos Opcionales

```typescript
import { IsOptional } from 'class-validator';

export class UpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio?: string;
}
```

---

## 🛡️ Validadores de Seguridad Personalizados

Ubicación: `src/common/validators/security.validators.ts`

### 1. IsNotSqlInjection

**Previene:** SQL Injection

**Uso:**
```typescript
import { IsNotSqlInjection } from '@/common/validators';

export class SearchDto {
  @IsString()
  @IsNotSqlInjection({ message: 'Search contains forbidden SQL patterns' })
  query: string;
}
```

**Detecta:**
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- `DROP`, `CREATE`, `ALTER`, `EXEC`
- Comentarios SQL: `--`, `/* */`
- Operadores: `OR 1=1`, `UNION SELECT`

### 2. IsNotXSS

**Previene:** Cross-Site Scripting (XSS)

**Uso:**
```typescript
import { IsNotXSS } from '@/common/validators';

export class CommentDto {
  @IsString()
  @IsNotXSS({ message: 'Comment contains dangerous HTML/JavaScript' })
  content: string;
}
```

**Detecta:**
- `<script>` tags
- `<iframe>` tags
- `javascript:` URLs
- Event handlers: `onclick=`, `onerror=`
- `<embed>`, `<object>` tags

### 3. IsNotPathTraversal

**Previene:** Path Traversal

**Uso:**
```typescript
import { IsNotPathTraversal } from '@/common/validators';

export class FileDto {
  @IsString()
  @IsNotPathTraversal({ message: 'Path contains traversal patterns' })
  filePath: string;
}
```

**Detecta:**
- `../` y `..\`
- URL encoded: `%2e%2e`
- Double encoded: `%252e%252e`

### 4. IsNotCommandInjection

**Previene:** Command Injection

**Uso:**
```typescript
import { IsNotCommandInjection } from '@/common/validators';

export class SystemDto {
  @IsString()
  @IsNotCommandInjection({ message: 'Input contains command injection patterns' })
  command: string;
}
```

**Detecta:**
- Caracteres especiales: `;`, `|`, `&`, `` ` ``
- `$()`, `$()`
- `&&`, `||`
- Newlines: `\n`, `\r`

### 5. IsStrongPassword

**Previene:** Contraseñas débiles

**Uso:**
```typescript
import { IsStrongPassword } from '@/common/validators';

export class RegisterDto {
  @IsStrongPassword({ message: 'Password does not meet requirements' })
  password: string;
}
```

**Requisitos:**
- ✅ Mínimo 8 caracteres
- ✅ Al menos una mayúscula
- ✅ Al menos una minúscula
- ✅ Al menos un número
- ✅ Al menos un carácter especial (@$!%*?&)

### 6. IsSafeFilename

**Previene:** Nombres de archivo peligrosos

**Uso:**
```typescript
import { IsSafeFilename } from '@/common/validators';

export class UploadDto {
  @IsSafeFilename({ message: 'Filename contains forbidden characters' })
  filename: string;
}
```

**Permite solo:**
- Letras: `a-zA-Z`
- Números: `0-9`
- Caracteres especiales: `.`, `-`, `_`

### 7. IsNotPrototypePollution

**Previene:** Prototype Pollution

**Uso:**
```typescript
import { IsNotPrototypePollution } from '@/common/validators';

export class ConfigDto {
  @IsString()
  @IsNotPrototypePollution()
  key: string;
}
```

**Detecta:**
- `__proto__`
- `constructor`
- `prototype`

### 8. IsSanitizedText

**Previene:** Múltiples ataques (XSS, SQL, Command Injection)

**Uso:**
```typescript
import { IsSanitizedText } from '@/common/validators';

export class PostDto {
  @IsSanitizedText()
  content: string;
}
```

**Aplica automáticamente:**
- IsNotXSS
- IsNotSqlInjection
- IsNotCommandInjection

---

## 💡 Ejemplos Prácticos

Ver ejemplos completos en: `src/common/validators/examples.dto.ts`

### Ejemplo 1: Registro Seguro

```typescript
export class SecureRegisterDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsStrongPassword()
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotXSS()
  @IsNotSqlInjection()
  name: string;
}
```

### Ejemplo 2: Búsqueda Segura

```typescript
export class SearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsNotSqlInjection()
  @IsNotXSS()
  query: string;
}
```

### Ejemplo 3: Subida de Archivo

```typescript
export class UploadFileDto {
  @IsString()
  @MaxLength(255)
  @IsSafeFilename()
  filename: string;

  @IsString()
  @MaxLength(500)
  @IsNotPathTraversal()
  destination: string;
}
```

---

## ✅ Mejores Prácticas

### 1. Siempre validar en el backend

❌ **MAL:**
```typescript
// Confiar en la validación del frontend
export class UserDto {
  email: string;  // Sin validación
  password: string;  // Sin validación
}
```

✅ **BIEN:**
```typescript
export class UserDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsStrongPassword()
  password: string;
}
```

### 2. Usar mensajes de error claros

❌ **MAL:**
```typescript
@MinLength(8)  // Error genérico
password: string;
```

✅ **BIEN:**
```typescript
@MinLength(8, { message: 'Password must be at least 8 characters long' })
password: string;
```

### 3. Limitar longitudes máximas

❌ **MAL:**
```typescript
@IsString()
content: string;  // Sin límite (vulnerable a DoS)
```

✅ **BIEN:**
```typescript
@IsString()
@MaxLength(5000, { message: 'Content cannot exceed 5000 characters' })
content: string;
```

### 4. Combinar validadores

❌ **MAL:**
```typescript
@IsString()
comment: string;  // Solo tipo, sin seguridad
```

✅ **BIEN:**
```typescript
@IsString()
@MinLength(1)
@MaxLength(1000)
@IsNotXSS()
@IsNotSqlInjection()
comment: string;
```

### 5. Usar whitelist en ValidationPipe

✅ **Configuración correcta:**
```typescript
new ValidationPipe({
  whitelist: true,              // Elimina props extras
  forbidNonWhitelisted: true,   // Lanza error si hay extras
  transform: true,
})
```

### 6. Validar tipos complejos

```typescript
// Para arrays de objetos
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
```

---

## 🚨 Troubleshooting

### Problema 1: Validación no funciona

**Causa:** ValidationPipe no configurado globalmente

**Solución:**
```typescript
// src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### Problema 2: Los tipos no se transforman

**Causa:** `transform: false` o falta `@Type()`

**Solución:**
```typescript
// Opción 1: Habilitar transform en ValidationPipe
new ValidationPipe({ transform: true })

// Opción 2: Usar @Type() para tipos complejos
@Type(() => Date)
startDate: Date;
```

### Problema 3: Validadores personalizados no funcionan

**Causa:** No están registrados correctamente

**Solución:**
```typescript
import { registerDecorator } from 'class-validator';

export function CustomValidator() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'customValidator',
      target: object.constructor,
      propertyName: propertyName,
      validator: CustomValidatorConstraint,
    });
  };
}
```

### Problema 4: Mensajes de error en español

**Solución:**
```typescript
@MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
password: string;
```

### Problema 5: Validación asíncrona

**Ejemplo:**
```typescript
@ValidatorConstraint({ name: 'UniqueEmail', async: true })
export class UniqueEmailConstraint implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(email: string) {
    const user = await this.userService.findByEmail(email);
    return !user;
  }

  defaultMessage() {
    return 'Email already exists';
  }
}
```

---

## 📊 Comparación: Antes vs Después

### Antes

```typescript
export class CreateUserDto {
  email: string;        // Sin validación
  password: string;     // Sin validación
  name: string;         // Sin validación
}
```

**Vulnerabilidades:**
- ❌ SQL Injection posible
- ❌ XSS posible
- ❌ Sin límites de longitud (DoS)
- ❌ Emails inválidos aceptados
- ❌ Contraseñas débiles aceptadas

### Después

```typescript
export class CreateUserDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsStrongPassword()
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotXSS()
  @IsNotSqlInjection()
  name: string;
}
```

**Protecciones:**
- ✅ SQL Injection bloqueada
- ✅ XSS bloqueada
- ✅ Límites de longitud aplicados
- ✅ Solo emails válidos
- ✅ Contraseñas fuertes requeridas

---

## 🔗 Recursos Adicionales

- [class-validator Documentation](https://github.com/typestack/class-validator)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [MDN Data Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)

---

## 📝 Checklist de Validación

Usa este checklist para cada DTO nuevo:

- [ ] ¿Todos los campos tienen decoradores de tipo?
- [ ] ¿Hay límites MaxLength en strings?
- [ ] ¿Los emails usan @IsEmail()?
- [ ] ¿Las contraseñas tienen validación fuerte?
- [ ] ¿Los inputs de usuario tienen validación anti-XSS?
- [ ] ¿Las búsquedas tienen validación anti-SQL Injection?
- [ ] ¿Los campos opcionales usan @IsOptional()?
- [ ] ¿Los arrays tienen límites de tamaño?
- [ ] ¿Los UUIDs usan @IsUUID()?
- [ ] ¿Los mensajes de error son claros?

---

**Última actualización:** Diciembre 2025
**Mantenido por:** Equipo de Desarrollo
