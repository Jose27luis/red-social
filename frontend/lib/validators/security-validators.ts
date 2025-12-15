/**
 * Security Validators for Zod
 *
 * Custom Zod validators that mirror the backend's class-validator decorators.
 * These provide client-side validation for security threats like SQL injection,
 * XSS, path traversal, command injection, and more.
 *
 * Each validator returns a Zod schema that can be chained with other validations.
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   email: z.string().email().pipe(zIsNotXSS()),
 *   password: zIsStrongPassword(),
 *   searchQuery: z.string().pipe(zIsNotSqlInjection()).pipe(zIsNotXSS()),
 * });
 * ```
 */

import { z } from 'zod';

/**
 * 1. SQL Injection Validator
 *
 * Detects common SQL injection patterns:
 * - SQL keywords (SELECT, INSERT, UPDATE, DELETE, DROP, etc.)
 * - UNION SELECT attacks
 * - Comment syntax (-- , /* *\/, #)
 * - OR 1=1 patterns
 *
 * @param message - Custom error message
 * @returns Zod string schema with SQL injection validation
 *
 * @example
 * ```typescript
 * const searchSchema = z.object({
 *   query: z.string().pipe(zIsNotSqlInjection())
 * });
 * ```
 */
export function zIsNotSqlInjection(
  message: string = 'Input contains potential SQL injection patterns'
) {
  return z.string().refine(
    (value) => {
      if (!value) return true;

      const sqlPatterns = [
        // SQL Keywords
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT)\b)/gi,
        // UNION SELECT
        /(\bUNION\b.*\bSELECT\b)/gi,
        // Comment syntax
        /(--|\/\*|\*\/|#)/g,
        // OR 1=1 patterns
        /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
        /(\'\s*OR\s*\'.+\'\s*=\s*\')/gi,
        // URL encoded versions
        /(\%27)|(\%23)|(\%2D\%2D)/gi,
      ];

      return !sqlPatterns.some((pattern) => pattern.test(value));
    },
    { message }
  );
}

/**
 * 2. XSS (Cross-Site Scripting) Validator
 *
 * Detects XSS attack patterns:
 * - Script tags
 * - iFrame tags
 * - JavaScript protocol
 * - Event handlers (onclick, onerror, etc.)
 * - Other dangerous tags (object, embed)
 *
 * @param message - Custom error message
 * @returns Zod string schema with XSS validation
 *
 * @example
 * ```typescript
 * const postSchema = z.object({
 *   content: z.string().pipe(zIsNotXSS())
 * });
 * ```
 */
export function zIsNotXSS(
  message: string = 'Input contains potential XSS attack patterns'
) {
  return z.string().refine(
    (value) => {
      if (!value) return true;

      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:\s*/gi,
        /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers
        /<object\b/gi,
        /<embed\b/gi,
        /<applet\b/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
        /onload\s*=/gi,
        /<style\b.*expression\s*\(/gi, // CSS expression
        /vbscript:/gi,
        /data:text\/html/gi,
      ];

      return !xssPatterns.some((pattern) => pattern.test(value));
    },
    { message }
  );
}

/**
 * 3. Path Traversal Validator
 *
 * Detects path traversal attempts:
 * - ../ and ..\ patterns
 * - URL encoded versions (%2e%2e, %252e%252e)
 *
 * @param message - Custom error message
 * @returns Zod string schema with path traversal validation
 *
 * @example
 * ```typescript
 * const fileSchema = z.object({
 *   path: z.string().pipe(zIsNotPathTraversal())
 * });
 * ```
 */
export function zIsNotPathTraversal(
  message: string = 'Input contains path traversal patterns'
) {
  return z.string().refine(
    (value) => {
      if (!value) return true;

      const traversalPatterns = [
        /\.\.\//g, // ../
        /\.\.\\/g, // ..\
        /%2e%2e%2f/gi, // URL encoded ../
        /%252e%252e%252f/gi, // Double URL encoded
        /\.\.%2f/gi,
        /\.\.%5c/gi,
        /%2e%2e\//gi,
      ];

      return !traversalPatterns.some((pattern) => pattern.test(value));
    },
    { message }
  );
}

/**
 * 4. Command Injection Validator
 *
 * Detects command injection patterns:
 * - Command separators (;, |, &)
 * - Backticks for command substitution
 * - $() for command substitution
 * - Newlines
 *
 * @param message - Custom error message
 * @returns Zod string schema with command injection validation
 *
 * @example
 * ```typescript
 * const commandSchema = z.object({
 *   input: z.string().pipe(zIsNotCommandInjection())
 * });
 * ```
 */
export function zIsNotCommandInjection(
  message: string = 'Input contains potential command injection patterns'
) {
  return z.string().refine(
    (value) => {
      if (!value) return true;

      const commandPatterns = [
        /[;&|`]/g, // Command separators and backticks
        /\$\(.*\)/g, // Command substitution $()
        /\${.*}/g, // Variable substitution
        /&&|\|\|/g, // Logical operators
        /\n|\r/g, // Newlines
      ];

      return !commandPatterns.some((pattern) => pattern.test(value));
    },
    { message }
  );
}

/**
 * 5. Strong Password Validator
 *
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param message - Custom error message
 * @returns Zod string schema with strong password validation
 *
 * @example
 * ```typescript
 * const registerSchema = z.object({
 *   password: zIsStrongPassword()
 * });
 * ```
 */
export function zIsStrongPassword(
  message: string = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
) {
  return z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .refine(
      (value) => {
        // At least one uppercase
        if (!/[A-Z]/.test(value)) return false;
        // At least one lowercase
        if (!/[a-z]/.test(value)) return false;
        // At least one number
        if (!/[0-9]/.test(value)) return false;
        // At least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return false;

        return true;
      },
      { message }
    );
}

/**
 * 6. Safe Filename Validator
 *
 * Validates filename contains only safe characters:
 * - Letters (a-z, A-Z)
 * - Numbers (0-9)
 * - Dots, dashes, underscores (., -, _)
 * - No path traversal (..)
 *
 * @param message - Custom error message
 * @returns Zod string schema with filename validation
 *
 * @example
 * ```typescript
 * const uploadSchema = z.object({
 *   filename: zIsSafeFilename()
 * });
 * ```
 */
export function zIsSafeFilename(
  message: string = 'Filename contains invalid characters'
) {
  return z.string().refine(
    (value) => {
      if (!value) return false;

      // Only allow alphanumeric, dots, dashes, underscores
      const safeFilenameRegex = /^[a-zA-Z0-9._-]+$/;

      // Check against safe pattern
      if (!safeFilenameRegex.test(value)) return false;

      // Prevent .. in filename
      if (value.includes('..')) return false;

      // Prevent starting with dot (hidden files)
      if (value.startsWith('.')) return false;

      // Must have at least one character before extension
      const parts = value.split('.');
      if (parts.length > 1 && parts[0].length === 0) return false;

      return true;
    },
    { message }
  );
}

/**
 * 7. Prototype Pollution Validator
 *
 * Detects object keys that could lead to prototype pollution:
 * - __proto__
 * - constructor
 * - prototype
 *
 * @param message - Custom error message
 * @returns Zod string schema with prototype pollution validation
 *
 * @example
 * ```typescript
 * const objectKeySchema = z.string().pipe(zIsNotPrototypePollution());
 * ```
 */
export function zIsNotPrototypePollution(
  message: string = 'Input contains dangerous object keys'
) {
  return z.string().refine(
    (value) => {
      if (!value) return true;

      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      const lowerValue = value.toLowerCase();

      return !dangerousKeys.includes(lowerValue);
    },
    { message }
  );
}

/**
 * 8. Sanitized Text Validator
 *
 * Combines multiple security checks:
 * - No XSS patterns
 * - No SQL injection patterns
 * - No command injection patterns
 *
 * Use this for general user input that needs comprehensive validation.
 *
 * @param message - Custom error message
 * @returns Zod string schema with combined security validation
 *
 * @example
 * ```typescript
 * const commentSchema = z.object({
 *   text: z.string().pipe(zIsSanitizedText())
 * });
 * ```
 */
export function zIsSanitizedText(
  message: string = 'Input contains potentially dangerous content'
) {
  return z.string().superRefine((value, ctx) => {
    if (!value) return;

    // Check for XSS
    const xssValidator = zIsNotXSS('Contains XSS patterns');
    const xssResult = xssValidator.safeParse(value);
    if (!xssResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: xssResult.error.errors[0].message,
      });
    }

    // Check for SQL injection
    const sqlValidator = zIsNotSqlInjection('Contains SQL injection patterns');
    const sqlResult = sqlValidator.safeParse(value);
    if (!sqlResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: sqlResult.error.errors[0].message,
      });
    }

    // Check for command injection
    const cmdValidator = zIsNotCommandInjection('Contains command injection patterns');
    const cmdResult = cmdValidator.safeParse(value);
    if (!cmdResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: cmdResult.error.errors[0].message,
      });
    }
  });
}

/**
 * Email with domain restriction validator
 *
 * Validates email format and restricts to specific domain
 *
 * @param allowedDomain - Domain to restrict (e.g., '@unamad.edu.pe')
 * @param message - Custom error message
 * @returns Zod string schema with email validation
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   email: zIsUniversityEmail('@unamad.edu.pe')
 * });
 * ```
 */
export function zIsUniversityEmail(
  allowedDomain: string = process.env.NEXT_PUBLIC_UNIVERSIDAD_DOMAIN || '@unamad.edu.pe',
  message: string = `Email must be from ${allowedDomain} domain`
) {
  return z
    .string()
    .email('Invalid email format')
    .refine(
      (value) => {
        return value.toLowerCase().endsWith(allowedDomain.toLowerCase());
      },
      { message }
    );
}

/**
 * UUID v4 Validator
 *
 * Validates that string is a valid UUID v4
 *
 * @param message - Custom error message
 * @returns Zod string schema with UUID validation
 */
export function zIsUUIDv4(message: string = 'Invalid UUID format') {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return z.string().refine((value) => uuidRegex.test(value), { message });
}

/**
 * Safe URL Validator
 *
 * Validates URL and ensures it uses safe protocols
 *
 * @param message - Custom error message
 * @returns Zod string schema with URL validation
 */
export function zIsSafeUrl(message: string = 'Invalid or unsafe URL') {
  return z.string().url('Invalid URL format').refine(
    (value) => {
      const lower = value.toLowerCase();
      const safeProtocols = ['http://', 'https://'];

      return safeProtocols.some((protocol) => lower.startsWith(protocol));
    },
    { message }
  );
}
