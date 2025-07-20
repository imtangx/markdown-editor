import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nodeFactory } from '@markdown-editor/ast';
import { renderToHTML, renderToReact, RendererFactory, BatchRenderer } from '../src/utils';

// Mock React
const mockReact = {
  createElement: vi.fn((type, props, ...children) => {
    const flatChildren = children.flat().filter(child => child !== null && child !== undefined);
    return {
      type,
      props: {
        ...props,
        children: flatChildren.length === 0 ? undefined : flatChildren.length === 1 ? flatChildren[0] : flatChildren,
      },
      key: props?.key,
    };
  }),
  isValidElement: vi.fn(() => true),
  cloneElement: vi.fn((element, props) => ({
    ...element,
    props: { ...element.props, ...props },
  })),
};

describe('Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderToHTML', () => {
    it('应该将AST渲染为HTML字符串', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = renderToHTML(paragraph);

      expect(html).toContain('<p');
      expect(html).toContain('Hello World');
      expect(html).toContain('</p>');
    });

    it('应该使用自定义选项', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = renderToHTML(paragraph, { classPrefix: 'custom-' });

      expect(html).toContain('class="custom-paragraph"');
    });
  });

  describe('renderToReact', () => {
    it('应该将AST渲染为React元素', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const element = renderToReact(mockReact, paragraph);

      expect(element.type).toBe('p');
      expect(mockReact.createElement).toHaveBeenCalledWith(
        'p',
        expect.objectContaining({ className: 'md-paragraph' }),
        expect.anything(),
      );
    });

    it('应该使用自定义选项', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      // 确保调用 renderToReact 并获取返回值
      const result = renderToReact(mockReact, paragraph, { classPrefix: 'custom-' });

      // 验证返回值类型（可选）
      expect(result).toBeDefined();

      // 验证 mock 调用
      expect(mockReact.createElement).toHaveBeenCalledWith(
        'p',
        expect.objectContaining({ className: 'custom-paragraph' }),
        expect.anything(),
      );
    });
  });

  describe('RendererFactory', () => {
    it('应该创建HTML渲染器', () => {
      const renderer = RendererFactory.createHTMLRenderer();

      expect(renderer).toBeDefined();
      expect(typeof renderer.render).toBe('function');
    });

    it('应该创建React渲染器', () => {
      const renderer = RendererFactory.createReactRenderer(mockReact);

      expect(renderer).toBeDefined();
      expect(typeof renderer.render).toBe('function');
    });

    it('应该使用自定义选项创建渲染器', () => {
      const htmlRenderer = RendererFactory.createHTMLRenderer({ classPrefix: 'test-' });
      const reactRenderer = RendererFactory.createReactRenderer(mockReact, { classPrefix: 'test-' });

      expect(htmlRenderer).toBeDefined();
      expect(reactRenderer).toBeDefined();
    });
  });

  describe('BatchRenderer', () => {
    it('应该批量渲染为HTML', () => {
      const batchRenderer = new BatchRenderer();
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = batchRenderer.toHTML(paragraph);

      expect(html).toContain('<p');
      expect(html).toContain('Hello World');
      expect(html).toContain('</p>');
    });

    it('应该批量渲染为React', () => {
      const batchRenderer = new BatchRenderer(mockReact);
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const element = batchRenderer.toReact(paragraph);

      expect(element.type).toBe('p');
    });

    it('应该在没有React时抛出错误', () => {
      const batchRenderer = new BatchRenderer();
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      expect(() => batchRenderer.toReact(paragraph)).toThrow('React is required for React rendering');
    });

    it('应该批量渲染为所有格式', () => {
      const batchRenderer = new BatchRenderer(mockReact);
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const result = batchRenderer.renderAll(paragraph);

      expect(result.html).toContain('<p');
      expect(result.react).toBeDefined();
      expect(result?.react?.type).toBe('p');
    });

    it('应该在没有React时只渲染HTML', () => {
      const batchRenderer = new BatchRenderer();
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const result = batchRenderer.renderAll(paragraph);

      expect(result.html).toContain('<p');
      expect(result.react).toBeUndefined();
    });

    it('应该复用渲染器实例', () => {
      const batchRenderer = new BatchRenderer();
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html1 = batchRenderer.toHTML(paragraph);
      const html2 = batchRenderer.toHTML(paragraph);

      // 两次调用应该产生相同的结果
      expect(html1).toBe(html2);
    });
  });
});
