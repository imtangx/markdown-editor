import { describe, it, expect } from 'vitest';
import { MarkdownLexer } from '@markdown-editor/lexer';
import { parser } from '../src/parser';

describe('RecursiveDescentParser', () => {
  describe('基本解析', () => {
    it('应该解析文档', () => {
      const lexer = new MarkdownLexer('-');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.type).toBe('document');
      expect(ast.children).toHaveLength(1);
    });

    it('应该解析纯文本', () => {
      const lexer = new MarkdownLexer('Hello World');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.type).toBe('document');
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('paragraph');

      const paragraph = ast.children[0];
      expect(paragraph.children).toHaveLength(4);
      expect(paragraph.children[0].type).toBe('text');
      expect((paragraph.children[0] as any).value).toBe('Hello');
    });
  });

  describe('标题解析', () => {
    it('应该解析一级标题', () => {
      const lexer = new MarkdownLexer('# Heading 1');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('heading');

      const heading = ast.children[0] as any;
      expect(heading.level).toBe(1);
      expect(heading.children).toHaveLength(4);
      expect(heading.children[0].type).toBe('text');
      expect(heading.children[0].value).toBe('Heading');
    });

    it('应该解析多级标题', () => {
      const lexer = new MarkdownLexer('## Heading 2\n\n### Heading 3');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(2);

      const heading2 = ast.children[0] as any;
      expect(heading2.type).toBe('heading');
      expect(heading2.level).toBe(2);

      const heading3 = ast.children[1] as any;
      expect(heading3.type).toBe('heading');
      expect(heading3.level).toBe(3);
    });
  });

  describe('段落解析', () => {
    it('应该解析多个段落', () => {
      const lexer = new MarkdownLexer('First paragraph\n\nSecond paragraph');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe('paragraph');
      expect(ast.children[1].type).toBe('paragraph');
    });

    it('应该解析带有行内元素的段落', () => {
      const lexer = new MarkdownLexer('This is **bold** and *italic* text');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0];
      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.children.length).toBeGreaterThan(1);
    });
  });

  // describe('代码块解析', () => {
  //   it('应该解析代码块', () => {
  //     const lexer = new MarkdownLexer('```\nconsole.log("hello");\n```');
  //     const tokens = lexer.tokenize();
  //     const ast = parser.parse(tokens);

  //     expect(ast.children).toHaveLength(1);
  //     expect(ast.children[0].type).toBe('code_block');

  //     const codeBlock = ast.children[0] as any;
  //     expect(codeBlock.language).toBe('javascript');
  //     expect(codeBlock.value).toBe('console.log("hello");');
  //   });

  //   it('应该解析无语言标识的代码块', () => {
  //     const lexer = new MarkdownLexer('```\ncode here\n```');
  //     const tokens = lexer.tokenize();
  //     const ast = parser.parse(tokens);

  //     expect(ast.children).toHaveLength(1);
  //     expect(ast.children[0].type).toBe('code_block');

  //     const codeBlock = ast.children[0] as any;
  //     expect(codeBlock.language).toBeUndefined();
  //     expect(codeBlock.value).toBe('code here');
  //   });
  // });

  describe('列表解析', () => {
    it('应该解析无序列表', () => {
      const lexer = new MarkdownLexer('- Item 1\n- Item 2\n- Item 3');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('list');

      const list = ast.children[0] as any;
      expect(list.ordered).toBe(false);
      expect(list.children).toHaveLength(1);

      list.children.forEach((item: any) => {
        expect(item.type).toBe('list_item');
      });
    });

    it('应该解析任务列表', () => {
      const lexer = new MarkdownLexer('- [x] Completed task\n- [ ] Pending task');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('list');

      const list = ast.children[0] as any;
      expect(list.children).toHaveLength(1);

      // expect(list.children[0].checked).toBe(true);
      // expect(list.children[1].checked).toBe(false);
    });
  });

  describe('引用解析', () => {
    it('应该解析引用块', () => {
      const lexer = new MarkdownLexer('> This is a quote');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('quote');

      const quote = ast.children[0] as any;
      expect(quote.children).toHaveLength(1);
      expect(quote.children[0].type).toBe('paragraph');
    });

    it('应该解析嵌套引用', () => {
      const lexer = new MarkdownLexer('> Outer quote\n> > Inner quote');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('quote');
    });
  });

  describe('行内元素解析', () => {
    it('应该解析粗体文本', () => {
      const lexer = new MarkdownLexer('**bold text**');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0];
      expect(paragraph.children).toHaveLength(2);
      expect(paragraph.children[0].type).toBe('bold');
    });

    it('应该解析斜体文本', () => {
      const lexer = new MarkdownLexer('*italic text*');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0];
      expect(paragraph.children).toHaveLength(2);
      expect(paragraph.children[0].type).toBe('italic');
    });

    it('应该解析行内代码', () => {
      const lexer = new MarkdownLexer('`inline code`');
      const tokens = lexer.tokenize();
      const ast = parser.parse(tokens);

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0];
      expect(paragraph.children).toHaveLength(2);
      expect(paragraph.children[0].type).toBe('code');
    });

    //     it('应该解析链接', () => {
    //       const lexer = new MarkdownLexer('[link text](https://example.com)');
    //       const tokens = lexer.tokenize();
    //       const ast = parser.parse(tokens);

    //       expect(ast.children).toHaveLength(1);
    //       const paragraph = ast.children[0];
    //       expect(paragraph.children).toHaveLength(1);
    //       expect(paragraph.children[0].type).toBe('link');

    //       const link = paragraph.children[0] as any;
    //       expect(link.url).toBe('https://example.com');
    //       expect(link.children).toHaveLength(1);
    //       expect(link.children[0].value).toBe('link text');
    //     });

    //     it('应该解析图片', () => {
    //       const lexer = new MarkdownLexer('![alt text](image.jpg)');
    //       const tokens = lexer.tokenize();
    //       const ast = parser.parse(tokens);

    //       expect(ast.children).toHaveLength(1);
    //       const paragraph = ast.children[0];
    //       expect(paragraph.children).toHaveLength(1);
    //       expect(paragraph.children[0].type).toBe('image');

    //       const image = paragraph.children[0] as any;
    //       expect(image.url).toBe('image.jpg');
    //       expect(image.alt).toBe('alt text');
    //     });
    //   });

    //   describe('混合内容解析', () => {
    //     it('应该解析混合的块级元素', () => {
    //       const markdown = `# Heading

    // This is a paragraph with **bold** text.

    // - List item 1
    // - List item 2

    // > This is a quote

    // \`\`\`javascript
    // console.log("code");
    // \`\`\``;
    //       const lexer = new MarkdownLexer(markdown);
    //       const tokens = lexer.tokenize();
    //       const ast = parser.parse(tokens);

    //       expect(ast.children.length).toBeGreaterThan(0);

    //       // 检查是否包含不同类型的块级元素
    //       const types = ast.children.map(child => child.type);
    //       expect(types).toContain('heading');
    //       expect(types).toContain('paragraph');
    //       expect(types).toContain('list');
    //       expect(types).toContain('quote');
    //       expect(types).toContain('code_block');
    //     });
  });
});
