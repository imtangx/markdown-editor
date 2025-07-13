/**
 * Markdown语法相关常量
 */

export const MARKDOWN_SYNTAX = {
  /** 标题标记 */
  HEADING: '#',
  /** 粗体标记 */
  BOLD: '**',
  /** 斜体标记 */
  ITALIC: '*',
  /** 行内代码标记 */
  CODE: '`',
  /** 代码块标记 */
  CODE_BLOCK: '```',
  /** 链接开始标记 */
  LINK_START: '[',
  /** 链接结束标记 */
  LINK_END: ']',
  /** URL开始标记 */
  URL_START: '(',
  /** URL结束标记 */
  URL_END: ')',
  /** 图片标记 */
  IMAGE: '!',
  /** 引用标记 */
  QUOTE: '>',
  /** 列表标记 */
  LIST_UNORDERED: '-',
  /** 有序列表标记 */
  LIST_ORDERED: '1.',
  /** 分割线 */
  HORIZONTAL_RULE: '---',
  /** 换行 */
  NEWLINE: '\n',
  /** 回车换行 */
  CRLF: '\r\n',
} as const;
