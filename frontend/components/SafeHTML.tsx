/**
 * SafeHTML Component
 *
 * A React component that safely renders user-generated HTML content
 * by sanitizing it before rendering. Prevents XSS attacks.
 *
 * Uses DOMPurify for sanitization and provides different security levels.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SafeHTML content={post.content} />
 *
 * // With custom sanitization level
 * <SafeHTML content={comment.text} level="basic" />
 *
 * // With custom styling
 * <SafeHTML content={user.bio} className="text-sm text-gray-600" />
 * ```
 */

'use client';

import React, { useMemo } from 'react';
import { sanitizeHtml, containsDangerousContent } from '@/lib/security/sanitizer';
import { logSecurityEvent } from '@/lib/security/xss-prevention';

export interface SafeHTMLProps {
  /**
   * The HTML content to sanitize and render
   */
  content: string;

  /**
   * Sanitization level:
   * - 'strict': Remove all HTML, keep only text
   * - 'basic': Allow basic formatting (b, i, em, strong, u, br, p)
   * - 'rich': Allow rich content (headings, lists, links, code blocks)
   *
   * @default 'rich'
   */
  level?: 'strict' | 'basic' | 'rich';

  /**
   * Custom CSS classes to apply to the wrapper element
   */
  className?: string;

  /**
   * HTML element to use as wrapper
   * @default 'div'
   */
  as?: keyof React.JSX.IntrinsicElements;

  /**
   * Fallback content to show if sanitization removes all content
   * @default ''
   */
  fallback?: string;

  /**
   * Whether to log security events when dangerous content is detected
   * @default true in development
   */
  logEvents?: boolean;

  /**
   * Callback when dangerous content is detected
   */
  onDangerousContent?: (content: string) => void;
}

/**
 * SafeHTML Component
 *
 * Renders sanitized HTML content safely in React
 */
export function SafeHTML({
  content,
  level = 'rich',
  className,
  as: Component = 'div',
  fallback = '',
  logEvents = process.env.NODE_ENV === 'development',
  onDangerousContent,
}: SafeHTMLProps) {
  // Memoize sanitization to avoid re-computing on every render
  const sanitizedContent = useMemo(() => {
    // Early return for empty content
    if (!content || typeof content !== 'string') {
      return fallback;
    }

    // Check for dangerous content before sanitizing
    if (containsDangerousContent(content)) {
      if (logEvents) {
        logSecurityEvent('xss', `Dangerous content detected: ${content.substring(0, 100)}...`);
      }

      if (onDangerousContent) {
        onDangerousContent(content);
      }
    }

    // Sanitize the content
    const cleaned = sanitizeHtml(content, level);

    // Return fallback if sanitization removed everything
    if (!cleaned || cleaned.trim() === '') {
      return fallback;
    }

    return cleaned;
  }, [content, level, fallback, logEvents, onDangerousContent]);

  // Render nothing if no content
  if (!sanitizedContent) {
    return null;
  }

  // Render sanitized HTML using createElement to support dynamic tag names
  return React.createElement(Component, {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedContent },
  });
}

/**
 * SafeText Component
 *
 * Similar to SafeHTML but strips ALL HTML tags, rendering plain text only.
 * Use this when you want to display user input as text without any formatting.
 *
 * @example
 * ```tsx
 * <SafeText content={user.name} />
 * ```
 */
export interface SafeTextProps {
  content: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function SafeText({
  content,
  className,
  as: Component = 'span',
}: SafeTextProps) {
  return (
    <SafeHTML
      content={content}
      level="strict"
      className={className}
      as={Component}
    />
  );
}

/**
 * SafeLink Component
 *
 * Renders a safe anchor tag with URL sanitization
 *
 * @example
 * ```tsx
 * <SafeLink href={user.website} text="Visit Website" />
 * ```
 */
export interface SafeLinkProps {
  href: string;
  text: string;
  className?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

export function SafeLink({
  href,
  text,
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
}: SafeLinkProps) {
  const sanitizedHref = useMemo(() => {
    if (!href || typeof href !== 'string') {
      return '#';
    }

    // Only allow safe protocols
    const lower = href.trim().toLowerCase();
    const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
    const isRelative = href.startsWith('/');

    if (!isRelative && !safeProtocols.some((p) => lower.startsWith(p))) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Blocked unsafe URL: ${href}`);
      }
      return '#';
    }

    return href;
  }, [href]);

  const sanitizedText = useMemo(() => {
    return sanitizeHtml(text, 'strict');
  }, [text]);

  // Don't render if URL is invalid
  if (sanitizedHref === '#') {
    return <span className={className}>{sanitizedText}</span>;
  }

  return (
    <a
      href={sanitizedHref}
      className={className}
      target={target}
      rel={target === '_blank' ? rel : undefined}
    >
      {sanitizedText}
    </a>
  );
}

/**
 * SafeImage Component
 *
 * Renders an image with URL validation
 *
 * @example
 * ```tsx
 * <SafeImage src={post.imageUrl} alt="Post image" />
 * ```
 */
export interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: () => void;
}

export function SafeImage({
  src,
  alt,
  className,
  width,
  height,
  onError,
}: SafeImageProps) {
  const sanitizedSrc = useMemo(() => {
    if (!src || typeof src !== 'string') {
      return '';
    }

    // Only allow safe image URLs (http/https) or data URLs for images
    const lower = src.trim().toLowerCase();
    const safeProtocols = ['http://', 'https://', 'data:image/', '/'];

    if (!safeProtocols.some((p) => lower.startsWith(p))) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Blocked unsafe image URL: ${src}`);
      }
      return '';
    }

    return src;
  }, [src]);

  const sanitizedAlt = useMemo(() => {
    return sanitizeHtml(alt || 'Image', 'strict');
  }, [alt]);

  // Don't render if URL is invalid
  if (!sanitizedSrc) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sanitizedSrc}
      alt={sanitizedAlt}
      className={className}
      width={width}
      height={height}
      onError={onError}
    />
  );
}

/**
 * withSanitization HOC
 *
 * Higher-order component that wraps a component and sanitizes its children
 *
 * @example
 * ```tsx
 * const SafeDiv = withSanitization('div');
 * <SafeDiv>{userContent}</SafeDiv>
 * ```
 */
export function withSanitization<P extends { children?: React.ReactNode }>(
  Component: React.ComponentType<P>,
  level: 'strict' | 'basic' | 'rich' = 'rich'
) {
  return function SafeComponent(props: P) {
    const { children, ...rest } = props;

    if (typeof children === 'string') {
      const sanitized = sanitizeHtml(children, level);
      return (
        <Component {...(rest as P)}>
          {/* dangerouslySetInnerHTML is safe here because content is sanitized with DOMPurify */}
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: sanitized }} />
        </Component>
      );
    }

    return <Component {...props} />;
  };
}

export default SafeHTML;
