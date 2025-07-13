/**
 * 字符串工具函数
 */

/**
 * 检查字符是否为空白字符
 */
export function isWhitespace(char: string): boolean {
  return /^\s$/.test(char);
}

/**
 * 检查字符是否为字母
 */
export function isAlpha(char: string): boolean {
  return /^[a-zA-Z]$/.test(char);
}

/**
 * 检查字符是否为数字
 */
export function isDigit(char: string): boolean {
  return /^[0-9]$/.test(char);
}

/**
 * 检查字符是否为字母或数字
 */
export function isAlphaNumeric(char: string): boolean {
  return isAlpha(char) || isDigit(char);
}

/**
 * 检查字符是否为换行符
 */
export function isNewline(char: string): boolean {
  return char === '\n' || char === '\r';
}

/**
 * 标准化换行符
 */
export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * 获取文本的行数组
 */
export function getLines(text: string): string[] {
  return text.split('\n');
}

/**
 * 计算字符串特定偏移量的行列位置
 */
export function getLineColumnFromOffset(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;

  text = normalizeNewlines(text);

  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column };
}
