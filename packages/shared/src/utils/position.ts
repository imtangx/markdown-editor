/**
 * 位置/范围工具函数
 */

import type { Position, Range } from '../types';

/**
 * 创建位置对象
 */
export function createPosition(line: number, column: number, offset: number): Position {
  return { line, column, offset };
}

/**
 * 创建范围对象
 */
export function createRange(start: Position, end: Position): Range {
  return { start, end };
}

/**
 * 检查位置是否在范围内
 */
export function isPositionInRange(position: Position, range: Range): boolean {
  return position.offset >= range.start.offset && position.offset <= range.end.offset;
}

/**
 * 比较两个位置
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function comparePositions(a: Position, b: Position): number {
  if (a.offset < b.offset) return -1;
  if (a.offset > b.offset) return 1;
  return 0;
}

/**
 * 计算范围的长度
 */
export function getRangeLength(range: Range): number {
  return range.end.offset - range.start.offset;
}

/**
 * 检查两个范围是否重叠
 */
export function rangesOverlap(a: Range, b: Range): boolean {
  return !(a.end.offset < b.start.offset || b.end.offset < a.start.offset);
}

/**
 * 合并两个范围
 */
export function mergeRanges(a: Range, b: Range): Range {
  const start = comparePositions(a.start, b.start) <= 0 ? a.start : b.start;
  const end = comparePositions(a.end, b.end) >= 0 ? a.end : b.end;
  return createRange(start, end);
}
