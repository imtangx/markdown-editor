import { isWhitespace, normalizeNewlines, createPosition, isDigit, isNewline } from '@markdown-editor/shared';
import { TokenType, type Token, type LexerOptions } from './types';

/**
 * Markdown词法分析器
 */
export class MarkdownLexer {
  private input: string;
  private line: number = 1;
  private column: number = 1;
  private offset: number = 0;
  private options: LexerOptions;

  constructor(input: string, options: LexerOptions = {}) {
    /** 换行标准化转义处理 */
    this.input = normalizeNewlines(input);
    this.options = options;
  }

  /**
   * 取出当前字符
   */
  peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.input[this.offset];
  }

  /**
   * 移动到下一个位置 不用处理换行
   */
  advance(): void {
    if (this.isAtEnd()) return;

    this.offset++;
    this.column++;
  }

  /**
   * 取出下一个字符
   */
  peekNext(): string {
    if (this.offset + 1 >= this.input.length) return '\0';
    return this.input[this.offset + 1];
  }

  /**
   * 是否到达输入末尾
   */
  isAtEnd(): boolean {
    return this.offset >= this.input.length;
  }

  /**
   * 词法分析主方法
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const token = this.scanToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  /**
   * 创建Token
   */
  private createToken(type: TokenType, value: string): Token {
    const position = createPosition(this.line, Math.max(1, this.column - value.length), this.offset - value.length);

    return {
      type,
      value,
      position,
      length: value.length,
      raw: value,
    };
  }

  /**
   * 扫描当前位置的Token
   */
  scanToken(): Token | null {
    const char = this.peek();

    switch (char) {
      case '#':
        return this.scanHash();
      case '*':
        return this.scanAsterisk();
      case '`':
        return this.scanBacktick();
      case '[':
        return this.scanBracketOpen();
      case ']':
        return this.scanBracketClose();
      case '(':
        return this.scanParenOpen();
      case ')':
        return this.scanParenClose();
      case '!':
        return this.scanExclamation();
      case '>':
        return this.scanGreaterThan();
      case '-':
        return this.scanMinus();
      case '.':
        return this.scanDot();
      case '\n':
        return this.scanNewline();
      case '\t':
        return this.scanTab();
      case ' ':
        return this.scanWhitespace();
      default:
        if (isDigit(char)) {
          return this.scanDigit();
        }
        return this.scanText(); // 视为普通文本
    }
  }

  /**
   * 检查字符是否属于普通文本
   */
  private isTextChar(char: string): boolean {
    return !(
      char === '#' ||
      char === '*' ||
      char === '`' ||
      char === '[' ||
      char === ']' ||
      char === '(' ||
      char === ')' ||
      char === '!' ||
      char === '>' ||
      char === '-' ||
      char === '.' ||
      isNewline(char) ||
      isWhitespace(char)
    );
  }

  /**
   * 扫描标题标记
   */
  private scanHash(): Token {
    let count = 0;

    /** 最多6级标题 */
    while (this.peek() === '#' && count < 6) {
      this.advance();
      count++;
    }

    return this.createToken(TokenType.HASH, '#'.repeat(count));
  }

  /**
   * 扫描星号（可能是粗体、斜体或列表）
   */
  private scanAsterisk(): Token {
    this.advance();

    // 检查是否是粗体 (**)
    if (this.peek() === '*') {
      this.advance();
      return this.createToken(TokenType.BOLD, '**');
    }

    return this.createToken(TokenType.ASTERISK, '*');
  }

  /**
   * 扫描反引号（代码）
   */
  private scanBacktick(): Token {
    let count = 0;

    while (this.peek() === '`') {
      this.advance();
      count++;
    }

    /** 块级代码 */
    if (count === 3) {
      return this.createToken(TokenType.CODE_BLOCK, '`'.repeat(count));
    } else {
      return this.createToken(TokenType.BACKTICK, '`'.repeat(count));
    }
  }

  /**
   * 扫描左方括号
   */
  private scanBracketOpen(): Token {
    this.advance();
    return this.createToken(TokenType.BRACKET_OPEN, '[');
  }

  /**
   * 扫描右方括号
   */
  private scanBracketClose(): Token {
    this.advance();
    return this.createToken(TokenType.BRACKET_CLOSE, ']');
  }

  /**
   * 扫描左圆括号
   */
  private scanParenOpen(): Token {
    this.advance();
    return this.createToken(TokenType.PAREN_OPEN, '(');
  }

  /**
   * 扫描右圆括号
   */
  private scanParenClose(): Token {
    this.advance();
    return this.createToken(TokenType.PAREN_CLOSE, ')');
  }

  /**
   * 扫描感叹号（图片）
   */
  private scanExclamation(): Token {
    this.advance();
    return this.createToken(TokenType.EXCLAMATION, '!');
  }

  /**
   * 扫描大于号（引用）
   */
  private scanGreaterThan(): Token {
    this.advance();
    return this.createToken(TokenType.GREATER_THAN, '>');
  }

  /**
   * 扫描减号（列表或分割线）
   */
  private scanMinus(): Token {
    let count = 0;

    while (this.peek() === '-') {
      this.advance();
      count++;
    }

    /** 是否是分割线 */
    if (count >= 3) {
      return this.createToken(TokenType.HORIZONTAL_RULE, '-'.repeat(count));
    }

    return this.createToken(TokenType.MINUS, '-'.repeat(count));
  }

  /**
   * 扫描点号
   */
  private scanDot(): Token {
    this.advance();
    return this.createToken(TokenType.DOT, '.');
  }

  /**
   * 扫描数字
   */
  private scanDigit(): Token {
    const start = this.offset;

    while (isDigit(this.peek())) {
      this.advance();
    }

    return this.createToken(TokenType.DIGIT, this.input.slice(start, this.offset));
  }

  /**
   * 扫描换行符
   */
  private scanNewline(): Token {
    this.advance();

    // 换行
    this.line++;
    this.column = 1;

    return this.createToken(TokenType.NEWLINE, '\n');
  }

  /**
   * 扫描制表符
   */
  private scanTab(): Token {
    this.advance();
    return this.createToken(TokenType.TAB, '\t');
  }

  /**
   * 扫描空白字符
   */
  private scanWhitespace(): Token {
    let count = 0;

    while (this.peek() === ' ') {
      this.advance();
      count++;
    }

    return this.createToken(TokenType.WHITESPACE, ' '.repeat(count));
  }

  /**
   * 扫描普通文本
   */
  private scanText(): Token {
    const start = this.offset;

    while (!this.isAtEnd() && this.isTextChar(this.peek())) {
      this.advance();
    }

    return this.createToken(TokenType.TEXT, this.input.slice(start, this.offset));
  }
}
