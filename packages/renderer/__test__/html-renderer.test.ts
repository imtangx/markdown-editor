import { describe, it, expect, beforeEach } from 'vitest';
import { nodeFactory } from '@markdown-editor/ast';
import { HTMLRenderer } from '../src/html-renderer';

describe('HTMLRenderer', () => {
  let renderer: HTMLRenderer;

  beforeEach(() => {
    renderer = new HTMLRenderer();
  });

  describe('基本渲染', () => {
    it('应该渲染文档节点', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const document = nodeFactory.createDocument([paragraph], { line: 1, column: 1, offset: 0 });

      const html = renderer.render(document);

      expect(html).toContain('<p');
      expect(html).toContain('Hello World');
      expect(html).toContain('</p>');
    });

    it('应该渲染文本节点', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });

      const html = renderer.visitText(textNode);

      expect(html).toBe('Hello World');
    });

    it('应该转义HTML特殊字符', () => {
      const textNode = nodeFactory.createText('<script>alert("xss")</script>', { line: 1, column: 1, offset: 0 });

      const html = renderer.visitText(textNode);

      expect(html).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
  });

  describe('标题渲染', () => {
    it('应该渲染不同级别的标题', () => {
      const textNode = nodeFactory.createText('Heading', { line: 1, column: 1, offset: 0 });

      for (let level = 1; level <= 6; level++) {
        const heading = nodeFactory.createHeading(level, [textNode], { line: 1, column: 1, offset: 0 });
        const html = renderer.visitHeading(heading);

        expect(html).toContain(`<h${level}`);
        expect(html).toContain('Heading');
        expect(html).toContain(`</h${level}>`);
      }
    });

    it('应该限制标题级别在1-6之间', () => {
      const textNode = nodeFactory.createText('Heading', { line: 1, column: 1, offset: 0 });

      // 测试超出范围的级别
      const heading0 = nodeFactory.createHeading(0, [textNode], { line: 1, column: 1, offset: 0 });
      const heading7 = nodeFactory.createHeading(7, [textNode], { line: 1, column: 1, offset: 0 });

      expect(renderer.visitHeading(heading0)).toContain('<h1');
      expect(renderer.visitHeading(heading7)).toContain('<h6');
    });
  });

  describe('段落渲染', () => {
    it('应该渲染段落', () => {
      const textNode = nodeFactory.createText('This is a paragraph', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitParagraph(paragraph);

      expect(html).toContain('<p');
      expect(html).toContain('This is a paragraph');
      expect(html).toContain('</p>');
    });
  });

  describe('代码块渲染', () => {
    it('应该渲染代码块', () => {
      const codeBlock = nodeFactory.createCodeBlock('console.log("hello");', 'javascript', {
        line: 1,
        column: 1,
        offset: 0,
      });

      const html = renderer.visitCodeBlock(codeBlock);

      expect(html).toContain('<pre');
      expect(html).toContain('<code');
      expect(html).toContain('language-javascript');
      expect(html).toContain('console.log(&quot;hello&quot;);');
      expect(html).toContain('</code>');
      expect(html).toContain('</pre>');
    });

    it('应该渲染无语言标识的代码块', () => {
      const codeBlock = nodeFactory.createCodeBlock('plain code', undefined, { line: 1, column: 1, offset: 0 });

      const html = renderer.visitCodeBlock(codeBlock);

      expect(html).toContain('<pre');
      expect(html).toContain('<code');
      expect(html).toContain('plain code');
      expect(html).not.toContain('language-');
    });
  });

  describe('列表渲染', () => {
    it('应该渲染无序列表', () => {
      const textNode = nodeFactory.createText('Item 1', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const listItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 });
      const list = nodeFactory.createList(false, [listItem], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitList(list);

      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
      expect(html).toContain('</li>');
      expect(html).toContain('</ul>');
    });

    it('应该渲染有序列表', () => {
      const textNode = nodeFactory.createText('Item 1', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const listItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 });
      const list = nodeFactory.createList(true, [listItem], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitList(list);

      expect(html).toContain('<ol');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
      expect(html).toContain('</li>');
      expect(html).toContain('</ol>');
    });

    it('应该渲染任务列表', () => {
      const textNode = nodeFactory.createText('Task item', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const checkedItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 }, true);
      const uncheckedItem = nodeFactory.createListItem([paragraph], { line: 2, column: 1, offset: 0 }, false);

      const checkedHtml = renderer.visitListItem(checkedItem);
      const uncheckedHtml = renderer.visitListItem(uncheckedItem);

      expect(checkedHtml).toContain('<input');
      expect(checkedHtml).toContain('type="checkbox"');
      expect(checkedHtml).toContain('checked="checked"');

      expect(uncheckedHtml).toContain('<input');
      expect(uncheckedHtml).toContain('type="checkbox"');
      expect(uncheckedHtml).not.toContain('checked="checked"');
    });
  });

  describe('引用渲染', () => {
    it('应该渲染引用块', () => {
      const textNode = nodeFactory.createText('This is a quote', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const quote = nodeFactory.createQuote([paragraph], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitQuote(quote);

      expect(html).toContain('<blockquote');
      expect(html).toContain('This is a quote');
      expect(html).toContain('</blockquote>');
    });
  });

  describe('行内元素渲染', () => {
    it('应该渲染粗体文本', () => {
      const textNode = nodeFactory.createText('bold text', { line: 1, column: 1, offset: 0 });
      const bold = nodeFactory.createBold([textNode], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitBold(bold);

      expect(html).toContain('<strong');
      expect(html).toContain('bold text');
      expect(html).toContain('</strong>');
    });

    it('应该渲染斜体文本', () => {
      const textNode = nodeFactory.createText('italic text', { line: 1, column: 1, offset: 0 });
      const italic = nodeFactory.createItalic([textNode], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitItalic(italic);

      expect(html).toContain('<em');
      expect(html).toContain('italic text');
      expect(html).toContain('</em>');
    });

    it('应该渲染行内代码', () => {
      const code = nodeFactory.createCode('console.log', { line: 1, column: 1, offset: 0 });

      const html = renderer.visitCode(code);

      expect(html).toContain('<code');
      expect(html).toContain('console.log');
      expect(html).toContain('</code>');
    });

    it('应该渲染链接', () => {
      const textNode = nodeFactory.createText('link text', { line: 1, column: 1, offset: 0 });
      const link = nodeFactory.createLink(
        'https://example.com',
        [textNode],
        { line: 1, column: 1, offset: 0 },
        'Link Title',
      );

      const html = renderer.visitLink(link);

      expect(html).toContain('<a');
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('title="Link Title"');
      expect(html).toContain('link text');
      expect(html).toContain('</a>');
    });

    it('应该渲染图片', () => {
      const image = nodeFactory.createImage('image.jpg', 'Alt text', { line: 1, column: 1, offset: 0 }, 'Image Title');

      const html = renderer.visitImage(image);

      expect(html).toContain('<img');
      expect(html).toContain('src="image.jpg"');
      expect(html).toContain('alt="Alt text"');
      expect(html).toContain('title="Image Title"');
    });

    it('应该渲染换行', () => {
      const newLine = nodeFactory.createNewLine({ line: 1, column: 1, offset: 0 });

      const html = renderer.visitNewLine(newLine);

      expect(html).toContain('<br');
    });
  });

  describe('渲染选项', () => {
    it('应该使用自定义CSS类名前缀', () => {
      const customRenderer = new HTMLRenderer({ classPrefix: 'custom-' });
      const textNode = nodeFactory.createText('Text', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = customRenderer.visitParagraph(paragraph);

      expect(html).toContain('class="custom-paragraph"');
    });

    it('应该使用美化输出', () => {
      const prettyRenderer = new HTMLRenderer({ pretty: true, indent: '  ' });
      const textNode = nodeFactory.createText('Text', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = prettyRenderer.visitParagraph(paragraph);

      expect(html).toContain('\n');
    });

    it('应该使用自定义属性', () => {
      const customRenderer = new HTMLRenderer({
        customAttributes: {
          paragraph: { 'data-test': 'custom' },
        },
      });
      const textNode = nodeFactory.createText('Text', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      const html = customRenderer.visitParagraph(paragraph);

      expect(html).toContain('data-test="custom"');
    });
  });

  describe('混合内容渲染', () => {
    it('应该渲染复杂的嵌套结构', () => {
      // 创建 "This is **bold** text" 段落
      const text1 = nodeFactory.createText('This is ', { line: 1, column: 1, offset: 0 });
      const boldText = nodeFactory.createText('bold', { line: 1, column: 9, offset: 0 });
      const bold = nodeFactory.createBold([boldText], { line: 1, column: 8, offset: 0 });
      const text2 = nodeFactory.createText(' text', { line: 1, column: 15, offset: 0 });
      const paragraph = nodeFactory.createParagraph([text1, bold, text2], { line: 1, column: 1, offset: 0 });

      const html = renderer.visitParagraph(paragraph);

      expect(html).toContain('<p');
      expect(html).toContain('This is ');
      expect(html).toContain('<strong');
      expect(html).toContain('bold');
      expect(html).toContain('</strong>');
      expect(html).toContain(' text');
      expect(html).toContain('</p>');
    });
  });
});
