import { describe, it, expect, beforeEach } from 'vitest';
import { nodeFactory } from '../src/factory';
import { traverser, transformer } from '../src/visitor';
import type { DocumentNode, TextNode } from '../src/nodes';
/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('AST Package', () => {
  describe('NodeFactory', () => {
    it('应该创建文档节点', () => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraphNode = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const documentNode = nodeFactory.createDocument([paragraphNode], { line: 1, column: 1, offset: 0 });

      expect(documentNode.type).toBe('document');
      expect(documentNode.children).toHaveLength(1);
      expect(documentNode.children[0]).toBe(paragraphNode);
      expect(paragraphNode.parent).toBe(documentNode);
    });

    it('应该创建标题节点', () => {
      const textNode = nodeFactory.createText('Heading', { line: 1, column: 1, offset: 0 });
      const heading = nodeFactory.createHeading(1, [textNode], { line: 1, column: 1, offset: 0 });

      expect(heading.type).toBe('heading');
      expect(heading.level).toBe(1);
      expect(heading.children).toHaveLength(1);
      expect(textNode.parent).toBe(heading);
    });

    it('应该创建段落节点', () => {
      const textNode = nodeFactory.createText('Paragraph text', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.children).toHaveLength(1);
      expect(textNode.parent).toBe(paragraph);
    });

    it('应该创建代码块节点', () => {
      const codeBlock = nodeFactory.createCodeBlock('console.log("hello");', 'javascript', {
        line: 1,
        column: 1,
        offset: 0,
      });

      expect(codeBlock.type).toBe('code_block');
      expect(codeBlock.value).toBe('console.log("hello");');
      expect(codeBlock.language).toBe('javascript');
      expect(codeBlock.info).toBe('javascript');
    });

    it('应该创建链接节点', () => {
      const textNode = nodeFactory.createText('Link Text', { line: 1, column: 1, offset: 0 });
      const link = nodeFactory.createLink(
        'https://example.com',
        [textNode],
        { line: 1, column: 1, offset: 0 },
        'Link Title',
      );

      expect(link.type).toBe('link');
      expect(link.url).toBe('https://example.com');
      expect(link.title).toBe('Link Title');
      expect(link.children).toHaveLength(1);
      expect(textNode.parent).toBe(link);
    });

    it('应该创建图片节点', () => {
      const image = nodeFactory.createImage('https://example.com/image.png', 'Alt text', {
        line: 1,
        column: 1,
        offset: 0,
      });

      expect(image.type).toBe('image');
      expect(image.url).toBe('https://example.com/image.png');
      expect(image.alt).toBe('Alt text');
    });

    it('应该创建列表节点', () => {
      const textNode = nodeFactory.createText('Item 1', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      const listItem = nodeFactory.createListItem([paragraph], { line: 1, column: 1, offset: 0 });
      const list = nodeFactory.createList(false, [listItem], { line: 1, column: 1, offset: 0 });

      // expect(list.type).toBe('list');
      expect(list.ordered).toBe(false);
      expect(list.marker).toBe('-');
      expect(list.children).toHaveLength(1);
      expect(listItem.parent).toBe(list);
    });
  });

  describe('ASTTraverser', () => {
    let document: DocumentNode;

    beforeEach(() => {
      // 创建测试AST
      const textNode1 = nodeFactory.createText('Hello', { line: 1, column: 1, offset: 0 });
      const textNode2 = nodeFactory.createText('World', { line: 1, column: 7, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode1, textNode2], { line: 1, column: 1, offset: 0 });

      const headingText = nodeFactory.createText('Heading', { line: 2, column: 3, offset: 0 });
      const heading = nodeFactory.createHeading(1, [headingText], { line: 2, column: 1, offset: 0 });

      document = nodeFactory.createDocument([paragraph, heading], { line: 1, column: 1, offset: 0 });
    });

    it('应该遍历所有节点', () => {
      const visited: string[] = [];

      traverser.traverse(document, {
        visitNode: node => {
          visited.push(node.type);
          return node.type;
        },
      });

      expect(document.type).toBe('document');
      expect(visited).toEqual(['text', 'text', 'paragraph', 'text', 'heading', 'document']);
    });

    it('应该查找特定节点', () => {
      const textNode = traverser.find(document, node => node.type === 'text');
      expect(textNode).toBeTruthy();
      expect(textNode?.type).toBe('text');
    });

    it('应该查找所有匹配的节点', () => {
      const textNodes = traverser.findAll(document, node => node.type === 'text');
      expect(textNodes).toHaveLength(3);
    });

    it('应该按类型获取节点', () => {
      const textNodes = traverser.getNodesByType(document, 'text');
      expect(textNodes).toHaveLength(3);
    });

    it('应该计算节点深度', () => {
      const paragraph = document.children[0];
      const textNode = paragraph?.children?.[0];

      expect(traverser.getDepth(document)).toBe(0);
      expect(traverser.getDepth(paragraph)).toBe(1);
      expect(traverser.getDepth(textNode!)).toBe(2);
    });

    it('应该获取节点路径', () => {
      const textNode = document?.children[0]?.children?.[0];
      const path = traverser.getPath(textNode!);

      expect(path).toHaveLength(3);
      expect(path[0]).toBe(document);
      expect(path[1]).toBe(document.children[0]);
      expect(path[2]).toBe(textNode);
    });

    it('应该获取兄弟节点', () => {
      const paragraph = document.children[0];
      const heading = document.children[1];

      const paragraphSiblings = traverser.getSiblings(paragraph);
      expect(paragraphSiblings).toEqual([heading]);

      const headingSiblings = traverser.getSiblings(heading);
      expect(headingSiblings).toEqual([paragraph]);
    });

    it('应该获取前一个和后一个兄弟节点', () => {
      const paragraph = document.children[0];
      const heading = document.children[1];

      expect(traverser.getPreviousSibling(paragraph)).toBeNull();
      expect(traverser.getNextSibling(paragraph)).toBe(heading);

      expect(traverser.getPreviousSibling(heading)).toBe(paragraph);
      expect(traverser.getNextSibling(heading)).toBeNull();
    });
  });

  describe('ASTTransformer', () => {
    let document: DocumentNode;

    beforeEach(() => {
      const textNode = nodeFactory.createText('Hello World', { line: 1, column: 1, offset: 0 });
      const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
      document = nodeFactory.createDocument([paragraph], { line: 1, column: 1, offset: 0 });
    });

    it('应该转换节点', () => {
      const transformed = transformer.transform(document, node => {
        if (node.type === 'text') {
          return nodeFactory.createText('Transformed Text', node.position);
        }
        return node;
      });

      expect(transformed).toBeTruthy();
      const textNode = transformed!.children[0]?.children?.[0] as TextNode;
      expect(textNode.value).toBe('Transformed Text');
    });

    it('应该克隆节点', () => {
      const cloned = transformer.clone(document);

      expect(cloned).not.toBe(document);
      expect(cloned.type).toBe(document.type);
      expect(cloned.children).toHaveLength(document.children.length);
      expect(cloned.parent).toBeUndefined();

      // 检查子节点的父子关系
      const clonedParagraph = cloned.children[0];
      expect(clonedParagraph.parent).toBe(cloned);
    });

    it('应该插入节点', () => {
      const newText = nodeFactory.createText('New Text', { line: 2, column: 1, offset: 0 });
      const paragraph = document.children[0];

      transformer.insertNode(paragraph, newText);

      expect(paragraph.children).toHaveLength(2);
      expect(paragraph?.children?.[1]).toBe(newText);
      expect(newText.parent).toBe(paragraph);
    });

    it('应该删除节点', () => {
      const paragraph = document.children[0];
      const textNode = paragraph?.children?.[0];

      transformer.removeNode(textNode!);

      expect(paragraph.children).toHaveLength(0);
      expect(textNode!.parent).toBeUndefined();
    });

    it('应该替换节点', () => {
      const paragraph = document.children[0];
      const oldText = paragraph?.children?.[0];
      const newText = nodeFactory.createText('New Text', { line: 1, column: 1, offset: 0 });

      transformer.replaceNode(oldText!, newText);

      expect(paragraph.children).toHaveLength(1);
      expect(paragraph?.children?.[0]).toBe(newText);
      expect(newText.parent).toBe(paragraph);
      expect(oldText?.parent).toBeUndefined();
    });

    it('应该移动节点', () => {
      const textNode = nodeFactory.createText('Text to move', { line: 2, column: 1, offset: 0 });
      const paragraph1 = nodeFactory.createParagraph([textNode], { line: 2, column: 1, offset: 0 });
      const paragraph2 = nodeFactory.createParagraph([], { line: 3, column: 1, offset: 0 });

      transformer.moveNode(textNode, paragraph2);

      expect(paragraph1.children).toHaveLength(0);
      expect(paragraph2.children).toHaveLength(1);
      expect(paragraph2.children[0]).toBe(textNode);
      expect(textNode.parent).toBe(paragraph2);
    });
  });
});
