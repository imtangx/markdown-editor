import type { Position } from '@markdown-editor/shared';

/**
 * Token类型枚举
 */
export enum TokenType {
  // ========== 根元素 ==========
  DOCUMENT = 'document',

  // ========== 块级元素 ==========
  /** 标题，如 `# Heading` */
  HEADING = 'heading',
  /** 段落文本 */
  PARAGRAPH = 'paragraph',
  /** 代码块，如 ```code``` */
  CODE_BLOCK = 'code_block',
  /** 引用块，如 `> Quote` */
  QUOTE = 'quote',
  /** 无序列表，如 `- Item` */
  LIST = 'list',
  /** 无序列表项，如 `- Item` */
  LIST_ITEM = 'list_item',
  /** 水平分割线，如 `---` */
  HORIZONTAL_RULE = 'horizontal_rule',

  // ========== 行内元素 ==========
  /** 加粗文本，如 `**bold**` */
  BOLD = 'bold',
  /** 斜体文本，如 `*italic*` */
  ITALIC = 'italic',
  /** 行内代码，如 `code` */
  CODE = 'code',
  /** 链接，如 `[text](url)` */
  LINK = 'link',
  /** 图片，如 `![alt](src)` */
  IMAGE = 'image',

  // ========== 特殊字符 ==========
  /** 星号 `*` */
  ASTERISK = 'asterisk',
  /** 反引号 `` ` `` */
  BACKTICK = 'backtick',
  /** 左方括号 `[` */
  BRACKET_OPEN = 'bracket_open',
  /** 右方括号 `]` */
  BRACKET_CLOSE = 'bracket_close',
  /** 左圆括号 `(` */
  PAREN_OPEN = 'paren_open',
  /** 右圆括号 `)` */
  PAREN_CLOSE = 'paren_close',
  /** 井号 `#` */
  HASH = 'hash',
  /** 感叹号 `!` */
  EXCLAMATION = 'exclamation',
  /** 大于号 `>` */
  GREATER_THAN = 'greater_than',
  /** 减号 `-` */
  MINUS = 'minus',
  /** 数字 `0-9` */
  DIGIT = 'digit',
  /** 点号 `.` */
  DOT = 'dot',

  // ========== 基础类型 ==========
  /** 普通文本 */
  TEXT = 'text',
  /** 空白字符（空格/制表符） */
  WHITESPACE = 'whitespace',
  /** 换行符 `\n` 或 `\r\n` 或 `\r` */
  NEWLINE = 'newline',
  /** 制表符 `\t` */
  TAB = 'tab',
  /** 文件结束符 */
  EOF = 'eof',

  // ========== 错误类型 ==========
  /** 未知字符或语法 */
  UNKNOWN = 'unknown',
}

/**
 * Token接口
 */
export interface Token {
  /** Token类型 */
  type: TokenType;
  /** Token值 */
  value: string;
  /** 位置信息 */
  position: Position;
  /** Token长度 */
  length: number;
  /** 原始文本 */
  raw: string;
}

/**
 * 词法分析器配置
 */

export interface LexerOptions {}
