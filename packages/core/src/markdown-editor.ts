import { MarkdownEditor, type EditorConfig, lightTheme, darkTheme } from '@markdown-editor/editor';
import { MarkdownPreview, type PreviewConfig } from '@markdown-editor/preview';
import { SyncScroller } from './sync-scroll';
import { debounce, throttle } from '@markdown-editor/shared';

/**
 * 编辑器主题类型
 */
export type EditorTheme = 'light' | 'dark';

/**
 * Markdown编辑器配置
 */
export interface MarkdownEditorConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** 初始内容 */
  initialContent?: string;
  /** 主题 */
  theme?: EditorTheme;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否启用同步滚动 */
  syncScroll?: boolean;
  /** 编辑器配置 */
  editorConfig?: Partial<EditorConfig>;
  /** 预览配置 */
  previewConfig?: Partial<PreviewConfig>;
  /** 内容变化回调 */
  onChange?: (content: string) => void;
  /** 预览切换回调 */
  onPreviewToggle?: (visible: boolean) => void;
}

/**
 * Markdown编辑器核心类
 */
export class MarkdownEditorCore {
  private container: HTMLElement;
  private config: MarkdownEditorConfig;
  private editor!: MarkdownEditor;
  private preview!: MarkdownPreview;
  private syncScroller!: SyncScroller;

  private editorContainer!: HTMLElement;
  private previewContainer!: HTMLElement;
  private splitContainer!: HTMLElement;

  private isPreviewVisible: boolean = true;
  private currentTheme: EditorTheme = 'light';

  constructor(config: MarkdownEditorConfig) {
    this.config = {
      showPreview: true,
      syncScroll: true,
      theme: 'light',
      ...config,
    };

    this.container = config.container;
    this.isPreviewVisible = this.config.showPreview!;
    this.currentTheme = this.config.theme!;

    this.setupLayout();
    this.initializeEditor();
    this.initializePreview();
    this.setupSyncScroll();
    this.updateLayout();
  }

  /**
   * 设置布局
   */
  private setupLayout(): void {
    this.container.style.position = 'relative';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';

    // 创建分割容器
    this.splitContainer = document.createElement('div');
    this.splitContainer.style.cssText = `
      display: flex;
      flex: 1;
      height: 100%;
      min-height: 0;
    `;

    // 创建编辑器容器
    this.editorContainer = document.createElement('div');
    this.editorContainer.style.cssText = `
      flex: 1;
      min-width: 0;
      height: 100%;
      position: relative;
    `;

    // 创建预览容器
    this.previewContainer = document.createElement('div');
    this.previewContainer.style.cssText = `
      flex: 1;
      min-width: 0;
      height: 100%;
      position: relative;
      border-left: 1px solid #e5e7eb;
    `;

    this.splitContainer.appendChild(this.editorContainer);
    this.splitContainer.appendChild(this.previewContainer);
    this.container.appendChild(this.splitContainer);
  }

  /**
   * 初始化编辑器
   */
  private initializeEditor(): void {
    const editorConfig: EditorConfig = {
      doc: this.config.initialContent || '',
      theme: this.getEditorTheme(),
      onChange: event => {
        // 更新预览
        this.preview.render(event.content);

        // 触发外部回调
        if (this.config.onChange) {
          this.config.onChange(event.content);
        }
      },
      onScroll: this.config.syncScroll
        ? debounce((scrollTop: number, scrollHeight: number, clientHeight: number) => {
            if (this.syncScroller) {
              this.syncScroller.syncFromEditor(scrollTop, scrollHeight, clientHeight);
            }
          }, 100)
        : undefined,
      ...this.config.editorConfig,
    };

    this.editor = new MarkdownEditor(this.editorContainer, editorConfig);
  }

  /**
   * 初始化预览
   */
  private initializePreview(): void {
    const previewConfig: PreviewConfig = {
      className: 'markdown-preview',
      styles: this.getPreviewStyles(),
      onScroll: this.config.syncScroll
        ? debounce((event: { scrollTop: number; scrollHeight: number; clientHeight: number; percentage: number }) => {
            if (this.syncScroller) {
              this.syncScroller.syncFromPreview(event.scrollTop, event.scrollHeight, event.clientHeight);
            }
          }, 100)
        : undefined,
      ...this.config.previewConfig,
    };

    this.preview = new MarkdownPreview(this.previewContainer, previewConfig);

    // 渲染初始内容
    if (this.config.initialContent) {
      this.preview.render(this.config.initialContent);
    }
  }

  /**
   * 设置同步滚动
   */
  private setupSyncScroll(): void {
    if (!this.config.syncScroll) return;

    this.syncScroller = new SyncScroller({
      editor: {
        getScrollInfo: () => this.editor.getScrollInfo(),
        setScrollTop: scrollTop => this.editor.setScrollTop(scrollTop),
      },
      preview: {
        getScrollInfo: () => this.preview.getScrollInfo(),
        setScrollTop: scrollTop => this.preview.setScrollTop(scrollTop),
      },
    });
  }

  /**
   * 获取编辑器主题
   */
  private getEditorTheme() {
    return this.currentTheme === 'dark' ? darkTheme : lightTheme;
  }

  /**
   * 获取预览样式
   */
  private getPreviewStyles(): Record<string, string> {
    const baseStyles = {
      padding: '16px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: '1.6',
      borderRadius: '8px',
      overflow: 'auto',
      height: '100%',
    };

    if (this.currentTheme === 'dark') {
      return {
        ...baseStyles,
        color: '#e5e7eb',
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
      };
    } else {
      return {
        ...baseStyles,
        color: '#374151',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
      };
    }
  }

  /**
   * 更新布局
   */
  private updateLayout(): void {
    if (this.isPreviewVisible) {
      this.previewContainer.style.display = 'block';
      this.editorContainer.style.borderRight = '1px solid #e5e7eb';
    } else {
      this.previewContainer.style.display = 'none';
      this.editorContainer.style.borderRight = 'none';
    }
  }

  /**
   * 获取编辑器内容
   */
  getContent(): string {
    return this.editor.getContent();
  }

  /**
   * 设置编辑器内容
   */
  setContent(content: string): void {
    this.editor.setContent(content);
    this.preview.render(content);
  }

  /**
   * 插入文本
   */
  insertText(text: string): void {
    this.editor.insertText(text);
  }

  /**
   * 切换预览显示
   */
  togglePreview(): void {
    this.isPreviewVisible = !this.isPreviewVisible;
    this.updateLayout();

    if (this.config.onPreviewToggle) {
      this.config.onPreviewToggle(this.isPreviewVisible);
    }
  }

  /**
   * 显示预览
   */
  showPreview(): void {
    if (!this.isPreviewVisible) {
      this.togglePreview();
    }
  }

  /**
   * 隐藏预览
   */
  hidePreview(): void {
    if (this.isPreviewVisible) {
      this.togglePreview();
    }
  }

  /**
   * 设置主题
   */
  setTheme(theme: EditorTheme): void {
    if (theme === this.currentTheme) return;

    this.currentTheme = theme;

    // 保存当前编辑器内容
    const currentContent = this.editor.getContent();

    // 更新编辑器主题
    this.editor.destroy();
    this.initializeEditor();

    // 恢复编辑器内容
    this.editor.setContent(currentContent);

    // 更新预览样式
    const previewStyles = this.getPreviewStyles();
    Object.assign(this.previewContainer.style, previewStyles);
  }

  /**
   * 获取当前主题
   */
  getTheme(): EditorTheme {
    return this.currentTheme;
  }

  /**
   * 聚焦编辑器
   */
  focus(): void {
    this.editor.focus();
  }

  /**
   * 获取编辑器实例
   */
  getEditor(): MarkdownEditor {
    return this.editor;
  }

  /**
   * 获取预览实例
   */
  getPreview(): MarkdownPreview {
    return this.preview;
  }

  /**
   * 获取同步滚动器
   */
  getSyncScroller(): SyncScroller {
    return this.syncScroller;
  }

  /**
   * 启用同步滚动
   */
  enableSyncScroll(): void {
    if (!this.syncScroller) {
      this.setupSyncScroll();
    }
  }

  /**
   * 禁用同步滚动
   */
  disableSyncScroll(): void {
    if (this.syncScroller) {
      this.syncScroller.destroy();
    }
  }

  /**
   * 检查预览是否可见
   */
  isPreviewShown(): boolean {
    return this.isPreviewVisible;
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.editor.destroy();
    this.preview.destroy();

    if (this.syncScroller) {
      this.syncScroller.destroy();
    }

    this.container.innerHTML = '';
  }
}
