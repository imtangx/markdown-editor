import type { ASTNode } from '@markdown-editor/ast';
import { HTMLRenderer, type HTMLRenderOptions } from './html-renderer';

/**
 * 将AST渲染为HTML字符串
 */
export function renderToHTML(node: ASTNode, options?: HTMLRenderOptions): string {
  const renderer = new HTMLRenderer(options);
  return renderer.render(node);
}

/**
 * 渲染器工厂
 */
export class RendererFactory {
  /**
   * 创建HTML渲染器
   */
  static createHTMLRenderer(options?: HTMLRenderOptions): HTMLRenderer {
    return new HTMLRenderer(options);
  }
}

/**
 * 批量渲染工具
 */
export class BatchRenderer {
  private htmlRenderer?: HTMLRenderer;

  constructor(
    private React?: any,
    private htmlOptions?: HTMLRenderOptions,
  ) {}

  /**
   * 渲染为HTML
   */
  toHTML(node: ASTNode): string {
    if (!this.htmlRenderer) {
      this.htmlRenderer = new HTMLRenderer(this.htmlOptions);
    }
    return this.htmlRenderer.render(node);
  }
}
