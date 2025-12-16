/**
 * Content Sanitization Utilities
 *
 * This module provides functions to sanitize user-generated content
 * and prevent XSS (Cross-Site Scripting) attacks using DOMPurify.
 *
 * Uses isomorphic-dompurify for compatibility with both client and server
 * (SSR) environments in Next.js.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for different sanitization levels
 */
const SANITIZE_CONFIGS = {
  // Strict: Remove all HTML tags, keep only text
  strict: {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  },

  // Basic: Allow basic formatting tags only
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
  },

  // Rich: Allow more HTML tags for rich content (posts, comments)
  rich: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'ul', 'ol', 'li', 'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
};

/**
 * Sanitize HTML content - removes dangerous tags and attributes
 *
 * @param dirty - Raw HTML string
 * @param level - Sanitization level: 'strict' | 'basic' | 'rich'
 * @returns Sanitized HTML string
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeHtml(userInput); // Returns: 'Hello'
 * ```
 */
export function sanitizeHtml(
  dirty: string,
  level: 'strict' | 'basic' | 'rich' = 'rich'
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  try {
    // level is restricted to 'strict' | 'basic' | 'rich', safe from object injection
    // eslint-disable-next-line security/detect-object-injection
    const config = SANITIZE_CONFIGS[level];
    return DOMPurify.sanitize(dirty, config);
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return ''; // Return empty string on error to be safe
  }
}

/**
 * Sanitize URL - ensures URL is safe and doesn't contain javascript: or data: schemes
 *
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 *
 * @example
 * ```typescript
 * sanitizeUrl('javascript:alert("XSS")'); // Returns: ''
 * sanitizeUrl('https://example.com'); // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove whitespace
  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  const lowerUrl = trimmed.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
      return '';
    }
  }

  // Only allow http, https, mailto, tel protocols
  const allowedProtocolRegex = /^(https?|mailto|tel):/i;
  const relativeUrlRegex = /^(\/|\.\/|\.\.\/)/;

  if (!allowedProtocolRegex.test(trimmed) && !relativeUrlRegex.test(trimmed)) {
    // If it doesn't start with allowed protocol or relative path, reject it
    console.warn(`Blocked URL with invalid protocol: ${trimmed}`);
    return '';
  }

  return trimmed;
}

/**
 * Strip all HTML tags from string - returns plain text only
 *
 * @param html - HTML string
 * @returns Plain text without any HTML tags
 *
 * @example
 * ```typescript
 * sanitizeText('<p>Hello <b>World</b></p>'); // Returns: 'Hello World'
 * ```
 */
export function sanitizeText(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true,
    });
  } catch (error) {
    console.error('Error sanitizing text:', error);
    return '';
  }
}

/**
 * General purpose sanitizer for user input
 * Uses strict sanitization by default
 *
 * @param input - User input string
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * const userInput = form.values.comment;
 * const safe = sanitizeUserInput(userInput);
 * ```
 */
export function sanitizeUserInput(input: string): string {
  return sanitizeHtml(input, 'strict');
}

/**
 * Sanitize filename - removes path traversal attempts and dangerous characters
 *
 * @param filename - Original filename
 * @returns Safe filename
 *
 * @example
 * ```typescript
 * sanitizeFilename('../../../etc/passwd'); // Returns: 'etc_passwd'
 * sanitizeFilename('my<script>.jpg'); // Returns: 'myscript.jpg'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed';
  }

  // Remove path traversal attempts
  let safe = filename.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');

  // Remove dangerous characters but keep alphanumeric, dots, dashes, underscores
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Remove multiple consecutive dots (to prevent ..)
  safe = safe.replace(/\.{2,}/g, '.');

  // Ensure filename is not empty
  if (!safe || safe === '.' || safe === '_') {
    return 'unnamed';
  }

  // Limit length
  if (safe.length > 255) {
    const ext = safe.split('.').pop();
    safe = safe.substring(0, 250) + (ext ? '.' + ext : '');
  }

  return safe;
}

/**
 * Encode HTML entities - converts special characters to HTML entities
 *
 * @param text - Text to encode
 * @returns Encoded text
 *
 * @example
 * ```typescript
 * encodeHtmlEntities('<script>'); // Returns: '&lt;script&gt;'
 * ```
 */
export function encodeHtmlEntities(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  // char is restricted by regex to specific characters, safe from object injection
  // eslint-disable-next-line security/detect-object-injection
  return text.replace(/[&<>"'\/]/g, (char) => entityMap[char] || char);
}

/**
 * Sanitize object keys - prevents prototype pollution
 *
 * @param obj - Object to sanitize
 * @returns New object with safe keys
 *
 * @example
 * ```typescript
 * const unsafe = { '__proto__': 'evil', name: 'safe' };
 * const safe = sanitizeObjectKeys(unsafe); // { name: 'safe' }
 * ```
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  const safeObj: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!dangerousKeys.includes(key)) {
      safeObj[key as keyof T] = value;
    } else {
      console.warn(`Blocked dangerous object key: ${key}`);
    }
  }

  return safeObj;
}

/**
 * Batch sanitize multiple HTML strings
 *
 * @param htmlArray - Array of HTML strings
 * @param level - Sanitization level
 * @returns Array of sanitized HTML strings
 */
export function batchSanitize(
  htmlArray: string[],
  level: 'strict' | 'basic' | 'rich' = 'rich'
): string[] {
  if (!Array.isArray(htmlArray)) {
    return [];
  }

  return htmlArray.map((html) => sanitizeHtml(html, level));
}

/**
 * Check if string contains potentially dangerous content
 * Returns true if dangerous content is detected
 *
 * @param content - Content to check
 * @returns true if dangerous, false if safe
 */
export function containsDangerousContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i, // CSS expression
  ];

  return dangerousPatterns.some((pattern) => pattern.test(content));
}
