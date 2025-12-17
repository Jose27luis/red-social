/**
 * Common Validation Schemas
 *
 * Pre-built Zod schemas for common use cases across the application.
 * These schemas incorporate security validators to prevent attacks.
 *
 * Import these schemas in your components and use with React Hook Form:
 *
 * @example
 * ```typescript
 * import { registerSchema } from '@/lib/validators/common-schemas';
 *
 * const form = useForm({
 *   resolver: zodResolver(registerSchema),
 * });
 * ```
 */

import { z } from 'zod';
import {
  zIsNotXSS,
  zIsNotSqlInjection,
  zIsStrongPassword,
  zIsUniversityEmail,
  zIsSanitizedText,
  zIsUUIDv4,
  zIsSafeUrl,
} from './security-validators';

// ==================== Authentication Schemas ====================

/**
 * Registration Schema
 *
 * Validates user registration data with security checks
 */
export const registerSchema = z.object({
  email: zIsUniversityEmail(),
  password: zIsStrongPassword(),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'First name can only contain letters')
    .pipe(zIsNotXSS()),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name can only contain letters')
    .pipe(zIsNotXSS()),
  career: z
    .string()
    .min(2, 'Career must be at least 2 characters')
    .max(100, 'Career must not exceed 100 characters')
    .pipe(zIsNotXSS())
    .optional(),
  interests: z
    .array(z.string().pipe(zIsNotXSS()))
    .max(20, 'Maximum 20 interests allowed')
    .optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Login Schema
 *
 * Validates login credentials
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').pipe(zIsNotXSS()),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Change Password Schema
 *
 * Validates password change with current and new passwords
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: zIsStrongPassword(),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ==================== Post Schemas ====================

/**
 * Create Post Schema
 *
 * Validates post creation with content security checks
 */
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(3000, 'Content must not exceed 3000 characters')
    .pipe(zIsNotXSS())
    .pipe(zIsNotSqlInjection()),
  type: z.enum(['DISCUSSION', 'QUESTION', 'ANNOUNCEMENT', 'RESOURCE'], {
    message: 'Invalid post type',
  }),
  images: z
    .array(z.string().url('Invalid image URL').pipe(zIsSafeUrl()))
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  groupId: zIsUUIDv4().optional(),
  tags: z
    .array(z.string().min(1).max(50).pipe(zIsNotXSS()))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

/**
 * Create Comment Schema
 *
 * Validates comment creation
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must not exceed 1000 characters')
    .pipe(zIsSanitizedText()),
  postId: zIsUUIDv4(),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;

// ==================== Group Schemas ====================

/**
 * Create Group Schema
 *
 * Validates group creation data
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must not exceed 100 characters')
    .pipe(zIsNotXSS()),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .pipe(zIsNotXSS())
    .pipe(zIsNotSqlInjection()),
  isPrivate: z.boolean().default(false),
  category: z
    .string()
    .min(1, 'Category is required')
    .pipe(zIsNotXSS())
    .optional(),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;

// ==================== Event Schemas ====================

/**
 * Create Event Schema
 *
 * Validates event creation data
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .pipe(zIsNotXSS()),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .pipe(zIsNotXSS()),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters')
    .pipe(zIsNotXSS()),
  date: z.string().datetime('Invalid date format'),
  maxAttendees: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Must allow at least 1 attendee')
    .max(1000, 'Maximum 1000 attendees allowed')
    .optional(),
  groupId: zIsUUIDv4().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

// ==================== Resource Schemas ====================

/**
 * Upload Resource Schema
 *
 * Validates resource upload data
 */
export const uploadResourceSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .pipe(zIsNotXSS()),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .pipe(zIsNotXSS())
    .optional(),
  type: z.enum(['DOCUMENT', 'VIDEO', 'LINK', 'IMAGE', 'OTHER'], {
    message: 'Invalid resource type',
  }),
  url: z.string().url('Invalid URL').pipe(zIsSafeUrl()).optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .pipe(zIsNotXSS())
    .optional(),
  tags: z
    .array(z.string().min(1).max(50).pipe(zIsNotXSS()))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export type UploadResourceFormData = z.infer<typeof uploadResourceSchema>;

// ==================== Message Schemas ====================

/**
 * Send Message Schema
 *
 * Validates message sending
 */
export const sendMessageSchema = z.object({
  receiverId: zIsUUIDv4(),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must not exceed 2000 characters')
    .pipe(zIsSanitizedText()),
});

export type SendMessageFormData = z.infer<typeof sendMessageSchema>;

// ==================== Search Schemas ====================

/**
 * Search Schema
 *
 * Validates search queries with security checks
 */
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query must not exceed 200 characters')
    .pipe(zIsNotSqlInjection())
    .pipe(zIsNotXSS()),
  type: z
    .enum(['all', 'users', 'posts', 'groups', 'events', 'resources'])
    .optional()
    .default('all'),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchFormData = z.infer<typeof searchSchema>;

// ==================== Profile Update Schemas ====================

/**
 * Update Profile Schema
 *
 * Validates profile update data
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'First name can only contain letters')
    .pipe(zIsNotXSS())
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name can only contain letters')
    .pipe(zIsNotXSS())
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .pipe(zIsNotXSS())
    .optional(),
  career: z
    .string()
    .max(100, 'Career must not exceed 100 characters')
    .pipe(zIsNotXSS())
    .optional(),
  interests: z
    .array(z.string().pipe(zIsNotXSS()))
    .max(20, 'Maximum 20 interests allowed')
    .optional(),
  website: z.string().url('Invalid URL').pipe(zIsSafeUrl()).optional().or(z.literal('')),
  socialLinks: z
    .object({
      linkedin: z.string().url().pipe(zIsSafeUrl()).optional().or(z.literal('')),
      github: z.string().url().pipe(zIsSafeUrl()).optional().or(z.literal('')),
      twitter: z.string().url().pipe(zIsSafeUrl()).optional().or(z.literal('')),
    })
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// ==================== Filter Schemas ====================

/**
 * Filter Schema
 *
 * Generic filter schema for listings
 */
export const filterSchema = z.object({
  sortBy: z
    .enum(['recent', 'popular', 'oldest', 'name'])
    .optional()
    .default('recent'),
  category: z.string().pipe(zIsNotXSS()).optional(),
  tags: z.array(z.string().pipe(zIsNotXSS())).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type FilterFormData = z.infer<typeof filterSchema>;

// ==================== Contact/Report Schemas ====================

/**
 * Contact Form Schema
 *
 * Validates contact/support form submissions
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .pipe(zIsNotXSS()),
  email: z.string().email('Invalid email format').pipe(zIsNotXSS()),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .pipe(zIsNotXSS()),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must not exceed 2000 characters')
    .pipe(zIsSanitizedText()),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Report Content Schema
 *
 * Validates content reporting
 */
export const reportContentSchema = z.object({
  contentId: zIsUUIDv4(),
  contentType: z.enum(['post', 'comment', 'user', 'group', 'event']),
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate',
    'misinformation',
    'copyright',
    'other',
  ]),
  details: z
    .string()
    .min(10, 'Please provide details about the report')
    .max(1000, 'Details must not exceed 1000 characters')
    .pipe(zIsSanitizedText())
    .optional(),
});

export type ReportContentFormData = z.infer<typeof reportContentSchema>;
