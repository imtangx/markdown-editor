import { describe, it, expect } from 'vitest';
import {
  isWhitespace,
  isAlpha,
  isDigit,
  isAlphaNumeric,
  isNewline,
  normalizeNewlines,
  getLines,
  getLineColumnFromOffset,
} from '../src';

describe('string-utils', () => {
  describe('isWhitespace', () => {
    it('should return true for whitespace characters', () => {
      expect(isWhitespace(' ')).toBe(true);
      expect(isWhitespace('\t')).toBe(true);
      expect(isWhitespace('\n')).toBe(true);
    });

    it('should return false for non-whitespace characters', () => {
      expect(isWhitespace('a')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isWhitespace('')).toBe(false);
    });
  });

  describe('isAlpha', () => {
    it('should return true for alphabetic characters', () => {
      expect(isAlpha('a')).toBe(true);
      expect(isAlpha('Z')).toBe(true);
    });

    it('should return false for non-alphabetic characters', () => {
      expect(isAlpha('1')).toBe(false);
      expect(isAlpha(' ')).toBe(false);
      expect(isAlpha('@')).toBe(false);
    });
  });

  describe('isDigit', () => {
    it('should return true for digit characters', () => {
      for (let i = 0; i <= 9; i++) {
        expect(isDigit(i.toString())).toBe(true);
      }
    });

    it('should return false for non-digit characters', () => {
      expect(isDigit('a')).toBe(false);
      expect(isDigit(' ')).toBe(false);
      expect(isDigit('@')).toBe(false);
    });
  });

  describe('isAlphaNumeric', () => {
    it('should return true for alphanumeric characters', () => {
      expect(isAlphaNumeric('a')).toBe(true);
      expect(isAlphaNumeric('Z')).toBe(true);
      expect(isAlphaNumeric('5')).toBe(true);
    });

    it('should return false for non-alphanumeric characters', () => {
      expect(isAlphaNumeric(' ')).toBe(false);
      expect(isAlphaNumeric('@')).toBe(false);
      expect(isAlphaNumeric('_')).toBe(false);
    });
  });

  describe('isNewline', () => {
    it('should return true for newline characters', () => {
      expect(isNewline('\n')).toBe(true);
      expect(isNewline('\r')).toBe(true);
    });

    it('should return false for non-newline characters', () => {
      expect(isNewline(' ')).toBe(false);
      expect(isNewline('a')).toBe(false);
      expect(isNewline('\t')).toBe(false);
    });
  });

  describe('normalizeNewlines', () => {
    it('should convert Windows line endings to Unix', () => {
      expect(normalizeNewlines('hello\r\nworld')).toBe('hello\nworld');
    });

    it('should convert Mac line endings to Unix', () => {
      expect(normalizeNewlines('hello\rworld')).toBe('hello\nworld');
    });

    it('should preserve Unix line endings', () => {
      expect(normalizeNewlines('hello\nworld')).toBe('hello\nworld');
    });

    it('should handle mixed line endings', () => {
      expect(normalizeNewlines('line1\r\nline2\rline3\nline4')).toBe('line1\nline2\nline3\nline4');
    });

    it('should handle empty string', () => {
      expect(normalizeNewlines('')).toBe('');
    });
  });

  describe('getLines', () => {
    it('should split single line text', () => {
      expect(getLines('hello world')).toEqual(['hello world']);
    });

    it('should split multi-line text', () => {
      expect(getLines('line1\nline2\nline3')).toEqual(['line1', 'line2', 'line3']);
    });

    it('should handle empty lines', () => {
      expect(getLines('\n\n')).toEqual(['', '', '']);
    });

    it('should handle empty string', () => {
      expect(getLines('')).toEqual(['']);
    });
  });

  describe('getLineColumnFromOffset', () => {
    const text = 'line1\nline2\nline3';

    it('should return correct position for first line', () => {
      expect(getLineColumnFromOffset(text, 0)).toEqual({ line: 1, column: 1 });
      expect(getLineColumnFromOffset(text, 4)).toEqual({ line: 1, column: 5 });
    });

    it('should return correct position for second line', () => {
      expect(getLineColumnFromOffset(text, 6)).toEqual({ line: 2, column: 1 });
      expect(getLineColumnFromOffset(text, 10)).toEqual({ line: 2, column: 5 });
    });

    it('should return correct position for third line', () => {
      expect(getLineColumnFromOffset(text, 12)).toEqual({ line: 3, column: 1 });
    });

    it('should handle offset at newline character', () => {
      expect(getLineColumnFromOffset(text, 5)).toEqual({ line: 1, column: 6 });
    });

    it('should handle offset beyond text length', () => {
      expect(getLineColumnFromOffset(text, 100)).toEqual({ line: 3, column: 6 });
    });

    it('should handle empty string', () => {
      expect(getLineColumnFromOffset('', 0)).toEqual({ line: 1, column: 1 });
      expect(getLineColumnFromOffset('', 10)).toEqual({ line: 1, column: 1 });
    });
  });
});
