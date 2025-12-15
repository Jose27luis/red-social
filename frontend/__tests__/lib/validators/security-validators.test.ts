/**
 * Security Validators Tests
 *
 * Comprehensive tests for all 8 custom Zod security validators.
 * These tests ensure validators correctly detect and block attack patterns.
 *
 * Run with: npm run test
 */

import { describe, it, expect } from 'vitest';
import {
  zIsNotSqlInjection,
  zIsNotXSS,
  zIsNotPathTraversal,
  zIsNotCommandInjection,
  zIsStrongPassword,
  zIsSafeFilename,
  zIsNotPrototypePollution,
  zIsSanitizedText,
} from '@/lib/validators/security-validators';

describe('Security Validators', () => {
  // ==================== SQL Injection Tests ====================

  describe('zIsNotSqlInjection', () => {
    const validator = zIsNotSqlInjection();

    it('should block SELECT statements', () => {
      expect(() => validator.parse('SELECT * FROM users')).toThrow();
      expect(() => validator.parse('select password from users')).toThrow();
    });

    it('should block INSERT statements', () => {
      expect(() => validator.parse('INSERT INTO users VALUES')).toThrow();
    });

    it('should block UPDATE statements', () => {
      expect(() => validator.parse('UPDATE users SET admin=1')).toThrow();
    });

    it('should block DELETE statements', () => {
      expect(() => validator.parse('DELETE FROM users')).toThrow();
    });

    it('should block DROP statements', () => {
      expect(() => validator.parse('DROP TABLE users')).toThrow();
    });

    it('should block UNION SELECT attacks', () => {
      expect(() => validator.parse("' UNION SELECT password FROM users--")).toThrow();
    });

    it('should block comment syntax', () => {
      expect(() => validator.parse("admin' --")).toThrow();
      expect(() => validator.parse('admin /* comment */')).toThrow();
      expect(() => validator.parse('admin#')).toThrow();
    });

    it('should block OR 1=1 patterns', () => {
      expect(() => validator.parse("' OR 1=1 --")).toThrow();
      expect(() => validator.parse("admin' OR '1'='1")).toThrow();
    });

    it('should allow safe input', () => {
      expect(validator.parse('Hello World')).toBe('Hello World');
      expect(validator.parse('user@example.com')).toBe('user@example.com');
      expect(validator.parse('Product name 123')).toBe('Product name 123');
    });
  });

  // ==================== XSS Tests ====================

  describe('zIsNotXSS', () => {
    const validator = zIsNotXSS();

    it('should block script tags', () => {
      expect(() => validator.parse('<script>alert("XSS")</script>')).toThrow();
      expect(() => validator.parse('<SCRIPT>alert("XSS")</SCRIPT>')).toThrow();
    });

    it('should block iframe tags', () => {
      expect(() => validator.parse('<iframe src="evil.com"></iframe>')).toThrow();
    });

    it('should block javascript protocol', () => {
      expect(() => validator.parse('javascript:alert(1)')).toThrow();
      expect(() => validator.parse('javascript:void(0)')).toThrow();
    });

    it('should block event handlers', () => {
      expect(() => validator.parse('<img onerror="alert(1)">')).toThrow();
      expect(() => validator.parse('<div onclick="alert(1)">')).toThrow();
      expect(() => validator.parse('<body onload="alert(1)">')).toThrow();
    });

    it('should block object and embed tags', () => {
      expect(() => validator.parse('<object data="evil.swf"></object>')).toThrow();
      expect(() => validator.parse('<embed src="evil.swf">')).toThrow();
    });

    it('should block data:text/html', () => {
      expect(() => validator.parse('data:text/html,<script>alert(1)</script>')).toThrow();
    });

    it('should allow safe HTML', () => {
      expect(validator.parse('Hello <b>World</b>')).toBe('Hello <b>World</b>');
      expect(validator.parse('<p>This is safe text</p>')).toBe('<p>This is safe text</p>');
    });

    it('should allow safe input', () => {
      expect(validator.parse('Hello World')).toBe('Hello World');
      expect(validator.parse('Email: test@example.com')).toBe('Email: test@example.com');
    });
  });

  // ==================== Path Traversal Tests ====================

  describe('zIsNotPathTraversal', () => {
    const validator = zIsNotPathTraversal();

    it('should block ../ patterns', () => {
      expect(() => validator.parse('../../../etc/passwd')).toThrow();
      expect(() => validator.parse('../../config.php')).toThrow();
    });

    it('should block ..\\ patterns', () => {
      expect(() => validator.parse('..\\..\\windows\\system32')).toThrow();
    });

    it('should block URL encoded traversal', () => {
      expect(() => validator.parse('%2e%2e%2f')).toThrow();
      expect(() => validator.parse('%252e%252e%252f')).toThrow();
    });

    it('should allow safe paths', () => {
      expect(validator.parse('./local/file.txt')).toBe('./local/file.txt');
      expect(validator.parse('folder/subfolder/file.txt')).toBe('folder/subfolder/file.txt');
      expect(validator.parse('/absolute/path')).toBe('/absolute/path');
    });
  });

  // ==================== Command Injection Tests ====================

  describe('zIsNotCommandInjection', () => {
    const validator = zIsNotCommandInjection();

    it('should block semicolons', () => {
      expect(() => validator.parse('file.txt; rm -rf /')).toThrow();
    });

    it('should block pipes', () => {
      expect(() => validator.parse('file.txt | cat /etc/passwd')).toThrow();
    });

    it('should block ampersands', () => {
      expect(() => validator.parse('file.txt & malicious')).toThrow();
    });

    it('should block backticks', () => {
      expect(() => validator.parse('`whoami`')).toThrow();
    });

    it('should block command substitution', () => {
      expect(() => validator.parse('$(whoami)')).toThrow();
      expect(() => validator.parse('${USER}')).toThrow();
    });

    it('should block logical operators', () => {
      expect(() => validator.parse('cmd1 && cmd2')).toThrow();
      expect(() => validator.parse('cmd1 || cmd2')).toThrow();
    });

    it('should block newlines', () => {
      expect(() => validator.parse('line1\nline2')).toThrow();
      expect(() => validator.parse('line1\rline2')).toThrow();
    });

    it('should allow safe input', () => {
      expect(validator.parse('filename.txt')).toBe('filename.txt');
      expect(validator.parse('user input text')).toBe('user input text');
    });
  });

  // ==================== Strong Password Tests ====================

  describe('zIsStrongPassword', () => {
    const validator = zIsStrongPassword();

    it('should reject passwords without uppercase', () => {
      expect(() => validator.parse('password123!')).toThrow();
    });

    it('should reject passwords without lowercase', () => {
      expect(() => validator.parse('PASSWORD123!')).toThrow();
    });

    it('should reject passwords without numbers', () => {
      expect(() => validator.parse('Password!')).toThrow();
    });

    it('should reject passwords without special characters', () => {
      expect(() => validator.parse('Password123')).toThrow();
    });

    it('should reject short passwords', () => {
      expect(() => validator.parse('Pass1!')).toThrow();
    });

    it('should reject very long passwords', () => {
      const longPassword = 'P@ssw0rd' + 'a'.repeat(200);
      expect(() => validator.parse(longPassword)).toThrow();
    });

    it('should accept strong passwords', () => {
      expect(validator.parse('Password123!')).toBe('Password123!');
      expect(validator.parse('MyP@ssw0rd')).toBe('MyP@ssw0rd');
      expect(validator.parse('Str0ng!Pass')).toBe('Str0ng!Pass');
    });
  });

  // ==================== Safe Filename Tests ====================

  describe('zIsSafeFilename', () => {
    const validator = zIsSafeFilename();

    it('should block filenames with special characters', () => {
      expect(() => validator.parse('file<script>.txt')).toThrow();
      expect(() => validator.parse('file|name.txt')).toThrow();
      expect(() => validator.parse('file?name.txt')).toThrow();
    });

    it('should block filenames with path traversal', () => {
      expect(() => validator.parse('file..name.txt')).toThrow();
    });

    it('should block filenames starting with dot', () => {
      expect(() => validator.parse('.htaccess')).toThrow();
    });

    it('should accept safe filenames', () => {
      expect(validator.parse('document.pdf')).toBe('document.pdf');
      expect(validator.parse('image_001.jpg')).toBe('image_001.jpg');
      expect(validator.parse('my-file.txt')).toBe('my-file.txt');
    });
  });

  // ==================== Prototype Pollution Tests ====================

  describe('zIsNotPrototypePollution', () => {
    const validator = zIsNotPrototypePollution();

    it('should block __proto__', () => {
      expect(() => validator.parse('__proto__')).toThrow();
      expect(() => validator.parse('__PROTO__')).toThrow();
    });

    it('should block constructor', () => {
      expect(() => validator.parse('constructor')).toThrow();
      expect(() => validator.parse('CONSTRUCTOR')).toThrow();
    });

    it('should block prototype', () => {
      expect(() => validator.parse('prototype')).toThrow();
      expect(() => validator.parse('PROTOTYPE')).toThrow();
    });

    it('should allow safe keys', () => {
      expect(validator.parse('name')).toBe('name');
      expect(validator.parse('email')).toBe('email');
      expect(validator.parse('userId')).toBe('userId');
    });
  });

  // ==================== Sanitized Text Tests ====================

  describe('zIsSanitizedText', () => {
    const validator = zIsSanitizedText();

    it('should detect multiple threat types', () => {
      const input = '<script>SELECT * FROM users</script>';
      expect(() => validator.parse(input)).toThrow();
    });

    it('should detect XSS in text', () => {
      expect(() => validator.parse('<script>alert(1)</script>')).toThrow();
    });

    it('should detect SQL injection in text', () => {
      expect(() => validator.parse("' OR 1=1 --")).toThrow();
    });

    it('should detect command injection in text', () => {
      expect(() => validator.parse('text; rm -rf /')).toThrow();
    });

    it('should allow clean text', () => {
      const safeText = 'This is a clean comment without any threats.';
      expect(validator.parse(safeText)).toBe(safeText);
    });
  });
});
