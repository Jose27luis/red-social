/**
 * File Upload Validation
 *
 * Provides comprehensive validation for file uploads including:
 * - File size limits
 * - MIME type validation
 * - Filename sanitization
 * - Magic byte verification (file signature)
 * - Extension validation
 *
 * IMPORTANT: Client-side validation is NOT sufficient for security.
 * Always validate files on the server side as well.
 */

import { z } from 'zod';
import { zIsSafeFilename } from './security-validators';
import { sanitizeFilename } from '@/lib/security/sanitizer';

// ==================== Constants ====================

/**
 * Maximum file sizes by type (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 25 * 1024 * 1024, // 25MB
  audio: 50 * 1024 * 1024, // 50MB
  default: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Allowed MIME types by category
 */
export const ALLOWED_MIME_TYPES = {
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  video: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
} as const;

/**
 * File magic bytes (signatures) for validation
 * Maps MIME types to their expected magic bytes
 */
export const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff],
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47],
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38],
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF
  ],
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
};

// ==================== Helper Functions ====================

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Check if file extension matches MIME type
 */
export function isExtensionValid(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);

  const validExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'text/plain': ['txt'],
  };

  const expected = validExtensions[mimeType] || [];
  return expected.includes(ext);
}

/**
 * Verify file signature (magic bytes)
 * Returns a promise that resolves to true if signature is valid
 */
export async function verifyFileSignature(
  file: File
): Promise<boolean> {
  const expectedSignatures = FILE_SIGNATURES[file.type];

  if (!expectedSignatures) {
    // If we don't have signatures for this type, skip verification
    // but log a warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`No signature verification available for ${file.type}`);
    }
    return true;
  }

  try {
    // Read first 8 bytes of file
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Check if any of the expected signatures match
    return expectedSignatures.some((signature) => {
      return signature.every((byte, index) => bytes[index] === byte);
    });
  } catch (error) {
    console.error('Error verifying file signature:', error);
    return false;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== Zod Schemas ====================

/**
 * Image Upload Schema
 *
 * Validates image file uploads
 */
export const imageUploadSchema = z.custom<File>(
  (file) => file instanceof File,
  'Invalid file'
).superRefine(async (file, ctx) => {
  // Check file size
  if (file.size > MAX_FILE_SIZES.image) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Image size must be less than ${formatFileSize(MAX_FILE_SIZES.image)}`,
    });
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.image.includes(file.type as any)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid image type. Allowed: ${ALLOWED_MIME_TYPES.image.join(', ')}`,
    });
  }

  // Check filename
  const filenameResult = zIsSafeFilename().safeParse(file.name);
  if (!filenameResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Filename contains invalid characters',
    });
  }

  // Check extension matches MIME type
  if (!isExtensionValid(file.name, file.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'File extension does not match file type',
    });
  }
});

/**
 * Document Upload Schema
 *
 * Validates document file uploads
 */
export const documentUploadSchema = z.custom<File>(
  (file) => file instanceof File,
  'Invalid file'
).superRefine(async (file, ctx) => {
  if (file.size > MAX_FILE_SIZES.document) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Document size must be less than ${formatFileSize(MAX_FILE_SIZES.document)}`,
    });
  }

  if (!ALLOWED_MIME_TYPES.document.includes(file.type as any)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid document type. Allowed: PDF, Word, Excel, PowerPoint, Text`,
    });
  }

  const filenameResult = zIsSafeFilename().safeParse(file.name);
  if (!filenameResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Filename contains invalid characters',
    });
  }

  if (!isExtensionValid(file.name, file.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'File extension does not match file type',
    });
  }
});

/**
 * Generic File Upload Schema
 *
 * Validates any file upload with custom limits
 */
export function createFileUploadSchema(
  allowedTypes: string[],
  maxSize: number = MAX_FILE_SIZES.default
) {
  return z.custom<File>(
    (file) => file instanceof File,
    'Invalid file'
  ).superRefine(async (file, ctx) => {
    if (file.size > maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File size must be less than ${formatFileSize(maxSize)}`,
      });
    }

    if (!allowedTypes.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      });
    }

    const filenameResult = zIsSafeFilename().safeParse(file.name);
    if (!filenameResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Filename contains invalid characters',
      });
    }
  });
}

// ==================== File Validation Functions ====================

/**
 * Validate file before upload
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  verifySignature?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedFilename: string;
}

export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const {
    maxSize = MAX_FILE_SIZES.default,
    allowedTypes,
    verifySignature = true,
  } = options;

  const errors: string[] = [];

  // Validate size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum of ${formatFileSize(maxSize)}`);
  }

  // Validate empty file
  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Validate MIME type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Validate filename
  const filenameResult = zIsSafeFilename().safeParse(file.name);
  if (!filenameResult.success) {
    errors.push('Filename contains invalid characters');
  }

  // Verify file signature (magic bytes)
  if (verifySignature && FILE_SIGNATURES[file.type]) {
    const signatureValid = await verifyFileSignature(file);
    if (!signatureValid) {
      errors.push('File signature does not match declared type (possible file type mismatch)');
    }
  }

  // Verify extension matches MIME type
  if (!isExtensionValid(file.name, file.type)) {
    errors.push('File extension does not match file type');
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedFilename,
  };
}

/**
 * Validate multiple files
 *
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Array of validation results
 */
export async function validateFiles(
  files: File[],
  options: FileValidationOptions = {}
): Promise<FileValidationResult[]> {
  return Promise.all(files.map((file) => validateFile(file, options)));
}

/**
 * Check if all files are valid
 *
 * @param results - Array of validation results
 * @returns true if all files are valid
 */
export function areAllFilesValid(results: FileValidationResult[]): boolean {
  return results.every((result) => result.isValid);
}

/**
 * Get all errors from validation results
 *
 * @param results - Array of validation results
 * @returns Array of all error messages
 */
export function getAllErrors(results: FileValidationResult[]): string[] {
  return results.flatMap((result) => result.errors);
}
