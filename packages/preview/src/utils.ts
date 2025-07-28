/**
 * 计算滚动百分比
 */
export function calculateScrollPercentage(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  if (scrollHeight <= clientHeight) return 0;
  return Math.max(0, Math.min(1, scrollTop / (scrollHeight - clientHeight)));
}

/**
 * 同步滚动位置
 */
export function syncScrollPosition(
  sourcePercentage: number,
  targetScrollHeight: number,
  targetClientHeight: number,
): number {
  const maxScroll = targetScrollHeight - targetClientHeight;
  return Math.max(0, maxScroll * sourcePercentage);
}
