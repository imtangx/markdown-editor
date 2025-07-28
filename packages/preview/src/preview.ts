import { MarkdownLexer } from '@markdown-editor/lexer';
import { RecursiveDescentParser } from '@markdown-editor/parser';
import { HTMLRenderer } from '@markdown-editor/renderer';
import type { AnyNode } from '@markdown-editor/ast';

/**
 * 预览配置接口
 */
export interface PreviewConfig {
  /** 是否启用语法高亮 */
  enableSyntaxHighlight?: boolean;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  styles?: Record<string, string>;
  /** 是否启用实时更新 */
  liveUpdate?: boolean;
  /** 更新防抖时间（毫秒） */
  debounceTime?: number;
  /** 滚动回调 */
  onScroll?: (event: PreviewScrollEvent) => void;
}

/**
 * 预览滚动事件
 */
export interface PreviewScrollEvent {
  /** 滚动位置 */
  scrollTop: number;
  /** 总高度 */
  scrollHeight: number;
  /** 可见高度 */
  clientHeight: number;
  /** 滚动百分比 */
  percentage: number;
}

/**
 * Markdown预览类
 */
export class MarkdownPreview {
  private lexer: MarkdownLexer;
  private parser: RecursiveDescentParser;
  private renderer: HTMLRenderer;
  private container: HTMLElement;
  private config: PreviewConfig;
  private updateTimeout?: number;
  private currentContent: string = '';

  constructor(container: HTMLElement, config: PreviewConfig = {}) {
    this.container = container;
    this.config = {
      enableSyntaxHighlight: true,
      className: 'markdown-preview',
      liveUpdate: true,
      debounceTime: 300,
      ...config,
    };

    this.lexer = new MarkdownLexer('');
    this.parser = new RecursiveDescentParser();
    this.renderer = new HTMLRenderer();

    this.setupContainer();
    this.setupEventListeners();
  }

  /**
   * 设置容器
   */
  private setupContainer(): void {
    this.container.className = this.config.className || 'markdown-preview';

    // 默认样式
    const defaultStyles: Record<string, string> = {
      padding: '16px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: '1.6',
      color: '#374151',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'auto',
      height: '100%',
      ...this.config.styles,
    };

    Object.assign(this.container.style, defaultStyles);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 滚动事件
    if (this.config.onScroll) {
      this.container.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  /**
   * 处理滚动事件
   */
  private handleScroll(): void {
    if (!this.config.onScroll) return;

    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const percentage = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;

    this.config.onScroll({
      scrollTop,
      scrollHeight,
      clientHeight,
      percentage,
    });
  }

  /**
   * 渲染markdown内容
   */
  render(content: string): void {
    if (content === this.currentContent) return;
    this.currentContent = content;

    if (this.config.liveUpdate && this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    const doRender = () => {
      try {
        // 词法分析
        const lexer = new MarkdownLexer(content);
        const tokens = lexer.tokenize();

        // 语法分析
        const ast = this.parser.parse(tokens);

        // 渲染为HTML
        const html = this.renderer.render(ast);

        // 更新容器内容
        this.container.innerHTML = html;

        // 后处理
        this.postProcess();
      } catch (error) {
        console.error('Preview rendering failed:', error);
        this.renderError(error instanceof Error ? error.message : String(error));
      }
    };

    if (this.config.liveUpdate && this.config.debounceTime && this.config.debounceTime > 0) {
      this.updateTimeout = window.setTimeout(doRender, this.config.debounceTime);
    } else {
      doRender();
    }
  }

  /**
   * 渲染错误信息
   */
  private renderError(message: string): void {
    this.container.innerHTML = `
      <div style="
        color: #dc2626; 
        background: #fef2f2; 
        padding: 12px; 
        border-radius: 6px; 
        border: 1px solid #fecaca;
        margin: 16px;
      ">
        <strong>渲染错误:</strong> ${message}
      </div>
    `;
  }

  /**
   * 后处理渲染结果
   */
  private postProcess(): void {
    // 语法高亮
    if (this.config.enableSyntaxHighlight) {
      this.applySyntaxHighlight();
    }

    // 链接处理
    this.setupLinks();

    // 表格处理
    this.setupTables();
  }

  /**
   * 应用语法高亮
   */
  private applySyntaxHighlight(): void {
    const codeBlocks = this.container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      // 这里可以集成 Prism.js 或其他语法高亮库
      block.classList.add('hljs');

      // 简单的基础样式
      Object.assign((block as HTMLElement).style, {
        display: 'block',
        background: '#f8f9fa',
        padding: '1em',
        borderRadius: '4px',
        fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
        fontSize: '0.875em',
        overflow: 'auto',
      });
    });
  }

  /**
   * 设置链接处理
   */
  private setupLinks(): void {
    const links = this.container.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  /**
   * 设置表格处理
   */
  private setupTables(): void {
    const tables = this.container.querySelectorAll('table');
    tables.forEach(table => {
      // 添加表格样式
      Object.assign((table as HTMLElement).style, {
        borderCollapse: 'collapse',
        width: '100%',
        margin: '1em 0',
      });

      // 设置单元格样式
      const cells = table.querySelectorAll('th, td');
      cells.forEach(cell => {
        Object.assign((cell as HTMLElement).style, {
          border: '1px solid #e5e7eb',
          padding: '8px 12px',
          textAlign: 'left',
        });
      });

      // 设置表头样式
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        Object.assign((header as HTMLElement).style, {
          backgroundColor: '#f9fafb',
          fontWeight: 'bold',
        });
      });
    });
  }

  /**
   * 获取滚动信息
   */
  getScrollInfo(): { top: number; height: number; clientHeight: number; percentage: number } {
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const percentage = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;

    return {
      top: scrollTop,
      height: scrollHeight,
      clientHeight,
      percentage,
    };
  }

  /**
   * 设置滚动位置
   */
  setScrollTop(scrollTop: number): void {
    this.container.scrollTop = scrollTop;
  }

  /**
   * 销毁预览器
   */
  destroy(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.container.removeEventListener('scroll', this.handleScroll.bind(this));

    // 清空内容
    this.container.innerHTML = '';
    this.currentContent = '';
  }
}
