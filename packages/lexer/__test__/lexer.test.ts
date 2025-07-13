import { describe, it, expect } from 'vitest';
import { MarkdownLexer } from '../src/lexer';
import { TokenType } from '../src/types';

describe('MarkdownLexer', () => {
  describe('基础功能', () => {
    it('应该正确处理空字符串', () => {
      const lexer = new MarkdownLexer('');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('应该正确处理位置信息', () => {
      const lexer = new MarkdownLexer('a');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(2);
      expect(tokens[0].position.line).toBe(1);
      expect(tokens[0].position.column).toBe(1);
      expect(tokens[0].position.offset).toBe(0);
    });
  });

  describe('标题标记 (#)', () => {
    it('应该扫描单个 #', () => {
      const lexer = new MarkdownLexer('#');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HASH);
      expect(tokens[0].value).toBe('#');
      expect(tokens[0].length).toBe(1);
    });

    it('应该扫描多个 #', () => {
      const lexer = new MarkdownLexer('###');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HASH);
      expect(tokens[0].value).toBe('###');
      expect(tokens[0].length).toBe(3);
    });

    it('应该限制最多6个 #', () => {
      const lexer = new MarkdownLexer('########');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HASH);
      expect(tokens[0].value).toBe('######');
      expect(tokens[1].type).toBe(TokenType.HASH);
      expect(tokens[1].value).toBe('##');
    });
  });

  describe('星号 (*)', () => {
    it('应该扫描单个 *', () => {
      const lexer = new MarkdownLexer('*');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.ASTERISK);
      expect(tokens[0].value).toBe('*');
    });

    it('应该扫描粗体 **', () => {
      const lexer = new MarkdownLexer('**');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BOLD);
      expect(tokens[0].value).toBe('**');
    });

    it('应该扫描三个星号为 ** + *', () => {
      const lexer = new MarkdownLexer('***');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BOLD);
      expect(tokens[0].value).toBe('**');
      expect(tokens[1].type).toBe(TokenType.ASTERISK);
      expect(tokens[1].value).toBe('*');
    });
  });

  describe('反引号 (`)', () => {
    it('应该扫描单个反引号', () => {
      const lexer = new MarkdownLexer('`');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BACKTICK);
      expect(tokens[0].value).toBe('`');
    });

    it('应该扫描双反引号', () => {
      const lexer = new MarkdownLexer('``');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BACKTICK);
      expect(tokens[0].value).toBe('``');
    });

    it('应该扫描代码块 ```', () => {
      const lexer = new MarkdownLexer('```');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.CODE_BLOCK);
      expect(tokens[0].value).toBe('```');
    });
  });

  describe('括号', () => {
    it('应该扫描方括号', () => {
      const lexer = new MarkdownLexer('[]');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BRACKET_OPEN);
      expect(tokens[0].value).toBe('[');
      expect(tokens[1].type).toBe(TokenType.BRACKET_CLOSE);
      expect(tokens[1].value).toBe(']');
    });

    it('应该扫描圆括号', () => {
      const lexer = new MarkdownLexer('()');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.PAREN_OPEN);
      expect(tokens[0].value).toBe('(');
      expect(tokens[1].type).toBe(TokenType.PAREN_CLOSE);
      expect(tokens[1].value).toBe(')');
    });
  });

  describe('特殊字符', () => {
    it('应该扫描感叹号', () => {
      const lexer = new MarkdownLexer('!');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.EXCLAMATION);
      expect(tokens[0].value).toBe('!');
    });

    it('应该扫描大于号', () => {
      const lexer = new MarkdownLexer('>');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.GREATER_THAN);
      expect(tokens[0].value).toBe('>');
    });

    it('应该扫描点号', () => {
      const lexer = new MarkdownLexer('.');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.DOT);
      expect(tokens[0].value).toBe('.');
    });
  });

  describe('减号 (-)', () => {
    it('应该扫描单个减号', () => {
      const lexer = new MarkdownLexer('-');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.MINUS);
      expect(tokens[0].value).toBe('-');
    });

    it('应该扫描双减号', () => {
      const lexer = new MarkdownLexer('--');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.MINUS);
      expect(tokens[0].value).toBe('--');
    });

    it('应该扫描水平分割线', () => {
      const lexer = new MarkdownLexer('---');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HORIZONTAL_RULE);
      expect(tokens[0].value).toBe('---');
    });

    it('应该扫描更长的水平分割线', () => {
      const lexer = new MarkdownLexer('-----');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HORIZONTAL_RULE);
      expect(tokens[0].value).toBe('-----');
    });
  });

  describe('数字', () => {
    it('应该扫描单个数字', () => {
      const lexer = new MarkdownLexer('1');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.DIGIT);
      expect(tokens[0].value).toBe('1');
    });

    it('应该扫描多位数字', () => {
      const lexer = new MarkdownLexer('123');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.DIGIT);
      expect(tokens[0].value).toBe('123');
    });

    it('应该扫描零', () => {
      const lexer = new MarkdownLexer('0');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.DIGIT);
      expect(tokens[0].value).toBe('0');
    });
  });

  describe('空白字符', () => {
    it('应该扫描换行符', () => {
      const lexer = new MarkdownLexer('\n');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.NEWLINE);
      expect(tokens[0].value).toBe('\n');
      expect(tokens[0].position.line).toBe(2); // 换行后行号应为2
    });

    it('应该扫描制表符', () => {
      const lexer = new MarkdownLexer('\t');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TAB);
      expect(tokens[0].value).toBe('\t');
    });

    it('应该扫描单个空格', () => {
      const lexer = new MarkdownLexer(' ');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.WHITESPACE);
      expect(tokens[0].value).toBe(' ');
    });

    it('应该扫描多个连续空格', () => {
      const lexer = new MarkdownLexer('   ');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.WHITESPACE);
      expect(tokens[0].value).toBe('   ');
      expect(tokens[0].length).toBe(3);
    });

    it('应该正确处理换行后的位置信息', () => {
      const lexer = new MarkdownLexer('\na');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.NEWLINE);
      expect(tokens[1].type).toBe(TokenType.TEXT);
      expect(tokens[1].position.line).toBe(2);
      expect(tokens[1].position.column).toBe(1);
    });
  });

  describe('普通文本', () => {
    it('应该扫描字母', () => {
      const lexer = new MarkdownLexer('hello');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('hello');
    });

    it('应该扫描中文', () => {
      const lexer = new MarkdownLexer('你好世界');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('你好世界');
    });

    it('应该扫描特殊字符作为文本', () => {
      const lexer = new MarkdownLexer('hello@world.com');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('hello@world');
      expect(tokens[1].type).toBe(TokenType.DOT);
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe('com');
    });

    it('应该在特殊字符处停止文本扫描', () => {
      const lexer = new MarkdownLexer('hello*world');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('hello');
      expect(tokens[1].type).toBe(TokenType.ASTERISK);
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe('world');
    });
  });

  describe('复杂场景', () => {
    it('应该扫描简单的 Markdown 标题', () => {
      const lexer = new MarkdownLexer('# Hello World');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HASH);
      expect(tokens[0].value).toBe('#');
      expect(tokens[1].type).toBe(TokenType.WHITESPACE);
      expect(tokens[1].value).toBe(' ');
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe('Hello');
      expect(tokens[3].type).toBe(TokenType.WHITESPACE);
      expect(tokens[3].value).toBe(' ');
      expect(tokens[4].type).toBe(TokenType.TEXT);
      expect(tokens[4].value).toBe('World');
      expect(tokens[5].type).toBe(TokenType.EOF);
    });

    it('应该扫描粗体文本', () => {
      const lexer = new MarkdownLexer('**bold**');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BOLD);
      expect(tokens[1].type).toBe(TokenType.TEXT);
      expect(tokens[1].value).toBe('bold');
      expect(tokens[2].type).toBe(TokenType.BOLD);
    });

    it('应该扫描代码块', () => {
      const lexer = new MarkdownLexer('```code```');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.CODE_BLOCK);
      expect(tokens[1].type).toBe(TokenType.TEXT);
      expect(tokens[1].value).toBe('code');
      expect(tokens[2].type).toBe(TokenType.CODE_BLOCK);
    });

    it('应该扫描链接语法', () => {
      const lexer = new MarkdownLexer('[text](url)');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BRACKET_OPEN);
      expect(tokens[1].type).toBe(TokenType.TEXT);
      expect(tokens[1].value).toBe('text');
      expect(tokens[2].type).toBe(TokenType.BRACKET_CLOSE);
      expect(tokens[3].type).toBe(TokenType.PAREN_OPEN);
      expect(tokens[4].type).toBe(TokenType.TEXT);
      expect(tokens[4].value).toBe('url');
      expect(tokens[5].type).toBe(TokenType.PAREN_CLOSE);
    });

    it('应该扫描图片语法', () => {
      const lexer = new MarkdownLexer('![alt](src)');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.EXCLAMATION);
      expect(tokens[1].type).toBe(TokenType.BRACKET_OPEN);
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe('alt');
      expect(tokens[3].type).toBe(TokenType.BRACKET_CLOSE);
      expect(tokens[4].type).toBe(TokenType.PAREN_OPEN);
      expect(tokens[5].type).toBe(TokenType.TEXT);
      expect(tokens[5].value).toBe('src');
      expect(tokens[6].type).toBe(TokenType.PAREN_CLOSE);
    });

    it('应该扫描引用块', () => {
      const lexer = new MarkdownLexer('> quote');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.GREATER_THAN);
      expect(tokens[1].type).toBe(TokenType.WHITESPACE);
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe('quote');
    });

    it('应该扫描有序列表', () => {
      const lexer = new MarkdownLexer('1. item');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.DIGIT);
      expect(tokens[0].value).toBe('1');
      expect(tokens[1].type).toBe(TokenType.DOT);
      expect(tokens[2].type).toBe(TokenType.WHITESPACE);
      expect(tokens[3].type).toBe(TokenType.TEXT);
      expect(tokens[3].value).toBe('item');
    });

    it('应该处理多行内容', () => {
      const lexer = new MarkdownLexer('line1\nline2');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('line1');
      expect(tokens[0].position.line).toBe(1);
      expect(tokens[1].type).toBe(TokenType.NEWLINE);
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe('line2');
      expect(tokens[2].position.line).toBe(2);
    });
  });

  describe('边界情况', () => {
    it('应该处理只有空白字符的输入', () => {
      const lexer = new MarkdownLexer('   \t\n   ');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.WHITESPACE);
      expect(tokens[1].type).toBe(TokenType.TAB);
      expect(tokens[2].type).toBe(TokenType.NEWLINE);
      expect(tokens[3].type).toBe(TokenType.WHITESPACE);
      expect(tokens[4].type).toBe(TokenType.EOF);
    });

    it('应该处理连续的特殊字符', () => {
      const lexer = new MarkdownLexer('***---```');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BOLD);
      expect(tokens[1].type).toBe(TokenType.ASTERISK);
      expect(tokens[2].type).toBe(TokenType.HORIZONTAL_RULE);
      expect(tokens[3].type).toBe(TokenType.CODE_BLOCK);
    });

    it('应该处理末尾的换行符', () => {
      const lexer = new MarkdownLexer('text\n');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[1].type).toBe(TokenType.NEWLINE);
      expect(tokens[2].type).toBe(TokenType.EOF);
    });
  });
});
