import type { ASTNode } from '@markdown-editor/ast';
import { HTMLRenderer, type HTMLRenderOptions } from './html-renderer';
import { ReactRenderer, type ReactRenderOptions } from './react-renderer';
import React from 'react';

/**
 * 将AST渲染为HTML字符串
 */
export function renderToHTML(node: ASTNode, options?: HTMLRenderOptions): string {
  const renderer = new HTMLRenderer(options);
  return renderer.render(node);
}

/**
 * 将AST渲染为React元素
 */
export function renderToReact(React: any, node: ASTNode, options?: ReactRenderOptions): React.ReactElement {
  const renderer = new ReactRenderer(React, options);
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

  /**
   * 创建React渲染器
   */
  static createReactRenderer(React: any, options?: ReactRenderOptions): ReactRenderer {
    return new ReactRenderer(React, options);
  }
}

/**
 * 批量渲染工具
 */
export class BatchRenderer {
  private htmlRenderer?: HTMLRenderer;
  private reactRenderer?: ReactRenderer;

  constructor(
    private React?: any,
    private htmlOptions?: HTMLRenderOptions,
    private reactOptions?: ReactRenderOptions,
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

  /**
   * 渲染为React
   */
  toReact(node: ASTNode): React.ReactElement {
    if (!this.React) {
      throw new Error('React is required for React rendering');
    }
    if (!this.reactRenderer) {
      this.reactRenderer = new ReactRenderer(this.React, this.reactOptions);
    }
    return this.reactRenderer.render(node);
  }

  /**
   * 批量渲染为多种格式
   */
  renderAll(node: ASTNode): {
    html: string;
    react?: React.ReactElement;
  } {
    const result: any = {
      html: this.toHTML(node),
    };

    if (this.React) {
      result.react = this.toReact(node);
    }

    return result;
  }
}
