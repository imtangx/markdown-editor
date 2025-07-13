import { describe, it, expect } from 'vitest';
import { MarkdownLexer } from '../src/lexer';
import { TokenType } from '../src/types';

describe('MarkdownLexer 位置信息测试', () => {
  it('应该正确计算单行位置', () => {
    const lexer = new MarkdownLexer('hello world');
    const tokens = lexer.tokenize();

    expect(tokens[0].position.line).toBe(1);
    expect(tokens[0].position.column).toBe(1);
    expect(tokens[0].position.offset).toBe(0);

    expect(tokens[1].position.line).toBe(1);
    expect(tokens[1].position.column).toBe(6); // 'hello' 之后
    expect(tokens[1].position.offset).toBe(5);

    expect(tokens[2].position.line).toBe(1);
    expect(tokens[2].position.column).toBe(7); // 空格之后
    expect(tokens[2].position.offset).toBe(6);
  });

  it('应该正确计算多行位置', () => {
    const lexer = new MarkdownLexer('line1\nline2\nline3');
    const tokens = lexer.tokenize();

    // line1
    expect(tokens[0].position.line).toBe(1);
    expect(tokens[0].position.column).toBe(1);

    // \n
    expect(tokens[1].position.line).toBe(2);
    expect(tokens[1].position.column).toBe(1);

    // line2
    expect(tokens[2].position.line).toBe(2);
    expect(tokens[2].position.column).toBe(1);

    // \n
    expect(tokens[3].position.line).toBe(3);
    expect(tokens[3].position.column).toBe(1);

    // line3
    expect(tokens[4].position.line).toBe(3);
    expect(tokens[4].position.column).toBe(1);
  });

  it('应该正确计算包含制表符的位置', () => {
    const lexer = new MarkdownLexer('hello\tworld');
    const tokens = lexer.tokenize();

    expect(tokens[0].position.line).toBe(1); // hello
    expect(tokens[0].position.column).toBe(1);

    expect(tokens[1].position.line).toBe(1); // \t
    expect(tokens[1].position.column).toBe(6);

    expect(tokens[2].position.line).toBe(1); // world
    expect(tokens[2].position.column).toBe(7);
  });

  it('应该正确计算多字符 token 的位置', () => {
    const lexer = new MarkdownLexer('###hello***123---');
    const tokens = lexer.tokenize();

    // ###
    expect(tokens[0].type).toBe(TokenType.HASH);
    expect(tokens[0].position.column).toBe(1);
    expect(tokens[0].length).toBe(3);

    // hello
    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].position.column).toBe(4);
    expect(tokens[1].length).toBe(5);

    // ***
    expect(tokens[2].type).toBe(TokenType.BOLD);
    expect(tokens[2].position.column).toBe(9);
    expect(tokens[2].length).toBe(2);

    expect(tokens[3].type).toBe(TokenType.ASTERISK);
    expect(tokens[3].position.column).toBe(11);
    expect(tokens[3].length).toBe(1);

    // 123
    expect(tokens[4].type).toBe(TokenType.DIGIT);
    expect(tokens[4].position.column).toBe(12);
    expect(tokens[4].length).toBe(3);

    // ---
    expect(tokens[5].type).toBe(TokenType.HORIZONTAL_RULE);
    expect(tokens[5].position.column).toBe(15);
    expect(tokens[5].length).toBe(3);
  });

  it('应该正确计算 offset', () => {
    const lexer = new MarkdownLexer('ab\ncd\nef');
    const tokens = lexer.tokenize();

    expect(tokens[0].position.offset).toBe(0); // 'ab'
    expect(tokens[1].position.offset).toBe(2); // '\n'
    expect(tokens[2].position.offset).toBe(3); // 'cd'
    expect(tokens[3].position.offset).toBe(5); // '\n'
    expect(tokens[4].position.offset).toBe(6); // 'ef'
  });

  it('应该正确处理空行', () => {
    const lexer = new MarkdownLexer('line1\n\nline3');
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.TEXT); // line1
    expect(tokens[0].position.line).toBe(1);

    expect(tokens[1].type).toBe(TokenType.NEWLINE); // \n
    expect(tokens[1].position.line).toBe(2);

    expect(tokens[2].type).toBe(TokenType.NEWLINE); // \n
    expect(tokens[2].position.line).toBe(3);

    expect(tokens[3].type).toBe(TokenType.TEXT); // line3
    expect(tokens[3].position.line).toBe(3);
    expect(tokens[3].position.column).toBe(1);
  });
});
