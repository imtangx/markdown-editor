import { calculateScrollPercentage, syncScrollPosition } from '@markdown-editor/preview';
import { debounce } from '@markdown-editor/shared';

/**
 * 滚动器接口
 */
export interface ScrollerInterface {
  getScrollInfo(): { top: number; height: number; clientHeight: number };
  setScrollTop(scrollTop: number): void;
}

/**
 * 同步滚动配置
 */
export interface SyncScrollConfig {
  editor: ScrollerInterface;
  preview: ScrollerInterface;
  enabled?: boolean;
  debounceTime?: number;
}

/**
 * 同步滚动器
 */
export class SyncScroller {
  private config: SyncScrollConfig;
  private isScrolling: boolean = false;
  private scrollTimeout?: number;
  private debounceSyncFromEditor: (targetScrollTop: number) => void;
  private debounceSyncFromPreview: (targetScrollTop: number) => void;

  constructor(config: SyncScrollConfig) {
    this.config = {
      enabled: true,
      debounceTime: 50,
      ...config,
    };

    this.debounceSyncFromEditor = debounce(
      (targetScrollTop: number) => this.config.preview.setScrollTop(targetScrollTop),
      this.config.debounceTime || 50,
    );
    this.debounceSyncFromPreview = debounce(
      (targetScrollTop: number) => this.config.editor.setScrollTop(targetScrollTop),
      this.config.debounceTime || 50,
    );
  }

  /**
   * 从编辑器同步到预览
   */
  syncFromEditor(scrollTop: number, scrollHeight: number, clientHeight: number): void {
    if (!this.config.enabled || this.isScrolling) return;

    try {
      // 计算滚动百分比
      const percentage = calculateScrollPercentage(scrollTop, scrollHeight, clientHeight);

      // 获取预览滚动信息
      const previewInfo = this.config.preview.getScrollInfo();

      // 计算目标滚动位置
      const targetScrollTop = syncScrollPosition(percentage, previewInfo.height, previewInfo.clientHeight);

      // 应用滚动
      this.debounceSyncFromEditor(targetScrollTop);
    } catch (error) {
      console.warn('Sync scroll from editor failed:', error);
    }
  }

  /**
   * 从预览同步到编辑器
   */
  syncFromPreview(scrollTop: number, scrollHeight: number, clientHeight: number): void {
    if (!this.config.enabled || this.isScrolling) return;

    try {
      // 计算滚动百分比
      const percentage = calculateScrollPercentage(scrollTop, scrollHeight, clientHeight);

      // 获取编辑器滚动信息
      const editorInfo = this.config.editor.getScrollInfo();

      // 计算目标滚动位置
      const targetScrollTop = syncScrollPosition(percentage, editorInfo.height, editorInfo.clientHeight);

      // 应用滚动
      // TODO: 可能会产生竞态问题
      // this.debounceSyncFromPreview(targetScrollTop);
    } catch (error) {
      console.warn('Sync scroll from preview failed:', error);
    }
  }

  /**
   * 启用同步滚动
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * 禁用同步滚动
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled || false;
  }

  /**
   * 设置防抖时间
   */
  setDebounceTime(time: number): void {
    this.config.debounceTime = time;
  }

  /**
   * 销毁同步滚动器
   */
  destroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.config.enabled = false;
    this.isScrolling = false;
  }
}
