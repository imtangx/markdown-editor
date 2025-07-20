import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nodeFactory } from '@markdown-editor/ast';
import { ReactRenderer, createReactRenderer } from '../src/react-renderer';

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

describe('ReactRenderer', () => {
  let renderer: ReactRenderer;

  beforeEach(() => {
    vi.clearAllMocks();
    renderer = new ReactRenderer(mockReact);
  });

  describe('基本渲染', () => {
    it('应该渲染文档节点', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const document = nodeFactory.createDocument([paragraph], { line: 1, column: 1, offset: 0 });

      const element = renderer.render(document);

      expect(element.type).toBe('div');
      expect(mockReact.createElement).toHaveBeenCalledWith(
        'div',
        expect.objectContaining({ className: 'md-document' }),
        expect.any(Object),
      );
    });

    it('应该渲染文本节点', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });

      const result = renderer.visitText(textNode);

      expect(result).toBe('Hello World');
    });
  });

  describe('标题渲染', () => {
    it('应该渲染不同级别的标题', () => {
      const textNode = nodeFactory.createText('Heading', { line: 1, column: 1, offset: 0 });

      for (let level = 1; level <= 6; level++) {
        const heading = nodeFactory.createHeading(level, [textNode], { line: 1, column: 1, offset: 0 });
        const element = renderer.visitHeading(heading);

        expect(element.type).toBe(`h${level}`);
        expect(element.props.level).toBe(level);
        expect(element.props.className).toBe(`md-heading-h${level}`);
      }
    });

    it('应该限制标题级别在1-6之间', () => {
      const textNode = nodeFactory.createText('Heading', { line: 1, column: 1, offset: 0 });

      const heading0 = nodeFactory.createHeading(0, [textNode], { line: 1, column: 1, offset: 0 });
      const heading7 = nodeFactory.createHeading(7, [textNode], { line: 1, column: 1, offset: 0 });

      expect(renderer.visitHeading(heading0).type).toBe('h1');
      expect(renderer.visitHeading(heading7).type).toBe('h6');
    });
  });

  describe('段落渲染', () => {
    it('应该渲染段落', () => {
      const textNode = nodeFactory.createText('This is a paragraph', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const element = renderer.visitParagraph(paragraph);

      expect(element.type).toBe('p');
      expect(element.props.className).toBe('md-paragraph');
    });
  });

  // describe('代码块渲染', () => {
  //   it('应该渲染代码块', () => {
  //     const codeBlock = nodeFactory.createCodeBlock('console.log("hello");', 'javascript', {
  //       line: 1,
  //       column: 1,
  //       offset: 0,
  //     });

  //     const element = renderer.visitCodeBlock(codeBlock);

  //     expect(element.props.language).toBe('javascript');
  //     expect(element.props.children).toBe('console.log("hello");');
  //     expect(element.props.className).toBe('md-code-block-language-javascript');
  //   });

  //   it('应该渲染无语言标识的代码块', () => {
  //     const codeBlock = nodeFactory.createCodeBlock('plain code', undefined, { line: 1, column: 1, offset: 0 });

  //     const element = renderer.visitCodeBlock(codeBlock);

  //     expect(element.props.language).toBeUndefined();
  //     expect(element.props.children).toBe('plain code');
  //     expect(element.props.className).toBe('md-code-block');
  //   });
  // });

  describe('列表渲染', () => {
    it('应该渲染无序列表', () => {
      const textNode = nodeFactory.createText('Item 1', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const listItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 });
      const list = nodeFactory.createList(false, [listItem], { line: 1, column: 1, offset: 0 });

      const element = renderer.visitList(list);

      expect(element.type).toBe('ul');
      expect(element.props.ordered).toBe(false);
      expect(element.props.className).toBe('md-list-unordered');
    });

    it('应该渲染有序列表', () => {
      const textNode = nodeFactory.createText('Item 1', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const listItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 });
      const list = nodeFactory.createList(true, [listItem], { line: 1, column: 1, offset: 0 });

      const element = renderer.visitList(list);

      expect(element.type).toBe('ol');
      expect(element.props.ordered).toBe(true);
      expect(element.props.className).toBe('md-list-ordered');
    });

    it('应该渲染任务列表', () => {
      const textNode = nodeFactory.createText('Task item', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const checkedItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 }, true);
      const uncheckedItem = nodeFactory.createListItem([paragraph], { line: 2, column: 1, offset: 0 }, false);

      const checkedElement = renderer.visitListItem(checkedItem);
      const uncheckedElement = renderer.visitListItem(uncheckedItem);

      expect(checkedElement.props.checked).toBe(true);
      expect(checkedElement.props.className).toBe('md-list-item-task-checked');

      expect(uncheckedElement.props.checked).toBe(false);
      expect(uncheckedElement.props.className).toBe('md-list-item-task-unchecked');
    });
  });

  describe('引用渲染', () => {
    it('应该渲染引用块', () => {
      const textNode = nodeFactory.createText('This is a quote', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const quote = nodeFactory.createQuote([paragraph], { line: 1, column: 1, offset: 0 });

      const element = renderer.visitQuote(quote);

      expect(element.type).toBe('blockquote');
      expect(element.props.className).toBe('md-quote');
    });
  });

  describe('行内元素渲染', () => {
    it('应该渲染粗体文本', () => {
      const textNode = nodeFactory.createText('bold text', { line: 1, column: 1, offset: 0 });
      const bold = nodeFactory.createBold([textNode], { line: 1, column: 1, offset: 0 });

      const element = renderer.visitBold(bold);

      expect(element.type).toBe('strong');
      expect(element.props.className).toBe('md-bold');
    });

    it('应该渲染斜体文本', () => {
      const textNode = nodeFactory.createText('italic text', { line: 1, column: 1, offset: 0 });
      const italic = nodeFactory.createItalic([textNode], { line: 1, column: 1, offset: 0 });

      const element = renderer.visitItalic(italic);

      expect(element.type).toBe('em');
      expect(element.props.className).toBe('md-italic');
    });

    // it('应该渲染行内代码', () => {
    //   const code = nodeFactory.createCode('console.log', { line: 1, column: 1, offset: 0 });

    //   const element = renderer.visitCode(code);

    //   expect(element.type).toBe('code');
    //   expect(element.props.children).toBe('console.log');
    //   expect(element.props.className).toBe('md-code');
    // });

    it('应该渲染链接', () => {
      const textNode = nodeFactory.createText('link text', { line: 1, column: 1, offset: 0 });
      const link = nodeFactory.createLink(
        'https://example.com',
        [textNode],
        { line: 1, column: 1, offset: 0 },
        'Link Title',
      );

      const element = renderer.visitLink(link);

      expect(element.type).toBe('a');
      expect(element.props.href).toBe('https://example.com');
      expect(element.props.title).toBe('Link Title');
      expect(element.props.className).toBe('md-link');
    });

    it('应该渲染图片', () => {
      const image = nodeFactory.createImage('image.jpg', 'Alt text', { line: 1, column: 1, offset: 0 }, 'Image Title');

      const element = renderer.visitImage(image);

      expect(element.type).toBe('img');
      expect(element.props.src).toBe('image.jpg');
      expect(element.props.alt).toBe('Alt text');
      expect(element.props.title).toBe('Image Title');
      expect(element.props.className).toBe('md-image');
    });

    it('应该渲染换行', () => {
      const newline = nodeFactory.createNewLine({ line: 1, column: 1, offset: 0 });

      const element = renderer.visitNewLine(newline);

      expect(element.type).toBe('br');
      expect(element.props.className).toBe('md-new-line');
    });
  });

  describe('自定义组件', () => {
    it('应该使用自定义组件', () => {
      const CustomHeading = vi.fn();
      const customRenderer = new ReactRenderer(mockReact, {
        components: { heading: CustomHeading },
      });

      const textNode = nodeFactory.createText('Heading', { line: 1, column: 1, offset: 0 });
      const heading = nodeFactory.createHeading(1, [textNode], { line: 1, column: 1, offset: 0 });

      customRenderer.visitHeading(heading);

      expect(mockReact.createElement).toHaveBeenCalledWith(
        CustomHeading,
        expect.objectContaining({ level: 1 }),
        expect.anything(),
      );
    });

    it('应该使用自定义CSS类名前缀', () => {
      const customRenderer = new ReactRenderer(mockReact, { classPrefix: 'custom-' });
      const textNode = nodeFactory.createText('Text', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const element = customRenderer.visitParagraph(paragraph);

      expect(element.props.className).toBe('custom-paragraph');
    });

    it('应该使用自定义属性', () => {
      const customRenderer = new ReactRenderer(mockReact, {
        customProps: {
          paragraph: { 'data-test': 'custom' },
        },
      });
      const textNode = nodeFactory.createText('Text', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const element = customRenderer.visitParagraph(paragraph);

      expect(element.props['data-test']).toBe('custom');
    });
  });

  describe('工厂函数', () => {
    it('应该通过工厂函数创建渲染器', () => {
      const renderer = createReactRenderer(mockReact, { classPrefix: 'test-' });

      expect(renderer).toBeInstanceOf(ReactRenderer);
    });
  });

  describe('子节点渲染', () => {
    it('应该为React元素添加key', () => {
      const textNode1 = nodeFactory.createText('Text 1', { line: 1, column: 1, offset: 0 });
      const textNode2 = nodeFactory.createText('Text 2', { line: 1, column: 8, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode1, textNode2], { line: 1, column: 1, offset: 0 });

      renderer.visitParagraph(paragraph);

      expect(mockReact.cloneElement).toHaveBeenCalled();
    });
  });
});
