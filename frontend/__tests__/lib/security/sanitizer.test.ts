/**
 * Sanitizer Tests
 *
 * Tests for DOMPurify-based content sanitization functions.
 * Ensures XSS payloads are properly cleaned.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeText,
  sanitizeUserInput,
  sanitizeFilename,
  encodeHtmlEntities,
  sanitizeObjectKeys,
  containsDangerousContent,
  batchSanitize,
} from '@/lib/security/sanitizer';

describe('Sanitizer', () => {
  // ==================== sanitizeHtml Tests ====================

  describe('sanitizeHtml', () => {
    it('should remove script tags (rich level)', () => {
      const dirty = '<script>alert("XSS")</script>Hello';
      const clean = sanitizeHtml(dirty, 'rich');
      expect(clean).not.toContain('<script');
      expect(clean).toContain('Hello');
    });

    it('should remove iframe tags', () => {
      const dirty = '<iframe src="evil.com"></iframe>Content';
      const clean = sanitizeHtml(dirty, 'rich');
      expect(clean).not.toContain('<iframe');
    });

    it('should remove event handlers', () => {
      const dirty = '<img src="x" onerror="alert(1)">';
      const clean = sanitizeHtml(dirty, 'rich');
      expect(clean).not.toContain('onerror');
    });

    it('should allow safe HTML tags (rich level)', () => {
      const dirty = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const clean = sanitizeHtml(dirty, 'rich');
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
    });

    it('should strip all HTML (strict level)', () => {
      const dirty = '<p>Hello <b>World</b></p>';
      const clean = sanitizeHtml(dirty, 'strict');
      expect(clean).toBe('Hello World');
      expect(clean).not.toContain('<');
    });

    it('should allow basic formatting (basic level)', () => {
      const dirty = '<p><b>Bold</b> <i>Italic</i> <script>alert(1)</script></p>';
      const clean = sanitizeHtml(dirty, 'basic');
      expect(clean).toContain('<b>');
      expect(clean).toContain('<i>');
      expect(clean).not.toContain('<script');
    });

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });
  });

  // ==================== sanitizeUrl Tests ====================

  describe('sanitizeUrl', () => {
    it('should allow http and https URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('should allow tel URLs', () => {
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
      expect(sanitizeUrl('../relative/path')).toBe('../relative/path');
    });

    it('should block javascript protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
    });

    it('should block data protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should block vbscript protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('should block file protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    });

    it('should handle empty input', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl('   ')).toBe('');
    });
  });

  // ==================== sanitizeText Tests ====================

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      expect(sanitizeText(html)).toBe('Hello World');
    });

    it('should remove script tags', () => {
      const html = '<script>alert("XSS")</script>Text';
      expect(sanitizeText(html)).toBe('Text');
    });

    it('should preserve text content', () => {
      const html = '<div><p>Line 1</p><p>Line 2</p></div>';
      const result = sanitizeText(html);
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
    });

    it('should handle empty input', () => {
      expect(sanitizeText('')).toBe('');
    });
  });

  // ==================== sanitizeUserInput Tests ====================

  describe('sanitizeUserInput', () => {
    it('should use strict sanitization', () => {
      const input = '<p>Hello <b>World</b></p>';
      expect(sanitizeUserInput(input)).toBe('Hello World');
    });

    it('should remove all HTML', () => {
      const input = '<script>alert(1)</script>Text';
      expect(sanitizeUserInput(input)).toBe('Text');
    });
  });

  // ==================== sanitizeFilename Tests ====================

  describe('sanitizeFilename', () => {
    it('should allow safe filenames', () => {
      expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
      expect(sanitizeFilename('image_001.jpg')).toBe('image_001.jpg');
      expect(sanitizeFilename('my-file.txt')).toBe('my-file.txt');
    });

    it('should remove path traversal attempts', () => {
      const result = sanitizeFilename('../../../etc/passwd');
      expect(result).not.toContain('..');
    });

    it('should replace dangerous characters', () => {
      const result = sanitizeFilename('file<script>.txt');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should handle multiple consecutive dots', () => {
      const result = sanitizeFilename('file...txt');
      expect(result).not.toContain('...');
    });

    it('should limit length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('should handle empty input', () => {
      expect(sanitizeFilename('')).toBe('unnamed');
      expect(sanitizeFilename('.')).toBe('unnamed');
    });
  });

  // ==================== encodeHtmlEntities Tests ====================

  describe('encodeHtmlEntities', () => {
    it('should encode special characters', () => {
      expect(encodeHtmlEntities('<script>')).toBe('&lt;script&gt;');
      expect(encodeHtmlEntities('&')).toBe('&amp;');
      expect(encodeHtmlEntities('"')).toBe('&quot;');
      expect(encodeHtmlEntities("'")).toBe('&#39;');
    });

    it('should encode all special characters', () => {
      const input = '<>&"\'/';
      const result = encodeHtmlEntities(input);
      // Verify the result is properly encoded
      expect(result).toBe('&lt;&gt;&amp;&quot;&#39;&#x2F;');
      // Verify original dangerous characters are not present (except & which is part of encoding)
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
    });

    it('should preserve safe text', () => {
      expect(encodeHtmlEntities('Hello World')).toBe('Hello World');
    });
  });

  // ==================== sanitizeObjectKeys Tests ====================

  describe('sanitizeObjectKeys', () => {
    it('should block __proto__', () => {
      const obj = { __proto__: 'evil', name: 'safe' };
      const result = sanitizeObjectKeys(obj);
      expect(result).not.toHaveProperty('__proto__');
      expect(result).toHaveProperty('name', 'safe');
    });

    it('should block constructor', () => {
      const obj = { constructor: 'evil', name: 'safe' };
      const result = sanitizeObjectKeys(obj);
      expect(result).not.toHaveProperty('constructor');
      expect(result).toHaveProperty('name', 'safe');
    });

    it('should block prototype', () => {
      const obj = { prototype: 'evil', name: 'safe' };
      const result = sanitizeObjectKeys(obj);
      expect(result).not.toHaveProperty('prototype');
      expect(result).toHaveProperty('name', 'safe');
    });

    it('should allow safe keys', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 30 };
      const result = sanitizeObjectKeys(obj);
      expect(result).toEqual(obj);
    });

    it('should handle empty object', () => {
      expect(sanitizeObjectKeys({})).toEqual({});
    });
  });

  // ==================== containsDangerousContent Tests ====================

  describe('containsDangerousContent', () => {
    it('should detect script tags', () => {
      expect(containsDangerousContent('<script>alert(1)</script>')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsDangerousContent('<iframe src="evil"></iframe>')).toBe(true);
    });

    it('should detect javascript protocol', () => {
      expect(containsDangerousContent('javascript:alert(1)')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsDangerousContent('<img onerror="alert(1)">')).toBe(true);
      expect(containsDangerousContent('<div onclick="evil()">')).toBe(true);
    });

    it('should detect eval', () => {
      expect(containsDangerousContent('eval("alert(1)")')).toBe(true);
    });

    it('should return false for safe content', () => {
      expect(containsDangerousContent('Hello World')).toBe(false);
      expect(containsDangerousContent('<p>Safe HTML</p>')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(containsDangerousContent('')).toBe(false);
    });
  });

  // ==================== batchSanitize Tests ====================

  describe('batchSanitize', () => {
    it('should sanitize multiple strings', () => {
      const dirty = [
        '<script>alert(1)</script>Hello',
        '<iframe>World</iframe>',
        '<p>Safe</p>',
      ];
      const clean = batchSanitize(dirty, 'rich');

      expect(clean[0]).not.toContain('<script');
      expect(clean[1]).not.toContain('<iframe');
      expect(clean[2]).toContain('<p>');
    });

    it('should handle empty array', () => {
      expect(batchSanitize([])).toEqual([]);
    });

    it('should preserve order', () => {
      const dirty = ['First', 'Second', 'Third'];
      const clean = batchSanitize(dirty);
      expect(clean[0]).toContain('First');
      expect(clean[1]).toContain('Second');
      expect(clean[2]).toContain('Third');
    });
  });

  // ==================== XSS Payload Tests ====================

  describe('XSS Payload Protection', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
      '<select onfocus=alert(1) autofocus>',
      '<textarea onfocus=alert(1) autofocus>',
      '<marquee onstart=alert(1)>',
      '<details open ontoggle=alert(1)>',
    ];

    it('should sanitize common XSS payloads', () => {
      xssPayloads.forEach((payload) => {
        const clean = sanitizeHtml(payload, 'rich');
        expect(clean).not.toContain('alert');
        expect(clean).not.toContain('onerror');
        expect(clean).not.toContain('onload');
      });
    });

    it('should detect dangerous content in payloads', () => {
      xssPayloads.forEach((payload) => {
        expect(containsDangerousContent(payload)).toBe(true);
      });
    });
  });

  // ==================== Edge Cases ====================

  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(100000);
      const result = sanitizeHtml(longString, 'strict');
      expect(result).toBe(longString);
    });

    it('should handle unicode characters', () => {
      const unicode = '你好世界 🚀 مرحبا';
      const result = sanitizeHtml(unicode, 'strict');
      expect(result).toBe(unicode);
    });

    it('should handle mixed content', () => {
      const mixed = '<p>Safe text</p><script>alert(1)</script><p>More safe</p>';
      const result = sanitizeHtml(mixed, 'rich');
      expect(result).toContain('Safe text');
      expect(result).toContain('More safe');
      expect(result).not.toContain('script');
    });
  });
});
