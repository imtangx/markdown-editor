/**
 * 文本编辑器的共享类型定义
 */

/**
 * 位置信息接口
 */
export interface Position {
  /** 行号 (从1开始) */
  line: number;
  /** 列号 (从1开始) */
  column: number;
  /** 字符总偏移量 (从0开始) */
  offset: number;
}

/**
 * 位置范围接口
 */
export interface Range {
  /** 开始位置 */
  start: Position;
  /** 结束位置 */
  end: Position;
}
