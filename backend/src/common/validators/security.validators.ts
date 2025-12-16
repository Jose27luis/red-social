import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * ==========================================================
 * VALIDADORES PERSONALIZADOS DE SEGURIDAD
 * ==========================================================
 */

// ==========================================================
// 1. NO SQL INJECTION
// ==========================================================

@ValidatorConstraint({ name: 'IsNotSqlInjection', async: false })
export class IsNotSqlInjectionConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text || typeof text !== 'string') return true;

    // Patrones comunes de SQL Injection
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(--|\bOR\b.*=.*|;)/i,
      /('|"|\b1\b.*=.*\b1\b)/i,
      /(union.*select)/i,
    ];

    return !sqlInjectionPatterns.some((pattern) => pattern.test(text));
  }

  defaultMessage(_args: ValidationArguments) {
    return `${_args.property} contains forbidden SQL patterns`;
  }
}

export function IsNotSqlInjection(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotSqlInjection',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotSqlInjectionConstraint,
    });
  };
}

// ==========================================================
// 2. NO XSS (Cross-Site Scripting)
// ==========================================================

@ValidatorConstraint({ name: 'IsNotXSS', async: false })
export class IsNotXSSConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text || typeof text !== 'string') return true;

    // Patrones comunes de XSS
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onerror, etc.
      /<embed[\s\S]*?>/gi,
      /<object[\s\S]*?>/gi,
    ];

    return !xssPatterns.some((pattern) => pattern.test(text));
  }

  defaultMessage(_args: ValidationArguments) {
    return `${_args.property} contains potentially dangerous HTML/JavaScript`;
  }
}

export function IsNotXSS(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotXSS',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotXSSConstraint,
    });
  };
}

// ==========================================================
// 3. NO PATH TRAVERSAL
// ==========================================================

@ValidatorConstraint({ name: 'IsNotPathTraversal', async: false })
export class IsNotPathTraversalConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text || typeof text !== 'string') return true;

    // Patrones de Path Traversal
    const pathTraversalPatterns = [
      /\.\./,
      /\.\.\//, // ../
      /\.\.\\/, // ..\
      /%2e%2e/, // URL encoded ..
      /%252e%252e/, // Double URL encoded ..
    ];

    return !pathTraversalPatterns.some((pattern) => pattern.test(text));
  }

  defaultMessage(_args: ValidationArguments) {
    return `${_args.property} contains path traversal patterns`;
  }
}

export function IsNotPathTraversal(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPathTraversal',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotPathTraversalConstraint,
    });
  };
}

// ==========================================================
// 4. NO COMMAND INJECTION
// ==========================================================

@ValidatorConstraint({ name: 'IsNotCommandInjection', async: false })
export class IsNotCommandInjectionConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text || typeof text !== 'string') return true;

    // Patrones de Command Injection
    const commandInjectionPatterns = [/[;&|`$()]/, /\n|\r/, /&&|\|\|/];

    return !commandInjectionPatterns.some((pattern) => pattern.test(text));
  }

  defaultMessage(_args: ValidationArguments) {
    return `${_args.property} contains command injection patterns`;
  }
}

export function IsNotCommandInjection(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotCommandInjection',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotCommandInjectionConstraint,
    });
  };
}

// ==========================================================
// 5. STRONG PASSWORD
// ==========================================================

@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password || typeof password !== 'string') return false;

    // Requisitos:
    // - Al menos 8 caracteres
    // - Al menos una mayúscula
    // - Al menos una minúscula
    // - Al menos un número
    // - Al menos un carácter especial (cualquier carácter que no sea letra o número)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    return strongPasswordRegex.test(password);
  }

  defaultMessage() {
    return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}

// ==========================================================
// 6. SAFE FILENAME
// ==========================================================

@ValidatorConstraint({ name: 'IsSafeFilename', async: false })
export class IsSafeFilenameConstraint implements ValidatorConstraintInterface {
  validate(filename: string) {
    if (!filename || typeof filename !== 'string') return false;

    // Solo permitir: letras, números, guiones, guiones bajos, y punto
    // No permitir: caracteres especiales, espacios, path traversal
    const safeFilenameRegex = /^[a-zA-Z0-9._-]+$/;

    return safeFilenameRegex.test(filename) && !filename.includes('..');
  }

  defaultMessage(_args: ValidationArguments) {
    return `${_args.property} must be a safe filename (letters, numbers, dots, hyphens, underscores only)`;
  }
}

export function IsSafeFilename(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSafeFilename',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsSafeFilenameConstraint,
    });
  };
}

// ==========================================================
// 7. NO PROTOTYPE POLLUTION
// ==========================================================

@ValidatorConstraint({ name: 'IsNotPrototypePollution', async: false })
export class IsNotPrototypePollutionConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text || typeof text !== 'string') return true;

    // Detectar intentos de prototype pollution
    const prototypePollutionPatterns = [/__proto__/i, /constructor/i, /prototype/i];

    return !prototypePollutionPatterns.some((pattern) => pattern.test(text));
  }

  defaultMessage(_args: ValidationArguments) {
    return `${_args.property} contains forbidden prototype pollution patterns`;
  }
}

export function IsNotPrototypePollution(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPrototypePollution',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotPrototypePollutionConstraint,
    });
  };
}

// ==========================================================
// 8. SANITIZED TEXT (Combinación de múltiples validaciones)
// ==========================================================

export function IsSanitizedText(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    // Aplicar múltiples validaciones de seguridad
    IsNotXSS(validationOptions)(object, propertyName);
    IsNotSqlInjection(validationOptions)(object, propertyName);
    IsNotCommandInjection(validationOptions)(object, propertyName);
  };
}
