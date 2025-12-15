/**
 * XSS Prevention Utilities
 *
 * Additional utilities for detecting and preventing Cross-Site Scripting (XSS) attacks.
 * Works in conjunction with sanitizer.ts for comprehensive XSS protection.
 */

/**
 * Patterns that indicate potential XSS attacks
 */
const XSS_PATTERNS = {
  scriptTags: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  iframeTags: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  objectTags: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  embedTags: /<embed\b[^<]*>/gi,
  javascriptProtocol: /javascript:\s*/gi,
  dataProtocol: /data:text\/html/gi,
  onEventHandlers: /on\w+\s*=\s*["'][^"']*["']/gi,
  styleExpression: /style\s*=\s*["'][^"']*expression\s*\([^"']*\)["']/gi,
  vbscriptProtocol: /vbscript:/gi,
};

/**
 * Detect if content contains XSS attack patterns
 *
 * @param content - Content to check
 * @returns Object with detection results
 *
 * @example
 * ```typescript
 * const result = detectXSS('<script>alert("XSS")</script>');
 * // { hasXSS: true, threats: ['scriptTags'], details: [...] }
 * ```
 */
export function detectXSS(content: string): {
  hasXSS: boolean;
  threats: string[];
  details: string[];
} {
  if (!content || typeof content !== 'string') {
    return { hasXSS: false, threats: [], details: [] };
  }

  const threats: string[] = [];
  const details: string[] = [];

  for (const [patternName, pattern] of Object.entries(XSS_PATTERNS)) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      threats.push(patternName);
      details.push(`Found ${matches.length} instance(s) of ${patternName}`);
    }
  }

  return {
    hasXSS: threats.length > 0,
    threats,
    details,
  };
}

/**
 * Strip all script tags from content
 *
 * @param content - Content to clean
 * @returns Content without script tags
 */
export function stripScriptTags(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  return content
    .replace(XSS_PATTERNS.scriptTags, '')
    .replace(XSS_PATTERNS.iframeTags, '')
    .replace(XSS_PATTERNS.objectTags, '')
    .replace(XSS_PATTERNS.embedTags, '');
}

/**
 * Remove event handlers from HTML attributes
 *
 * @param html - HTML string
 * @returns HTML without event handlers
 *
 * @example
 * ```typescript
 * stripEventHandlers('<div onclick="alert()">Click</div>');
 * // Returns: '<div>Click</div>'
 * ```
 */
export function stripEventHandlers(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html.replace(XSS_PATTERNS.onEventHandlers, '');
}

/**
 * Escape HTML special characters
 * More comprehensive than encodeHtmlEntities in sanitizer.ts
 *
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return text.replace(/[&<>"'`=\/]/g, (char) => escapeMap[char] || char);
}

/**
 * Validate that a string is safe for use in HTML attribute
 *
 * @param value - Attribute value to validate
 * @returns true if safe, false otherwise
 */
export function isSafeAttribute(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+=/i,
    /<script/i,
    /expression\(/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(value));
}

/**
 * Validate URL is safe for use in href or src attributes
 * More strict than sanitizeUrl
 *
 * @param url - URL to validate
 * @returns true if safe, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  if (dangerousProtocols.some((protocol) => trimmed.startsWith(protocol))) {
    return false;
  }

  // Only allow safe protocols
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
  const isRelative = /^(\/|\.\/|\.\.\/|#)/.test(url);

  return (
    isRelative || safeProtocols.some((protocol) => trimmed.startsWith(protocol))
  );
}

/**
 * Check if string contains SQL injection patterns
 * This is a basic check - real validation should happen server-side
 *
 * @param input - Input to check
 * @returns true if SQL injection detected
 */
export function containsSqlInjection(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
    /(\'\s*OR\s*\'.+\'\s*=\s*\')/gi,
    /(\%27)|(\-\-)|(\%23)/gi, // URL encoded versions
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check if string contains command injection patterns
 *
 * @param input - Input to check
 * @returns true if command injection detected
 */
export function containsCommandInjection(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const commandPatterns = [
    /[;&|`$()]/g, // Command separators and substitution
    /\n|\r/g, // Newlines
    /\$\{.+\}/g, // Variable substitution
  ];

  return commandPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check if string attempts path traversal
 *
 * @param path - Path to check
 * @returns true if path traversal detected
 */
export function containsPathTraversal(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  const traversalPatterns = [
    /\.\.\//g, // ../
    /\.\.\\/g, // ..\
    /%2e%2e%2f/gi, // URL encoded ../
    /%252e%252e%252f/gi, // Double URL encoded ../
    /\.\.%2f/gi,
    /\.\.%5c/gi,
  ];

  return traversalPatterns.some((pattern) => pattern.test(path));
}

/**
 * Check if object key could lead to prototype pollution
 *
 * @param key - Object key to check
 * @returns true if dangerous key
 */
export function isDangerousObjectKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  return dangerousKeys.includes(key.toLowerCase());
}

/**
 * Validate that content is safe for rendering
 * Comprehensive check combining multiple validation methods
 *
 * @param content - Content to validate
 * @returns Validation result with details
 */
export function validateContent(content: string): {
  isSafe: boolean;
  issues: string[];
} {
  if (!content || typeof content !== 'string') {
    return { isSafe: true, issues: [] };
  }

  const issues: string[] = [];

  // Check for XSS
  const xssResult = detectXSS(content);
  if (xssResult.hasXSS) {
    issues.push(...xssResult.details);
  }

  // Check for SQL injection
  if (containsSqlInjection(content)) {
    issues.push('Potential SQL injection detected');
  }

  // Check for command injection
  if (containsCommandInjection(content)) {
    issues.push('Potential command injection detected');
  }

  // Check for path traversal
  if (containsPathTraversal(content)) {
    issues.push('Potential path traversal detected');
  }

  return {
    isSafe: issues.length === 0,
    issues,
  };
}

/**
 * Create a safe text node content for React
 * Ensures content is safe to render without dangerouslySetInnerHTML
 *
 * @param text - Text to make safe
 * @returns Safe text
 */
export function createSafeTextContent(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove all HTML tags
  let safe = text.replace(/<[^>]*>/g, '');

  // Escape special characters
  safe = escapeHtml(safe);

  return safe;
}

/**
 * Validate email doesn't contain XSS or injection attempts
 *
 * @param email - Email to validate
 * @returns true if safe
 */
export function isSafeEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check for dangerous patterns
  const validation = validateContent(email);
  return validation.isSafe;
}

/**
 * Log security event (for monitoring)
 * In production, this should integrate with your logging service
 *
 * @param eventType - Type of security event
 * @param details - Event details
 */
export function logSecurityEvent(
  eventType: 'xss' | 'sql_injection' | 'command_injection' | 'path_traversal' | 'other',
  details: string
): void {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Security Event] ${eventType}:`, details);
  }

  // In production, send to logging service
  // Example: Send to Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   // Send to your logging service
  // }
}
