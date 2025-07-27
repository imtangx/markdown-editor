import { describe, it, expect } from 'vitest';
import { MarkdownLexer } from '../src/lexer';
import { TokenType } from '../src/types';

describe('MarkdownLexer 错误处理', () => {
  it('应该处理未预期的字符', () => {
    // 测试一些 Unicode 字符
    const lexer = new MarkdownLexer('🚀 emoji 测试');
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.TEXT);
    expect(tokens[0].value).toBe('🚀');
    expect(tokens[1].type).toBe(TokenType.WHITESPACE);
    expect(tokens[2].type).toBe(TokenType.TEXT);
    expect(tokens[2].value).toBe('emoji');
  });

  it('应该处理不完整的语法结构', () => {
    const testCases = [
      '*', // 单个星号（不是粗体）
      '**', // 未闭合的粗体
      '`', // 单个反引号
      '[', // 未闭合的方括号
      '(', // 未闭合的圆括号
      '#'.repeat(10), // 超过6个#
    ];

    testCases.forEach(testCase => {
      const lexer = new MarkdownLexer(testCase);
      const tokens = lexer.tokenize();

      // 应该能正常解析，不抛出错误
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
    });
  });

  it('应该处理极长的输入', () => {
    const veryLongText = 'a'.repeat(10000);
    const lexer = new MarkdownLexer(veryLongText);
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.TEXT);
    expect(tokens[0].value.length).toBe(10000);
    expect(tokens[1].type).toBe(TokenType.EOF);
  });
});
